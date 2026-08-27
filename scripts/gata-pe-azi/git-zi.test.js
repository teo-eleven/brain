"use strict";

/**
 * Teste pentru faza de git.
 *
 * Rulare:  node --test scripts/gata-pe-azi
 *
 * Fiecare test isi face propriul repo in os.tmpdir(), cu un remote FALS (un repo
 * bare local). Niciun test nu atinge un repo real si niciunul nu ajunge pe
 * internet — un test care greseste aici ar publica pe remote-ul unei echipe.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { incarcaConfig } = require("./config.js");
const gz = require("./git-zi.js");

const CONFIG = incarcaConfig();
const ZI = "2026-08-24";

function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

/** Repo de lucru, cu un „remote" care e de fapt un repo bare local. */
function repoCuRemote({ ramura = "dev", modificari = true } = {}) {
  const bare = fs.mkdtempSync(path.join(os.tmpdir(), "gz-remote-"));
  execFileSync("git", ["init", "--bare", "--quiet", bare]);

  const cale = fs.mkdtempSync(path.join(os.tmpdir(), "gz-repo-"));
  git(["init", "--quiet", `--initial-branch=${ramura}`], cale);
  git(["config", "user.email", "test@example.com"], cale);
  git(["config", "user.name", "Test"], cale);
  git(["config", "commit.gpgsign", "false"], cale);
  git(
    ["config", "core.hooksPath", path.join(cale, ".git", "fara-hooks")],
    cale,
  );
  git(["remote", "add", "origin", bare.replace(/\\/g, "/")], cale);

  fs.writeFileSync(path.join(cale, "baza.txt"), "x\n", "utf8");
  git(["add", "-A"], cale);
  git(["commit", "-m", "test: baza", "--quiet"], cale);

  if (modificari) fs.writeFileSync(path.join(cale, "nou.txt"), "y\n", "utf8");
  return { cale, bare, proiect: { nume: "test", cale, ramuraBaza: ramura } };
}

const OPT = (extra = {}) => ({
  config: CONFIG,
  zi: ZI,
  sufix: "review si reparatii",
  mesaj: "fix: reparațiile de la review",
  ...extra,
});

// ---------------------------------------------------------------- nume

test("nume: sufixul pierde diacriticele si spatiile, dar ramane citibil", () => {
  assert.equal(
    gz.numeRamura(CONFIG, ZI, "Ștergere categorie și buget"),
    "fix/review-2026-08-24-stergere-categorie-si-buget",
  );
});

test("nume: un sufix gol nu produce o ramura cu nume rupt", () => {
  assert.equal(
    gz.numeRamura(CONFIG, ZI, ""),
    "fix/review-2026-08-24-modificari",
  );
});

// ---------------------------------------------------------------- comit

test("comite pe o ramura NOUA, nu pe cea pe care erai", () => {
  const { cale, proiect } = repoCuRemote({ ramura: "dev" });

  const r = gz.pregateste(proiect, OPT());

  assert.equal(r.actiune, "comis");
  assert.equal(r.ramuraDinainte, "dev");
  assert.equal(r.ramura, "fix/review-2026-08-24-review-si-reparatii");
  assert.equal(gz.ramuraCurenta(cale), r.ramura);
});

test("numaratoarea de fisiere e cea REALA, nu cu unul in plus", () => {
  // `repoCuRemote` cu modificari implicit adauga UN singur fisier nou
  // (nou.txt) peste baza deja comisa. `git show --stat --oneline` scoate
  // randul de antet si cel de rezumat pe langa randul de fisier — numaratoarea
  // trebuie sa scada AMANDOUA, nu doar unul.
  const { proiect } = repoCuRemote({ ramura: "dev" });

  const r = gz.pregateste(proiect, OPT());

  assert.equal(r.fisiere, 1);
});

test("`dev` ramane NEATINSA — bariera care conteaza cel mai mult", () => {
  const { cale, proiect } = repoCuRemote({ ramura: "dev" });
  const inainte = git(["rev-parse", "dev"], cale);

  gz.pregateste(proiect, OPT());

  assert.equal(
    git(["rev-parse", "dev"], cale),
    inainte,
    "dev n-a primit niciun commit",
  );
  assert.equal(
    git(["rev-list", "--count", "dev..HEAD"], cale),
    "1",
    "commit-ul e doar pe ramura noua",
  );
});

test("se semnaleaza ca porneai de pe o ramura protejata", () => {
  const { proiect } = repoCuRemote({ ramura: "dev" });
  assert.equal(gz.pregateste(proiect, OPT()).eraPeRamuraProtejata, true);

  const alt = repoCuRemote({ ramura: "feat/ceva" });
  assert.equal(gz.pregateste(alt.proiect, OPT()).eraPeRamuraProtejata, false);
});

test("un repo fara modificari e sarit, nu comis gol", () => {
  const { proiect } = repoCuRemote({ modificari: false });
  const r = gz.pregateste(proiect, OPT());
  assert.equal(r.actiune, "sarit");
  assert.equal(r.motiv, "nimic de comis");
});

test("o cale inexistenta e raportata, nu ignorata si nu aruncata", () => {
  const r = gz.pregateste(
    {
      nume: "fantoma",
      cale: path.join(os.tmpdir(), "nu-exista-" + process.pid),
    },
    OPT(),
  );
  assert.equal(r.actiune, "sarit");
  assert.match(r.motiv, /nu există pe disc/);
});

test("un folder care nu e repo git e sarit", () => {
  const cale = fs.mkdtempSync(path.join(os.tmpdir(), "gz-nerepo-"));
  const r = gz.pregateste({ nume: "x", cale }, OPT());
  assert.equal(r.actiune, "sarit");
  assert.equal(r.motiv, "nu e repo git");
});

test("a doua rulare in aceeasi zi refoloseste ramura, nu crapa", () => {
  const { cale, proiect } = repoCuRemote();
  gz.pregateste(proiect, OPT());

  fs.writeFileSync(path.join(cale, "inca-unul.txt"), "z\n", "utf8");
  const r = gz.pregateste(proiect, OPT());

  assert.equal(r.actiune, "comis");
  assert.equal(git(["rev-list", "--count", "dev..HEAD"], cale), "2");
});

// ---------------------------------------------------------------- push

/** Config cu urcarea oprita — mecanismul se testeaza independent de politica zilei. */
const CONFIG_FARA_PUSH = {
  ...CONFIG,
  git: { ...CONFIG.git, pushAutomat: false },
};

test("cu `pushAutomat: false`, push-ul e REFUZAT fara confirmare", () => {
  // Mecanismul trebuie sa ramana, chiar daca politica actuala e sa se urce
  // automat: `pushAutomat` e un comutator din config, iar cine il pune pe
  // `false` trebuie sa fie sigur ca oprirea chiar functioneaza.
  const { proiect } = repoCuRemote();
  const comis = gz.pregateste(proiect, OPT());

  const r = gz.publica(comis, { config: CONFIG_FARA_PUSH });

  assert.equal(r.push, "refuzat");
  assert.equal(r.motiv, "lipsește confirmarea");
});

test("cu `pushAutomat: true`, ramura urca fara sa se mai ceara nimic", () => {
  // Politica aleasa pe 24.08: urcarea face parte din „gata pe azi".
  const { bare, proiect } = repoCuRemote();
  const comis = gz.pregateste(proiect, OPT());

  const r = gz.publica(comis, { config: CONFIG });

  assert.equal(r.push, "urcat");
  assert.match(
    execFileSync("git", ["branch", "--list"], { cwd: bare, encoding: "utf8" }),
    /fix\/review-2026-08-24/,
  );
});

test("push-ul nu a atins remote-ul cat timp a fost refuzat", () => {
  const { bare, proiect } = repoCuRemote();
  const comis = gz.pregateste(proiect, OPT());
  gz.publica(comis, { config: CONFIG_FARA_PUSH });

  const ramuriPeRemote = execFileSync("git", ["branch", "--list"], {
    cwd: bare,
    encoding: "utf8",
  }).trim();
  assert.equal(ramuriPeRemote, "", "remote-ul e gol — nimic n-a plecat");
});

test("cu confirmare, ramura ajunge pe remote", () => {
  const { bare, proiect } = repoCuRemote();
  const comis = gz.pregateste(proiect, OPT());

  const r = gz.publica(comis, { config: CONFIG, confirmat: true });

  assert.equal(r.push, "urcat");
  assert.match(
    execFileSync("git", ["branch", "--list"], { cwd: bare, encoding: "utf8" }),
    /fix\/review-2026-08-24/,
  );
});

test("un proiect care n-a fost comis nu se publica nici cu confirmare", () => {
  const { proiect } = repoCuRemote({ modificari: false });
  const sarit = gz.pregateste(proiect, OPT());

  const r = gz.publica(sarit, { config: CONFIG, confirmat: true });

  assert.equal(r.push, "sărit");
});

test("fiecare proiect primeste o ramura NOUA, si vaultul la fel", () => {
  // Cerinta proprietarului (24.08): fara exceptii. Vaultul avea inainte
  // `creeazaRamuraNoua: false`, ca sa-si pastreze fluxul propriu de ramuri.
  const configReal = require("./config.js").incarcaConfig();
  for (const [nume, p] of Object.entries(configReal.proiecte)) {
    assert.equal(
      p.creeazaRamuraNoua,
      true,
      `${nume} trebuie sa primeasca ramura noua`,
    );
  }
});
