---
tags: [project]
created: 2026-08-20
type: project
status: active
---

# HR ScoreBoard

## Într-o propoziție

Aplicație internă de People & Culture: catalog de KPI administrat din aplicație, dashboard pe
roluri și direcții, importuri din Excel-uri și **calcul propriu** al indicatorilor din date brute.

## Stack

- **Backend** — `apps/api`, Python 3.11, module încărcate dintr-un manifest (`core/module_loader`)
- **Frontend** — `apps/web`, React + TypeScript, Vite, Tailwind
- **Contracte** — `packages/contracts`, partajate între API și web
- **Rulare** — Docker Compose + Caddy, ca la [[ADM Expert]]; CLI de operator în `apps/api/pc`

Scheletul e derivat din ADM Expert (75 de fișiere comune, documentat în `README.md:17`).
ADM Expert e curat de conținut HR — verificat la inventarul din [[2026-08-19]].

## Unde e codul

```
D:\teodor.fotciuc\people&culture

apps/api/modules/hr_scorecard      # KPI, ținte, rezultate, import XLSX, calcul
apps/api/core                      # boot, migrații, autentificare, RBAC, setări
apps/api/pc                        # CLI de operator (conturi, backup, module)
apps/web/src/modules/hr-scorecard  # dashboard, categorii, KPI, importuri
00. docs/                          # cerințe, catalogul de KPI, întrebările deschise
01. mock-up/                       # mock-up-ul de produs, sursă de date pentru seed
```

**22 de commit-uri**, toate din 18–20.08. **Fără remote** — nu există nicio copie în afara
laptopului. Vezi [[Fara clone locale]] și [[COMENZI-REMOTE]], unde comenzile de push sunt scrise
și verificate, dar nerulate.

## De unde vine

Ședința de cerințe din [[2026-08-17]]: dashboard pe roluri și domenii, catalog de KPI editabil din
aplicație, RBAC, importuri din mai multe Excel-uri, exporturi de rânduri și grafice. Abordare
modulară — o pagină cu subpagini, un singur repo cu mai multe module.

## Decizia care structurează tot restul

Aplicația **calculează** indicatorii din date brute, în loc să primească rezultate deja calculate.
Consecința: fiecare formulă din catalog trebuie transformată din text pentru om în expresie
executabilă — și acolo unde nu se poate, se **spune**, nu se aproximează.

Starea pe 20.08, din cele 25 de KPI ale scorecard-ului de grup:

| Stare                                             | Câte |
| ------------------------------------------------- | ---- |
| formulă confirmată metodologic                     | 11   |
| din ele, transformate fără nicio presupunere       | 8    |
| blocate — formula scrisă dă alt rezultat decât cel raportat | 3    |
| formule neconfirmate, deci niciodată calculate      | 14   |

Cele 3 blocate afișează „nu are expresie executabilă", cu motivul scris. Nimic nu s-a corectat
din proprie inițiativă: formula rămâne exact cum a fost auditată.

## Datele semănate

Seed idempotent la fiecare pornire reușită (`INSERT OR IGNORE`, deci nu suprascrie editările din
API), din **două surse îmbinate**: constantele din mock-up (6 direcții, ținte, rezultate 2025,
interpretări, recomandări) și catalogul de KPI din `00. docs/materiale marcela` (cod, categorie,
formula corectată, frecvență, praguri, baza țintei).

Catalogul documentează **4 formule raportate greșit ca fiind corecte în 2025**. Două ating KPI din
seed și au valoare recalculată în catalog — sunt folosite acelea, nu cifrele raportate
(participare la evaluare 100% → 88,1%; pondere beneficii 15% → 9,8%). A treia semnalează doar
eroarea de bază, fără valoare alternativă: rezultatul rămâne cel raportat, dar **formula** stocată
e cea corectă.

## Blocaje

**Cele 3 formule** — întrebările sunt scrise în `00. docs/intrebari-marcela-formule.md`, fiecare cu
contradicția pusă lângă ea. Blocajul din [[2026-08-17]] („formulele nu există încă") a devenit,
pe 20.08, **8 întrebări cu răspuns punctual** — 3 care blochează calculul, 5 care schimbă doar
cifra introdusă.

**Fără remote.** 22 de commit-uri și 17 fișiere necomise trăiesc doar pe laptop.

## Legături

[[ADM Expert]] · [[2026-08-17]] · [[2026-08-19]] · [[2026-08-20]] · [[Fara clone locale]]
