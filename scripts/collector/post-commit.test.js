"use strict";

/**
 * Teste de integrare pentru hook-ul `githooks/post-commit`.
 *
 * Rulare:  node --test scripts/collector
 *
 * Testele de aici fac un `git commit` REAL, cu `core.hooksPath` indreptat spre
 * `githooks/` din vault, si verifica trei lucruri care nu se pot verifica din
 * teste unitare:
 *
 *   1. commit-ul se TERMINA (hook-ul nu-l blocheaza);
 *   2. jurnalul primeste exact un eveniment, nu zero si nu doua;
 *   3. un hook propriu al proiectului e chemat o singura data, fara recursie.
 *
 * Punctul 3 exista pentru ca a fost un defect real: `git rev-parse --git-path
 * hooks/post-commit` RESPECTA `core.hooksPath`, deci intorcea chiar hook-ul
 * global, care se chema pe sine. Rezultatul — 126 de procese `sh` si un
 * `git commit` blocat definitiv. Fara testul asta, defectul se intoarce tacut.
 *
 * Fiecare test isi face propriul repo si propriul vault in os.tmpdir(); niciunul
 * nu atinge vaultul real (BRAIN_VAULT il muta) sau repo-urile de lucru.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const {
  asteaptaEvenimente,
  evenimenteDupaLinistire,
} = require("./ajutoare-teste.js");

const RADACINA_VAULT = path.resolve(__dirname, "..", "..");
const GITHOOKS = path.join(RADACINA_VAULT, "githooks");

/** Plafon peste care consideram ca hook-ul a blocat commit-ul, nu ca a fost lent. */
const TIMEOUT_COMMIT_MS = 20000;

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function git(args, cwd, env) {
  return execFileSync("git", args, {
    cwd,
    env: env ? { ...process.env, ...env } : process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: TIMEOUT_COMMIT_MS,
  });
}

function repoCuHookGlobal() {
  const dir = tempDir("hook-repo-");
  git(["init", "--quiet", "--initial-branch=main"], dir);
  git(["config", "user.email", "test@example.com"], dir);
  git(["config", "user.name", "Test"], dir);
  git(["config", "commit.gpgsign", "false"], dir);
  git(["config", "core.hooksPath", GITHOOKS.replace(/\\/g, "/")], dir);
  git(
    [
      "config",
      "remote.origin.url",
      "https://github.com/exemplu/repo-de-test.git",
    ],
    dir,
  );
  return dir;
}

test("hook: un commit real se termina si produce exact un eveniment", async () => {
  const vault = tempDir("hook-vault-");
  const repo = repoCuHookGlobal();
  fs.writeFileSync(path.join(repo, "README.md"), "unu\ndoi\n", "utf8");
  git(["add", "-A"], repo);

  // daca hook-ul blocheaza, `timeout` opreste procesul si testul cade aici
  git(["commit", "-m", "feat: primul commit", "--quiet"], repo, {
    BRAIN_VAULT: vault,
  });

  const ev = await asteaptaEvenimente(vault, 1);
  assert.equal(ev.length, 1, "exact un eveniment per commit");
  assert.equal(ev[0].subiect, "feat: primul commit");
  assert.equal(
    ev[0].fisiere,
    1,
    "primul commit dintr-un repo trebuie sa raporteze fisierele lui",
  );
  assert.equal(ev[0].adaugate, 2);
  assert.equal(ev[0].proiect, "https://github.com/exemplu/repo-de-test");
});

test("hook: hook-ul propriu al proiectului ruleaza o data, fara recursie", async () => {
  const vault = tempDir("hook-vault-");
  const repo = repoCuHookGlobal();
  const martor = path.join(repo, "martor.txt");

  const localHook = path.join(repo, ".git", "hooks", "post-commit");
  fs.mkdirSync(path.dirname(localHook), { recursive: true });
  // se adauga o linie la fiecare rulare: recursia ar produce mai multe
  fs.writeFileSync(
    localHook,
    `#!/bin/sh\necho rulat >> "${martor.replace(/\\/g, "/")}"\n`,
    "utf8",
  );
  fs.chmodSync(localHook, 0o755);

  fs.writeFileSync(path.join(repo, "a.txt"), "x\n", "utf8");
  git(["add", "-A"], repo);
  git(["commit", "-m", "feat: cu hook local", "--quiet"], repo, {
    BRAIN_VAULT: vault,
  });

  const rulari = fs.existsSync(martor)
    ? fs.readFileSync(martor, "utf8").split("\n").filter(Boolean).length
    : 0;
  assert.equal(
    rulari,
    1,
    "hook-ul local ruleaza exact o data — nici zero, nici de doua ori",
  );
  const ev = await asteaptaEvenimente(vault, 1);
  assert.equal(ev.length, 1, "si jurnalul primeste tot un singur eveniment");
});

test("hook: daca colectorul crapa, commit-ul reuseste oricum", async () => {
  const vault = tempDir("hook-vault-");
  const repo = repoCuHookGlobal();
  fs.writeFileSync(path.join(repo, "a.txt"), "x\n", "utf8");
  git(["add", "-A"], repo);

  // Un `node` fals, pus PRIMUL in PATH, care iese cu eroare. Asa se exercita
  // exact ramura periculoasa: colectorul porneste si ESUEAZA. Commit-ul trebuie
  // sa treaca la fel de bine — jurnalul e optional, munca nu.
  //
  // (Varianta „golim PATH-ul complet" a fost incercata si e gresita: rupe git-ul
  //  insusi, deci nu testeaza hook-ul, ci mediul.)
  const binFals = tempDir("hook-bin-");
  const nodeFals = path.join(binFals, "node");
  fs.writeFileSync(nodeFals, "#!/bin/sh\nexit 1\n", "utf8");
  fs.chmodSync(nodeFals, 0o755);

  git(["commit", "-m", "feat: cu colector stricat", "--quiet"], repo, {
    BRAIN_VAULT: vault,
    PATH: `${binFals}${path.delimiter}${process.env.PATH}`,
  });

  assert.equal(
    git(["rev-list", "--count", "HEAD"], repo).trim(),
    "1",
    "commit-ul a intrat",
  );
  const ev = await evenimenteDupaLinistire(vault);
  assert.equal(ev.length, 0, "si jurnalul a tacut, fara sa strice nimic");
});
