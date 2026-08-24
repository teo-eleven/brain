"use strict";

/**
 * Ajutoare comune pentru testele colectorului.
 *
 * Numele fisierului evita deliberat tiparele pe care `node --test` le considera
 * fisiere de test (`*.test.js`, `test-*.js`), ca sa nu fie rulat ca suita goala.
 */

const fs = require("node:fs");
const path = require("node:path");

/** Fisierul de evenimente al zilei curente, pentru un vault dat. */
function fisierulZilei(vault) {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const zi = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  return path.join(vault, ".events", `${zi}.jsonl`);
}

function citesteEvenimente(vault) {
  const f = fisierulZilei(vault);
  if (!fs.existsSync(f)) return [];
  return fs
    .readFileSync(f, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        // o linie pe jumatate scrisa, prinsa exact intre `append` si citire;
        // se ignora la aceasta trecere, urmatoarea o va vedea intreaga
        return null;
      }
    })
    .filter(Boolean);
}

const asteapta = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Asteapta pana apar `cate` evenimente, sau pana expira rabdarea.
 *
 * Necesar pentru ca hook-ul porneste colectorul IN FUNDAL: `git commit` se
 * intoarce inainte ca evenimentul sa fie scris. O asertie imediata ar fi
 * intermitenta — verde pe o masina odihnita, rosie pe una ocupata.
 */
async function asteaptaEvenimente(vault, cate, timeoutMs = 30000) {
  const limita = Date.now() + timeoutMs;
  let ev = citesteEvenimente(vault);
  while (ev.length < cate && Date.now() < limita) {
    await asteapta(100);
    ev = citesteEvenimente(vault);
  }
  return ev;
}

/**
 * Lasa colectorul din fundal sa termine, apoi intoarce ce a scris.
 *
 * Pentru cazurile in care se asteapta ZERO evenimente: acolo nu ai ce astepta,
 * doar te asiguri ca n-a aparut nimic nici dupa ce ar fi avut timp sa apara.
 */
async function evenimenteDupaLinistire(vault, ms = 6000) {
  await asteapta(ms);
  return citesteEvenimente(vault);
}

module.exports = {
  fisierulZilei,
  citesteEvenimente,
  asteaptaEvenimente,
  evenimenteDupaLinistire,
  asteapta,
};
