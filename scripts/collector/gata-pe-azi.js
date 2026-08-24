#!/usr/bin/env node
"use strict";

/**
 * gata-pe-azi.js — inchide ziua si scrie FAPTELE ei in nota din vault.
 *
 * Motorul din spatele comenzii `/gata-pe-azi`. Scrii „gata pe azi", iar ziua
 * ajunge in Obsidian fara sa o compui de mana.
 *
 * REGULA CARE NU SE NEGOCIAZA: aici se scriu doar fapte verificabile — ce a
 * strans colectorul din commit-uri si sesiuni, plus sedintele primite ca
 * argument. Nicio propozitie despre „de ce". Sectiunile scrise de mana
 * (`Focus`, `Tasks`, `Notes`, `Deschis`) nu sunt atinse niciodata: blocul
 * generat traieste strict intre doi markeri, ca si cel al lui `sync-daily.ps1`.
 *
 * Sedintele NU se pot lua de aici: conectorul Microsoft 365 cere o sesiune
 * autentificata, iar un script de linie de comanda n-are asa ceva. De aceea
 * comanda le aduce si le paseaza incoace cu `--sedinte`, ca fisier JSON.
 *
 * Utilizare:
 *   node gata-pe-azi.js
 *   node gata-pe-azi.js --zi 2026-08-24 --sedinte C:/tmp/sedinte.json
 *   node gata-pe-azi.js --fara-sync          # sare peste sync-daily.ps1
 *
 * Scrie pe stdout un rezumat JSON, ca sa poata fi raportat mai departe.
 */

const fs = require("node:fs");
const path = require("node:path");

const { incarcaConfig, normalizeazaRemote } = require("./config.js");
const inchidere = require("./close-day.js");
// aceeasi implementare pentru `git` si pentru regula de ignorare ca in colector:
// doua variante ale barierei care apara repo-urile de echipa ar ajunge sa nu
// mai fie de acord, exact acolo unde nu-ti permiti
const { git, esteIgnorat } = require("./collect-event.js");

const ZI_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

function ziLocala(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function caleNotaZi(config, zi) {
  return path.join(
    config.vault.cale,
    config.raport.folderZile,
    config.raport.numeFisierZi.replace("{zi}", zi),
  );
}

function numeScurt(proiect) {
  if (proiect.startsWith("local:")) return proiect.slice("local:".length);
  return proiect.split("/").filter(Boolean).pop() || proiect;
}

function etichetaProiect(proiect, config) {
  const nota = config.proiecte.harta[proiect];
  return nota ? `[[${nota}]]` : `\`${numeScurt(proiect)}\``;
}

/**
 * Repo-urile gasite sub radacinile din config, pe un singur nivel.
 *
 * Descoperire, nu lista scrisa de mana: o lista se desincronizeaza garantat, iar
 * exact asta a costat noua zile de jurnal in august (o clona moarta trecuta in
 * `$TRACKED`, care raporta sincer „zero commit-uri azi").
 */
function scaneazaRepouri(config) {
  const gasite = [];
  for (const radacina of config.raport.radaciniRepo) {
    let intrari = [];
    try {
      intrari = fs.readdirSync(radacina, { withFileTypes: true });
    } catch {
      continue; // radacina lipseste pe statia asta; nu e o eroare
    }
    for (const intrare of intrari) {
      if (!intrare.isDirectory()) continue;
      const cale = path.join(radacina, intrare.name);
      if (fs.existsSync(path.join(cale, ".git"))) gasite.push(cale);
    }
  }
  return gasite;
}

/**
 * Ce se vede ACUM in repo-uri: munca necomisa si commit-urile de azi.
 *
 * Jurnalul vede doar commit-uri deja intamplate si sesiuni deja incheiate. O
 * comanda care raspunde la „ce am facut azi" rulata la 18:00, in mijlocul
 * lucrului, ar spune altfel „nimic" — desi ziua e plina. De asta se scaneaza si
 * starea curenta.
 */
function starePrezenta(config, zi) {
  const rezultat = { necomis: [], commituriGasite: [], caiPerProiect: {} };
  const inceput = `${zi} 00:00:00`;
  const sfarsit = `${zi} 23:59:59`;

  for (const cale of scaneazaRepouri(config)) {
    const remote = git(["config", "--get", "remote.origin.url"], cale, config);
    const proiect = normalizeazaRemote(remote, path.basename(cale));
    if (esteIgnorat(proiect, cale, config)) continue;

    const status = git(
      ["-c", "core.quotePath=false", "status", "--porcelain=v1"],
      cale,
      config,
    );
    if (status) {
      const fisiere = status
        .split("\n")
        .filter(Boolean)
        .map((l) => l.slice(3).trim());
      rezultat.necomis.push({
        proiect,
        cale,
        necomise: fisiere.length,
        fisiere: fisiere.slice(0, config.raport.maxFisiereNecomis),
      });
    }
    // toate caile la care a fost gasit un proiect — sursa avertismentului de clona
    if (!rezultat.caiPerProiect[proiect]) rezultat.caiPerProiect[proiect] = [];
    rezultat.caiPerProiect[proiect].push(cale);

    if (!config.raport.recuperareDinGit) continue;
    const log = git(
      [
        "log",
        "--all",
        `--since=${inceput}`,
        `--until=${sfarsit}`,
        "--pretty=format:%h%x1f%s%x1f%aI",
      ],
      cale,
      config,
    );
    if (!log) continue;
    for (const linie of log.split("\n").filter(Boolean)) {
      const [sha, subiect, la] = linie.split("\x1f");
      rezultat.commituriGasite.push({ proiect, sha, subiect, la });
    }
  }
  return rezultat;
}

/**
 * Faptele zilei: jurnalul, plus starea curenta a repo-urilor.
 */
function stangeFapte(config, zi, sedinte = [], prezent = null) {
  const evenimente = inchidere.citesteJurnal(config, zi);
  const commituri = evenimente.filter((e) => e.tip === "commit" && !e.automat);
  const automate = evenimente.filter((e) => e.tip === "commit" && e.automat);
  const sesiuni = inchidere.ultimeleSesiuni(
    evenimente.filter((e) => e.tip === "sesiune"),
  );

  const perProiect = new Map();
  for (const ev of commituri) {
    if (!perProiect.has(ev.proiect)) {
      perProiect.set(ev.proiect, {
        commituri: [],
        adaugate: 0,
        sterse: 0,
        fisiere: 0,
      });
    }
    const p = perProiect.get(ev.proiect);
    p.commituri.push(ev);
    p.adaugate += ev.adaugate;
    p.sterse += ev.sterse;
    p.fisiere += ev.fisiere;
  }

  const necomis = sesiuni
    .filter((s) => s.necomise > 0)
    .map((s) => ({
      proiect: s.proiect,
      necomise: s.necomise,
      fisiere: s.fisiereNecomise,
    }));

  // Commit-uri gasite in repo-uri dar ABSENTE din jurnal: hook-ul nu le-a prins
  // (nu era instalat inca, a esuat, sau repo-ul e o clona). Se raporteaza
  // separat, ca lipsa lui sa se VADA, nu sa produca o zi mai saraca.
  const cunoscute = new Set(evenimente.filter((e) => e.sha).map((e) => e.sha));
  // Fara duplicate: cand acelasi repo exista la doua cai, `git log` il gaseste
  // de doua ori, iar ziua ar arata munca dubla. Cheia e (proiect, sha).
  const vazute = new Set();
  const recuperate = (prezent ? prezent.commituriGasite : []).filter((c) => {
    if (cunoscute.has(c.sha)) return false;
    const cheie = `${c.proiect}|${c.sha}`;
    if (vazute.has(cheie)) return false;
    vazute.add(cheie);
    return true;
  });

  // Acelasi proiect, doua cai pe disc — verificat si pe scanarea de ACUM, nu
  // doar pe jurnal. Asa s-a descoperit ca `ecf-people-culture` exista in doua
  // locuri: jurnalul n-avea inca niciun eveniment de la el.
  const dinJurnal = inchidere.gasesteDuplicate(evenimente);
  const dinScanare = Object.entries(prezent ? prezent.caiPerProiect : {})
    .filter(([proiect, cai]) => !proiect.startsWith("local:") && cai.length > 1)
    .map(([proiect, cai]) => ({ proiect, cai }))
    .filter((d) => !dinJurnal.some((x) => x.proiect === d.proiect));

  return {
    zi,
    recuperate,
    // o singura intrare per proiect, chiar daca a fost gasit la doua cai
    necomisAcum: prezent
      ? prezent.necomis.filter(
          (n, i, tot) => tot.findIndex((x) => x.proiect === n.proiect) === i,
        )
      : [],
    proiecte: [...perProiect.entries()].map(([proiect, p]) => ({
      proiect,
      ...p,
    })),
    totalCommituri: commituri.length,
    totalAdaugate: commituri.reduce((t, e) => t + e.adaugate, 0),
    totalSterse: commituri.reduce((t, e) => t + e.sterse, 0),
    automate: automate.length,
    sesiuni: sesiuni.length,
    necomis,
    sedinte,
    duplicate: [...dinJurnal, ...dinScanare],
  };
}

/** Blocul de text care intra intre markeri. */
function construiesteBloc(fapte, config) {
  const out = [];
  out.push(config.raport.marcajStart);
  out.push("## Fapte");
  out.push("");

  const gol =
    !fapte.totalCommituri &&
    !fapte.sesiuni &&
    !fapte.sedinte.length &&
    !fapte.recuperate.length &&
    !fapte.necomisAcum.length;
  if (gol) {
    out.push(
      "Nicio activitate înregistrată azi. Colectorul a rulat — un rând gol " +
        "aici înseamnă că n-a fost activitate, nu că jurnalul a tăcut.",
    );
    out.push("");
    out.push(config.raport.marcajFinal);
    return out.join("\n");
  }

  if (fapte.totalCommituri) {
    out.push(
      `**${fapte.totalCommituri} commit-uri** · ` +
        `+${fapte.totalAdaugate} / −${fapte.totalSterse} linii · ` +
        `${fapte.proiecte.length} proiecte` +
        (fapte.automate ? ` · ${fapte.automate} de întreținere` : ""),
    );
    out.push("");
    for (const p of fapte.proiecte) {
      out.push(
        `- ${etichetaProiect(p.proiect, config)} — ${p.commituri.length} commit-uri, ` +
          `+${p.adaugate} / −${p.sterse}`,
      );
      for (const ev of p.commituri.sort((a, b) => a.ts.localeCompare(b.ts))) {
        out.push(`    - **${ev.ts}** \`${ev.sha}\` ${ev.subiect}`);
      }
    }
    out.push("");
  }

  if (fapte.sedinte.length) {
    out.push("**Ședințe**");
    out.push("");
    for (const s of fapte.sedinte) {
      const ora = s.ora ? `**${s.ora}** ` : "";
      const cu =
        s.participanti && s.participanti.length
          ? ` · ${s.participanti.join(", ")}`
          : "";
      out.push(`- ${ora}${s.titlu}${cu}`);
    }
    out.push("");
  }

  if (fapte.recuperate.length) {
    out.push(
      `**${fapte.recuperate.length} commit-uri găsite direct în repo-uri**, ` +
        "absente din jurnal — hook-ul nu era instalat încă sau n-a apucat să le prindă",
    );
    out.push("");
    for (const c of fapte.recuperate) {
      out.push(
        `- ${etichetaProiect(c.proiect, config)} \`${c.sha}\` ${c.subiect}`,
      );
    }
    out.push("");
  }

  if (fapte.necomisAcum.length) {
    out.push("**Necomis chiar acum**");
    out.push("");
    for (const n of fapte.necomisAcum) {
      out.push(
        `- ${etichetaProiect(n.proiect, config)} — ${n.necomise} fișiere: ` +
          n.fisiere.join(", "),
      );
    }
    out.push("");
  }

  if (fapte.necomis.length) {
    out.push("**Rămas necomis la închiderea sesiunii**");
    out.push("");
    for (const n of fapte.necomis) {
      out.push(
        `- ${etichetaProiect(n.proiect, config)} — ${n.necomise} fișiere: ` +
          n.fisiere.join(", "),
      );
    }
    out.push("");
  }

  if (fapte.duplicate.length) {
    out.push(
      "**⚠ Același proiect, două locuri pe disc** — vezi [[Fara clone locale]]",
    );
    out.push("");
    for (const d of fapte.duplicate) {
      out.push(
        `- \`${d.proiect}\`: ${d.cai.map((c) => `\`${c}\``).join(" · ")}`,
      );
    }
    out.push("");
  }

  out.push(config.raport.marcajFinal);
  return out.join("\n");
}

/** Nota zilei, creata din sablon daca nu exista inca. */
function asiguraNota(config, zi) {
  const fisier = caleNotaZi(config, zi);
  if (fs.existsSync(fisier)) return fisier;

  const sablon = path.join(config.vault.cale, config.raport.sablon);
  let text = `---\ntags: [daily]\ncreated: ${zi}\ntype: daily\n---\n\n# ${zi}\n\n`;
  if (config.raport.sablon && fs.existsSync(sablon)) {
    // sabloanele Obsidian folosesc {{date:...}}; se inlocuieste cu ziua ceruta
    text = fs
      .readFileSync(sablon, "utf8")
      .replace(/\{\s*\{\s*date:[^}]*\}\s*\}/g, zi)
      .replace(/\{\{date:[^}]*\}\}/g, zi);
  }
  fs.mkdirSync(path.dirname(fisier), { recursive: true });
  fs.writeFileSync(fisier, text, "utf8");
  return fisier;
}

/**
 * Pune blocul in nota, intre markeri.
 *
 * Trei cazuri, in ordine: blocul exista deja (se inlocuieste pe loc), exista
 * ancora `inainteDe` (se aseaza inaintea ei, ca tot ce e generat sa stea
 * grupat), nu exista niciuna (se adauga la final). Nimic din afara markerilor
 * nu se atinge in niciunul dintre cazuri.
 */
function pune(text, bloc, config) {
  const { marcajStart, marcajFinal, inainteDe } = config.raport;

  const i = text.indexOf(marcajStart);
  if (i !== -1) {
    const j = text.indexOf(marcajFinal, i);
    if (j !== -1) {
      return text.slice(0, i) + bloc + text.slice(j + marcajFinal.length);
    }
  }

  const k = inainteDe ? text.indexOf(inainteDe) : -1;
  if (k !== -1) {
    return text.slice(0, k) + bloc + "\n\n" + text.slice(k);
  }

  const separator = text.endsWith("\n") ? "\n" : "\n\n";
  return text + separator + bloc + "\n";
}

function citesteSedinte(cale) {
  if (!cale) return [];
  try {
    const brut = JSON.parse(fs.readFileSync(cale, "utf8"));
    return Array.isArray(brut) ? brut : [];
  } catch {
    return [];
  }
}

function ruleaza(optiuni = {}) {
  const config = optiuni.config || incarcaConfig();
  const zi = optiuni.zi || ziLocala();
  if (!ZI_VALIDA.test(zi)) throw new Error(`zi invalida: ${zi}`);

  // 1. vederile din inbox + heartbeat, pentru zilele ramase
  const inchise = inchidere.incheie({
    config,
    faraSync: true, // scriptul greu se cheama la final, o singura data
  });

  // 2. faptele zilei cerute
  // starea curenta a repo-urilor: munca necomisa ACUM si commit-urile de azi
  const prezent =
    optiuni.prezent !== undefined ? optiuni.prezent : starePrezenta(config, zi);
  const fapte = stangeFapte(config, zi, optiuni.sedinte || [], prezent);

  // 3. blocul in nota
  const fisier = asiguraNota(config, zi);
  const inainte = fs.readFileSync(fisier, "utf8");
  const dupa = pune(inainte, construiesteBloc(fapte, config), config);
  const schimbat = dupa !== inainte;
  if (schimbat) fs.writeFileSync(fisier, dupa, "utf8");

  // 4. scriptul greu, o singura data
  let sync = null;
  if (!optiuni.faraSync && config.incheiere.ruleazaSyncDaily) {
    sync = inchidere.incheie({ config, zi, faraSync: false }).sync;
  }

  return {
    zi,
    nota: fisier,
    notaSchimbata: schimbat,
    vederi: inchise.zile.map((z) => z.zi),
    fapte,
    sync,
  };
}

module.exports = {
  ruleaza,
  stangeFapte,
  construiesteBloc,
  pune,
  asiguraNota,
  caleNotaZi,
};

if (require.main === module) {
  const arg = (nume) => {
    const i = process.argv.indexOf(nume);
    return i !== -1 ? process.argv[i + 1] : undefined;
  };
  const rezultat = ruleaza({
    zi: arg("--zi"),
    sedinte: citesteSedinte(arg("--sedinte")),
    faraSync: process.argv.includes("--fara-sync"),
  });
  process.stdout.write(JSON.stringify(rezultat, null, 2) + "\n");
}
