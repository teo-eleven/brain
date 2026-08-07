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

### Branch-uri deschise

| Branch | Ce conține | Stare |
|---|---|---|
| `refactor/redenumire-firma-in-companie` | redenumirea firmă → companie (`35fa2e9`) | **doar pe branch-ul lui** — 4 commit-uri înaintea lui `origin/dev`, 2 în urmă |
| `fix/animatii-ui` | munca de UI fără animații | parcat |
| `modificari-minodora` | cele 8 cerințe din documentul Minodorei | nemerged |
| `fix/retusuri-finale` · `fix/retusuri-minodora` | retușuri export buget | nemerged |

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
