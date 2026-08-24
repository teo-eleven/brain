#!/usr/bin/env node
"use strict";

/**
 * plan-zi.js — decide pe ce se lucrează când spui „gata pe azi".
 *
 * Piesa care face dintr-un singur mesaj un plan pentru TOATE proiectele atinse
 * în ziua respectivă. Nu o listă fixă: lista se recalculează în fiecare seară,
 * din ce s-a întâmplat efectiv pe disc.
 *
 * Un proiect intră în plan dacă are, în ziua curentă de lucru, fie muncă
 * necomisă, fie commit-uri. Nimic altceva nu contează — nici dacă e „important",
 * nici dacă a fost în planul de ieri.
 *
 * TREI LUCRURI pe care le face și care nu sunt evidente:
 *
 *   1. ZIUA DE LUCRU nu e ziua calendaristică. Dacă spui „gata pe azi" la 01:30,
 *      te referi la ziua care tocmai s-a terminat, nu la cea care începe. Pragul
 *      stă în config (`ziuaDeLucru.oraStart`).
 *
 *   2. Proiectele ATINSE DAR ABSENTE din registru sunt raportate separat, nu
 *      ignorate. Altfel „am lucrat la ceva și n-a apărut nicăieri" ar arăta
 *      identic cu „n-am lucrat" — exact eșecul tăcut pe care îl tot vânăm.
 *
 *   3. Aceeași identitate de remote la două căi înseamnă o clonă. Se ia calea
 *      din registru, iar cealaltă se raportează ca duplicat — regula din ADR-ul
 *      `Fara clone locale`, aplicată automat.
 *
 * Toate setările vin din `config.json` (registrul) și din configul colectorului
 * (rădăcinile de scanare) — niciuna din cod.
 */

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const { incarcaConfig } = require("./config.js");
const {
  incarcaConfig: incarcaConfigColector,
  normalizeazaRemote,
} = require("../collector/config.js");

// Ca în `git-zi.js`: plafonul stă în `config.json` (`git.timeoutMs`), nu aici.
// Un singur plafon pentru toate interogările git din `gata pe azi` — două
// numere pentru aceeași întrebare ar ajunge sigur să nu mai fie de acord.
const TIMEOUT_GIT_MS = incarcaConfig().git.timeoutMs;

function git(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: TIMEOUT_GIT_MS,
      windowsHide: true,
    }).trimEnd();
  } catch {
    return null;
  }
}

/**
 * Ziua de lucru curentă.
 *
 * Înainte de `oraStart`, ziua de lucru e încă cea precedentă: cine închide la
 * 01:30 vorbește despre ziua care s-a terminat, nu despre cea care începe.
 */
function ziuaDeLucru(config, acum = new Date()) {
  const d = new Date(acum.getTime());
  if (d.getHours() < config.ziuaDeLucru.oraStart) {
    d.setDate(d.getDate() - 1);
  }
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function fisiereSchimbate(cale) {
  const stare = git(
    ["-c", "core.quotePath=false", "status", "--porcelain"],
    cale,
  );
  if (!stare || !stare.trim()) return [];
  return stare
    .split("\n")
    .filter(Boolean)
    .map((l) => l.slice(3).trim())
    .map((f) => (f.includes(" -> ") ? f.split(" -> ").pop() : f));
}

function areModificari(cale) {
  return fisiereSchimbate(cale).length > 0;
}

/**
 * A fost ATINS proiectul in ziua asta?
 *
 * „Are fisiere necomise" NU inseamna „s-a lucrat azi" — asta a fost un defect
 * real: un proiect cu un fisier necomis din urma cu 17 zile intra in planul
 * zilei si primea un agent de review degeaba. Fisierele necomise arata unde ai
 * ramas, nu cand.
 *
 * Semnalul corect e ORA ultimei scrieri pe disc, trecuta prin aceeasi regula de
 * zi de lucru ca restul: un fisier salvat la 01:30 apartine zilei care tocmai
 * s-a incheiat, nu celei care incepe.
 */
function modificatAzi(cale, config, zi) {
  for (const fisier of fisiereSchimbate(cale)) {
    let stat;
    try {
      stat = fs.statSync(path.join(cale, fisier));
    } catch {
      continue; // fisier sters sau folder; nu putem sti cand
    }
    if (ziuaDeLucru(config, new Date(stat.mtimeMs)) === zi) return true;
  }
  return false;
}

/**
 * Cate commit-uri ALE TALE sunt in ziua data.
 *
 * `--all` include si `refs/remotes`: dupa un simplu `git fetch` intr-un repo de
 * echipa, aici intrau commit-urile COLEGILOR. Doua pagube deodata — un proiect
 * la care n-ai pus mana intra in planul zilei si primeste un agent de review
 * degeaba, iar munca altcuiva ajunge numarata ca a ta.
 *
 * Autorul nu e scris in cod: e identitatea git A REPO-ULUI ALA (`user.email`),
 * deci merge si unde folosesti alt email. Daca repo-ul n-are identitate, nu se
 * inventeaza una — se numara zero, fiindca „toate commit-urile" ar fi un raspuns
 * mai gresit decat niciunul. Comutatorul e acelasi ca la colector.
 */
function commituriDin(cale, zi, doarAleMele = true) {
  const autor = doarAleMele ? git(["config", "--get", "user.email"], cale) : null;
  if (doarAleMele && !autor) return 0;
  const brut = git(
    [
      "log",
      "--all",
      `--since=${zi} 00:00:00`,
      `--until=${zi} 23:59:59`,
      ...(autor ? [`--author=${autor}`] : []),
      "--pretty=format:%h",
    ],
    cale,
  );
  return brut ? brut.split("\n").filter(Boolean).length : 0;
}

function esteRepo(cale) {
  return fs.existsSync(cale) && Boolean(git(["rev-parse", "--git-dir"], cale));
}

/** Toate repo-urile de sub rădăcinile de scanare, pe un singur nivel. */
function scaneazaTot(radacini) {
  const gasite = [];
  for (const radacina of radacini) {
    let intrari = [];
    try {
      intrari = fs.readdirSync(radacina, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const intrare of intrari) {
      if (!intrare.isDirectory()) continue;
      const cale = path.join(radacina, intrare.name);
      if (fs.existsSync(path.join(cale, ".git"))) gasite.push(cale);
    }
  }
  return gasite;
}

function identitate(cale) {
  return normalizeazaRemote(
    git(["config", "--get", "remote.origin.url"], cale),
    path.basename(cale),
  );
}

/**
 * Planul zilei.
 *
 * @returns {{
 *   zi: string,
 *   deLucru: Array<{proiect: object, necomise: boolean, commituri: number}>,
 *   sarite: Array<{nume: string, motiv: string}>,
 *   lipsescDinRegistru: Array<{cale: string, identitate: string}>,
 *   duplicate: Array<{identitate: string, cai: string[]}>
 * }}
 */
function construiestePlan(optiuni = {}) {
  const config = optiuni.config || incarcaConfig();
  const radacini =
    optiuni.radacini || incarcaConfigColector().raport.radaciniRepo;
  const zi = optiuni.zi || ziuaDeLucru(config);
  // acelasi comutator ca la colector: o singura politica, nu doua
  const doarAleMele =
    optiuni.doarAleMele !== undefined
      ? optiuni.doarAleMele
      : incarcaConfigColector().raport.doarCommiturileMele;

  const deLucru = [];
  const sarite = [];

  // 1. proiectele din registru: care au fost atinse azi?
  const caiDinRegistru = new Map();
  for (const proiect of Object.values(config.proiecte)) {
    if (!esteRepo(proiect.cale)) {
      sarite.push({
        nume: proiect.nume,
        motiv: fs.existsSync(proiect.cale)
          ? "nu e repo git"
          : "calea nu există pe disc",
      });
      continue;
    }
    caiDinRegistru.set(path.resolve(proiect.cale).toLowerCase(), proiect);

    const commituri = commituriDin(proiect.cale, zi, doarAleMele);
    const atinsAzi = modificatAzi(proiect.cale, config, zi);
    if (!atinsAzi && !commituri) {
      sarite.push({
        nume: proiect.nume,
        motiv: areModificari(proiect.cale)
          ? "neatins azi (are muncă necomisă, dar mai veche)"
          : "neatins azi",
      });
      continue;
    }
    deLucru.push({ proiect, necomise: atinsAzi, commituri });
  }

  // 2. ce s-a atins azi și NU e în registru — se raportează, nu se ignoră
  // Caile lasate deliberat pe dinafara: apar in raport ca DECIZIE, cu motivul
  // scris, nu ca scapare. Altfel aceleasi doua linii ar tipa in fiecare seara.
  const deliberat = new Map(
    (config.inafaraRegistrului || []).map((x) => [
      path.resolve(x.cale).toLowerCase(),
      x.motiv,
    ]),
  );
  const inafaraDeliberat = [];
  const lipsescDinRegistru = [];
  const caiPerIdentitate = new Map();
  for (const cale of scaneazaTot(radacini)) {
    const id = identitate(cale);
    if (!caiPerIdentitate.has(id)) caiPerIdentitate.set(id, []);
    caiPerIdentitate.get(id).push(cale);

    if (caiDinRegistru.has(path.resolve(cale).toLowerCase())) continue;
    if (
      !modificatAzi(cale, config, zi) &&
      !commituriDin(cale, zi, doarAleMele)
    )
      continue;

    const motiv = deliberat.get(path.resolve(cale).toLowerCase());
    if (motiv) {
      inafaraDeliberat.push({ cale, motiv });
      continue;
    }
    lipsescDinRegistru.push({ cale, identitate: id });
  }

  // 3. clone: aceeași identitate, două căi
  const duplicate = [...caiPerIdentitate.entries()]
    .filter(([id, cai]) => !id.startsWith("local:") && cai.length > 1)
    .map(([identitate, cai]) => ({ identitate, cai }));

  return {
    zi,
    deLucru,
    sarite,
    lipsescDinRegistru,
    inafaraDeliberat,
    duplicate,
  };
}

/** Raport de o linie per intrare, pentru chat. */
function rezumat(plan) {
  const linii = [`Ziua de lucru: ${plan.zi}`];
  if (plan.deLucru.length) {
    linii.push(`De lucru (${plan.deLucru.length}), în paralel:`);
    for (const x of plan.deLucru) {
      const parti = [];
      if (x.commituri) parti.push(`${x.commituri} commit-uri`);
      if (x.necomise) parti.push("fișiere modificate azi");
      linii.push(`  • ${x.proiect.nume} — ${parti.join(" + ")}`);
    }
  } else {
    linii.push("De lucru: niciun proiect atins azi.");
  }
  if (plan.lipsescDinRegistru.length) {
    linii.push(
      `ATINSE AZI DAR LIPSESC DIN REGISTRU (${plan.lipsescDinRegistru.length}):`,
    );
    for (const x of plan.lipsescDinRegistru) linii.push(`  • ${x.cale}`);
  }
  if (plan.duplicate.length) {
    linii.push("CLONE (același remote, două căi):");
    for (const d of plan.duplicate)
      linii.push(`  • ${d.identitate}: ${d.cai.join(" · ")}`);
  }
  if (plan.inafaraDeliberat.length) {
    linii.push("În afara registrului, deliberat:");
    for (const x of plan.inafaraDeliberat) {
      linii.push(`  • ${x.cale} — ${x.motiv}`);
    }
  }
  if (plan.sarite.length) {
    linii.push(
      `Sărite: ${plan.sarite.map((s) => `${s.nume} (${s.motiv})`).join(", ")}`,
    );
  }
  return linii.join("\n");
}

module.exports = { construiestePlan, ziuaDeLucru, rezumat };

if (require.main === module) {
  process.stdout.write(rezumat(construiestePlan()) + "\n");
}
