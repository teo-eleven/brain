#!/usr/bin/env node
"use strict";

// vault-check.js - verificator de integritate pentru vaultul Obsidian.
// Scaneaza notele, rezolva linkurile [[...]] si raporteaza linkuri moarte,
// note orfane, note fara backlinks, schelete, hub-uri si distributia pe foldere.
// Fara dependinte externe. Node 20+.

const fs = require("fs");
const path = require("path");

// Radacina vaultului = parintele directorului scripts/ (nu se hardcodeaza).
const VAULT_ROOT = path.resolve(__dirname, "..");

// Foldere sarite complet la scanarea notelor.
const SKIP_DIRS = new Set([
  ".obsidian",
  ".git",
  "attachments",
  "scripts",
  "node_modules",
]);
// Foldere pe care nu le parcurgem deloc (nici macar pentru inventarul de fisiere).
const NEVER_WALK = new Set([".obsidian", ".git", "node_modules"]);
// Folderul de sabloane: notele de acolo nu conteaza la verdictul de orfane.
const TEMPLATES_DIR = "_templates";
const TOP_HUBS = 5;
const ROOT_LABEL = "(radacina)";

// ---------------------------------------------------------------- utilitare

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function stem(fileName) {
  return fileName.replace(/\.[^.]+$/, "");
}

function folderOf(relPath) {
  const dir = path.posix.dirname(relPath);
  return dir === "." ? ROOT_LABEL : dir;
}

function isInSkippedDir(relPath) {
  const first = relPath.split("/")[0];
  return SKIP_DIRS.has(first);
}

// ------------------------------------------------------- inventarul de pe disc

// Parcurge recursiv vaultul si intoarce caile relative (stil posix) ale fisierelor.
function walkFiles(dir, relBase, acc) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (NEVER_WALK.has(entry.name)) continue;
      walkFiles(path.join(dir, entry.name), rel, acc);
    } else if (entry.isFile()) {
      acc.push(rel);
    }
  }
  return acc;
}

// ------------------------------------------------- curatarea textului markdown

// Scoate blocurile de cod ``` sau ~~~ (linkurile de acolo sunt exemple didactice).
function stripCodeFences(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let fence = null;
  for (const line of lines) {
    const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (match && match[1][0] === fence.char && match[1].length >= fence.len)
        fence = null;
      out.push("");
      continue;
    }
    if (match) {
      fence = { char: match[1][0], len: match[1].length };
      out.push("");
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

// Scoate comentariile HTML, inclusiv pe cele care se intind pe mai multe linii.
function stripHtmlComments(text) {
  const cleaned = text.replace(/<!--[\s\S]*?-->/g, " ");
  const unterminated = cleaned.indexOf("<!--");
  return unterminated === -1 ? cleaned : cleaned.slice(0, unterminated);
}

// Cauta o secventa de backtick-uri de exact lungimea ceruta (regula CommonMark).
function findClosingRun(text, from, len) {
  let i = from;
  while (i < text.length) {
    if (text[i] !== "`") {
      i += 1;
      continue;
    }
    let run = 0;
    while (text[i + run] === "`") run += 1;
    if (run === len) return i;
    i += run;
  }
  return -1;
}

// Scoate code span-urile `...` fara sa atinga restul liniei.
function stripCodeSpans(text) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] !== "`") {
      out += text[i];
      i += 1;
      continue;
    }
    let len = 0;
    while (text[i + len] === "`") len += 1;
    const close = findClosingRun(text, i + len, len);
    if (close === -1) {
      out += "`".repeat(len);
      i += len;
      continue;
    }
    out += " ";
    i = close + len;
  }
  return out;
}

function cleanContent(text) {
  return stripCodeSpans(stripHtmlComments(stripCodeFences(text)));
}

// ------------------------------------------------------------ parsare linkuri

const LINK_RE = /!?\[\[([^\[\]]+?)\]\]/g;

// Din "folder/Nume#Sectiune|alias" pastreaza doar numele fisierului tinta.
function targetOf(rawLink) {
  let target = rawLink.split("|")[0];
  target = target.split("#")[0];
  target = target.replace(/\\/g, "/").trim();
  if (!target) return null; // link intern spre o sectiune din aceeasi nota
  const base = target.split("/").pop().trim();
  return base || null;
}

function extractLinks(cleanText) {
  const found = [];
  let match;
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(cleanText)) !== null) {
    const target = targetOf(match[1]);
    if (target) found.push(target);
  }
  return found;
}

// ------------------------------------------------------------- frontmatter

function frontmatterOf(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  return match ? match[1] : "";
}

function hasScheletStatus(text) {
  return /^status:\s*schelet\s*$/m.test(frontmatterOf(text));
}

// ------------------------------------------------------------ modelul vaultului

function buildVault() {
  const allFiles = walkFiles(VAULT_ROOT, "", []);

  const noteIndex = new Map(); // stem lowercase -> nume nota
  const assetIndex = new Map(); // nume fisier non-md (cu si fara extensie) -> cale
  const notes = new Map(); // nume nota -> obiect nota

  for (const rel of allFiles) {
    const base = path.posix.basename(rel);
    const isMarkdown = base.toLowerCase().endsWith(".md");
    if (isMarkdown && !isInSkippedDir(rel)) {
      const name = stem(base);
      const key = name.toLowerCase();
      if (!noteIndex.has(key)) noteIndex.set(key, name);
      notes.set(name, {
        name,
        rel,
        folder: folderOf(rel),
        isTemplate: rel.startsWith(`${TEMPLATES_DIR}/`),
        isSchelet: false,
        outLinks: new Set(),
        inLinks: new Set(),
        assetLinks: 0,
      });
    } else if (!isMarkdown) {
      const full = base.toLowerCase();
      const withoutExt = stem(base).toLowerCase();
      if (!assetIndex.has(full)) assetIndex.set(full, rel);
      if (!assetIndex.has(withoutExt)) assetIndex.set(withoutExt, rel);
    }
  }

  return { notes, noteIndex, assetIndex };
}

// Rezolva o tinta la o nota, la un fisier de pe disc, sau la nimic (link mort).
function resolveTarget(target, noteIndex, assetIndex) {
  const asNote = noteIndex.get(target.replace(/\.md$/i, "").toLowerCase());
  if (asNote) return { kind: "note", name: asNote };
  const asAsset =
    assetIndex.get(target.toLowerCase()) ||
    assetIndex.get(stem(target).toLowerCase());
  if (asAsset) return { kind: "asset", name: asAsset };
  return { kind: "dead" };
}

function analyzeVault() {
  const { notes, noteIndex, assetIndex } = buildVault();
  const deadLinks = new Map(); // tinta -> set de note sursa
  let resolvedCount = 0;

  for (const note of notes.values()) {
    const raw = fs.readFileSync(path.join(VAULT_ROOT, note.rel), "utf8");
    note.isSchelet = hasScheletStatus(raw);

    for (const target of extractLinks(cleanContent(raw))) {
      const resolved = resolveTarget(target, noteIndex, assetIndex);
      if (resolved.kind === "dead") {
        if (!deadLinks.has(target)) deadLinks.set(target, new Set());
        deadLinks.get(target).add(note.name);
        continue;
      }
      resolvedCount += 1;
      if (resolved.kind === "asset") {
        note.assetLinks += 1;
        continue;
      }
      if (resolved.name === note.name) continue; // auto-link, nu e legatura reala
      note.outLinks.add(resolved.name);
      notes.get(resolved.name).inLinks.add(note.name);
    }
  }

  return { notes, deadLinks, resolvedCount };
}

// ------------------------------------------------------------------- raportul

function buildReport() {
  const { notes, deadLinks, resolvedCount } = analyzeVault();
  const all = [...notes.values()].sort((a, b) => a.name.localeCompare(b.name));

  const orphansAll = all.filter(
    (n) => n.inLinks.size === 0 && n.outLinks.size === 0,
  );
  const orphans = orphansAll.filter((n) => !n.isTemplate);
  const orphanTemplates = orphansAll.length - orphans.length;
  const noBacklinks = all.filter(
    (n) => n.inLinks.size === 0 && n.outLinks.size > 0,
  );
  const skeletons = all.filter((n) => n.isSchelet);

  const hubs = [...all]
    .sort((a, b) => {
      const byTotal =
        b.inLinks.size + b.outLinks.size - (a.inLinks.size + a.outLinks.size);
      return byTotal !== 0 ? byTotal : a.name.localeCompare(b.name);
    })
    .slice(0, TOP_HUBS);

  const folderCounts = new Map();
  for (const note of all)
    folderCounts.set(note.folder, (folderCounts.get(note.folder) || 0) + 1);
  const folders = [...folderCounts.entries()]
    .map(([folder, count]) => ({ folder, count }))
    .sort((a, b) => b.count - a.count || a.folder.localeCompare(b.folder));

  const deadTotal = [...deadLinks.values()].reduce(
    (sum, set) => sum + set.size,
    0,
  );
  const isOk = deadLinks.size === 0 && orphans.length === 0;

  return {
    summary: {
      notes: all.length,
      resolvedLinks: resolvedCount,
      avgLinksPerNote: all.length
        ? Number((resolvedCount / all.length).toFixed(2))
        : 0,
    },
    deadLinks: [...deadLinks.entries()]
      .map(([target, sources]) => ({ target, sources: [...sources].sort() }))
      .sort((a, b) => a.target.localeCompare(b.target)),
    deadLinkOccurrences: deadTotal,
    orphans: orphans.map((n) => n.name),
    orphanTemplatesExcluded: orphanTemplates,
    notesWithoutBacklinks: noBacklinks.map((n) => n.name),
    skeletons: skeletons.map((n) => n.name),
    hubs: hubs.map((n) => ({
      name: n.name,
      in: n.inLinks.size,
      out: n.outLinks.size,
    })),
    folders,
    verdict: isOk
      ? "VAULT OK"
      : `PROBLEME: ${deadLinks.size} linkuri moarte, ${orphans.length} orfane`,
    ok: isOk,
  };
}

// -------------------------------------------------------------------- afisare

function line(text) {
  console.log(text);
}

function section(title) {
  line("");
  line(`== ${title}`);
}

function printReport(report) {
  const s = report.summary;
  line("== Sumar");
  line(
    `   note: ${s.notes}  |  legaturi rezolvate: ${s.resolvedLinks}  |  medie/nota: ${s.avgLinksPerNote}`,
  );

  section("Linkuri moarte");
  if (report.deadLinks.length === 0) {
    line("   ✓ niciun link mort");
  } else {
    for (const dead of report.deadLinks) {
      line(`   ✗ [[${dead.target}]]  <- ${dead.sources.join(", ")}`);
    }
  }

  section("Note orfane (fara legaturi in nici un sens)");
  if (report.orphans.length === 0) {
    line("   ✓ niciuna");
  } else {
    for (const name of report.orphans) line(`   ✗ ${name}`);
  }
  if (report.orphanTemplatesExcluded > 0) {
    line(
      `   (${report.orphanTemplatesExcluded} sabloane din ${TEMPLATES_DIR}/ excluse din verdict)`,
    );
  }

  section("Note fara backlinks (leaga, dar nu e legat nimeni de ele)");
  if (report.notesWithoutBacklinks.length === 0) {
    line("   ✓ niciuna");
  } else {
    for (const name of report.notesWithoutBacklinks) line(`   - ${name}`);
  }

  section(`Schelete necompletate: ${report.skeletons.length}`);
  if (report.skeletons.length > 0) line(`   ${report.skeletons.join(" · ")}`);

  section("Top 5 hub-uri");
  for (const hub of report.hubs) {
    line(
      `   ${String(hub.in).padStart(3)} in / ${String(hub.out).padStart(3)} out  ${hub.name}`,
    );
  }

  section("Distributie pe foldere");
  for (const entry of report.folders) {
    line(`   ${String(entry.count).padStart(3)}  ${entry.folder}`);
  }

  line("");
  line(report.ok ? `✓ ${report.verdict}` : `✗ ${report.verdict}`);
}

// ----------------------------------------------------------------------- main

function main() {
  const args = process.argv.slice(2);
  const quiet = args.includes("--quiet");
  const asJson = args.includes("--json");

  const report = buildReport();

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else if (quiet) {
    line(report.verdict);
  } else {
    printReport(report);
  }

  process.exit(report.deadLinks.length > 0 ? 1 : 0);
}

// Ruleaza doar cand e apelat direct; la require expune functiile pentru verificari.
if (require.main === module) {
  main();
}

module.exports = {
  cleanContent,
  stripCodeFences,
  stripCodeSpans,
  stripHtmlComments,
  extractLinks,
  targetOf,
  resolveTarget,
  hasScheletStatus,
  buildReport,
};
