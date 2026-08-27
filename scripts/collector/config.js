"use strict";

/**
 * Incarcarea si validarea configului colectorului.
 *
 * O singura sursa de adevar: `config.json`, de langa acest fisier. Codul nu are
 * voie sa contina nicio valoare care s-ar putea schimba — cai, limite, tipare,
 * timeout-uri, comutatoare. Daca ceva trebuie reglat, se regleaza acolo.
 *
 * Validarea e la granita, nu in adancul codului: un config gresit se afla la
 * incarcare, cu numele campului in mesaj, nu peste doua saptamani cand observi
 * ca jurnalul e gol.
 *
 * Precedenta pentru radacina vaultului, de la cea mai tare la cea mai slaba:
 *   1. argumentul `caleVault` (folosit de teste)
 *   2. variabila de mediu BRAIN_VAULT
 *   3. `vault.cale` din config.json
 *   4. dedus din pozitia scriptului: scripts/collector/../..
 */

const fs = require("node:fs");
const path = require("node:path");

const CALE_CONFIG = path.join(__dirname, "config.json");

class ConfigInvalid extends Error {
  constructor(mesaj) {
    super(mesaj);
    this.name = "ConfigInvalid";
  }
}

/** Cheile care incep cu `_` sunt comentarii pentru om; nu ajung in configul folosit. */
function faraComentarii(valoare) {
  if (Array.isArray(valoare)) return valoare;
  if (valoare === null || typeof valoare !== "object") return valoare;
  const curat = {};
  for (const [cheie, v] of Object.entries(valoare)) {
    if (cheie.startsWith("_")) continue;
    curat[cheie] = faraComentarii(v);
  }
  return curat;
}

function cereObiect(valoare, cale) {
  if (
    valoare === null ||
    typeof valoare !== "object" ||
    Array.isArray(valoare)
  ) {
    throw new ConfigInvalid(`${cale} trebuie sa fie un obiect`);
  }
  return valoare;
}

/**
 * Cheia stabila a unui proiect, dintr-un url de remote.
 *
 * Sta AICI, nu in colector, fiindca trebuie aplicata in DOUA locuri: identitatii
 * calculate la fiecare commit si intrarilor scrise de om in `proiecteIgnorate`.
 * Doua normalizari diferite ar face lista de ignorate sa nu se potriveasca
 * niciodata — adica exact bariera care apara repo-urile de echipa ar esua tacut.
 *
 * Fara remote -> `local:<nume-folder>`, ceea ce e sincer: proiectul chiar NU are
 * identitate dincolo de statia asta.
 */
function normalizeazaRemote(remote, numeFolder = "") {
  if (!remote) return `local:${numeFolder}`;
  return remote
    .trim()
    .replace(/^git@([^:]+):/, "https://$1/")
    .replace(/\.git$/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

/** Cai comparabile intre ele: slash-uri, fara `/` la final, litere mici. */
function normalizeazaCale(cale) {
  return cale.trim().replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
}

function cereText(valoare, cale) {
  if (typeof valoare !== "string")
    throw new ConfigInvalid(`${cale} trebuie sa fie text`);
  return valoare;
}

function cereIntregPozitiv(valoare, cale) {
  if (!Number.isInteger(valoare) || valoare <= 0) {
    throw new ConfigInvalid(`${cale} trebuie sa fie un numar intreg pozitiv`);
  }
  return valoare;
}

function cereListaDeTexte(valoare, cale) {
  if (!Array.isArray(valoare) || valoare.some((v) => typeof v !== "string")) {
    throw new ConfigInvalid(`${cale} trebuie sa fie o lista de texte`);
  }
  return valoare;
}

function cereBoolean(valoare, cale) {
  if (typeof valoare !== "boolean")
    throw new ConfigInvalid(`${cale} trebuie sa fie true sau false`);
  return valoare;
}

/** Expresiile din config sunt date, nu cod: se compileaza aici, cu eroare clara. */
function compileazaTipare(tipare, cale, flags = "") {
  return cereListaDeTexte(tipare, cale).map((sursa, i) => {
    try {
      return new RegExp(sursa, flags);
    } catch (e) {
      throw new ConfigInvalid(
        `${cale}[${i}] nu e o expresie regulata valida: ${e.message}`,
      );
    }
  });
}

/**
 * Harta tehnologii: fiecare intrare leaga un tipar peste caile fisierelor de o
 * eticheta afisata in nota zilei si, optional, o nota din vault. `nota` lipsa
 * sau `null` inseamna doar eticheta simpla — nu se inventeaza o legatura spre
 * o nota care n-are cum sa existe.
 */
function compileazaHartaTehnologii(intrari, cale) {
  if (!Array.isArray(intrari)) {
    throw new ConfigInvalid(`${cale} trebuie sa fie o lista`);
  }
  return intrari.map((intrare, i) => {
    const obiect = cereObiect(intrare, `${cale}[${i}]`);
    const tipar = cereText(obiect.tipar ?? "", `${cale}[${i}].tipar`);
    let regex;
    try {
      regex = new RegExp(tipar, "i");
    } catch (e) {
      throw new ConfigInvalid(
        `${cale}[${i}].tipar nu e o expresie regulata valida: ${e.message}`,
      );
    }
    return {
      regex,
      eticheta: cereText(obiect.eticheta ?? "", `${cale}[${i}].eticheta`),
      nota:
        obiect.nota == null
          ? null
          : cereText(obiect.nota, `${cale}[${i}].nota`),
    };
  });
}

/**
 * @param {object} [optiuni]
 * @param {string} [optiuni.caleVault] radacina vaultului, bate orice altceva
 * @param {object} [optiuni.brut]      config deja citit (teste); altfel se citeste fisierul
 */
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

  // Sectiunile lipsa devin obiecte goale, ca validarea de mai jos sa dea un
  // mesaj despre CAMPUL lipsa, nu un "cannot read property of undefined".
  const vault = cereObiect(c.vault ?? {}, "vault");
  const hook = cereObiect(c.hook ?? {}, "hook");
  const git = cereObiect(c.git ?? {}, "git");
  const evenimente = cereObiect(c.evenimente ?? {}, "evenimente");
  const sesiune = cereObiect(c.sesiune ?? {}, "sesiune");
  const commit = cereObiect(c.commit ?? {}, "commit");
  const incheiere = cereObiect(c.incheiere ?? {}, "incheiere");
  const raport = cereObiect(c.raport ?? {}, "raport");
  const proiecte = cereObiect(c.proiecte ?? {}, "proiecte");
  const tehnologii = cereObiect(c.tehnologii ?? {}, "tehnologii");
  const ignorate = cereObiect(c.proiecteIgnorate ?? {}, "proiecteIgnorate");
  const diagnostic = cereObiect(c.diagnostic ?? {}, "diagnostic");

  const caleDinFisier = cereText(vault.cale ?? "", "vault.cale");
  const cale =
    optiuni.caleVault ||
    process.env.BRAIN_VAULT ||
    caleDinFisier ||
    path.resolve(__dirname, "..", "..");

  return {
    vault: {
      cale,
      folderEvenimente: cereText(
        vault.folderEvenimente ?? ".events",
        "vault.folderEvenimente",
      ),
      numeFisierZi: cereText(
        vault.numeFisierZi ?? "{zi}.jsonl",
        "vault.numeFisierZi",
      ),
    },
    hook: {
      timeoutTotalSecunde: cereIntregPozitiv(
        hook.timeoutTotalSecunde ?? 20,
        "hook.timeoutTotalSecunde",
      ),
    },
    git: {
      timeoutMs: cereIntregPozitiv(git.timeoutMs ?? 5000, "git.timeoutMs"),
      maxFisiereListate: cereIntregPozitiv(
        git.maxFisiereListate ?? 40,
        "git.maxFisiereListate",
      ),
    },
    evenimente: {
      activate: cereListaDeTexte(
        evenimente.activate ?? [],
        "evenimente.activate",
      ),
    },
    sesiune: {
      doarInRepoGit: cereBoolean(
        sesiune.doarInRepoGit ?? true,
        "sesiune.doarInRepoGit",
      ),
    },
    commit: {
      tipareAutomate: compileazaTipare(
        commit.tipareAutomate ?? [],
        "commit.tipareAutomate",
      ),
      tipareCodeReview: compileazaTipare(
        commit.tipareCodeReview ?? [],
        "commit.tipareCodeReview",
        "i",
      ),
    },
    incheiere: {
      folderVedere: cereText(
        incheiere.folderVedere ?? "inbox",
        "incheiere.folderVedere",
      ),
      numeFisierVedere: cereText(
        incheiere.numeFisierVedere ?? "evenimente-{zi}.md",
        "incheiere.numeFisierVedere",
      ),
      zileInUrma: cereIntregPozitiv(
        incheiere.zileInUrma ?? 7,
        "incheiere.zileInUrma",
      ),
      ruleazaSyncDaily: cereBoolean(
        incheiere.ruleazaSyncDaily ?? true,
        "incheiere.ruleazaSyncDaily",
      ),
      caleSyncDaily: cereText(
        incheiere.caleSyncDaily ?? "scripts/sync-daily.ps1",
        "incheiere.caleSyncDaily",
      ),
      timeoutSyncDailySecunde: cereIntregPozitiv(
        incheiere.timeoutSyncDailySecunde ?? 180,
        "incheiere.timeoutSyncDailySecunde",
      ),
    },
    raport: {
      folderZile: cereText(raport.folderZile ?? "daily", "raport.folderZile"),
      numeFisierZi: cereText(
        raport.numeFisierZi ?? "{zi}.md",
        "raport.numeFisierZi",
      ),
      marcajStart: cereText(raport.marcajStart ?? "", "raport.marcajStart"),
      marcajFinal: cereText(raport.marcajFinal ?? "", "raport.marcajFinal"),
      inainteDe: cereText(raport.inainteDe ?? "", "raport.inainteDe"),
      sablon: cereText(raport.sablon ?? "", "raport.sablon"),
      radaciniRepo: cereListaDeTexte(
        raport.radaciniRepo ?? [],
        "raport.radaciniRepo",
      ),
      recuperareDinGit: cereBoolean(
        raport.recuperareDinGit ?? true,
        "raport.recuperareDinGit",
      ),
      doarCommiturileMele: cereBoolean(
        raport.doarCommiturileMele ?? true,
        "raport.doarCommiturileMele",
      ),
      maxFisiereNecomis: cereIntregPozitiv(
        raport.maxFisiereNecomis ?? 12,
        "raport.maxFisiereNecomis",
      ),
    },
    tehnologii: {
      harta: compileazaHartaTehnologii(
        tehnologii.harta ?? [],
        "tehnologii.harta",
      ),
    },
    // Harta e normalizata cu ACEEASI functie ca identitatea proiectelor: altfel
    // o intrare scrisa in forma ssh n-ar gasi niciodata proiectul si legatura
    // spre nota ar lipsi, fara ca nimic sa semnaleze de ce.
    proiecte: {
      harta: Object.fromEntries(
        Object.entries(cereObiect(proiecte.harta ?? {}, "proiecte.harta")).map(
          ([remote, nota]) => [
            normalizeazaRemote(remote),
            cereText(nota, `proiecte.harta["${remote}"]`),
          ],
        ),
      ),
    },
    // Ambele liste se normalizeaza AICI, cu exact aceleasi functii folosite
    // pentru identitatea calculata la fiecare commit. Altfel comparatia ar cadea
    // tacut pe forme perfect firesti scrise de om: o cale cu backslash („C:\\Lucru\\
    // ClientX", cum o copiezi din Explorer) fata de calea cu slash pe care o
    // intoarce git, sau un remote copiat din GitHub („git@github.com:Org/repo.git")
    // fata de identitatea normalizata. Iar cand bariera care apara repo-urile de
    // echipa esueaza, esueaza in favoarea scrierii — deci nu s-ar observa.
    proiecteIgnorate: {
      dupaRemote: cereListaDeTexte(
        ignorate.dupaRemote ?? [],
        "proiecteIgnorate.dupaRemote",
      ).map((s) => normalizeazaRemote(s)),
      dupaCale: cereListaDeTexte(
        ignorate.dupaCale ?? [],
        "proiecteIgnorate.dupaCale",
      ).map((s) => normalizeazaCale(s)),
    },
    diagnostic: {
      logErori: cereBoolean(diagnostic.logErori ?? true, "diagnostic.logErori"),
      fisierLogErori: cereText(
        diagnostic.fisierLogErori ?? ".events/erori.log",
        "diagnostic.fisierLogErori",
      ),
    },
  };
}

// Validatorii sunt expusi ca sa-i foloseasca si `scripts/gata-pe-azi/`:
// aceleasi reguli de validare in ambele module, un singur loc de reparat.
const validatori = {
  cereObiect,
  cereText,
  cereIntregPozitiv,
  cereListaDeTexte,
  cereBoolean,
};

module.exports = {
  validatori,
  incarcaConfig,
  ConfigInvalid,
  CALE_CONFIG,
  normalizeazaRemote,
  normalizeazaCale,
};
