#!/usr/bin/env node
"use strict";

/**
 * collect-event.js — colectorul de evenimente al vaultului.
 *
 * Chemat din hook-uri (git `post-commit`, mai tarziu `Stop`-ul din Claude Code)
 * si scrie O LINIE per eveniment in `.events/AAAA-LL-ZZ.jsonl`. Atat: nu
 * interpreteaza, nu cheama niciun model, nu atinge notele, nu face niciun commit.
 *
 * Trei reguli care nu se negociaza:
 *
 *   1. NU strica niciodata comanda care l-a chemat. Orice eroare -> exit 0, fara
 *      nimic pe stdout. Un jurnal ratat e un inconvenient; un `git commit` cazut
 *      din cauza jurnalului e un motiv sa dezactivezi tot mecanismul. Erorile nu
 *      dispar insa: se scriu in fisierul din `diagnostic.fisierLogErori`.
 *   2. Fara retea, fara scrieri in repo-ul de lucru. Hook-ul e global, deci
 *      ruleaza si in repo-urile de echipa — unde nu are ce cauta.
 *   3. Rapid. Se executa la FIECARE commit: patru interogari git, nimic altceva.
 *
 * Identitatea unui proiect e `remote.origin.url`, nu calea pe disc. Motivul e
 * scris ca ADR in vault (`decisions/Fara clone locale.md`): o clona veche e un
 * repo git perfect valid, la alta cale, care raporteaza sincer „zero commit-uri
 * azi" — si are dreptate, pentru repo-ul ala. Gruparea pe remote face duplicatul
 * VIZIBIL, in loc sa depinda de tinut minte.
 *
 * Toate setarile stau in `config.json`, de langa acest fisier. Nicio valoare
 * reglabila nu are voie sa apara mai jos.
 *
 * Utilizare:
 *   node collect-event.js commit      # din git post-commit, cu cwd = repo
 */

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const {
  incarcaConfig,
  normalizeazaRemote,
  normalizeazaCale,
} = require("./config.js");

/** Data LOCALA, nu UTC: zilele din vault sunt zile de lucru, nu intervale UTC. */
function ziua(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function ora(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** git, cu esecul transformat in `null`. Niciun apel de aici nu e critic. */
function git(args, cwd, config) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: config.git.timeoutMs,
      windowsHide: true,
      // `trimEnd`, NU `trim`: iesirea lui `git status --porcelain` incepe fiecare
      // linie cu doua caractere de stare, iar pentru un fisier modificat primul
      // e un SPATIU. Un `trim` complet manca spatiul de pe PRIMA linie, iar
      // taierea prefixului de stare inghitea apoi si prima litera din nume:
      // „.gitignore" ajungea „gitignore", „CLAUDE.md" ajungea „LAUDE.md".
      // Se vedea doar la primul fisier din fiecare lista, deci era usor de ratat.
    }).trimEnd();
  } catch {
    return null;
  }
}

/**
 * Cheia stabila a unui proiect. Normalizarea vine din `config.js`, ca sa fie
 * IDENTICA cu cea aplicata intrarilor din `proiecteIgnorate` — doua normalizari
 * diferite ar face lista de ignorate sa nu se potriveasca niciodata.
 */
function identitate(remote, radacina) {
  return normalizeazaRemote(remote, path.basename(radacina || ""));
}

/**
 * Potrivire cu GRANITA: „github.com/acme/app" nu are voie sa prinda si
 * „github.com/acme/app-mobile", iar „c:/lucru/client-a" sa prinda „client-ab".
 * Fara asta, o intrare din lista ar face sa dispara tacut evenimentele altui
 * proiect, iar lipsa lor n-ar semnala nimic.
 */
function sePotriveste(valoare, tipar) {
  if (!tipar) return false;
  const i = valoare.indexOf(tipar);
  if (i === -1) return false;
  const urmator = valoare[i + tipar.length];
  return urmator === undefined || urmator === "/";
}

function esteIgnorat(proiect, radacina, config) {
  const cale = normalizeazaCale(radacina || "");
  return (
    config.proiecteIgnorate.dupaRemote.some((p) => sePotriveste(proiect, p)) ||
    config.proiecteIgnorate.dupaCale.some((p) => sePotriveste(cale, p))
  );
}

/**
 * Antetul commit-ului SI statisticile lui, dintr-un SINGUR apel git.
 *
 * De ce comasat: pe statia asta un `git` pornit costa ~160 ms, iar `node` ~410
 * (masurat, nu presupus — probabil scanare antivirus la fiecare proces nou).
 * Cinci apeluri insemnau ~800 ms doar in porniri de proces. Trei apeluri fac
 * acelasi lucru: acesta, `rev-parse` cu doua intrebari deodata, si `config`
 * pentru remote.
 *
 * Optiunile nu sunt de stil:
 *   `--root`      — fara el, PRIMUL commit dintr-un repo (care n-are parinte cu
 *                   ce sa fie comparat) raporteaza zero fisiere si zero linii,
 *                   adica exact commit-ul de deschidere al oricarui proiect nou.
 *   `core.quotePath=false` — implicit git scrie numele non-ASCII cu escape-uri C,
 *                   deci un nume romanesc ar ajunge in jurnal cu escape-uri
 *                   octale: ilizibil si imposibil de legat de fisierul real.
 *
 * Un merge ramane la zero fisiere, deliberat: git nu produce numstat pentru
 * merge-uri, iar asta e corect — un merge nu aduce munca noua, doar o muta.
 * Evenimentul il marcheaza separat, cu `merge: true`.
 */
function antetSiStatistici(cwd, config) {
  const brut = git(
    [
      "-c",
      "core.quotePath=false",
      "show",
      "--numstat",
      "--format=%H%x1f%s%x1f%aI%x1f%P",
      "--root",
      "HEAD",
    ],
    cwd,
    config,
  );
  if (!brut) return null;

  const linii = brut.split("\n");
  const [sha, subiect, dataAutor, parinti] = (linii.shift() || "").split(
    "\x1f",
  );
  if (!sha) return null;

  let adaugate = 0;
  let sterse = 0;
  const cai = [];
  let fisiere = 0;
  for (const linie of linii) {
    if (!linie.trim()) continue;
    const [a, st, ...rest] = linie.split("\t");
    if (!rest.length) continue;
    fisiere += 1;
    // fisierele binare raporteaza `-` in loc de numar
    if (a !== "-") adaugate += Number(a) || 0;
    if (st !== "-") sterse += Number(st) || 0;
    cai.push(rest.join("\t"));
  }

  return { sha, subiect, dataAutor, parinti, fisiere, adaugate, sterse, cai };
}

function caleFisierZi(config, zi = ziua()) {
  return path.join(
    config.vault.cale,
    config.vault.folderEvenimente,
    config.vault.numeFisierZi.replace("{zi}", zi),
  );
}

function scrie(eveniment, config) {
  const fisier = caleFisierZi(config);
  fs.mkdirSync(path.dirname(fisier), { recursive: true });
  fs.appendFileSync(fisier, JSON.stringify(eveniment) + "\n", "utf8");
}

/**
 * Erorile nu ies la suprafata (regula 1), dar nici nu dispar. Daca nici logarea
 * nu merge, se renunta in tacere: nu exista nimic util de facut mai departe.
 */
function logEroare(eroare, config) {
  try {
    if (!config || !config.diagnostic.logErori) return;
    if (!fs.existsSync(config.vault.cale)) return;
    const fisier = path.join(
      config.vault.cale,
      config.diagnostic.fisierLogErori,
    );
    fs.mkdirSync(path.dirname(fisier), { recursive: true });
    fs.appendFileSync(
      fisier,
      `${new Date().toISOString()} collect-event ${eroare && eroare.stack ? eroare.stack : eroare}\n`,
      "utf8",
    );
  } catch {
    /* intentionat gol */
  }
}

function evenimentCommit(cwd, config) {
  // doua intrebari, un singur proces
  const brut = git(
    ["rev-parse", "--show-toplevel", "--abbrev-ref", "HEAD"],
    cwd,
    config,
  );
  if (!brut) return null; // nu suntem intr-un repo; nimic de raportat
  const [radacina, ramura] = brut.split("\n");
  if (!radacina) return null;

  const proiect = identitate(
    git(["config", "--get", "remote.origin.url"], cwd, config),
    radacina,
  );
  // verificarea de ignorare vine INAINTEA citirii commit-ului: pentru un repo
  // pe care nu-l jurnalizam, nici macar nu ne uitam ce contine
  if (esteIgnorat(proiect, radacina, config)) return null;

  const c = antetSiStatistici(cwd, config);
  if (!c) return null; // repo fara commit-uri

  const nrParinti = (c.parinti || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    ts: ora(),
    la: c.dataAutor,
    tip: "commit",
    proiect,
    cale: radacina,
    ramura: (ramura || "").trim(),
    sha: c.sha.slice(0, 7),
    subiect: c.subiect,
    merge: nrParinti > 1,
    // Commit-urile de intretinere (`sync-daily.ps1`) sunt marcate, NU excluse:
    // o zi in care intretinerea n-a rulat trebuie sa se vada.
    automat: config.commit.tipareAutomate.some((re) =>
      re.test(c.subiect || ""),
    ),
    fisiere: c.fisiere,
    adaugate: c.adaugate,
    sterse: c.sterse,
    fisiereAtinse: c.cai.slice(0, config.git.maxFisiereListate),
  };
}

/**
 * Ce a ramas NEcomis, dintr-un singur apel git.
 *
 * `--porcelain=v1 -b` da si ramura (prima linie, `## nume...`) si fisierele, cu
 * un format garantat stabil intre versiuni de git — spre deosebire de iesirea
 * pentru oameni a lui `git status`, care se poate schimba.
 */
function lucruNecomis(cwd, config) {
  const brut = git(
    ["-c", "core.quotePath=false", "status", "--porcelain=v1", "-b"],
    cwd,
    config,
  );
  if (brut === null) return null;

  let ramura = null;
  const fisiere = [];
  for (const linie of brut.split("\n")) {
    if (!linie) continue;
    if (linie.startsWith("## ")) {
      // „## main...origin/main [ahead 1]" -> „main"
      ramura = linie.slice(3).split(/\.\.\.|\s/)[0];
      continue;
    }
    // primele doua caractere sunt starea (indice + arbore), apoi un spatiu
    const cale = linie.slice(3).trim();
    // redenumirile apar ca „vechi -> nou"; ne intereseaza destinatia
    fisiere.push(cale.includes(" -> ") ? cale.split(" -> ").pop() : cale);
  }
  return { ramura, fisiere };
}

/**
 * Finalul unei sesiuni Claude Code (hook-ul `SessionEnd`).
 *
 * De ce `SessionEnd` si nu `Stop`: `Stop` se declanseaza dupa FIECARE raspuns al
 * modelului, deci ar fi produs zeci de intrari pe zi pentru aceeasi sesiune.
 * `SessionEnd` se declanseaza o singura data, la incheiere, si aduce si motivul.
 *
 * Ce retine: proiectul, ramura si ce a ramas NEcomis in acel moment — adica
 * exact partea de munca pe care commit-urile n-o pot arata. Nu retine nimic din
 * conversatie: transcriptul e primit in `intrare.transcript_path`, dar nu e
 * citit niciodata (decizie asumata la alegerea surselor).
 */
function evenimentSesiune(cwd, config, intrare = {}) {
  const brut = git(
    ["rev-parse", "--show-toplevel", "--abbrev-ref", "HEAD"],
    cwd,
    config,
  );
  const radacina = brut ? brut.split("\n")[0] : null;

  if (!radacina && config.sesiune.doarInRepoGit) return null;

  const proiect = radacina
    ? identitate(
        git(["config", "--get", "remote.origin.url"], cwd, config),
        radacina,
      )
    : identitate(null, path.basename(cwd || ""));
  if (esteIgnorat(proiect, radacina || cwd, config)) return null;

  const necomis = radacina ? lucruNecomis(cwd, config) : null;

  return {
    ts: ora(),
    la: new Date().toISOString(),
    tip: "sesiune",
    proiect,
    cale: radacina || cwd,
    ramura: necomis ? necomis.ramura : null,
    sesiune: intrare.session_id || null,
    motiv: intrare.reason || null,
    necomise: necomis ? necomis.fisiere.length : 0,
    fisiereNecomise: necomis
      ? necomis.fisiere.slice(0, config.git.maxFisiereListate)
      : [],
  };
}

const CONSTRUCTORI = {
  commit: evenimentCommit,
  sesiune: evenimentSesiune,
};

/**
 * Colecteaza un eveniment. Nu arunca niciodata.
 *
 * @param {string} tip                tipul evenimentului (`commit`, `sesiune`)
 * @param {object} [optiuni]
 * @param {string} [optiuni.cwd]      folderul din care s-a pornit (implicit: cel curent)
 * @param {object} [optiuni.config]   configul deja incarcat (teste); altfel se incarca
 * @param {object} [optiuni.intrare]  datele primite de hook pe stdin (`sesiune`)
 * @returns {boolean} true daca s-a scris un eveniment
 */
function colecteaza(tip, optiuni = {}) {
  let config = optiuni.config;
  try {
    if (!config) config = incarcaConfig();

    // Vaultul poate lipsi: alt calculator, disc nemontat, folder mutat. Atunci
    // colectorul tace. NU creeaza vaultul din nimic — ar ascunde o configurare
    // gresita sub un folder gol care pare sa functioneze.
    if (!fs.existsSync(config.vault.cale)) return false;

    if (!config.evenimente.activate.includes(tip)) return false;

    const construieste = CONSTRUCTORI[tip];
    if (!construieste) return false;

    const eveniment = construieste(
      optiuni.cwd || process.cwd(),
      config,
      optiuni.intrare || {},
    );
    if (!eveniment) return false;

    scrie(eveniment, config);
    return true;
  } catch (eroare) {
    logEroare(eroare, config);
    return false;
  }
}

/**
 * Datele pe care hook-ul le primeste pe stdin.
 *
 * Doar pentru `sesiune`: hook-urile Claude Code trimit un JSON
 * (`session_id`, `cwd`, `reason`, `transcript_path`). Pentru `commit` nu se
 * citeste stdin deloc — git nu trimite nimic acolo, iar o citire ar bloca.
 *
 * Orice esec de citire sau de parsare devine `{}`: evenimentul se scrie oricum,
 * doar fara identificatorul sesiunii. Mai bine o intrare incompleta decat una
 * lipsa.
 */
function citesteIntrarea() {
  try {
    const brut = fs.readFileSync(0, "utf8");
    return brut ? JSON.parse(brut) : {};
  } catch {
    return {};
  }
}

// `git` si `esteIgnorat` sunt expuse pentru `gata-pe-azi.js`, care scaneaza
// starea curenta a repo-urilor. Aceeasi implementare in ambele locuri: doua
// variante ale regulii de ignorare ar ajunge sa nu mai fie de acord, exact
// pe bariera care apara repo-urile de echipa.
module.exports = {
  colecteaza,
  identitate,
  ziua,
  ora,
  caleFisierZi,
  git,
  esteIgnorat,
};

if (require.main === module) {
  const tip = (process.argv[2] || "commit").toLowerCase();
  colecteaza(tip, { intrare: tip === "sesiune" ? citesteIntrarea() : {} });
  process.exit(0);
}
