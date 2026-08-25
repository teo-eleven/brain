"use strict";

/**
 * Regresii — cate un test pentru fiecare defect gasit la code review.
 *
 * Rulare:  node --test scripts/collector
 *
 * Toate cele de aici au fost defecte REALE, nu ipoteze: au fost demonstrate
 * rulate, nu deduse din citirea codului. Testele exista ca sa nu se intoarca
 * tacut — fiecare are, in comentariu, ce se intampla daca reparatia dispare.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { incarcaConfig } = require("./config.js");
const { asteaptaEvenimente } = require("./ajutoare-teste.js");
const colector = require("./collect-event.js");

const RADACINA_VAULT = path.resolve(__dirname, "..", "..");
const GITHOOKS = path.join(RADACINA_VAULT, "githooks").replace(/\\/g, "/");
const TIMEOUT_COMMIT_MS = 20000;

/**
 * Configul REAL, ca punct de plecare pentru suprascrierile din teste.
 *
 * Necesar, nu comod: `incarcaConfig({brut})` inlocuieste TOT fisierul, deci un
 * `brut` care contine doar `proiecteIgnorate` lasa `evenimente.activate` gol —
 * iar atunci colectorul nu scrie nimic, indiferent de ce testezi. Doua teste de
 * ignorare treceau exact asa: verde, dar din motivul gresit.
 */
const CONFIG_REAL = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf8"),
);

function configCu(vault, suprascrieri) {
  return incarcaConfig({
    caleVault: vault,
    brut: { ...CONFIG_REAL, ...suprascrieri },
  });
}

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function git(args, cwd, env, timeoutMs = TIMEOUT_COMMIT_MS) {
  return execFileSync("git", args, {
    cwd,
    env: env ? { ...process.env, ...env } : process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: timeoutMs,
  });
}

function repoNou({ remote = null, hookGlobal = false } = {}) {
  const dir = tempDir("regresie-repo-");
  git(["init", "--quiet", "--initial-branch=main"], dir);
  git(["config", "user.email", "test@example.com"], dir);
  git(["config", "user.name", "Test"], dir);
  git(["config", "commit.gpgsign", "false"], dir);
  git(
    [
      "config",
      "core.hooksPath",
      hookGlobal ? GITHOOKS : path.join(dir, ".git", "fara-hooks"),
    ],
    dir,
  );
  if (remote) git(["config", "remote.origin.url", remote], dir);
  return dir;
}

function comite(repo, { fisier = "a.txt", mesaj = "test: ceva", env } = {}) {
  fs.writeFileSync(path.join(repo, fisier), "x\n", "utf8");
  git(["add", "-A"], repo);
  git(["commit", "-m", mesaj, "--quiet"], repo, env);
}

function evenimenteleZilei(vault) {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const zi = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const f = path.join(vault, ".events", `${zi}.jsonl`);
  if (!fs.existsSync(f)) return [];
  return fs
    .readFileSync(f, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

// --------------------------------------------------- ignorate: normalizare

test("ignorare: o cale scrisa cu backslash (cum o copiezi din Explorer) chiar ignora", () => {
  // Inainte: `radacina` vine de la git cu slash-uri, intrarea din config ramanea
  // cu backslash, `startsWith` nu se potrivea niciodata — iar proiectul de
  // echipa pe care voiai sa-l tii afara din jurnal intra in el, in tacere.
  const vault = tempDir("regresie-vault-");
  const repo = repoNou();
  comite(repo);

  // Calea se ia de la GIT, nu de la `os.tmpdir()`: pe Windows, tmpdir intoarce
  // forma scurta 8.3 („TEODOR~1.FOT"), iar git forma lunga — iar testul ar cadea
  // pe diferenta aia, nu pe ce vrea sa verifice. Aici se testeaza doar
  // backslash-ul, adica forma in care un om copiaza o cale din Explorer.
  const caleGit = git(["rev-parse", "--show-toplevel"], repo).trim();
  const c = configCu(vault, {
    proiecteIgnorate: { dupaCale: [caleGit.replace(/\//g, "\\")] },
  });
  colector.colecteaza("commit", { cwd: repo, config: c });

  assert.equal(evenimenteleZilei(vault).length, 0);
});

test("ignorare: un remote copiat din GitHub in forma ssh chiar ignora", () => {
  // Inainte: identitatea era normalizata (https, fara .git), intrarea din config
  // doar trecuta prin toLowerCase — deci „git@github.com:Org/repo.git" nu se
  // potrivea cu nimic si repo-ul continua sa fie jurnalizat.
  const vault = tempDir("regresie-vault-");
  const repo = repoNou({
    remote: "https://github.com/Econfaire/ecf-adm-expert.git",
  });
  comite(repo);

  const c = configCu(vault, {
    proiecteIgnorate: {
      dupaRemote: ["git@github.com:Econfaire/ecf-adm-expert.git"],
    },
  });
  colector.colecteaza("commit", { cwd: repo, config: c });

  assert.equal(evenimenteleZilei(vault).length, 0);
});

test("ignorare: un prefix nu inghite un proiect cu nume asemanator", () => {
  // „acme/app" nu are voie sa opreasca si „acme/app-mobile": efectul ar fi
  // pierdere tacuta de evenimente pentru un proiect pe care nu l-ai vizat.
  const vault = tempDir("regresie-vault-");
  const repo = repoNou({ remote: "https://github.com/acme/app-mobile" });
  comite(repo);

  const c = configCu(vault, {
    proiecteIgnorate: { dupaRemote: ["https://github.com/acme/app"] },
  });
  colector.colecteaza("commit", { cwd: repo, config: c });

  assert.equal(evenimenteleZilei(vault).length, 1, "app-mobile NU e app");
});

// --------------------------------------------------- diacritice

test("fisiere: un nume cu diacritice ajunge intreg in jurnal", () => {
  // Inainte: `core.quotePath` (activ implicit) scria „fișier.txt" ca
  // `"fi\310\231ier.txt"` — ilizibil, si imposibil de legat de fisierul real.
  const vault = tempDir("regresie-vault-");
  const config = incarcaConfig({ caleVault: vault });
  const repo = repoNou();
  comite(repo, {
    fisier: "fișier cu diacritice.txt",
    mesaj: "test: diacritice",
  });

  colector.colecteaza("commit", { cwd: repo, config });

  const ev = evenimenteleZilei(vault)[0];
  assert.deepEqual(ev.fisiereAtinse, ["fișier cu diacritice.txt"]);
});

// --------------------------------------------------- worktree

test("hook: intr-un worktree secundar, hook-ul local al proiectului tot ruleaza", async () => {
  // Inainte: `--absolute-git-dir` intoarce `<repo>/.git/worktrees/<nume>`, care
  // n-are `hooks/`, deci hook-ul altei unelte (husky si celelalte) era sarit
  // tacut la orice commit facut dintr-un worktree.
  const vault = tempDir("regresie-vault-");
  const repo = repoNou({
    remote: "https://github.com/exemplu/cu-worktree",
    hookGlobal: true,
  });
  comite(repo, { mesaj: "feat: commit initial", env: { BRAIN_VAULT: vault } });

  const martor = path
    .join(tempDir("regresie-martor-"), "rulari.txt")
    .replace(/\\/g, "/");
  const hookComun = path.join(repo, ".git", "hooks", "post-commit");
  fs.mkdirSync(path.dirname(hookComun), { recursive: true });
  fs.writeFileSync(hookComun, `#!/bin/sh\necho rulat >> "${martor}"\n`, "utf8");
  fs.chmodSync(hookComun, 0o755);

  const wt = path.join(tempDir("regresie-wt-"), "ramura");
  git(["worktree", "add", "--quiet", "-b", "secundara", wt], repo);
  fs.writeFileSync(path.join(wt, "b.txt"), "y\n", "utf8");
  git(["add", "-A"], wt);
  git(["commit", "-m", "feat: din worktree", "--quiet"], wt, {
    BRAIN_VAULT: vault,
  });

  const rulari = fs.existsSync(martor)
    ? fs.readFileSync(martor, "utf8").split("\n").filter(Boolean).length
    : 0;
  assert.equal(
    rulari,
    1,
    "hook-ul comun trebuie chemat exact o data si din worktree",
  );
  const ev = await asteaptaEvenimente(vault, 2);
  assert.equal(ev.length, 2, "iar jurnalul a primit ambele commit-uri");
});

// --------------------------------------------------- plafon de timp

test("hook: un colector care se blocheaza nu tine commit-ul mai mult decat plafonul", () => {
  // Inainte: `git.timeoutMs` acoperea doar interogarile git. O scriere blocata
  // (disc de retea, cale de vault indisponibila) ar fi atarnat la nesfarsit, iar
  // `git commit` odata cu ea — exact ce n-are voie sa se intample.
  const vault = tempDir("regresie-vault-");
  const repo = repoNou({ hookGlobal: true });
  fs.writeFileSync(path.join(repo, "a.txt"), "x\n", "utf8");
  git(["add", "-A"], repo);

  // `node` fals care doarme mult mai mult decat plafonul din config
  const binFals = tempDir("regresie-bin-");
  const nodeFals = path.join(binFals, "node");
  fs.writeFileSync(nodeFals, "#!/bin/sh\nsleep 120\n", "utf8");
  fs.chmodSync(nodeFals, 0o755);

  const plafonS = incarcaConfig({ caleVault: vault }).hook.timeoutTotalSecunde;
  const inceput = Date.now();
  // Rabdarea harnasamentului trebuie sa fie MAI MARE decat plafonul testat,
  // altfel testul isi omoara singur commit-ul si nu afla nimic despre plasa de
  // siguranta. (Prima varianta avea 20s fix, exact cat plafonul — si cadea.)
  git(
    ["commit", "-m", "feat: cu colector blocat", "--quiet"],
    repo,
    {
      BRAIN_VAULT: vault,
      PATH: `${binFals}${path.delimiter}${process.env.PATH}`,
    },
    (plafonS + 40) * 1000,
  );
  const durataS = (Date.now() - inceput) / 1000;

  assert.equal(
    git(["rev-list", "--count", "HEAD"], repo).trim(),
    "1",
    "commit-ul a intrat",
  );
  assert.ok(
    durataS < plafonS + 10,
    `commit-ul a durat ${durataS.toFixed(1)}s, peste plafonul de ${plafonS}s — plasa de siguranta nu a functionat`,
  );
});

test("config: plafonul hook-ului e citit din config si validat", () => {
  assert.ok(incarcaConfig().hook.timeoutTotalSecunde > 0);
  assert.throws(
    () => incarcaConfig({ brut: { hook: { timeoutTotalSecunde: 0 } } }),
    /hook\.timeoutTotalSecunde/,
  );
});
