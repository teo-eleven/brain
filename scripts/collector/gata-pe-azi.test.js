"use strict";

/**
 * Teste pentru `gata-pe-azi.js` — motorul comenzii care inchide ziua.
 *
 * Rulare:  node --test scripts/collector
 *
 * Cel mai important test din fisier e „nu atinge nimic din afara markerilor":
 * scriptul scrie intr-o nota pe care omul o compune de mana. O singura scapare
 * acolo inseamna text pierdut, iar textul ala nu e recuperabil din nimic.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { incarcaConfig } = require("./config.js");
const gata = require("./gata-pe-azi.js");

const CONFIG_REAL = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf8"),
);

/**
 * Config de test.
 *
 * `radaciniRepo` e golit implicit: altfel `starePrezenta` ar scana repo-urile
 * REALE de pe stație, iar testele ar depinde de ce are omul necomis in momentul
 * rularii. Testele care chiar verifica scanarea si-o pun ele, pe un folder temporar.
 */
function configCu(vault, suprascrieri = {}) {
  return incarcaConfig({
    caleVault: vault,
    brut: {
      ...CONFIG_REAL,
      ...suprascrieri,
      raport: {
        ...CONFIG_REAL.raport,
        radaciniRepo: [],
        ...(suprascrieri.raport || {}),
      },
    },
  });
}

function vaultNou() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "gata-vault-"));
}

const ZI = "2026-08-24";

function scrieJurnal(config, evenimente, zi = ZI) {
  const f = path.join(config.vault.cale, ".events", `${zi}.jsonl`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(
    f,
    evenimente.map((e) => JSON.stringify(e)).join("\n") + "\n",
    "utf8",
  );
}

function commit(peste = {}) {
  return {
    ts: "09:12",
    tip: "commit",
    proiect: "https://github.com/econfaire/ecf-adm-expert",
    cale: "D:/teodor.fotciuc/ecf-adm-expert",
    ramura: "main",
    sha: "290dc61",
    subiect: "fix: ceva reparat",
    merge: false,
    automat: false,
    fisiere: 10,
    adaugate: 437,
    sterse: 37,
    fisiereAtinse: [],
    ...peste,
  };
}

function sesiune(peste = {}) {
  return {
    ts: "17:52",
    tip: "sesiune",
    proiect: "https://github.com/econfaire/ecf-adm-expert",
    cale: "D:/teodor.fotciuc/ecf-adm-expert",
    ramura: "main",
    sesiune: "s-1",
    motiv: "prompt_input_exit",
    necomise: 2,
    fisiereNecomise: ["docs/a.html", "docs/b/"],
    ...peste,
  };
}

function citesteNota(config, zi = ZI) {
  return fs.readFileSync(gata.caleNotaZi(config, zi), "utf8");
}

const NOTA_SCRISA_DE_OM = `---
tags: [daily]
created: 2026-08-24
type: daily
---

# 2026-08-24

## Focus de azi

- ceva important scris de mine

## Notes

### O lectie pe care am invatat-o azi

Text pe care nu are voie nimeni sa-l atinga.

<!-- COMMITS:START - generat de scripts/sync-daily.ps1, nu edita intre markeri -->
## Commit-uri
<!-- COMMITS:END -->

## Deschis / de continuat

- inca ceva de-al meu

#azi-focus
`;

function cuNotaOmului(config, zi = ZI) {
  const f = gata.caleNotaZi(config, zi);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, NOTA_SCRISA_DE_OM, "utf8");
  return f;
}

test("fapte: commit-urile intra grupate pe proiect, cu totalurile", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [
    commit(),
    commit({
      ts: "11:48",
      sha: "7b21ac9",
      subiect: "test: regresie",
      adaugate: 64,
      sterse: 3,
    }),
  ]);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  assert.match(nota, /\*\*2 commit-uri\*\* · \+501 \/ −40 linii · 1 proiecte/);
  assert.match(nota, /\[\[ADM Expert\]\] — 2 commit-uri/);
  assert.match(nota, /\*\*09:12\*\* `290dc61` fix: ceva reparat/);
});

test("tehnologiile detectate din fisierele atinse apar legate la proiect", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [
    commit({
      fisiereAtinse: [
        "apps/api/modules/budgets/service.py",
        "apps/api/modules/budgets/migrations/versions/0010_x.py",
        "apps/web/src/core/pages/Settings.tsx",
        "tests/test_company_edit.py",
      ],
    }),
  ]);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  assert.match(nota, /tehnologii: .*\[\[Alembic - migrari de schema\]\]/);
  assert.match(nota, /tehnologii: .*\[\[FastAPI - API async\]\]/);
  assert.match(nota, /tehnologii: .*TypeScript \/ React/);
  assert.match(nota, /tehnologii: .*Teste/);
});

test("fara fisiere care sa se potriveasca vreunui tipar, linia de tehnologii lipseste", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [commit({ fisiereAtinse: [] })]);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  assert.equal(/tehnologii:/.test(citesteNota(config)), false);
});

test("commit-urile de code review apar intr-o sectiune separata", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [
    commit(),
    commit({
      ts: "12:33",
      sha: "15fb965",
      subiect:
        "fix: defectele găsite la code review în verificarea de autenticitate",
    }),
  ]);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  assert.match(nota, /\*\*Code review\*\*/);
  assert.match(
    nota,
    /\[\[ADM Expert\]\] `15fb965` fix: defectele găsite la code review/,
  );
  // commit-ul obisnuit nu intra si el in sectiunea de code review
  const inceput = nota.indexOf("**Code review**");
  const sectiune = nota.slice(inceput, inceput + 300);
  assert.equal(sectiune.includes("290dc61"), false);
});

test("nu atinge NIMIC din afara markerilor", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [commit()]);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  for (const bucata of [
    "- ceva important scris de mine",
    "### O lectie pe care am invatat-o azi",
    "Text pe care nu are voie nimeni sa-l atinga.",
    "- inca ceva de-al meu",
    "#azi-focus",
    "<!-- COMMITS:START",
  ]) {
    assert.ok(nota.includes(bucata), `s-a pierdut: ${bucata}`);
  }
});

test("blocul se aseaza inaintea celui de commit-uri, ca generatul sa stea grupat", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [commit()]);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  assert.ok(
    nota.indexOf("FAPTE:START") < nota.indexOf("COMMITS:START"),
    "faptele stau inaintea blocului de commit-uri",
  );
  assert.ok(
    nota.indexOf("## Notes") < nota.indexOf("FAPTE:START"),
    "si dupa sectiunile scrise de mana",
  );
});

test("a doua rulare inlocuieste blocul, nu il dubleaza", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [commit()]);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });
  scrieJurnal(config, [
    commit(),
    commit({ ts: "12:00", sha: "aaa1111", subiect: "feat: nou" }),
  ]);
  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  assert.equal(nota.split("FAPTE:START").length - 1, 1, "un singur bloc");
  assert.match(nota, /aaa1111/, "cu continutul actualizat");
});

test("sedintele primite din sesiune intra in bloc", () => {
  // Nu pot fi luate de aici: conectorul M365 cere o sesiune autentificata.
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [commit()]);
  cuNotaOmului(config);

  gata.ruleaza({
    config,
    zi: ZI,
    faraSync: true,
    sedinte: [
      {
        ora: "10:00",
        titlu: "Sincron ADM Expert",
        participanti: ["Marcela", "Andrei"],
      },
      { ora: "15:30", titlu: "Discuție HR ScoreBoard" },
    ],
  });

  const nota = citesteNota(config);
  assert.match(nota, /\*\*Ședințe\*\*/);
  assert.match(nota, /\*\*10:00\*\* Sincron ADM Expert · Marcela, Andrei/);
  assert.match(nota, /\*\*15:30\*\* Discuție HR ScoreBoard/);
});

test("ce a ramas necomis apare separat, pe proiect", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [commit(), sesiune()]);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  assert.match(nota, /Rămas necomis la închiderea sesiunii/);
  assert.match(nota, /docs\/a\.html, docs\/b\//);
});

test("o zi goala spune ca jurnalul a functionat, nu tace", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, []);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  assert.match(
    citesteNota(config),
    /un rând gol aici înseamnă că n-a fost activitate/,
  );
});

test("nota lipsa se creeaza din sablonul vaultului", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  const sablon = path.join(vault, "_templates", "Daily note.md");
  fs.mkdirSync(path.dirname(sablon), { recursive: true });
  fs.writeFileSync(
    sablon,
    "---\ntags: [daily]\ncreated: {{date:YYYY-MM-DD}}\ntype: daily\n---\n\n# {{date:YYYY-MM-DD}}\n\n## Notes\n\n",
    "utf8",
  );
  scrieJurnal(config, [commit()]);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  assert.match(
    nota,
    /created: 2026-08-24/,
    "sablonul a fost completat cu ziua",
  );
  assert.match(nota, /# 2026-08-24/);
  assert.match(nota, /FAPTE:START/);
});

test("duplicatele de proiect apar si in nota zilei", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [
    commit(),
    commit({ ts: "16:00", sha: "b111111", cale: "D:/copie/ecf-adm-expert" }),
  ]);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  assert.match(nota, /Același proiect, două locuri pe disc/);
  assert.match(nota, /\[\[Fara clone locale\]\]/);
});

test("rezultatul spune ce s-a schimbat, pentru raportul din chat", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, [commit(), sesiune()]);
  cuNotaOmului(config);

  const r = gata.ruleaza({ config, zi: ZI, faraSync: true });

  assert.equal(r.zi, ZI);
  assert.equal(r.notaSchimbata, true);
  assert.equal(r.fapte.totalCommituri, 1);
  assert.equal(r.fapte.sesiuni, 1);
  assert.deepEqual(r.vederi, [ZI], "si vederea din inbox s-a generat");
});

// ------------------------------------------------- starea curenta a repo-urilor

const { execFileSync } = require("node:child_process");

function radacinaCuRepo({ necomis = true, commitAzi = false } = {}) {
  const radacina = fs.mkdtempSync(path.join(os.tmpdir(), "gata-radacina-"));
  const repo = path.join(radacina, "proiect-x");
  fs.mkdirSync(repo);
  const g = (args) =>
    execFileSync("git", args, {
      cwd: repo,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  g(["init", "--quiet", "--initial-branch=main"]);
  g(["config", "user.email", "t@e.com"]);
  g(["config", "user.name", "T"]);
  g(["config", "commit.gpgsign", "false"]);
  g(["config", "core.hooksPath", path.join(repo, ".git", "fara-hooks")]);
  g(["config", "remote.origin.url", "https://github.com/exemplu/proiect-x"]);
  fs.writeFileSync(path.join(repo, "baza.txt"), "x\n", "utf8");
  g(["add", "-A"]);
  g(["commit", "-m", "test: baza", "--quiet"]);
  if (commitAzi) {
    fs.writeFileSync(path.join(repo, "azi.txt"), "y\n", "utf8");
    g(["add", "-A"]);
    g(["commit", "-m", "feat: facut azi, fara hook", "--quiet"]);
  }
  if (necomis) fs.writeFileSync(path.join(repo, "in-lucru.txt"), "z\n", "utf8");
  return { radacina, repo };
}

test("prezent: munca necomisa ACUM apare, chiar daca jurnalul e gol", () => {
  // Cazul care a scos golul la iveala: comanda rulata la finalul zilei, cu tot
  // lucrul inca necomis, spunea „nicio activitate" — desi ziua era plina.
  const vault = vaultNou();
  const { radacina } = radacinaCuRepo();
  const config = configCu(vault, { raport: { radaciniRepo: [radacina] } });
  scrieJurnal(config, []);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  assert.match(nota, /\*\*Necomis chiar acum\*\*/);
  assert.match(nota, /in-lucru\.txt/);
  assert.equal(/Nicio activitate înregistrată/.test(nota), false);
});

test("prezent: un commit pe care hook-ul l-a ratat e recuperat si MARCAT ca atare", () => {
  // Un hook care n-a functionat nu trebuie sa produca o zi mai saraca, ci un
  // semn vizibil ca ceva n-a mers.
  const vault = vaultNou();
  const { radacina } = radacinaCuRepo({ necomis: false, commitAzi: true });
  const config = configCu(vault, { raport: { radaciniRepo: [radacina] } });
  scrieJurnal(config, []);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  const nota = citesteNota(config);
  assert.match(nota, /commit-uri găsite direct în repo-uri/);
  assert.match(nota, /feat: facut azi, fara hook/);
});

test("prezent: un commit deja in jurnal NU e raportat si ca recuperat", () => {
  const vault = vaultNou();
  const { radacina, repo } = radacinaCuRepo({
    necomis: false,
    commitAzi: true,
  });
  const config = configCu(vault, { raport: { radaciniRepo: [radacina] } });
  const sha = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd: repo,
    encoding: "utf8",
  }).trim();
  scrieJurnal(config, [
    commit({
      sha,
      subiect: "feat: facut azi, fara hook",
      proiect: "https://github.com/exemplu/proiect-x",
    }),
  ]);
  cuNotaOmului(config);

  const r = gata.ruleaza({ config, zi: ZI, faraSync: true });

  // Repo-ul de test are DOUA commit-uri de azi (cel de baza si cel „fara hook"),
  // iar in jurnal l-am pus doar pe al doilea. Deci lista de recuperate nu e
  // goala — se verifica exact ce trebuie: ca ce e DEJA in jurnal nu apare si
  // acolo, nu ca sectiunea lipseste cu totul.
  assert.equal(
    r.fapte.recuperate.some((c) => c.sha === sha),
    false,
    "commit-ul deja jurnalizat nu se raporteaza a doua oara",
  );
  assert.equal(
    r.fapte.recuperate.some((c) => c.subiect === "test: baza"),
    true,
    "iar cel chiar absent din jurnal e raportat",
  );
});

test("prezent: un proiect ignorat nu e scanat nici pentru starea curenta", () => {
  const vault = vaultNou();
  const { radacina } = radacinaCuRepo();
  const config = configCu(vault, {
    raport: { radaciniRepo: [radacina] },
    proiecteIgnorate: { dupaRemote: ["https://github.com/exemplu/proiect-x"] },
  });
  scrieJurnal(config, []);
  cuNotaOmului(config);

  gata.ruleaza({ config, zi: ZI, faraSync: true });

  assert.equal(/in-lucru\.txt/.test(citesteNota(config)), false);
});
