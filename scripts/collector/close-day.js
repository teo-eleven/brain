#!/usr/bin/env node
"use strict";

/**
 * close-day.js — transforma jurnalul brut in vederea citita de om.
 *
 * Citeste `.events/AAAA-LL-ZZ.jsonl` si scrie `inbox/evenimente-AAAA-LL-ZZ.md`.
 * Sursa ramane jurnalul; fisierul din inbox e doar o proiectie a lui, rescrisa
 * de fiecare data — de aceea are avertisment in antet si de aceea nu se editeaza
 * de mana.
 *
 * Chemat la inceputul unei sesiuni Claude Code, pentru zilele ramase neincheiate.
 *
 * TREI lucruri pe care le face si care nu sunt evidente:
 *
 *   1. HEARTBEAT. Fiecare vedere spune cand a fost generata, cate evenimente si
 *      din cate proiecte. O zi FARA activitate primeste tot un fisier, care
 *      spune raspicat ca n-a fost activitate. Asa se deosebeste „n-am lucrat"
 *      de „colectorul era mort" — distinctie care, lipsind, transforma un jurnal
 *      intr-o minciuna linistita.
 *
 *   2. DUPLICATE DE PROIECT. Daca acelasi remote apare la doua cai diferite pe
 *      disc, vederea o spune in capul listei. E regula din `decisions/Fara clone
 *      locale.md`, verificata automat in loc sa fie tinuta minte: o clona veche
 *      e un repo git perfect valid, care raporteaza sincer „zero commit-uri azi".
 *
 *   3. IDEMPOTENTA prin timp, nu prin stare. Vederea se regenereaza doar cand
 *      jurnalul e mai nou decat ea. Fara fisier de stare care sa se
 *      desincronizeze — daca stergi vederea, se reface; daca nu s-a intamplat
 *      nimic, nu se atinge nimic.
 *
 * Toate setarile sunt in `config.json`, sectiunile `incheiere` si `proiecte`.
 *
 * Utilizare:
 *   node close-day.js               # incheie zilele ramase (implicit)
 *   node close-day.js 2026-08-24    # doar ziua data, fortat
 */

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { incarcaConfig } = require("./config.js");

const ZI_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

function ziLocala(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function oraLocala(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

function caleJurnal(config, zi) {
  return path.join(
    config.vault.cale,
    config.vault.folderEvenimente,
    config.vault.numeFisierZi.replace("{zi}", zi),
  );
}

function caleVedere(config, zi) {
  return path.join(
    config.vault.cale,
    config.incheiere.folderVedere,
    config.incheiere.numeFisierVedere.replace("{zi}", zi),
  );
}

/** Liniile intregi din jurnal. O linie stricata se sare, nu opreste ziua. */
function citesteJurnal(config, zi) {
  const f = caleJurnal(config, zi);
  if (!fs.existsSync(f)) return [];
  return fs
    .readFileSync(f, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/** Numele scurt al unui proiect, cand nu e in harta din config. */
function numeScurt(proiect) {
  if (proiect.startsWith("local:")) return proiect.slice("local:".length);
  return proiect.split("/").filter(Boolean).pop() || proiect;
}

function titluProiect(proiect, config) {
  const nota = config.proiecte.harta[proiect];
  return nota ? `[[${nota}]]` : `\`${numeScurt(proiect)}\``;
}

function bani(n) {
  return n === 1 ? "1 fișier" : `${n} fișiere`;
}

/**
 * Sesiunile se colapseaza la ULTIMA per identificator.
 *
 * `SessionEnd` se declanseaza o data per sesiune, dar o sesiune reluata
 * (`--resume`) poate produce mai multe incheieri cu acelasi id. Ce conteaza e
 * starea finala, nu fiecare pas prin ea.
 */
function ultimeleSesiuni(evenimente) {
  const dupaId = new Map();
  const faraId = [];
  for (const ev of evenimente) {
    if (ev.sesiune) dupaId.set(ev.sesiune, ev);
    else faraId.push(ev);
  }
  return [...dupaId.values(), ...faraId];
}

/** Acelasi proiect vazut la doua cai diferite pe disc — vezi ADR-ul din vault. */
function gasesteDuplicate(evenimente) {
  const caiPerProiect = new Map();
  for (const ev of evenimente) {
    if (!ev.proiect || !ev.cale) continue;
    if (ev.proiect.startsWith("local:")) continue; // fara remote, nu se pot compara
    if (!caiPerProiect.has(ev.proiect))
      caiPerProiect.set(ev.proiect, new Set());
    caiPerProiect.get(ev.proiect).add(ev.cale);
  }
  return [...caiPerProiect.entries()]
    .filter(([, cai]) => cai.size > 1)
    .map(([proiect, cai]) => ({ proiect, cai: [...cai] }));
}

function randCommit(ev) {
  const linii = `+${ev.adaugate} / −${ev.sterse}`;
  const marcaje = ev.merge ? " · merge" : "";
  return (
    `- **${ev.ts}** \`${ev.sha}\` ${ev.subiect}  \n` +
    `  ${bani(ev.fisiere)} · ${linii} · \`${ev.ramura}\`${marcaje}`
  );
}

function randSesiune(ev) {
  const motiv = ev.motiv ? ` (${ev.motiv})` : "";
  if (!ev.necomise) {
    return `- **${ev.ts}** sesiune încheiată${motiv} · nimic necomis`;
  }
  const lista = ev.fisiereNecomise.join(", ");
  return (
    `- **${ev.ts}** sesiune încheiată${motiv} · **${bani(ev.necomise)} necomise**  \n` +
    `  ${lista}`
  );
}

/** Textul complet al vederii unei zile. */
function construiesteVedere(zi, evenimente, config) {
  const commituri = evenimente.filter((e) => e.tip === "commit" && !e.automat);
  const automate = evenimente.filter((e) => e.tip === "commit" && e.automat);
  const sesiuni = ultimeleSesiuni(
    evenimente.filter((e) => e.tip === "sesiune"),
  );
  const duplicate = gasesteDuplicate(evenimente);

  const proiecte = [
    ...new Set([...commituri, ...sesiuni].map((e) => e.proiect)),
  ].sort();

  const out = [];
  out.push("---");
  out.push("tags: [evenimente]");
  out.push(`created: ${zi}`);
  out.push("type: evenimente");
  out.push("---");
  out.push("");
  out.push(`# Evenimente — ${zi}`);
  out.push("");
  out.push("> Generat din `.events/` de `scripts/collector/close-day.js`.");
  out.push(
    "> Se rescrie la fiecare rulare — notele scrise de mână stau în ziua propriu-zisă.",
  );
  out.push("");
  out.push(
    `**Stare:** generat la ${oraLocala()} · ` +
      `${commituri.length} commit-uri · ${sesiuni.length} sesiuni · ` +
      `${proiecte.length} proiecte` +
      (automate.length ? ` · ${automate.length} de întreținere` : ""),
  );
  out.push("");
  out.push(`Ziua: [[${zi}]]`);
  out.push("");

  if (duplicate.length) {
    out.push("## ⚠ Același proiect, două locuri pe disc");
    out.push("");
    out.push(
      "Regula din [[Fara clone locale]], verificată automat. O clonă veche e un " +
        "repo git perfect valid, care raportează sincer „zero commit-uri azi”.",
    );
    out.push("");
    for (const d of duplicate) {
      out.push(`- \`${d.proiect}\``);
      for (const c of d.cai) out.push(`  - \`${c}\``);
    }
    out.push("");
  }

  if (!commituri.length && !sesiuni.length) {
    out.push("## Nicio activitate înregistrată");
    out.push("");
    out.push(
      "Colectorul a rulat și n-a găsit nimic pentru ziua asta. Un fișier gol " +
        "spune altceva decât un fișier lipsă: aici jurnalul **a funcționat** și " +
        "chiar n-a fost activitate.",
    );
    out.push("");
    return out.join("\n") + "\n";
  }

  for (const proiect of proiecte) {
    const c = commituri.filter((e) => e.proiect === proiect);
    const s = sesiuni.filter((e) => e.proiect === proiect);
    out.push(`## ${titluProiect(proiect, config)}`);
    out.push("");
    if (c.length) {
      const adaugate = c.reduce((t, e) => t + e.adaugate, 0);
      const sterse = c.reduce((t, e) => t + e.sterse, 0);
      out.push(`**${c.length} commit-uri** · +${adaugate} / −${sterse}`);
      out.push("");
      for (const ev of c.sort((a, b) => a.ts.localeCompare(b.ts))) {
        out.push(randCommit(ev));
      }
      out.push("");
    }
    if (s.length) {
      out.push("**Sesiuni**");
      out.push("");
      for (const ev of s.sort((a, b) => a.ts.localeCompare(b.ts))) {
        out.push(randSesiune(ev));
      }
      out.push("");
    }
  }

  if (automate.length) {
    out.push("## Întreținere");
    out.push("");
    out.push(
      `${automate.length} commit-uri automate (sincronizarea vaultului). ` +
        "Trecute separat, nu ascunse: o zi în care întreținerea **nu** a rulat " +
        "trebuie să se vadă.",
    );
    out.push("");
  }

  return out.join("\n") + "\n";
}

/** Zilele pentru care exista jurnal in ultimele `zileInUrma` zile. */
function zileCandidate(config, azi = new Date()) {
  const zile = [];
  for (let i = 0; i < config.incheiere.zileInUrma; i += 1) {
    const d = new Date(azi.getTime());
    d.setDate(d.getDate() - i);
    const zi = ziLocala(d);
    if (fs.existsSync(caleJurnal(config, zi))) zile.push(zi);
  }
  return zile.reverse();
}

/**
 * Vederea se reface doar daca jurnalul e mai nou decat ea.
 *
 * Idempotenta prin timp, nu prin fisier de stare: un fisier de stare poate ramane
 * in urma fata de realitate (vederea stearsa de mana, jurnal copiat de pe alta
 * statie), iar atunci nimic nu s-ar mai regenera si nimic n-ar semnala de ce.
 */
function trebuieRefacuta(config, zi) {
  const jurnal = caleJurnal(config, zi);
  const vedere = caleVedere(config, zi);
  if (!fs.existsSync(vedere)) return true;
  if (!fs.existsSync(jurnal)) return false;
  return fs.statSync(jurnal).mtimeMs > fs.statSync(vedere).mtimeMs;
}

function scrieVedere(config, zi) {
  const evenimente = citesteJurnal(config, zi);
  const text = construiesteVedere(zi, evenimente, config);
  const fisier = caleVedere(config, zi);
  fs.mkdirSync(path.dirname(fisier), { recursive: true });
  fs.writeFileSync(fisier, text, "utf8");
  return { zi, fisier, evenimente: evenimente.length };
}

/**
 * Scriptul greu (`sync-daily.ps1`): blocul de commit-uri din nota zilei,
 * tag-urile `#azi`, canvas-ul. Chemat O SINGURA data, la incheiere — nu la
 * fiecare commit, cum se intampla inainte.
 */
function ruleazaSyncDaily(config) {
  const script = path.join(config.vault.cale, config.incheiere.caleSyncDaily);
  if (!fs.existsSync(script))
    return { rulat: false, motiv: "scriptul nu există" };
  try {
    execFileSync(
      "powershell",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script],
      {
        cwd: config.vault.cale,
        encoding: "utf8",
        timeout: config.incheiere.timeoutSyncDailySecunde * 1000,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    return { rulat: true };
  } catch (e) {
    return { rulat: false, motiv: e.message };
  }
}

/**
 * Incheie zilele ramase. Nu arunca niciodata: e chemat dintr-un hook.
 *
 * @param {object} [optiuni]
 * @param {object} [optiuni.config]
 * @param {string} [optiuni.zi]        o singura zi, fortat (ignora verificarea de prospetime)
 * @param {boolean} [optiuni.faraSync] sare peste scriptul greu (folosit de teste)
 */
function incheie(optiuni = {}) {
  const config = optiuni.config || incarcaConfig();
  const rezultat = { zile: [], sync: null, eroare: null };
  try {
    if (!fs.existsSync(config.vault.cale)) return rezultat;

    const zile = optiuni.zi ? [optiuni.zi] : zileCandidate(config);
    for (const zi of zile) {
      if (!ZI_VALIDA.test(zi)) continue;
      if (!optiuni.zi && !trebuieRefacuta(config, zi)) continue;
      rezultat.zile.push(scrieVedere(config, zi));
    }

    if (
      rezultat.zile.length &&
      config.incheiere.ruleazaSyncDaily &&
      !optiuni.faraSync
    ) {
      rezultat.sync = ruleazaSyncDaily(config);
    }
  } catch (e) {
    rezultat.eroare = e.message;
  }
  return rezultat;
}

module.exports = {
  incheie,
  construiesteVedere,
  caleVedere,
  citesteJurnal,
  gasesteDuplicate,
  ultimeleSesiuni,
  zileCandidate,
  trebuieRefacuta,
};

if (require.main === module) {
  incheie({ zi: process.argv[2] });
  process.exit(0);
}
