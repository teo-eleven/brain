---
tags: [project]
created: 2026-08-11
type: project
status: active
---

# ADM Expert

## Într-o propoziție

Aplicație internă de administrare: buget lunar, cheltuieli, facturi, exporturi
Excel — multi-firmă, cu roluri pe firmă.

## Stack

- **Backend** — `apps/api`, Python `>=3.11,<3.12`, proiect `ecf-adm-expert`
- **Frontend** — `apps/web`, React + TypeScript, pachet `adm-expert-web`
- **Bază de date** — SQLite la `data/app.db`, în mod **WAL** (`-shm` / `-wal` alături)
- **Rulare** — Docker Compose: un singur serviciu, `app`, plus volumul `adm_data`;
  Caddy în `docker/Caddyfile`
- Monorepo, cele două aplicații în același repo

**Unelte:** `vite` (dev + build), `vitest` (teste web), `eslint` + `prettier`, `tsc -b` pentru
typecheck. Pe backend, `pytest` din `tests/`.

**Variabile de mediu** (`.env.example`): `ADM_DB_PATH`, `ADM_BUDGETS_SEED_DEMO`,
`ADM_PUBLIC_BASE_URL`, plus integrarea Dext pentru facturi — `DEXT_BASE_URL`, `DEXT_API_TOKEN`,
`DEXT_FACTURI_PROJECT_ID`, `DEXT_WEBHOOK_SECRET`.

## Unde e codul

```
D:\teodor.fotciuc\ecf-adm-expert          # calea vie, de la 17.08

apps/api/core                             # auth, company, module_loader, registry,
                                          # migrate_runner, migration_scoping
apps/api/modules/budgets                  # modulul de buget
apps/api/adm/cli.py                       # CLI
apps/web/src/core                         # auth, shell, pagini comune
apps/web/src/modules/budgets              # UI de buget
tests/                                    # pytest
```

**Branch de lucru:** `feat/export-doar-firma-proprie` — 18 commit-uri peste `dev`, ultimul pe
18.08 la 15:40. Mai există local `feat/grup-un-singur-set-de-date` (17) și
`feat/stergere-domenii-coprag-manager-super` (6). **Toate sunt pushuite pe origin**, deci nimic
nu trăiește doar pe laptop.

**Capcana clonei duble — rezolvată pe 19.08.** Pe 17.08 repo-ul a fost mutat de pe
`C:\Users\teodor.fotciuc\ecf-adm-expert` pe `D:`, iar copia veche a rămas pe disc: 347 MB, repo
git valid, dar înghețat pe 10.08. `$TRACKED` din `scripts/sync-daily.ps1` o urmărea pe **ea**.

Ce face defectul ăsta special: o cale **inexistentă** ar fi dat avertismentul scriptului
(`! sar peste ... nu e repo git`). O **clonă veche** e un repo perfect valid care raportează
sincer „zero commit-uri azi". Scriptul nu greșea — citea altceva decât credeam. De-asta nicio
zi de lucru pe ADM Expert n-a intrat în vault între 10.08 și 19.08.
[[Esecul tacut in sisteme AI]]: tăcerea citită ca „e în regulă".

Reparat: `$TRACKED` arată acum spre `D:`. Clona veche avea **7 commit-uri din 04.08 care nu
existau nicăieri altundeva** (verificat pe `patch-id`, nu doar pe SHA): conturi + administrare
din CLI, animații UI, export de buget fără coloana MODALITATE. Salvate ca patch-uri în
`D:\teodor.fotciuc\downloads\arhiva-adm-expert-clona-veche`, împreună cu `.env`-ul vechi.

Regula care a ieșit din episodul ăsta: [[Fara clone locale]]. Copia de 347 MB și backupul de
05.08 sunt încă pe disc — verificate ca redundante, ștergerea de rulat manual, în [[CURATENIE]].

**Pornire locală:** `docker compose -f docker-compose.dev.yml up`. Rebuild de producție:
`docker compose up --build`. Detaliile în `docs/DEV-WORKFLOW.md`, care e scris explicit pentru
echipa de trei.

## Starea actuală

**Livrat și funcțional** — buget lunar, cheltuieli, facturi cu import prin Dext, exporturi,
domenii și categorii, multi-firmă.

**În lucru acum** — pe branch-ul de mai sus:

- [x] Firma **Coprag** adăugată (migrarea `0006_company_coprag`)
- [x] Ștergerea domeniilor, cu dialog de confirmare
- [x] Rolul **manager super** (migrarea `0007_rol_manager_super`)
- [x] Rânduri comune pe grup (migrarea `0020_randuri_comune_grup`)
- [x] Scope pe firmă: **fiecare manager lucrează doar pe firma lui** — decis pe 18.08, după ce
      varianta cu set de date comun a fost încercată și retrasă în aceeași oră
- [x] `Buget propus` acceptă doar sume, cu pop-up când respinge un caracter (`budgets/lib/amount.ts`)
- [x] **Ștergerea unei categorii nu mai depinde de bugetul lunii** — decis pe 20.08:
      [[Bugetul se sterge, nu se pune pe zero]] (`290dc61`, `fix/stergere-categorie-cu-buget`)
- [ ] Branch-ul de integrat în `main`
- [ ] A treia rundă de code review — codul de după 10:06 pe 18.08 n-a trecut încă prin review

**Cine lucrează** — echipă de trei pe cod (`docs/DEV-WORKFLOW.md`). Cerințele de business vin de
la Marcela, arhitectura discutată cu Andrei.

**Blocat** — nimic pe ADM Expert. Blocajul e pe proiectul vecin, HR ScoreBoard: lipsesc formulele
de KPI.

## Următorii pași

- [ ] Integrarea branch-ului `feat/stergere-domenii-coprag-manager-super` în `main`
- [ ] Code review pe ultimele două funcționalități (validarea sumelor, scope-ul per firmă)
- [ ] **Export buget pe tot anul, defalcat pe sheet-uri lunare** — singura cerință rămasă din cele
      8 primite de la Minodora (`docs/materiale-primite/`). `excel_export.py:616` agregă anul în
      două foi; cerința e 12 foi, fiecare identică cu exportul lunar
- [ ] **`ADM_BUDGETS_SEED_DEMO` de scos din compose** — hardcodat pe `"1"` în
      `docker-compose.dev.yml:43`, periculos acum că localul rulează date de producție
- [ ] **HR ScoreBoard** — spațiu nou (`people&culture`), care refolosește modelul de dashboard de
      aici: dashboard pe roluri și pe domenii, KPI administrabile din aplicație, RBAC, importuri
      Excel, exporturi de rânduri și grafice. Mockup de făcut. Vezi [[2026-08-17]]

## Note

**Arhitectura e modulară, și se vede în migrări.** Două arbori separați, nu unul:
`core/migrations/versions` (7 versiuni — registry de module, auth, companies, roluri) și
`modules/budgets/migrations/versions` (20 de versiuni). Un modul nou își aduce propriile migrări,
fără să atingă schema comună. `core/migration_scoping.py` și `core/module_loader.py` sunt piesele
care fac asta să țină.

Direcția se potrivește cu ce cere Andrei pentru HR ScoreBoard: *un singur repo la nivel de git, cu
mai multe module*. Modelul există deja aici, nu trebuie inventat.

**Lecția din 18.08.** A doua variantă a scope-ului pe firmă a ieșit **mai mică** decât prima:
118 linii adăugate față de 143 șterse. Când varianta a doua e mai scurtă, prima era o abstracție
construită împotriva domeniului — vezi [[Experiment inainte de concluzie]] și [[2026-08-18]].

**Testele migrărilor stau separat de testele comportamentului.** O migrare se verifică pe schemă,
nu prin API — `tests/test_randuri_comune_migration.py` vs `tests/test_manager_super.py`.

**Localul rulează date de producție de la 20.08.** Snapshot importat în volumul `adm_data`:
117 alocări (1.636.543,81 RON), 595 cheltuieli, 149 facturi, 4 firme, 8 conturi. Pașii și cele
patru capcane, în [[Import date productie in local]]. Orice experiment distructiv se face cu asta
în minte.

**Indexul `funded` e sticky, și asta se propagă în tot ce ține de ștergere.** Se aprinde la prima
sumă nenulă a lunii și rămâne 1 (`max()` la upsert). Consecința nu se vede din interfață: un buget
coborât la 0 lei blochează la fel de bine ștergerea categoriei. A produs trei rapoarte separate de
„ștergerea nu merge" pe 20.08, cu trei cauze diferite — un 403 fără legătură, un 409 legitim și un
buton dezactivat în client. Diagnosticul care le separă: **se numără cererile din log**, nu se
citește consola. Zero cereri = problema e în client.

**Hot-reload-ul web cere restart, pe Windows.** Modificările din `apps/web` nu ajung în browser
fără `docker compose -f docker-compose.dev.yml restart web` (sau `VITE_USE_POLLING=1`, cu 10–40x
penalizare de viteză). Suita de teste rulează pe fișierele de pe disc, deci **verde în teste nu
dovedește că browserul vede codul nou** — vezi [[2026-08-20]] și [[Esecul tacut in sisteme AI]].

Legături: [[MOC Operatii zilnice]], [[MOC Sedinte]]

#azi
