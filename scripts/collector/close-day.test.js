"use strict";

/**
 * Teste pentru `close-day.js` — vederea citita de om.
 *
 * Rulare:  node --test scripts/collector
 *
 * Toate testele scriu in vault-uri temporare si cheama `incheie` cu
 * `faraSync: true`: scriptul greu (`sync-daily.ps1`) face commit in vault, deci
 * n-are ce cauta intr-o suita de teste.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { incarcaConfig } = require("./config.js");
const inchidere = require("./close-day.js");

const CONFIG_REAL = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf8"),
);

function configCu(vault, suprascrieri = {}) {
  return incarcaConfig({
    caleVault: vault,
    brut: { ...CONFIG_REAL, ...suprascrieri },
  });
}

function vaultNou() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "inchidere-vault-"));
}

function scrieJurnal(config, zi, evenimente) {
  const f = path.join(config.vault.cale, ".events", `${zi}.jsonl`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(
    f,
    evenimente.map((e) => JSON.stringify(e)).join("\n") + "\n",
    "utf8",
  );
  return f;
}

function citesteVedere(config, zi) {
  const f = inchidere.caleVedere(config, zi);
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
}

const ZI = "2026-08-24";

function commit(peste = {}) {
  return {
    ts: "14:06",
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
    fisiereAtinse: ["a.py"],
    ...peste,
  };
}

function sesiune(peste = {}) {
  return {
    ts: "17:20",
    tip: "sesiune",
    proiect: "https://github.com/econfaire/ecf-adm-expert",
    cale: "D:/teodor.fotciuc/ecf-adm-expert",
    ramura: "main",
    sesiune: "s-1",
    motiv: "prompt_input_exit",
    necomise: 2,
    fisiereNecomise: ["x.ts", "y.ts"],
    ...peste,
  };
}

test("vedere: commit-urile apar grupate pe proiect, cu totalul liniilor", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, [
    commit(),
    commit({
      ts: "15:10",
      sha: "abc1234",
      subiect: "feat: altceva",
      adaugate: 10,
      sterse: 2,
    }),
  ]);

  inchidere.incheie({ config, faraSync: true });

  const text = citesteVedere(config, ZI);
  assert.match(text, /# Evenimente — 2026-08-24/);
  assert.match(text, /\*\*2 commit-uri\*\* · \+447 \/ −39/);
  assert.match(text, /`290dc61` fix: ceva reparat/);
  assert.match(text, /Ziua: \[\[2026-08-24\]\]/);
});

test("vedere: proiectul din harta devine legatura, deci intra in graf", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, [commit()]);

  inchidere.incheie({ config, faraSync: true });

  assert.match(citesteVedere(config, ZI), /## \[\[ADM Expert\]\]/);
});

test("vedere: un proiect care nu e in harta apare cu numele scurt, fara legatura", () => {
  // O legatura [[...]] catre o nota inexistenta ar polua graful cu noduri goale.
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, [
    commit({ proiect: "https://github.com/cineva/necunoscut" }),
  ]);

  const text =
    (inchidere.incheie({ config, faraSync: true }), citesteVedere(config, ZI));
  assert.match(text, /## `necunoscut`/);
  assert.equal(/\[\[necunoscut\]\]/.test(text), false);
});

test("heartbeat: o zi fara activitate primeste TOT un fisier, care spune asta", () => {
  // Distinctia care tine jurnalul cinstit: „n-am lucrat" vs „colectorul era mort".
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, []);

  inchidere.incheie({ config, faraSync: true });

  const text = citesteVedere(config, ZI);
  assert.match(text, /Nicio activitate înregistrată/);
  assert.match(text, /jurnalul \*\*a funcționat\*\*/);
});

test("heartbeat: fiecare vedere spune cand a fost generata si cate evenimente", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, [commit(), sesiune()]);

  inchidere.incheie({ config, faraSync: true });

  assert.match(
    citesteVedere(config, ZI),
    /\*\*Stare:\*\* generat la \d{2}:\d{2} · 1 commit-uri · 1 sesiuni · 1 proiecte/,
  );
});

test("sesiuni: se pastreaza ULTIMA per identificator, nu toate", () => {
  // O sesiune reluata poate produce mai multe incheieri cu acelasi id; conteaza
  // starea finala, nu fiecare trecere prin ea.
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, [
    sesiune({
      ts: "11:00",
      necomise: 5,
      fisiereNecomise: ["a", "b", "c", "d", "e"],
    }),
    sesiune({ ts: "17:20", necomise: 1, fisiereNecomise: ["doar-unul.ts"] }),
  ]);

  inchidere.incheie({ config, faraSync: true });

  const text = citesteVedere(config, ZI);
  assert.match(text, /doar-unul\.ts/);
  assert.equal(/17:20/.test(text), true);
  assert.equal(/11:00/.test(text), false, "incheierea intermediara nu apare");
});

test("duplicate: acelasi remote la doua cai e semnalat in capul listei", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, [
    commit({ cale: "D:/teodor.fotciuc/ecf-adm-expert" }),
    commit({ ts: "16:00", sha: "b111111", cale: "D:/copie/ecf-adm-expert" }),
  ]);

  inchidere.incheie({ config, faraSync: true });

  const text = citesteVedere(config, ZI);
  assert.match(text, /Același proiect, două locuri pe disc/);
  assert.match(text, /\[\[Fara clone locale\]\]/);
  assert.match(text, /D:\/copie\/ecf-adm-expert/);
});

test("duplicate: proiectele fara remote NU se compara intre ele", () => {
  // `local:nume` nu e o identitate reala; doua foldere cu acelasi nume, in locuri
  // diferite, sunt de obicei proiecte diferite, nu o clona.
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, [
    commit({ proiect: "local:experiment", cale: "C:/a/experiment" }),
    commit({
      ts: "16:00",
      sha: "c222222",
      proiect: "local:experiment",
      cale: "C:/b/experiment",
    }),
  ]);

  inchidere.incheie({ config, faraSync: true });

  assert.equal(/două locuri pe disc/.test(citesteVedere(config, ZI)), false);
});

test("intretinere: commit-urile automate sunt separate, dar numarate", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, [
    commit(),
    commit({
      ts: "23:00",
      sha: "d333333",
      subiect: "notes: sync 2026-08-24",
      automat: true,
    }),
  ]);

  inchidere.incheie({ config, faraSync: true });

  const text = citesteVedere(config, ZI);
  assert.match(text, /## Întreținere/);
  assert.match(text, /1 commit-uri automate/);
  assert.match(
    text,
    /\*\*1 commit-uri\*\*/,
    "cele automate nu intra in numaratoarea proiectului",
  );
});

test("prospetime: vederea nu se rescrie daca jurnalul nu s-a schimbat", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, [commit()]);

  const primul = inchidere.incheie({ config, faraSync: true });
  assert.equal(primul.zile.length, 1);

  const alDoilea = inchidere.incheie({ config, faraSync: true });
  assert.equal(alDoilea.zile.length, 0, "a doua rulare nu atinge nimic");
});

test("prospetime: vederea stearsa de mana se reface singura", () => {
  // De asta idempotenta sta in timpi de fisier, nu intr-un fisier de stare:
  // starea s-ar desincroniza tacut de realitate.
  const vault = vaultNou();
  const config = configCu(vault);
  scrieJurnal(config, ZI, [commit()]);
  inchidere.incheie({ config, faraSync: true });

  fs.unlinkSync(inchidere.caleVedere(config, ZI));
  const dupa = inchidere.incheie({ config, faraSync: true });

  assert.equal(dupa.zile.length, 1);
  assert.ok(citesteVedere(config, ZI));
});

test("zile: se incheie si zilele din urma, nu doar cea curenta", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  const ieri = new Date();
  ieri.setDate(ieri.getDate() - 1);
  const p = (n) => String(n).padStart(2, "0");
  const ziIeri = `${ieri.getFullYear()}-${p(ieri.getMonth() + 1)}-${p(ieri.getDate())}`;

  scrieJurnal(config, ziIeri, [commit()]);

  const r = inchidere.incheie({ config, faraSync: true });
  assert.deepEqual(
    r.zile.map((z) => z.zi),
    [ziIeri],
  );
});

test("rezistenta: o linie stricata in jurnal nu opreste ziua", () => {
  const vault = vaultNou();
  const config = configCu(vault);
  const f = scrieJurnal(config, ZI, [commit()]);
  fs.appendFileSync(f, "{asta nu e json\n", "utf8");
  fs.appendFileSync(
    f,
    JSON.stringify(commit({ ts: "18:00", sha: "e444444" })) + "\n",
    "utf8",
  );

  inchidere.incheie({ config, faraSync: true });

  const text = citesteVedere(config, ZI);
  assert.match(text, /`290dc61`/);
  assert.match(text, /`e444444`/);
});

test("rezistenta: fara vault, nu se scrie nimic si nu se arunca", () => {
  const config = configCu(
    path.join(os.tmpdir(), "vault-inexistent-" + process.pid),
  );
  assert.doesNotThrow(() => inchidere.incheie({ config, faraSync: true }));
});
