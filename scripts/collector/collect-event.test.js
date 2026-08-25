"use strict";

/**
 * Teste pentru colectorul de evenimente.  Rulare:  node --test scripts/collector
 *
 * Fara dependinte externe (`node:test`, Node 20+), ca restul uneltelor din vault.
 * Fiecare test isi face propriul repo git si propriul vault, in os.tmpdir():
 * niciun test nu atinge vaultul real sau repo-urile de lucru.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { incarcaConfig, ConfigInvalid } = require("./config.js");
const colector = require("./collect-event.js");

// ---------------------------------------------------------------- ajutoare

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/** Repo git izolat: fara semnaturi, fara hook-uri mostenite din configul global. */
function repoNou({ remote = null } = {}) {
  const dir = tempDir("colector-repo-");
  git(["init", "--quiet", "--initial-branch=main"], dir);
  git(["config", "user.email", "test@example.com"], dir);
  git(["config", "user.name", "Test"], dir);
  git(["config", "commit.gpgsign", "false"], dir);
  git(
    ["config", "core.hooksPath", path.join(dir, ".git", "hooks-inexistente")],
    dir,
  );
  if (remote) git(["config", "remote.origin.url", remote], dir);
  return dir;
}

function comite(
  repo,
  { fisier = "a.txt", continut = "x\n", mesaj = "test: ceva" } = {},
) {
  fs.writeFileSync(path.join(repo, fisier), continut, "utf8");
  git(["add", "-A"], repo);
  git(["commit", "-m", mesaj, "--quiet"], repo);
}

function vaultNou() {
  const dir = tempDir("colector-vault-");
  fs.mkdirSync(path.join(dir, "scripts", "collector"), { recursive: true });
  return dir;
}

function ziuaCurenta() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function evenimente(vault, config) {
  const f = path.join(
    vault,
    config.vault.folderEvenimente,
    `${ziuaCurenta()}.jsonl`,
  );
  if (!fs.existsSync(f)) return [];
  return fs
    .readFileSync(f, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

/** Config real, cu vaultul mutat in temp si eventuale suprascrieri de test. */
function configPentru(vault, suprascrieri = {}) {
  const c = incarcaConfig({ caleVault: vault });
  return {
    ...c,
    ...suprascrieri,
    vault: { ...c.vault, ...(suprascrieri.vault || {}) },
    git: { ...c.git, ...(suprascrieri.git || {}) },
  };
}

// ---------------------------------------------------------------- config

test("config: valorile se incarca din config.json", () => {
  const c = incarcaConfig();
  assert.ok(
    c.vault.folderEvenimente,
    "folderul de evenimente trebuie sa fie definit",
  );
  assert.ok(Number.isInteger(c.git.timeoutMs) && c.git.timeoutMs > 0);
  assert.ok(
    Number.isInteger(c.git.maxFisiereListate) && c.git.maxFisiereListate > 0,
  );
  assert.ok(Array.isArray(c.commit.tipareAutomate));
});

test("config: `caleVault` primit ca argument bate valoarea din fisier", () => {
  const c = incarcaConfig({ caleVault: "X:\\undeva" });
  assert.equal(c.vault.cale, "X:\\undeva");
});

test("config: o valoare de tip gresit e respinsa cu numele campului in mesaj", () => {
  assert.throws(
    () => incarcaConfig({ brut: { git: { timeoutMs: "repede" } } }),
    (e) => e instanceof ConfigInvalid && /git\.timeoutMs/.test(e.message),
  );
});

test("config: o expresie regulata invalida e prinsa la incarcare, nu la rulare", () => {
  assert.throws(
    () => incarcaConfig({ brut: { commit: { tipareAutomate: ["["] } } }),
    (e) => e instanceof ConfigInvalid && /tipareAutomate\[0\]/.test(e.message),
  );
});

// ---------------------------------------------------------------- commit

test("commit: scrie o linie cu ce s-a intamplat", () => {
  const vault = vaultNou();
  const repo = repoNou({ remote: "https://github.com/tewtzu-ctrl/brain.git" });
  comite(repo, { mesaj: "feat: ceva nou", continut: "unu\ndoi\ntrei\n" });

  const config = configPentru(vault);
  colector.colecteaza("commit", { cwd: repo, config });

  const ev = evenimente(vault, config);
  assert.equal(ev.length, 1);
  assert.equal(ev[0].tip, "commit");
  assert.equal(ev[0].subiect, "feat: ceva nou");
  assert.equal(ev[0].ramura, "main");
  assert.equal(ev[0].fisiere, 1);
  assert.equal(ev[0].adaugate, 3);
  assert.equal(ev[0].sterse, 0);
  assert.equal(ev[0].automat, false);
  assert.match(ev[0].sha, /^[0-9a-f]{7}$/);
});

test("proiect: identitatea vine din remote, nu din calea pe disc", () => {
  const vault = vaultNou();
  const config = configPentru(vault);
  const a = repoNou({ remote: "git@github.com:Econfaire/ecf-adm-expert.git" });
  const b = repoNou({ remote: "https://github.com/Econfaire/ecf-adm-expert" });
  comite(a);
  comite(b);

  colector.colecteaza("commit", { cwd: a, config });
  colector.colecteaza("commit", { cwd: b, config });

  const ev = evenimente(vault, config);
  assert.equal(ev.length, 2);
  assert.equal(
    ev[0].proiect,
    ev[1].proiect,
    "doua clone ale aceluiasi proiect trebuie sa aiba ACEEASI identitate — asta face duplicatul vizibil",
  );
  assert.notEqual(
    ev[0].cale,
    ev[1].cale,
    "caile raman diferite, ca duplicatul sa poata fi aratat",
  );
});

test("proiect: fara remote, identitatea spune sincer ca e doar locala", () => {
  const vault = vaultNou();
  const config = configPentru(vault);
  const repo = repoNou();
  comite(repo);

  colector.colecteaza("commit", { cwd: repo, config });

  assert.match(evenimente(vault, config)[0].proiect, /^local:/);
});

test("commit: cele facute de scriptul de sincronizare sunt marcate `automat`", () => {
  const vault = vaultNou();
  const config = configPentru(vault);
  const repo = repoNou();
  comite(repo, {
    mesaj: "notes: sync 2026-08-24 - 0 commit-uri din repo-urile urmarite",
  });

  colector.colecteaza("commit", { cwd: repo, config });

  const ev = evenimente(vault, config)[0];
  assert.equal(
    ev.automat,
    true,
    "marcat, NU exclus: o zi in care intretinerea n-a rulat trebuie sa se vada",
  );
});

test("commit: stergerile sunt numarate separat de adaugari", () => {
  const vault = vaultNou();
  const config = configPentru(vault);
  const repo = repoNou();
  comite(repo, { continut: "unu\ndoi\ntrei\n" });
  comite(repo, { continut: "unu\n", mesaj: "fix: taiat doua linii" });

  colector.colecteaza("commit", { cwd: repo, config });

  const ev = evenimente(vault, config)[0];
  assert.equal(ev.adaugate, 0);
  assert.equal(ev.sterse, 2);
});

test("config: lista de fisiere e taiata la limita din config", () => {
  const vault = vaultNou();
  const config = configPentru(vault, { git: { maxFisiereListate: 2 } });
  const repo = repoNou();
  for (const f of ["a.txt", "b.txt", "c.txt", "d.txt"]) {
    fs.writeFileSync(path.join(repo, f), "x\n", "utf8");
  }
  git(["add", "-A"], repo);
  git(["commit", "-m", "test: patru fisiere", "--quiet"], repo);

  colector.colecteaza("commit", { cwd: repo, config });

  const ev = evenimente(vault, config)[0];
  assert.equal(ev.fisiere, 4, "numaratoarea ramane completa");
  assert.equal(ev.fisiereAtinse.length, 2, "doar lista afisata se taie");
});

test("config: un tip de eveniment scos din `activate` nu mai produce nimic", () => {
  const vault = vaultNou();
  const config = configPentru(vault, { evenimente: { activate: ["sesiune"] } });
  const repo = repoNou();
  comite(repo);

  colector.colecteaza("commit", { cwd: repo, config });

  assert.equal(evenimente(vault, config).length, 0);
});

test("ignorare: un proiect din lista ignorata nu produce niciun eveniment", () => {
  const vault = vaultNou();
  const repo = repoNou({ remote: "https://github.com/Econfaire/secret" });
  comite(repo);
  const config = configPentru(vault, {
    proiecteIgnorate: {
      dupaRemote: ["github.com/econfaire/secret"],
      dupaCale: [],
    },
  });

  colector.colecteaza("commit", { cwd: repo, config });

  assert.equal(evenimente(vault, config).length, 0);
});

// ------------------------------------------------- rezistenta la esec

test("vault lipsa: nu scrie nimic, nu arunca si nu inventeaza vaultul", () => {
  const vault = path.join(
    os.tmpdir(),
    "colector-vault-inexistent-" + process.pid,
  );
  const config = configPentru(vault);
  const repo = repoNou();
  comite(repo);

  assert.doesNotThrow(() =>
    colector.colecteaza("commit", { cwd: repo, config }),
  );
  assert.equal(fs.existsSync(vault), false);
});

test("in afara unui repo git: nu scrie nimic si nu arunca", () => {
  const vault = vaultNou();
  const config = configPentru(vault);
  const gol = tempDir("colector-nerepo-");

  assert.doesNotThrow(() =>
    colector.colecteaza("commit", { cwd: gol, config }),
  );
  assert.equal(evenimente(vault, config).length, 0);
});

test("CLI: chemat ca proces, iese cu 0 si nu scrie nimic pe stdout", () => {
  const vault = vaultNou();
  const config = configPentru(vault);
  const repo = repoNou({ remote: "https://github.com/x/y" });
  comite(repo, { mesaj: "fix: prin CLI" });

  const iesire = execFileSync(
    "node",
    [path.join(__dirname, "collect-event.js"), "commit"],
    {
      cwd: repo,
      env: { ...process.env, BRAIN_VAULT: vault },
      encoding: "utf8",
    },
  );

  assert.equal(
    iesire.trim(),
    "",
    "hook-ul nu are voie sa polueze iesirea lui git",
  );
  assert.equal(evenimente(vault, config)[0].subiect, "fix: prin CLI");
});
