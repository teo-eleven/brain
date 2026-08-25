"use strict";

/**
 * Teste pentru evenimentul de sesiune (`SessionEnd` din Claude Code).
 *
 * Rulare:  node --test scripts/collector
 *
 * De ce `SessionEnd` si nu `Stop`: `Stop` se declanseaza dupa FIECARE raspuns al
 * modelului, deci ar fi produs zeci de intrari pe zi pentru aceeasi sesiune.
 * Confirmat direct in binarul instalat (Claude Code 2.1.241), care declara
 * `hook_event_name: "SessionEnd"` cu un camp `reason`.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { incarcaConfig } = require("./config.js");
const { citesteEvenimente } = require("./ajutoare-teste.js");
const colector = require("./collect-event.js");

const CONFIG_REAL = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf8"),
);

function configCu(vault, suprascrieri = {}) {
  return incarcaConfig({
    caleVault: vault,
    brut: { ...CONFIG_REAL, ...suprascrieri },
  });
}

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

function repoNou({ remote = null } = {}) {
  const dir = tempDir("sesiune-repo-");
  git(["init", "--quiet", "--initial-branch=main"], dir);
  git(["config", "user.email", "test@example.com"], dir);
  git(["config", "user.name", "Test"], dir);
  git(["config", "commit.gpgsign", "false"], dir);
  git(["config", "core.hooksPath", path.join(dir, ".git", "fara-hooks")], dir);
  if (remote) git(["config", "remote.origin.url", remote], dir);
  fs.writeFileSync(path.join(dir, "start.txt"), "x\n", "utf8");
  git(["add", "-A"], dir);
  git(["commit", "-m", "test: start", "--quiet"], dir);
  return dir;
}

const INTRARE = {
  session_id: "abc-123",
  reason: "prompt_input_exit",
  transcript_path: "C:/undeva/transcript.jsonl",
};

test("sesiune: retine proiectul, ramura si ce a ramas necomis", () => {
  const vault = tempDir("sesiune-vault-");
  const config = configCu(vault);
  const repo = repoNou({ remote: "https://github.com/exemplu/proiect.git" });

  // munca lasata in lucru: un fisier modificat si unul neurmarit
  fs.writeFileSync(path.join(repo, "start.txt"), "x\ny\n", "utf8");
  fs.writeFileSync(path.join(repo, "nou.txt"), "z\n", "utf8");

  colector.colecteaza("sesiune", { cwd: repo, config, intrare: INTRARE });

  const ev = citesteEvenimente(vault)[0];
  assert.equal(ev.tip, "sesiune");
  assert.equal(ev.proiect, "https://github.com/exemplu/proiect");
  assert.equal(ev.ramura, "main");
  assert.equal(ev.sesiune, "abc-123");
  assert.equal(ev.motiv, "prompt_input_exit");
  assert.equal(ev.necomise, 2);
  assert.deepEqual([...ev.fisiereNecomise].sort(), ["nou.txt", "start.txt"]);
});

test("sesiune: un arbore curat se noteaza tot, cu zero necomise", () => {
  // O sesiune in care ai terminat si ai comis tot e o informatie utila, nu una
  // de sarit: arata ca ziua s-a inchis curat pe proiectul acela.
  const vault = tempDir("sesiune-vault-");
  const config = configCu(vault);
  const repo = repoNou();

  colector.colecteaza("sesiune", { cwd: repo, config, intrare: INTRARE });

  const ev = citesteEvenimente(vault)[0];
  assert.equal(ev.necomise, 0);
  assert.deepEqual(ev.fisiereNecomise, []);
});

test("sesiune: NU citeste transcriptul, doar il primeste", () => {
  // Decizie asumata la alegerea surselor: conversatiile nu intra in jurnal.
  // Testul o fixeaza, ca sa nu se strecoare mai tarziu „doar un rezumat".
  const vault = tempDir("sesiune-vault-");
  const config = configCu(vault);
  const repo = repoNou();

  colector.colecteaza("sesiune", { cwd: repo, config, intrare: INTRARE });

  const ev = citesteEvenimente(vault)[0];
  assert.equal(
    JSON.stringify(ev).includes("transcript"),
    false,
    "nicio urma a transcriptului in evenimentul scris",
  );
});

test("sesiune: fara repo git nu se scrie nimic, cu setarea implicita", () => {
  const vault = tempDir("sesiune-vault-");
  const config = configCu(vault);
  const gol = tempDir("sesiune-nerepo-");

  colector.colecteaza("sesiune", { cwd: gol, config, intrare: INTRARE });

  assert.equal(citesteEvenimente(vault).length, 0);
});

test("sesiune: cu `doarInRepoGit: false`, se scrie si in afara git-ului", () => {
  // Comportamentul se schimba din config, fara sa se atinga codul.
  const vault = tempDir("sesiune-vault-");
  const config = configCu(vault, { sesiune: { doarInRepoGit: false } });
  const gol = tempDir("sesiune-nerepo-");

  colector.colecteaza("sesiune", { cwd: gol, config, intrare: INTRARE });

  const ev = citesteEvenimente(vault)[0];
  assert.match(ev.proiect, /^local:/);
  assert.equal(ev.ramura, null);
});

test("sesiune: un proiect ignorat ramane ignorat si la sesiuni", () => {
  // Bariera pentru repo-urile de echipa trebuie sa acopere TOATE tipurile de
  // eveniment. Daca ar acoperi doar commit-urile, numele fisierelor necomise
  // dintr-un repo de client ar ajunge oricum in jurnal.
  const vault = tempDir("sesiune-vault-");
  const repo = repoNou({ remote: "https://github.com/client/secret" });
  const config = configCu(vault, {
    proiecteIgnorate: { dupaRemote: ["https://github.com/client/secret"] },
  });

  colector.colecteaza("sesiune", { cwd: repo, config, intrare: INTRARE });

  assert.equal(citesteEvenimente(vault).length, 0);
});

test("sesiune: scoasa din `evenimente.activate`, nu mai produce nimic", () => {
  const vault = tempDir("sesiune-vault-");
  const config = configCu(vault, { evenimente: { activate: ["commit"] } });
  const repo = repoNou();

  colector.colecteaza("sesiune", { cwd: repo, config, intrare: INTRARE });

  assert.equal(citesteEvenimente(vault).length, 0);
});

test("sesiune: fara date pe stdin, evenimentul se scrie oricum", () => {
  // Mai bine o intrare fara identificator de sesiune decat o zi fara intrare.
  const vault = tempDir("sesiune-vault-");
  const config = configCu(vault);
  const repo = repoNou();

  colector.colecteaza("sesiune", { cwd: repo, config });

  const ev = citesteEvenimente(vault)[0];
  assert.equal(ev.sesiune, null);
  assert.equal(ev.motiv, null);
  assert.equal(ev.tip, "sesiune");
});

test("sesiune: CLI-ul citeste JSON-ul de pe stdin, ca un hook adevarat", () => {
  const vault = tempDir("sesiune-vault-");
  const config = configCu(vault);
  const repo = repoNou({ remote: "https://github.com/exemplu/prin-stdin" });
  fs.writeFileSync(path.join(repo, "in-lucru.txt"), "q\n", "utf8");

  const iesire = execFileSync(
    "node",
    [path.join(__dirname, "collect-event.js"), "sesiune"],
    {
      cwd: repo,
      input: JSON.stringify({
        session_id: "prin-stdin-1",
        reason: "clear",
        hook_event_name: "SessionEnd",
      }),
      env: { ...process.env, BRAIN_VAULT: vault },
      encoding: "utf8",
    },
  );

  assert.equal(iesire.trim(), "", "un hook nu are voie sa scrie pe stdout");
  const ev = citesteEvenimente(vault, config)[0];
  assert.equal(ev.sesiune, "prin-stdin-1");
  assert.equal(ev.motiv, "clear");
  assert.equal(ev.necomise, 1);
});

test("commit: citirea de stdin NU se face pentru commit-uri", () => {
  // Daca CLI-ul ar citi stdin si pentru `commit`, hook-ul de git ar putea ramane
  // blocat asteptand date care nu vin niciodata. Aici stdin e lasat deschis
  // fara continut, iar comanda trebuie sa se termine oricum.
  const vault = tempDir("sesiune-vault-");
  const repo = repoNou({ remote: "https://github.com/exemplu/fara-stdin" });

  execFileSync("node", [path.join(__dirname, "collect-event.js"), "commit"], {
    cwd: repo,
    input: "",
    env: { ...process.env, BRAIN_VAULT: vault },
    encoding: "utf8",
    timeout: 15000,
  });

  assert.equal(citesteEvenimente(vault)[0].tip, "commit");
});
