"use strict";

/**
 * Configul fazei de verificare din `gata pe azi`.
 *
 * Validatorii vin din `scripts/collector/config.js` — aceleasi reguli in ambele
 * module, un singur loc de reparat. Configul insa e separat: colectorul strange
 * date si ruleaza la fiecare commit, asta verifica si publica si ruleaza o data
 * pe zi. Doua responsabilitati, doua fisiere de reglat.
 *
 * Ca peste tot in proiect: nicio valoare reglabila nu are voie sa apara in cod.
 */

const fs = require("node:fs");
const path = require("node:path");

const { validatori, ConfigInvalid } = require("../collector/config.js");

const {
  cereObiect,
  cereText,
  cereIntregPozitiv,
  cereListaDeTexte,
  cereBoolean,
} = validatori;

const CALE_CONFIG = path.join(__dirname, "config.json");

/** Cheile care incep cu `_` sunt comentarii pentru om. */
function faraComentarii(valoare) {
  if (Array.isArray(valoare)) return valoare.map(faraComentarii);
  if (valoare === null || typeof valoare !== "object") return valoare;
  const curat = {};
  for (const [cheie, v] of Object.entries(valoare)) {
    if (cheie.startsWith("_")) continue;
    curat[cheie] = faraComentarii(v);
  }
  return curat;
}

function citesteVerificare(brut, unde, implicitSecunde) {
  const v = cereObiect(brut, unde);
  return {
    nume: cereText(v.nume, `${unde}.nume`),
    comanda: cereText(v.comanda, `${unde}.comanda`),
    cwd: cereText(v.cwd ?? ".", `${unde}.cwd`),
    timeoutSecunde: cereIntregPozitiv(
      v.timeoutSecunde ?? implicitSecunde,
      `${unde}.timeoutSecunde`,
    ),
  };
}

function citesteSanatate(brut, unde) {
  const s = cereObiect(brut, unde);
  return {
    nume: cereText(s.nume, `${unde}.nume`),
    url: cereText(s.url, `${unde}.url`),
    codAsteptat: cereIntregPozitiv(s.codAsteptat ?? 200, `${unde}.codAsteptat`),
  };
}

/**
 * Un proiect din registru.
 *
 * `cale` trebuie sa existe pe disc: un proiect trecut in registru dar mutat sau
 * sters e o eroare de configurare, nu un motiv de tacere. Verificarea existentei
 * NU se face aici, ci la rulare, ca sa poata fi raportata ca atare.
 */
function citesteProiect(nume, brut, implicitSecunde) {
  const p = cereObiect(brut, `proiecte.${nume}`);
  return {
    nume,
    cale: cereText(p.cale, `proiecte.${nume}.cale`),
    ramuraBaza: cereText(p.ramuraBaza ?? "main", `proiecte.${nume}.ramuraBaza`),
    // implicit se creeaza ramura noua; un proiect cu flux propriu de ramuri
    // (vaultul) poate cere sa se comita pe ramura curenta
    creeazaRamuraNoua:
      p.creeazaRamuraNoua === undefined
        ? true
        : cereBoolean(
            p.creeazaRamuraNoua,
            `proiecte.${nume}.creeazaRamuraNoua`,
          ),
    verificari: (p.verificari ?? []).map((v, i) =>
      citesteVerificare(
        v,
        `proiecte.${nume}.verificari[${i}]`,
        implicitSecunde,
      ),
    ),
    sanatate: (p.sanatate ?? []).map((s, i) =>
      citesteSanatate(s, `proiecte.${nume}.sanatate[${i}]`),
    ),
    neacoperit: cereListaDeTexte(
      p.neacoperit ?? [],
      `proiecte.${nume}.neacoperit`,
    ),
  };
}

function incarcaConfig(optiuni = {}) {
  let brut = optiuni.brut;
  if (!brut) {
    let text;
    try {
      text = fs.readFileSync(CALE_CONFIG, "utf8");
    } catch (e) {
      throw new ConfigInvalid(`nu pot citi ${CALE_CONFIG}: ${e.message}`);
    }
    try {
      brut = JSON.parse(text);
    } catch (e) {
      throw new ConfigInvalid(`${CALE_CONFIG} nu e JSON valid: ${e.message}`);
    }
  }

  const c = faraComentarii(cereObiect(brut, "config"));
  const asteptare = cereObiect(c.asteptare ?? {}, "asteptare");
  const verificari = cereObiect(c.verificari ?? {}, "verificari");
  const reparatii = cereObiect(c.reparatii ?? {}, "reparatii");
  const git = cereObiect(c.git ?? {}, "git");
  const proiecte = cereObiect(c.proiecte ?? {}, "proiecte");
  const ziuaDeLucru = cereObiect(c.ziuaDeLucru ?? {}, "ziuaDeLucru");
  const inafara = cereObiect(c.inafaraRegistrului ?? {}, "inafaraRegistrului");

  const timeoutImplicit = cereIntregPozitiv(
    verificari.timeoutImplicitSecunde ?? 600,
    "verificari.timeoutImplicitSecunde",
  );

  return {
    asteptare: {
      timeoutSecunde: cereIntregPozitiv(
        asteptare.timeoutSecunde ?? 600,
        "asteptare.timeoutSecunde",
      ),
    },
    verificari: {
      timeoutImplicitSecunde: timeoutImplicit,
      liniiPastrate: cereIntregPozitiv(
        verificari.liniiPastrate ?? 25,
        "verificari.liniiPastrate",
      ),
      timeoutSanatateSecunde: cereIntregPozitiv(
        verificari.timeoutSanatateSecunde ?? 5,
        "verificari.timeoutSanatateSecunde",
      ),
      maxIesireMb: cereIntregPozitiv(
        verificari.maxIesireMb ?? 32,
        "verificari.maxIesireMb",
      ),
    },
    reparatii: {
      severitatiReparate: cereListaDeTexte(
        reparatii.severitatiReparate ?? ["CRITIC", "INALT"],
        "reparatii.severitatiReparate",
      ).map((s) => s.toUpperCase()),
      maxPerRulare: cereIntregPozitiv(
        reparatii.maxPerRulare ?? 8,
        "reparatii.maxPerRulare",
      ),
    },
    git: {
      prefixRamura: cereText(
        git.prefixRamura ?? "fix/review",
        "git.prefixRamura",
      ),
      tiparRamura: cereText(
        git.tiparRamura ?? "{prefix}-{zi}-{sufix}",
        "git.tiparRamura",
      ),
      pushAutomat: cereBoolean(git.pushAutomat ?? false, "git.pushAutomat"),
      timeoutMs: cereIntregPozitiv(git.timeoutMs ?? 60000, "git.timeoutMs"),
      ramuriInterzise: cereListaDeTexte(
        git.ramuriInterzise ?? [],
        "git.ramuriInterzise",
      ).map((r) => r.toLowerCase()),
    },
    ziuaDeLucru: {
      // 0–23; sub ora asta, „azi" inseamna ziua precedenta
      oraStart: cereIntregPozitiv(
        ziuaDeLucru.oraStart ?? 5,
        "ziuaDeLucru.oraStart",
      ),
    },
    // caile lasate deliberat pe dinafara, cu motivul lor
    inafaraRegistrului: (inafara.cai ?? []).map((x, i) => ({
      cale: cereText(x.cale, `inafaraRegistrului.cai[${i}].cale`),
      motiv: cereText(x.motiv, `inafaraRegistrului.cai[${i}].motiv`),
    })),
    proiecte: Object.fromEntries(
      Object.entries(proiecte).map(([nume, p]) => [
        nume,
        citesteProiect(nume, p, timeoutImplicit),
      ]),
    ),
  };
}

module.exports = { incarcaConfig, ConfigInvalid, CALE_CONFIG };
