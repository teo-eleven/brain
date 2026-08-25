#!/usr/bin/env node
"use strict";

/**
 * verificari.js — rularea retetei de verificare a unui proiect.
 *
 * Faza 2 si faza 5 din `gata pe azi`: se ruleaza aceleasi comenzi INAINTE de
 * orice modificare (linia de baza) si DUPA fiecare reparatie. Comparatia dintre
 * cele doua e singurul lucru care spune daca o reparatie a stricat ceva.
 *
 * DOUA REGULI care tin de siguranta, nu de stil:
 *
 *   1. Se citeste, nu se scrie. Nicio comanda de aici nu modifica proiectul,
 *      nu porneste si nu opreste servere, nu atinge Docker. Retetele din config
 *      sunt comenzi de verificare; daca cineva pune acolo o comanda care scrie,
 *      asta e o greseala de configurare, nu ceva ce codul poate preveni.
 *   2. Ce era ROSU inainte ramane rosu, si se stie ca era. Un test cazut de ieri
 *      nu devine „stricat de review" azi. Fara linia de baza, orice esec ar fi
 *      pus in carca ultimei modificari — exact felul de acuzatie care te pune
 *      sa cauti ore intregi o cauza inexistenta.
 *
 * Toate plafoanele vin din `config.json`.
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");

const { incarcaConfig } = require("./config.js");

// Plafonul implicit al health-check-urilor vine din `config.json`
// (`verificari.timeoutSanatateSecunde`), nu din cod. Citit o singura data:
// `verificaSanatate` e chemata si direct, fara config, din teste.
const TIMEOUT_SANATATE_MS =
  incarcaConfig().verificari.timeoutSanatateSecunde * 1000;

/** Ultimele linii dintr-o iesire, cate spune configul. */
function coada(text, linii) {
  return (text || "")
    .split("\n")
    .filter((l) => l.trim())
    .slice(-linii)
    .join("\n");
}

/**
 * O comanda de verificare. Nu arunca: esecul e un rezultat, nu o exceptie —
 * faza urmatoare trebuie sa poata compara, nu sa fie intrerupta.
 */
function ruleazaComanda(verificare, proiect, config) {
  const cwd = path.resolve(proiect.cale, verificare.cwd || ".");
  const inceput = Date.now();

  if (!fs.existsSync(cwd)) {
    return {
      nume: verificare.nume,
      reusit: false,
      motiv: `folderul nu exista: ${cwd}`,
      iesire: "",
      durataMs: 0,
    };
  }

  try {
    const iesire = execSync(verificare.comanda, {
      cwd,
      encoding: "utf8",
      timeout: verificare.timeoutSecunde * 1000,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      maxBuffer: config.verificari.maxIesireMb * 1024 * 1024,
    });
    return {
      nume: verificare.nume,
      reusit: true,
      iesire: coada(iesire, config.verificari.liniiPastrate),
      durataMs: Date.now() - inceput,
    };
  } catch (e) {
    const iesire = `${e.stdout || ""}\n${e.stderr || ""}`;
    const expirat = e.signal === "SIGTERM" || /ETIMEDOUT/.test(String(e.code));
    return {
      nume: verificare.nume,
      reusit: false,
      motiv: expirat
        ? `a depasit ${verificare.timeoutSecunde}s`
        : `cod de iesire ${e.status ?? "necunoscut"}`,
      iesire: coada(iesire, config.verificari.liniiPastrate),
      durataMs: Date.now() - inceput,
    };
  }
}

/**
 * Un health-check HTTP. Nu porneste nimic — doar constata.
 *
 * Clientul se alege dupa SCHEMA din url, nu e fixat pe `http`. Cu `http.get`
 * pentru toate, un `https://...` din config arunca sincron ERR_INVALID_PROTOCOL;
 * aruncat din executorul unui Promise, esecul devenea o respingere, iar
 * `ruleazaReteta` (care doar face `await`) o propaga mai departe pana in `main`,
 * unde nu exista niciun `.catch`. Rezultatul: o singura linie gresita in config
 * darama TOATA faza de verificare a proiectului, cu un stack trace in loc de un
 * rezultat — exact opusul regulii din antet („esecul e un rezultat, nu o
 * exceptie"). Orice alta eroare de pornire a cererii e prinsa la fel, mai jos.
 */
function verificaSanatate(tinta, timeoutMs = TIMEOUT_SANATATE_MS) {
  return new Promise((resolve) => {
    const esec = (motiv) =>
      resolve({
        nume: tinta.nume,
        reusit: false,
        cod: null,
        asteptat: tinta.codAsteptat,
        motiv,
      });

    let client;
    try {
      client = new URL(tinta.url).protocol === "https:" ? https : http;
    } catch {
      return esec(`url invalid: ${tinta.url}`);
    }

    let cerere;
    try {
      cerere = client.get(tinta.url, (raspuns) => {
        raspuns.resume();
        resolve({
          nume: tinta.nume,
          reusit: raspuns.statusCode === tinta.codAsteptat,
          cod: raspuns.statusCode,
          asteptat: tinta.codAsteptat,
        });
      });
    } catch (e) {
      return esec(e.code || e.message);
    }

    cerere.setTimeout(timeoutMs, () => {
      cerere.destroy();
      esec("nu raspunde");
    });
    cerere.on("error", (e) => {
      esec(e.code === "ECONNREFUSED" ? "aplicația nu rulează" : e.message);
    });
  });
}

/**
 * Toata reteta unui proiect: comenzile, apoi health-check-urile.
 *
 * Comenzile ruleaza SECVENTIAL, deliberat. In paralel s-ar bate pe aceleasi
 * containere si pe acelasi disc, iar o suita cazuta din cauza concurentei ar
 * arata identic cu una cazuta din cauza codului.
 */
async function ruleazaReteta(proiect, config) {
  const comenzi = [];
  for (const v of proiect.verificari) {
    comenzi.push(ruleazaComanda(v, proiect, config));
  }
  const sanatate = [];
  for (const s of proiect.sanatate) {
    sanatate.push(await verificaSanatate(s));
  }
  return {
    proiect: proiect.nume,
    comenzi,
    sanatate,
    toateTrec:
      comenzi.every((c) => c.reusit) && sanatate.every((s) => s.reusit),
  };
}

/**
 * Compara doua rulari si spune ce s-a SCHIMBAT.
 *
 * Asta e intrebarea care conteaza dupa o reparatie, nu „trece tot?": un proiect
 * care avea deja doua teste rosii ramane cu doua teste rosii, si e in regula.
 * Ce nu e in regula e ceva care era verde si a devenit rosu.
 */
function compara(baza, dupa) {
  const stareBaza = new Map(baza.comenzi.map((c) => [c.nume, c.reusit]));
  const stareBazaS = new Map(baza.sanatate.map((s) => [s.nume, s.reusit]));

  const stricate = [];
  const reparate = [];

  for (const c of dupa.comenzi) {
    const inainte = stareBaza.get(c.nume);
    if (inainte === true && !c.reusit) stricate.push(c.nume);
    if (inainte === false && c.reusit) reparate.push(c.nume);
  }
  for (const s of dupa.sanatate) {
    const inainte = stareBazaS.get(s.nume);
    if (inainte === true && !s.reusit) stricate.push(s.nume);
    if (inainte === false && s.reusit) reparate.push(s.nume);
  }

  return { stricate, reparate, curat: stricate.length === 0 };
}

/** Rezumat de o linie per verificare, pentru raportul din chat. */
function rezumat(rulare) {
  const linii = [];
  for (const c of rulare.comenzi) {
    const secunde = (c.durataMs / 1000).toFixed(0);
    linii.push(
      `${c.reusit ? "✓" : "✗"} ${c.nume} (${secunde}s)` +
        (c.reusit ? "" : ` — ${c.motiv}`),
    );
  }
  for (const s of rulare.sanatate) {
    linii.push(
      `${s.reusit ? "✓" : "✗"} ${s.nume}` +
        (s.reusit ? ` (${s.cod})` : ` — ${s.motiv || `cod ${s.cod}`}`),
    );
  }
  return linii;
}

module.exports = {
  ruleazaComanda,
  verificaSanatate,
  ruleazaReteta,
  compara,
  rezumat,
  coada,
};

if (require.main === module) {
  const config = incarcaConfig();
  const nume = process.argv[2];
  const proiect = config.proiecte[nume];
  if (!proiect) {
    process.stdout.write(
      `Proiect necunoscut: ${nume || "(niciunul dat)"}\n` +
        `In registru: ${Object.keys(config.proiecte).join(", ") || "(gol)"}\n`,
    );
    process.exit(1);
  }
  ruleazaReteta(proiect, config).then((r) => {
    process.stdout.write(rezumat(r).join("\n") + "\n");
    process.stdout.write(r.toateTrec ? "\nTOT VERDE\n" : "\nSUNT ESECURI\n");
  });
}
