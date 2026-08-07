---
tags: [project]
created: 2026-08-06
type: project
status: active
---

# ADM Expert

> **Status:** active · **Repo local:** `C:\Users\teodor.fotciuc\ecf-adm-expert`

> [!note] Schelet de completat
> Am pre-umplut ce știu din sesiunile de lucru. Verifică și completează — nota devine utilă doar când e a ta.

## Într-o propoziție

<!-- Ce face și pentru cine. -->

## Stack

- Backend: Python (FastAPI), în `apps/api`
- CLI: `python -m adm`
- Bază de date: migrată la model multi-tenant pe **companies**

## Unde e codul

- Local: `C:\Users\teodor.fotciuc\ecf-adm-expert`
- Backup-uri: `ecf-adm-expert-backup-2026-08-05`, `ecf-adm-expert-BACKUP-v1-inainte-de-cerinta-7`
- Repo remote:
- Deploy:

## Comenzi utile

Cele pe care le uit mereu:

```powershell
# CLI-ul adm — are nevoie de CWD la rădăcina repo-ului + PYTHONPATH
$env:PYTHONPATH = "apps/api"
$env:PYTHONIOENCODING = "utf-8"
python -m adm <comanda>
```

Node-ul e portabil și umbrit de PATH — comenzile de frontend au nevoie de prefix explicit.

## Starea actuală

<!-- Actualizat: 2026-08-07 -->

- Multi-tenancy: baza reală migrată la companies (`econfaire`, `leviatan`, `ubitech`)
- Conturile Leviatan / Ubitech se creează manual din UI-ul de Settings
- Terminologia din cod aliniată la domeniu: „firmă" → **„companie"** peste tot, commit `35fa2e9`
  (40 fișiere) — vezi [[2026-08-07]]
- Prezentat proiectul pe 7 august — [[2026-08-07]]

### Cum circulă codul

Branch-ul de integrare e **`dev`**, nu `main` — `origin/HEAD` arată spre `dev`, iar `main` primește
doar merge-uri din `dev` (ultimul: `7f9c97d "Merge branch 'dev'"`, 5 aug). Fluxul real:

```
feature branch  →  PR  →  dev  →  main
```

### Ce e livrat pe `dev`

| PR | Ce | Când |
|---|---|---|
| **#11** | refactor firmă → companie (`35fa2e9`) | 7 aug 11:30 |
| #10 | blocare dubluri număr factură | 6 aug 15:40 |
| #9 | administrare conturi + deploy pe server | 6 aug 14:00 |
| #8 | autentificare + multi-tenancy | 5 aug 16:44 |

`main` e sincron cu `dev` (`536148e`).

### În lucru pe remote

**`feat/domenii-administrabile-si-exporturi-excel`** — urcat 7 aug 19:40, **nemerged**.
3 commit-uri, 54 fișiere, **+7752 / −954**.

| Commit | Ce aduce |
|---|---|
| `fe8f891` | domenii administrabile — migrările `0017` `0018` `0019`, `excel_export.py` (nou, 343 linii), abonament lunar |
| `6552e74` | dashboard pe domenii, editare cu creionul, exporturi noi în frontend |
| `b70b800` | temă albastră pe gri Nardo; „minodora" → „roz" |

Domeniile nu mai sunt listă fixă în frontend, ci **tabel administrabil** în baza de date — vezi
[[Migrari zero-downtime]]. Acoperit de teste: `test_budgets_domains.py` (329 linii) și
`AdaugaDomeniuDialog.test.tsx` (198 linii).

### Branch-uri locale rămase

Pe remote au mai rămas doar `dev`, `main`, `fix/production-ready` și branch-ul de domenii de mai
sus — restul au fost șterse după merge. Astea există **doar local**, ca resturi:

| Branch local | Stare |
|---|---|
| `fix/animatii-ui` | parcat, niciodată urcat |
| `modificari-minodora` · `fix/retusuri-*` · `feat/*` | deja livrate prin PR, se pot șterge |

> [!tip] Curățenie
> `git branch --merged origin/dev` arată care se pot șterge fără pierdere.

## Următorii pași

- [ ]

## Decizii luate

<!-- Linkuri la ADR-uri. Peste 6 luni nu-ți mai amintești DE CE ai făcut ceva. -->
-

## Probleme cunoscute

-

## Note tehnice relevante

Ce am învățat aici și e general aplicabil:

- [[Multi-tenancy - patterns]] — modelul pe coloană + riscurile
- [[FastAPI - dependency de tenant]] — snippet-ul de izolare
- [[Migrari zero-downtime]] — migrarea la companies
- [[Autentificare vs autorizare]] — IDOR-ul e riscul principal aici
- [[Python virtual environments]] · [[PowerShell cheatsheet]]

#azi
