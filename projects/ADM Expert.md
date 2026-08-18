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

**Branch de lucru:** `feat/stergere-domenii-coprag-manager-super` — șase commit-uri, neintegrat
în `main`.

**Capcană, plătită deja:** pe 17.08 la 11:47 repo-ul a fost mutat de pe
`C:\Users\teodor.fotciuc\ecf-adm-expert` pe `D:`. Copia veche de pe `C:` a rămas pe disc, e un repo
git valid, dar mort — ultimul commit în ea e din 10.08. `$TRACKED` din `scripts/sync-daily.ps1`
încă o urmărește pe ea, deci **munca pe proiectul ăsta nu ajunge singură în notele de zi**. Vezi
[[2026-08-17]].

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
- [ ] Branch-ul de integrat în `main`
- [ ] A treia rundă de code review — codul de după 10:06 pe 18.08 n-a trecut încă prin review

**Cine lucrează** — echipă de trei pe cod (`docs/DEV-WORKFLOW.md`). Cerințele de business vin de
la Marcela, arhitectura discutată cu Andrei.

**Blocat** — nimic pe ADM Expert. Blocajul e pe proiectul vecin, HR ScoreBoard: lipsesc formulele
de KPI.

## Următorii pași

- [ ] Integrarea branch-ului `feat/stergere-domenii-coprag-manager-super` în `main`
- [ ] Code review pe ultimele două funcționalități (validarea sumelor, scope-ul per firmă)
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

Legături: [[MOC Operatii zilnice]], [[MOC Sedinte]]

#azi
