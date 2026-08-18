---
tags: [project, personal]
created: 2026-08-18
type: project
status: active
---

# Proiecte personale

Ce se lucrează **în afara econfaire**, pe contul GitHub personal `tewtzu-ctrl`. Trei repo-uri vii,
toate private. Nodul ăsta există fiindcă până pe 18.08 **niciunul nu apărea în vault**, deși în
cinci din ultimele șapte zile lucrătoare — plus sâmbătă 15.08 — a intrat cod în ele.

## Cele trei

| Proiect                             | Ce e                                                          | Stack                        | Ultimul commit |
| ----------------------------------- | ------------------------------------------------------------- | ---------------------------- | -------------- |
| [[Trupa 9 - site]]                  | site pentru o trupă de muzică live din Suceava                | HTML/CSS/JS static, fără build | **18.08** 15:19 |
| [[Pizzeria Punto - agent vocal]]    | agent de preluare comenzi prin voce, pentru o pizzerie        | FastAPI + SQLite, STT→LLM→TTS | 15.08 19:50    |
| [[Hours - planificator de zi]]      | pontaj 9h + sarcini, ședințe, memento-uri, 100% în browser    | TypeScript + React, IndexedDB | 15.08 19:53    |

Niciunul nu are legătură cu proiectele de serviciu ([[ADM Expert]], [[QA AI Agent]]) — nici cod,
nici date, nici conturi.

## Cronologia — ce s-a lucrat și când

| Ziua                | Ce a intrat în git                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 07.08               | Pizzeria Punto, Faza 1: domeniu + API + interfață web, 199 teste, coverage 97% (`50f5c68`)                                |
| [[2026-08-12]]      | Faza 2 — agentul pe text: checklist, tool-uri, buclă. **11:36**, +1606/−1 în 10 fișiere, PR #1                            |
| [[2026-08-13]]      | Faza 4 — șapte commit-uri împinse între **10:27 și 10:30**, +4407/−829, PR #2                                             |
| [[2026-08-14]]      | `hours` inițializat **15:48**, aplicația întreagă la **15:49** (+16012, 142 fișiere); pizzerie: străzile Suceava din OSM la **15:54** (+33911) |
| [[2026-08-15]]      | sâmbătă seara: număr de comandă zilnic și pop-up-uri (pizzerie), validare de formular (`hours`), două PR-uri închise      |
| [[2026-08-17]]      | Trupa 9: **14 commit-uri**, 14:02 → 17:42 — mirror-ul sitului, apoi identitatea vizuală peste el                          |
| [[2026-08-18]]      | Trupa 9: **4 commit-uri**, 14:47 → 15:19, +2853/−751 — redesign complet, server local, fix la clipuri, buton de sugestii  |

Zilele 07.08 și 15.08 n-au avut notă de zi: prima e dinaintea reconstruirii vaultului (11.08),
a doua e weekend. [[2026-08-15]] a fost scrisă pe 18.08, din istoricul GitHub.

## De ce n-au existat în vault până acum

Trei cauze care se adună, niciuna dintre ele o eroare vizibilă:

**1. `$TRACKED` nu le conține.** `scripts/sync-daily.ps1` urmărește trei căi, toate de serviciu:
`ecf-adm-expert`, `ecf_app_web-doc_extract_studio`, `qa-ai-agent`. Un repo care nu e în listă nu
produce nimic — nici măcar un „0". Aceeași formă ca [[Esecul tacut in sisteme AI]]: configurarea
există, execuția nu se aplică peste ce lipsește din configurare.

**2. Codul nu e pe mașina asta.** `trupa9-site` și `hours` **nu au copie locală** aici — căutate în
`D:\teodor.fotciuc` și în profilul de utilizator, nu există. Deci nici dacă intrau în `$TRACKED`
n-ar fi raportat ceva: scriptul citește `git log` de pe disc, iar pe disc nu e nimic de citit.

**3. Identitatea de commit e alta.** Mașina de serviciu comite ca
`tewtzu-ctrl <…@users.noreply.github.com>` — așa arată commit-urile din vault. Commit-urile
personale sunt semnate `teo.unshpiu <tewtzu@gmail.com>` (primele două din `hours`,
`Teodor Fotciuc <fotciucteodor4@gmail.com>`). Singura excepție e Faza 1 a pizzeriei, din 07.08,
făcută de aici — și exact de acolo încolo copia locală a rămas în urmă.

**Consecința practică:** sursa care știe ce s-a lucrat personal nu e discul, e GitHub (`gh api`).
Scriptul zilei nu are modelul ăsta — el presupune „repo pe disc". Cât timp presupunerea rămâne,
notele astea se scriu de mână.

## Ce nu e proiect

Inventar, ca să nu fie confundate cu cele trei de mai sus:

- **`D:\teodor.fotciuc\voice-chat-pizzerie`** — copie a pizzeriei, **rămasă în urmă**: `HEAD` e tot
  `50f5c68` (Faza 1), cu 9 fișiere modificate din 07.08 12:11, în timp ce originul are 14
  commit-uri peste. Repo git valid, dar mort — exact capcana plătită pe [[ADM Expert]] cu copia de
  pe `C:`. Modificările locale de acolo sunt probabil deja depășite de ce s-a scris pe mașina
  personală: **de comparat înainte de orice `git pull`**.
- **`D:\teodor.fotciuc\claude-code-starter-kit`** — nu e repo (fără `.git`), din 03.08. Sursa
  configului din `~/.claude` (agenți, comenzi, hooks, reguli). Unealtă, nu proiect —
  vezi [[Claude Code - configurare]].
- **`C:\Users\teodor.fotciuc\new-project`** — nu e repo. `server.js` de 75 KB plus un
  `server.js.backup-inainte-de-stergere`, din 03–04.08. Neatins de atunci.

## Deschis

- [ ] **Nicio copie locală** pentru `trupa9-site` și `hours` pe mașina asta. Dacă discul personal
      cade, GitHub e singurul loc unde există — acceptabil, dar de știut că e singurul.
- [ ] **Copia stale a pizzeriei** de pe `D:` — de reconciliat sau de șters. Cât timp stă acolo, e o
      a doua sursă de adevăr care arată Faza 1 ca fiind starea proiectului.
- [ ] **Cum ajung zilele astea în vault fără muncă manuală.** Ori `$TRACKED` capătă un mod „citește
      din GitHub", ori se acceptă că proiectele personale se consemnează de mână, o dată pe
      săptămână.
- [ ] **Vaultul nu mai are remote.** `git remote -v` în `D:\teodor.fotciuc\brain` e gol, iar
      `tewtzu-ctrl/brain` de pe GitHub e împins ultima dată pe **11.08 13:16** — dinaintea
      reconstruirii. [[MOC Sedinte]] și șablonul de ședință spun în continuare „vaultul e pe
      GitHub personal", ca motiv pentru care nu se scriu nume de colegi. Premisa s-a schimbat;
      regula rămâne bună, dar motivul scris în ea nu mai e adevărat.

## Legat

- [[MOC Vault]] — cum funcționează consemnarea · [[Scripturi de vault]] — `$TRACKED`
- [[MOC Operatii zilnice]] — rutina care le-a ratat până acum

#personal
