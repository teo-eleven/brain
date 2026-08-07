---
tags: [database, sql]
created: 2026-08-06
type: permanent
---

# Tranzactii si nivele de izolare

## Ideea

O tranzacție e atomică: ori tot, ori nimic. Nivelul de izolare stabilește **cât din munca altora vezi** în timp ce tranzacția ta rulează.

## Nivelele

| Nivel | Permite | Note |
|---|---|---|
| Read Uncommitted | dirty read | inutil, evită |
| **Read Committed** | non-repeatable read | **default Postgres** |
| **Repeatable Read** | phantom read (teoretic) | default MySQL/InnoDB |
| Serializable | nimic | corect, dar tranzacțiile pot eșua și trebuie reîncercate |

Anomaliile, în română:
- **dirty read** — citești ce altcineva n-a comis încă
- **non-repeatable read** — aceeași interogare, în aceeași tranzacție, dă altceva a doua oară
- **phantom read** — apar rânduri noi care se potrivesc condiției tale

## Capcana practică: read-modify-write

```python
# BUG, la orice nivel sub Serializable
stoc = db.query("SELECT cantitate FROM stoc WHERE id=1")   # citește 5
db.execute("UPDATE stoc SET cantitate = 4 WHERE id=1")      # scrie 5-1
```

Două cereri simultane citesc amândouă 5, amândouă scriu 4. Ai vândut două produse și ai scăzut unul.

**Soluții, în ordinea preferinței:**

```sql
-- 1. atomic în DB (cel mai bun)
UPDATE stoc SET cantitate = cantitate - 1 WHERE id = 1 AND cantitate > 0;

-- 2. lock pesimist
SELECT cantitate FROM stoc WHERE id = 1 FOR UPDATE;

-- 3. lock optimist (coloană de versiune)
UPDATE stoc SET cantitate = 4, version = 8 WHERE id = 1 AND version = 7;
-- 0 rânduri afectate → altcineva a modificat → 409, retry
```

## Reguli practice

- **Tranzacții scurte.** Nu ține o tranzacție deschisă cât aștepți un API extern sau un upload. Blochezi rânduri și epuizezi pool-ul — vezi [[Connection pooling]].
- Nu face I/O extern (email, webhook) în interiorul tranzacției. Dacă tranzacția face rollback, emailul e deja trimis. Scoate-l în [[Cozi si background jobs]].
- Ordinea consistentă de blocare previne deadlock-uri. Dacă A blochează X apoi Y, și B blochează Y apoi X, ai deadlock.

## Legături

- Face parte din: [[MOC Baze de date]]
- [[Idempotenta in API]] — cheia se salvează în aceeași tranzacție cu efectul
- [[Connection pooling]] · [[CAP theorem]]
