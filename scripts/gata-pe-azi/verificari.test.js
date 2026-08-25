"use strict";

/**
 * Teste pentru motorul de verificare.
 *
 * Rulare:  node --test scripts/gata-pe-azi
 *
 * Comenzile din teste sunt banale (`node -e`), niciodata retetele reale: o suita
 * de teste care ruleaza alte suite de teste ar dura minute si ar depinde de
 * starea containerelor. Ce se verifica aici e MECANISMUL — esec, timeout, linia
 * de baza, comparatia — nu comenzile in sine.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");

const { incarcaConfig, ConfigInvalid } = require("./config.js");
const v = require("./verificari.js");

const CONFIG = incarcaConfig();

function proiectFals(verificari, sanatate = []) {
  return {
    nume: "test",
    cale: fs.mkdtempSync(path.join(os.tmpdir(), "verif-")),
    ramuraBaza: "main",
    verificari: verificari.map((x) => ({
      cwd: ".",
      timeoutSecunde: 30,
      ...x,
    })),
    sanatate,
    neacoperit: [],
  };
}

// ---------------------------------------------------------------- config

test("config: registrul se incarca si stie proiectul real", () => {
  const c = incarcaConfig();
  assert.ok(c.proiecte["ecf-adm-expert"], "ADM Expert e in registru");
  assert.ok(c.proiecte["ecf-adm-expert"].verificari.length >= 3);
  assert.equal(c.git.pushAutomat, true, "urcarea face parte din feature");
});

test("config: `dev` si `main` sunt ramuri interzise pentru commit direct", () => {
  const c = incarcaConfig();
  for (const r of ["main", "dev"]) {
    assert.ok(
      c.git.ramuriInterzise.includes(r),
      `${r} trebuie sa fie interzisa`,
    );
  }
});

test("config: o reteta fara comanda e respinsa cu numele campului", () => {
  assert.throws(
    () =>
      incarcaConfig({
        brut: {
          proiecte: { x: { cale: "C:/x", verificari: [{ nume: "fara" }] } },
        },
      }),
    (e) =>
      e instanceof ConfigInvalid && /verificari\[0\]\.comanda/.test(e.message),
  );
});

// ---------------------------------------------------------------- comenzi

test("comanda reusita e raportata ca atare, cu durata", () => {
  const p = proiectFals([{ nume: "ok", comanda: 'node -e "process.exit(0)"' }]);
  const r = v.ruleazaComanda(p.verificari[0], p, CONFIG);
  assert.equal(r.reusit, true);
  assert.ok(r.durataMs >= 0);
});

test("comanda cazuta NU arunca — esecul e un rezultat, nu o exceptie", () => {
  // Daca ar arunca, faza de comparatie s-ar opri la primul esec si n-ar mai afla
  // niciodata ce altceva mai e stricat.
  const p = proiectFals([
    { nume: "cade", comanda: 'node -e "process.exit(3)"' },
  ]);
  let r;
  assert.doesNotThrow(() => {
    r = v.ruleazaComanda(p.verificari[0], p, CONFIG);
  });
  assert.equal(r.reusit, false);
  assert.match(r.motiv, /cod de iesire 3/);
});

test("iesirea unei comenzi cazute e pastrata, ca sa se vada de ce", () => {
  const p = proiectFals([
    {
      nume: "vorbareata",
      comanda:
        "node -e \"console.error('DETALIUL CARE CONTEAZA'); process.exit(1)\"",
    },
  ]);
  const r = v.ruleazaComanda(p.verificari[0], p, CONFIG);
  assert.match(r.iesire, /DETALIUL CARE CONTEAZA/);
});

test("o comanda care nu se mai termina e taiata la plafonul ei", () => {
  const p = proiectFals([
    {
      nume: "blocata",
      comanda: 'node -e "setTimeout(()=>{}, 60000)"',
      timeoutSecunde: 2,
    },
  ]);
  const inceput = Date.now();
  const r = v.ruleazaComanda(p.verificari[0], p, CONFIG);
  assert.equal(r.reusit, false);
  assert.ok(
    Date.now() - inceput < 20000,
    "s-a oprit repede, n-a asteptat minutul",
  );
});

test("un folder inexistent e raportat, nu ignorat", () => {
  const p = proiectFals([
    { nume: "aiurea", comanda: "node -v", cwd: "nu-exista" },
  ]);
  const r = v.ruleazaComanda(p.verificari[0], p, CONFIG);
  assert.equal(r.reusit, false);
  assert.match(r.motiv, /folderul nu exista/);
});

test("iesirea se taie la numarul de linii din config", () => {
  const c = incarcaConfig({
    brut: { verificari: { liniiPastrate: 3 }, proiecte: {} },
  });
  const p = proiectFals([
    {
      nume: "multe linii",
      comanda:
        "node -e \"for(let i=0;i<50;i++) console.log('linia '+i); process.exit(1)\"",
    },
  ]);
  const r = v.ruleazaComanda(p.verificari[0], p, c);
  assert.equal(r.iesire.split("\n").length, 3);
});

// ---------------------------------------------------------------- sanatate

test("sanatate: o aplicatie care nu ruleaza e raportata clar, nu ca eroare tehnica", async () => {
  const r = await v.verificaSanatate({
    nume: "inexistent",
    url: "http://127.0.0.1:59999/",
    codAsteptat: 200,
  });
  assert.equal(r.reusit, false);
  assert.equal(r.motiv, "aplicația nu rulează");
});

test("sanatate: un cod diferit de cel asteptat inseamna esec", async () => {
  const server = http.createServer((_, res) => {
    res.statusCode = 503;
    res.end("indisponibil");
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;

  const r = await v.verificaSanatate({
    nume: "cazut",
    url: `http://127.0.0.1:${port}/`,
    codAsteptat: 200,
  });
  server.close();

  assert.equal(r.reusit, false);
  assert.equal(r.cod, 503);
});

// ---------------------------------------------------------------- comparatia

test("comparatie: ce era rosu si a ramas rosu NU e raportat ca stricat", () => {
  // Regula care apara reviewul de o acuzatie falsa: un test cazut de ieri nu
  // devine „stricat de reparatiile de azi".
  const baza = {
    comenzi: [
      { nume: "a", reusit: true },
      { nume: "b", reusit: false },
    ],
    sanatate: [],
  };
  const dupa = {
    comenzi: [
      { nume: "a", reusit: true },
      { nume: "b", reusit: false },
    ],
    sanatate: [],
  };
  const c = v.compara(baza, dupa);
  assert.deepEqual(c.stricate, []);
  assert.equal(c.curat, true);
});

test("comparatie: ce era verde si a devenit rosu e semnalat", () => {
  const baza = { comenzi: [{ nume: "teste", reusit: true }], sanatate: [] };
  const dupa = { comenzi: [{ nume: "teste", reusit: false }], sanatate: [] };
  const c = v.compara(baza, dupa);
  assert.deepEqual(c.stricate, ["teste"]);
  assert.equal(c.curat, false);
});

test("comparatie: ce era rosu si s-a facut verde e raportat ca reparat", () => {
  const baza = { comenzi: [{ nume: "lint", reusit: false }], sanatate: [] };
  const dupa = { comenzi: [{ nume: "lint", reusit: true }], sanatate: [] };
  const c = v.compara(baza, dupa);
  assert.deepEqual(c.reparate, ["lint"]);
  assert.equal(c.curat, true);
});

test("comparatie: aplicatia cazuta dupa reparatii e semnalata ca stricata", () => {
  const baza = { comenzi: [], sanatate: [{ nume: "API", reusit: true }] };
  const dupa = { comenzi: [], sanatate: [{ nume: "API", reusit: false }] };
  assert.deepEqual(v.compara(baza, dupa).stricate, ["API"]);
});

// ---------------------------------------------------------------- reteta

test("reteta ruleaza toate comenzile, chiar daca una cade", () => {
  const p = proiectFals([
    { nume: "unu", comanda: 'node -e "process.exit(0)"' },
    { nume: "doi", comanda: 'node -e "process.exit(1)"' },
    { nume: "trei", comanda: 'node -e "process.exit(0)"' },
  ]);
  return v.ruleazaReteta(p, CONFIG).then((r) => {
    assert.equal(r.comenzi.length, 3, "nu se opreste la primul esec");
    assert.equal(r.toateTrec, false);
    assert.deepEqual(
      r.comenzi.map((c) => c.reusit),
      [true, false, true],
    );
  });
});

test("rezumatul are cate o linie per verificare, cu motivul esecului", () => {
  const p = proiectFals([
    { nume: "merge", comanda: 'node -e "process.exit(0)"' },
    { nume: "nu merge", comanda: 'node -e "process.exit(1)"' },
  ]);
  return v.ruleazaReteta(p, CONFIG).then((r) => {
    const linii = v.rezumat(r);
    assert.equal(linii.length, 2);
    assert.match(linii[0], /^✓ merge \(\d+s\)$/);
    assert.match(linii[1], /^✗ nu merge \(\d+s\) — cod de iesire 1$/);
  });
});
