"use strict";

/**
 * Teste pentru planul zilei — piesa care face dintr-un singur mesaj un plan
 * pentru toate proiectele atinse azi.
 *
 * Rulare:  node --test scripts/gata-pe-azi
 *
 * Toate testele lucreaza pe repo-uri temporare, sub o radacina temporara. Niciunul
 * nu se uita la proiectele reale: altfel rezultatul ar depinde de ce ai necomis
 * in momentul rularii.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { incarcaConfig } = require("./config.js");
const plan = require("./plan-zi.js");

function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function radacinaGoala() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "plan-radacina-"));
}

/**
 * Repo sub o radacina data.
 * `atins` — daca are muncă necomisa. `comiteAzi` — daca are commit-uri azi.
 * Un repo „neatins" are doar commit-ul de baza, antedatat, ca sa nu cada in ziua curenta.
 */
function repo(
  radacina,
  nume,
  { atins = false, comiteAzi = false, remote = null } = {},
) {
  const cale = path.join(radacina, nume);
  fs.mkdirSync(cale, { recursive: true });
  git(["init", "--quiet", "--initial-branch=main"], cale);
  git(["config", "user.email", "t@e.com"], cale);
  git(["config", "user.name", "T"], cale);
  git(["config", "commit.gpgsign", "false"], cale);
  git(
    ["config", "core.hooksPath", path.join(cale, ".git", "fara-hooks")],
    cale,
  );
  if (remote) git(["config", "remote.origin.url", remote], cale);

  fs.writeFileSync(path.join(cale, "baza.txt"), "x\n", "utf8");
  git(["add", "-A"], cale);
  // commit-ul de baza e antedatat: altfel ORICE repo ar parea atins azi
  execFileSync(
    "git",
    ["commit", "-m", "baza", "--quiet", "--date=2020-01-01T10:00:00"],
    {
      cwd: cale,
      env: { ...process.env, GIT_COMMITTER_DATE: "2020-01-01T10:00:00" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  if (comiteAzi) {
    fs.writeFileSync(path.join(cale, "azi.txt"), "y\n", "utf8");
    git(["add", "-A"], cale);
    git(["commit", "-m", "feat: azi", "--quiet"], cale);
  }
  if (atins) fs.writeFileSync(path.join(cale, "in-lucru.txt"), "z\n", "utf8");
  return cale;
}

function configCu(proiecte) {
  return incarcaConfig({
    brut: {
      proiecte: Object.fromEntries(
        Object.entries(proiecte).map(([nume, cale]) => [
          nume,
          { cale, ramuraBaza: "main", verificari: [] },
        ]),
      ),
    },
  });
}

const ZI = plan.ziuaDeLucru(incarcaConfig());

// ---------------------------------------------------------------- ziua

test("ziua de lucru: dupa ora de start, e ziua calendaristica", () => {
  const c = incarcaConfig({
    brut: { ziuaDeLucru: { oraStart: 5 }, proiecte: {} },
  });
  assert.equal(
    plan.ziuaDeLucru(c, new Date(2026, 7, 24, 22, 30)),
    "2026-08-24",
  );
});

test("ziua de lucru: la 01:30, „azi” inseamna ziua care tocmai s-a incheiat", () => {
  // Cine inchide dupa miezul noptii nu vorbeste despre ziua care abia incepe.
  const c = incarcaConfig({
    brut: { ziuaDeLucru: { oraStart: 5 }, proiecte: {} },
  });
  assert.equal(plan.ziuaDeLucru(c, new Date(2026, 7, 25, 1, 30)), "2026-08-24");
});

test("ziua de lucru: pragul se schimba din config, nu din cod", () => {
  const c = incarcaConfig({
    brut: { ziuaDeLucru: { oraStart: 3 }, proiecte: {} },
  });
  assert.equal(plan.ziuaDeLucru(c, new Date(2026, 7, 25, 4, 0)), "2026-08-25");
});

// ---------------------------------------------------------------- planul

test("intra in plan doar proiectele atinse azi", () => {
  const r = radacinaGoala();
  repo(r, "lucrat", { atins: true });
  repo(r, "nelucrat");
  const config = configCu({
    lucrat: path.join(r, "lucrat"),
    nelucrat: path.join(r, "nelucrat"),
  });

  const p = plan.construiestePlan({ config, radacini: [r], zi: ZI });

  assert.deepEqual(
    p.deLucru.map((x) => x.proiect.nume),
    ["lucrat"],
  );
  assert.ok(
    p.sarite.some((s) => s.nume === "nelucrat" && s.motiv === "neatins azi"),
  );
});

test("un proiect cu commit-uri azi, dar fara munca necomisa, intra si el", () => {
  const r = radacinaGoala();
  repo(r, "comis-azi", { comiteAzi: true });
  const config = configCu({ "comis-azi": path.join(r, "comis-azi") });

  const p = plan.construiestePlan({ config, radacini: [r], zi: ZI });

  assert.equal(p.deLucru.length, 1);
  assert.equal(p.deLucru[0].commituri, 1);
  assert.equal(p.deLucru[0].necomise, false);
});

test("un proiect ATINS dar absent din registru e raportat, nu ignorat", () => {
  // Altfel „am lucrat la ceva si n-a aparut nicaieri" arata identic cu „n-am lucrat".
  const r = radacinaGoala();
  repo(r, "in-registru", { atins: true });
  repo(r, "strain", { atins: true, remote: "https://github.com/x/strain" });
  const config = configCu({ "in-registru": path.join(r, "in-registru") });

  const p = plan.construiestePlan({ config, radacini: [r], zi: ZI });

  assert.equal(p.deLucru.length, 1);
  assert.equal(p.lipsescDinRegistru.length, 1);
  assert.match(p.lipsescDinRegistru[0].cale, /strain/);
});

test("un proiect neatins si absent din registru NU face zgomot", () => {
  const r = radacinaGoala();
  repo(r, "strain-linistit");
  const p = plan.construiestePlan({
    config: configCu({}),
    radacini: [r],
    zi: ZI,
  });
  assert.equal(p.lipsescDinRegistru.length, 0);
});

test("acelasi remote la doua cai e raportat ca o clona", () => {
  const r = radacinaGoala();
  const url = "https://github.com/tewtzu-ctrl/ceva";
  repo(r, "original", { atins: true, remote: url });
  repo(r, "clona", { remote: url });
  const config = configCu({ original: path.join(r, "original") });

  const p = plan.construiestePlan({ config, radacini: [r], zi: ZI });

  assert.equal(p.duplicate.length, 1);
  assert.equal(p.duplicate[0].cai.length, 2);
});

test("doua repo-uri FARA remote nu sunt confundate cu o clona", () => {
  const r = radacinaGoala();
  repo(r, "unu", { atins: true });
  repo(r, "doi", { atins: true });
  const p = plan.construiestePlan({
    config: configCu({}),
    radacini: [r],
    zi: ZI,
  });
  assert.equal(p.duplicate.length, 0);
});

test("un proiect din registru care nu mai exista pe disc e raportat", () => {
  const config = configCu({
    disparut: path.join(os.tmpdir(), "nu-exista-" + process.pid),
  });
  const p = plan.construiestePlan({ config, radacini: [], zi: ZI });
  assert.ok(
    p.sarite.some(
      (s) => s.nume === "disparut" && /nu există pe disc/.test(s.motiv),
    ),
  );
});

test("o zi fara niciun proiect atins produce un plan gol, nu o eroare", () => {
  const r = radacinaGoala();
  repo(r, "linistit");
  const config = configCu({ linistit: path.join(r, "linistit") });

  const p = plan.construiestePlan({ config, radacini: [r], zi: ZI });

  assert.equal(p.deLucru.length, 0);
  assert.match(plan.rezumat(p), /niciun proiect atins azi/);
});

test("rezumatul spune ce se lucreaza in paralel si ce lipseste", () => {
  const r = radacinaGoala();
  repo(r, "unu", { atins: true });
  repo(r, "doi", { comiteAzi: true });
  const config = configCu({
    unu: path.join(r, "unu"),
    doi: path.join(r, "doi"),
  });

  const text = plan.rezumat(
    plan.construiestePlan({ config, radacini: [r], zi: ZI }),
  );

  assert.match(text, /De lucru \(2\), în paralel/);
  assert.match(text, /• unu — fișiere modificate azi/);
  assert.match(text, /• doi — 1 commit-uri/);
});

// --------------------------------------------- „atins azi" nu inseamna „necomis"

test("un fisier necomis VECHI nu face proiectul sa para lucrat azi", () => {
  // Defect real, prins la prima rulare adevarata: doua proiecte neatinse de
  // 5 si de 17 zile au intrat in planul zilei si au primit fiecare cate un
  // agent de review, degeaba. Fisierele necomise arata UNDE ai ramas, nu CAND.
  const r = radacinaGoala();
  const cale = repo(r, "vechi", { atins: true });

  // fisierul necomis, imbatranit cu 17 zile
  const acum = Date.now();
  const acum17Zile = new Date(acum - 17 * 24 * 3600 * 1000);
  fs.utimesSync(path.join(cale, "in-lucru.txt"), acum17Zile, acum17Zile);

  const config = configCu({ vechi: cale });
  const p = plan.construiestePlan({ config, radacini: [r], zi: ZI });

  assert.equal(p.deLucru.length, 0, "nu intra in planul zilei");
  assert.match(
    p.sarite.find((s) => s.nume === "vechi").motiv,
    /neatins azi \(are muncă necomisă, dar mai veche\)/,
  );
});

test("un fisier necomis SALVAT azi face proiectul sa intre in plan", () => {
  const r = radacinaGoala();
  const cale = repo(r, "proaspat", { atins: true });
  const config = configCu({ proaspat: cale });

  const p = plan.construiestePlan({ config, radacini: [r], zi: ZI });

  assert.equal(p.deLucru.length, 1);
  assert.equal(p.deLucru[0].necomise, true);
});

test("un proiect cu commit azi intra chiar daca fisierele necomise sunt vechi", () => {
  const r = radacinaGoala();
  const cale = repo(r, "comis-azi-dar-vechi", { atins: true, comiteAzi: true });
  const vechi = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  fs.utimesSync(path.join(cale, "in-lucru.txt"), vechi, vechi);

  const config = configCu({ "comis-azi-dar-vechi": cale });
  const p = plan.construiestePlan({ config, radacini: [r], zi: ZI });

  assert.equal(p.deLucru.length, 1, "commit-ul de azi e suficient");
  assert.equal(p.deLucru[0].commituri, 1);
  assert.equal(
    p.deLucru[0].necomise,
    false,
    "iar fisierele vechi nu se numara ca lucru de azi",
  );
});
