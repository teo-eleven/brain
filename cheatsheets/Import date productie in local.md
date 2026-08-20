---
tags: [cheatsheet, adm-expert]
created: 2026-08-20
type: cheatsheet
---

# Import date producție în local — [[ADM Expert]]

Făcut prima dată pe 20.08.2026. Structura arhivei reproduce volumul `/data` de pe server, iar
rădăcina de upload-uri e `ADM_DB_PATH.parent` — deci `app.db` + `uploads/` se pun direct în volum.

## Pașii

```bash
# 1. verifică arhiva ÎNAINTE de orice: suma din MANIFEST trebuie să iasă
tar -tzf adm-expert-data-AAAALLZZ.tar.gz | head
sha256sum adm-export-AAAALLZZ/app.db          # se compară cu MANIFEST.txt

# 2. capetele de migrare din arhivă vs codul local — dacă diferă, întâi codul
#    (alembic_version_core / alembic_version_budgets vs migrations/versions)

# 3. backup la baza locală, prin API-ul de backup online (nu `cp` — baza e în WAL)
docker exec -e PYTHONPATH=/app/apps/api -w /app ecf-adm-expert-api-1   /app/.venv/bin/python -m adm backup /data/backups/pre-import-local.db

# 4. oprește API-ul, altfel scrii sub un writer viu
docker compose -f docker-compose.dev.yml stop api

# 5. înlocuiește în volum. ATENȚIE la -wal/-shm: un WAL vechi peste o bază nouă = corupție
docker run --rm -v ecf-adm-expert_adm_data:/data -v "<cale-arhiva>:/src:ro" alpine sh -c '
  mv /data/uploads /data/backups/uploads-pre-import
  rm -f /data/app.db /data/app.db-wal /data/app.db-shm
  cp /src/app.db /data/app.db && cp -r /src/uploads /data/uploads'

# 6. pornește cu semănarea demo OPRITĂ (vezi capcana de mai jos)
docker compose -f docker-compose.dev.yml -f <override>/no-demo-seed.yml up -d api
```

## Capcanele, în ordinea în care mușcă

**1. `ADM_BUDGETS_SEED_DEMO: "1"`** e hardcodat în `docker-compose.dev.yml`, iar `seeds.run()`
rulează la fiecare pornire. `INSERT OR IGNORE` sună inofensiv, dar **inserează unde nu există** —
pe datele reale ar fi adăugat 20 de alocări fictive, cu `funded = 1`, deci și categorii blocate pe
veci. Simulează înainte, pe baza din arhivă, nu după.

**2. Semănarea recreează ce s-a șters în producție.** O categorie semănată, ștearsă pe server,
reapare la prima pornire („Applications", 70 → 71 de categorii). Fără alocări, dar se întoarce la
fiecare boot.

**3. Sesiunile și conturile.** Cookie-ul din browser aparține bazei vechi → ești delogat. Conturile
din producție există, dar parolele sunt hash-uri Argon2 **per bază**: un cont care trăia doar în
dev nu se mută. Se creează local:
`docker exec -it ... python -m adm user create --email ... --name "..." --role admin`
(fără `--company` pentru admin — e rol fără firmă fixată).

**4. Adminul n-are companie activă** imediat după login, deci toate rutele de budgets răspund `400`
până la prima comutare de firmă. Nu e defect: `_NO_ACTIVE_COMPANY` din `core/auth/deps.py`.

## Verificarea de la final

`pragma integrity_check`, `pragma foreign_key_check`, apoi cifrele din MANIFEST comparate una cu
una — companii, utilizatori, domenii, categorii, alocări (cu totalul în RON), cheltuieli, facturi.
Plus facturi-în-bază vs fișiere-pe-disc, în ambele sensuri: **lipsă** și **orfane**.

Legături: [[Docker Compose - stack local]], [[Alembic - migrari de schema]], [[2026-08-20]]
