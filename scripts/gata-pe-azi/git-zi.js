#!/usr/bin/env node
"use strict";

/**
 * git-zi.js — faza 6: munca zilei ajunge pe un branch nou, în proiectul ei.
 *
 * PATRU BARIERE, în ordinea în care contează:
 *
 *   1. Doar proiecte din REGISTRU. Un proiect care nu e în `config.json` nu e
 *      atins, oricâtă muncă necomisă ar avea. Asta e apărarea împotriva
 *      publicării pe un proiect nimerit din întâmplare.
 *   2. Niciodată direct pe `dev` / `main` / `master`. Se creează întotdeauna
 *      branch nou din baza declarată a proiectului.
 *   3. Push-ul urmează `git.pushAutomat` din config — NU e un `false` fixat
 *      aici. Implicit era `false` (confirmare cerută la fiecare rulare, prin
 *      `publica({ confirmat: true })`); pe 24.08, proprietarul a decis explicit
 *      să-l treacă pe `true` — urcarea se face fără confirmare separată de-atunci.
 *      `publica()` respectă oricare din cele două valori are `config.json` ACUM;
 *      dacă vrei bariera de confirmare înapoi, se schimbă acolo, nu aici.
 *   4. Fără `--force`, niciodată, în nicio ramură a codului.
 *
 * Toate setările vin din `config.json`.
 */

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");

const { incarcaConfig } = require("./config.js");

// Plafonul NU e scris aici: ca orice valoare reglabilă din proiect, stă în
// `config.json` (`git.timeoutMs`). Se citește o singură dată, la încărcarea
// modulului, fiindcă `git()` e chemat și din funcții exportate care nu primesc
// configul (`ramuraCurenta`, `areModificari`).
const TIMEOUT_GIT_MS = incarcaConfig().git.timeoutMs;

/** git care ARUNCĂ la eșec: aici, spre deosebire de colector, un eșec contează. */
function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: TIMEOUT_GIT_MS,
    windowsHide: true,
  }).trimEnd();
}

function gitTacut(args, cwd) {
  try {
    return git(args, cwd);
  } catch {
    return null;
  }
}

function ramuraCurenta(cale) {
  return gitTacut(["rev-parse", "--abbrev-ref", "HEAD"], cale);
}

function areModificari(cale) {
  const stare = gitTacut(["status", "--porcelain"], cale);
  return Boolean(stare && stare.trim());
}

/**
 * Sufix de nume de ramură dintr-un text liber: fără diacritice, fără spații,
 * fără caractere pe care git le refuză. Scurt, ca numele să rămână citibil.
 */
function sufixDinText(text, maxLungime = 40) {
  // `NFD` plus stergerea semnelor combinate (U+0300-U+036F): „stergere" ramane
  // „stergere", nu „s?tergere". Intervalul e scris ca secvente de escape, nu ca
  // semne invizibile in sursa — altfel nimeni nu poate citi ce se sterge.
  const faraDiacritice = (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return (
    faraDiacritice
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, maxLungime)
      .replace(/-+$/, "") || "modificari"
  );
}

function numeRamura(config, zi, sufix) {
  return config.git.tiparRamura
    .replace("{prefix}", config.git.prefixRamura)
    .replace("{zi}", zi)
    .replace("{sufix}", sufixDinText(sufix));
}

/**
 * Pregătește un proiect: branch nou + commit local.
 *
 * Nu întoarce niciodată o excepție netratată — un proiect care eșuează nu are
 * voie să oprească restul. Rezultatul spune ce s-a întâmplat și de ce.
 */
function pregateste(proiect, { config, zi, sufix, mesaj }) {
  const rezultat = { proiect: proiect.nume, cale: proiect.cale, actiune: null };

  try {
    if (!fs.existsSync(proiect.cale)) {
      return {
        ...rezultat,
        actiune: "sarit",
        motiv: "calea nu există pe disc",
      };
    }
    if (!gitTacut(["rev-parse", "--git-dir"], proiect.cale)) {
      return { ...rezultat, actiune: "sarit", motiv: "nu e repo git" };
    }
    if (!areModificari(proiect.cale)) {
      return { ...rezultat, actiune: "sarit", motiv: "nimic de comis" };
    }

    const dinainte = ramuraCurenta(proiect.cale);
    const ramura = numeRamura(config, zi, sufix);

    // Bariera 2: pe o ramură protejată NU se comite niciodată direct.
    const peProtejata = config.git.ramuriInterzise.includes(
      (dinainte || "").toLowerCase(),
    );

    // `creeazaRamuraNoua: false` cere ca proiectul să fie comis PE RAMURA
    // CURENTĂ — cazul vaultului, care are deja fluxul lui de ramuri și pe care
    // o ramură nouă pe zi l-ar fragmenta. Steagul era citit și validat în
    // `config.js`, era descris în `config.json`, dar nu-l citea NIMENI: se făcea
    // ramură nouă oricum. Un buton care nu e legat la nimic e mai rău decât unul
    // care lipsește — arată ca o alegere făcută, când de fapt n-a fost.
    //
    // Excepția din config rămâne neanulabilă: pe `main`/`dev`/`master` se face
    // ramură nouă chiar și cu steagul pe `false`. Aia e bariera 2, iar barierele
    // nu se dezactivează din config.
    const vreaRamuraNoua = proiect.creeazaRamuraNoua !== false;
    const faceRamuraNoua = vreaRamuraNoua || peProtejata;

    let ramuraFolosita = dinainte;
    if (faceRamuraNoua) {
      const existaDeja = Boolean(
        gitTacut(["rev-parse", "--verify", "--quiet", ramura], proiect.cale),
      );
      if (existaDeja) {
        git(["switch", ramura], proiect.cale);
      } else {
        git(["switch", "-c", ramura], proiect.cale);
      }
      ramuraFolosita = ramura;
    }

    git(["add", "-A"], proiect.cale);
    git(["commit", "-m", mesaj], proiect.cale);

    return {
      ...rezultat,
      actiune: "comis",
      ramuraDinainte: dinainte,
      ramura: ramuraFolosita,
      ramuraNoua: faceRamuraNoua,
      // `true` doar când steagul a fost ignorat fiindcă erai pe o ramură
      // protejată — adică exact cazul în care omul trebuie să afle de ce a
      // primit totuși o ramură nouă.
      ramuraNouaFortata: faceRamuraNoua && !vreaRamuraNoua,
      eraPeRamuraProtejata: peProtejata,
      sha: gitTacut(["rev-parse", "--short", "HEAD"], proiect.cale),
      // `--stat --oneline`: un rand de antet (sha + subiect), N randuri de
      // fisier, un rand de rezumat ("N files changed, ..."). Numaratoarea reala
      // de fisiere e totalul MINUS cele doua randuri care nu sunt fisiere —
      // nu doar unul, cum era inainte (raporta cu un fisier in plus).
      fisiere: Math.max(
        0,
        (
          gitTacut(["show", "--stat", "--oneline", "HEAD"], proiect.cale) || ""
        ).split("\n").length - 2,
      ),
    };
  } catch (e) {
    return { ...rezultat, actiune: "eșuat", motiv: e.message.split("\n")[0] };
  }
}

/**
 * Publicarea. Separată deliberat de `pregateste`.
 *
 * Refuză să ruleze cât timp `git.pushAutomat` e `false` — adică pâna când omul
 * confirmă, după ce a văzut lista. Un push nu se ia înapoi, iar un branch greșit
 * ajuns pe remote-ul unei echipe e vizibil pentru toți.
 */
function publica(rezultat, { config, confirmat = false }) {
  if (!confirmat && !config.git.pushAutomat) {
    return { ...rezultat, push: "refuzat", motiv: "lipsește confirmarea" };
  }
  if (rezultat.actiune !== "comis") {
    return { ...rezultat, push: "sărit", motiv: "nu s-a comis nimic" };
  }
  try {
    git(["push", "-u", "origin", rezultat.ramura], rezultat.cale);
    return { ...rezultat, push: "urcat" };
  } catch (e) {
    return { ...rezultat, push: "eșuat", motiv: e.message.split("\n")[0] };
  }
}

module.exports = {
  pregateste,
  publica,
  numeRamura,
  sufixDinText,
  ramuraCurenta,
  areModificari,
};

if (require.main === module) {
  const config = incarcaConfig();
  process.stdout.write(
    JSON.stringify(
      {
        proiecteInRegistru: Object.keys(config.proiecte),
        pushAutomat: config.git.pushAutomat,
        exempluRamura: numeRamura(config, "2026-08-24", "review si reparatii"),
      },
      null,
      2,
    ) + "\n",
  );
}
