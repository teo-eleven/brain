---
tags: [sql, database, ref]
created: 2026-08-06
type: cheatsheet
---

# SQL cheatsheet

Dialect: PostgreSQL.

## JOIN-uri

```sql
INNER JOIN    -- doar rândurile care se potrivesc în ambele
LEFT JOIN     -- toate din stânga, NULL unde nu există în dreapta
RIGHT JOIN    -- invers (rar folosit — rescrie ca LEFT)
FULL JOIN     -- tot, din ambele
CROSS JOIN    -- produs cartezian (rar intenționat)
```

Capcană: `LEFT JOIN` + condiție pe tabela din dreapta în `WHERE` îl transformă în `INNER JOIN`. Condiția trebuie în `ON`:

```sql
-- Greșit: pierzi facturile fără plăți
LEFT JOIN plati p ON p.factura_id = f.id WHERE p.status = 'ok'
-- Corect
LEFT JOIN plati p ON p.factura_id = f.id AND p.status = 'ok'
```

## Agregare

```sql
SELECT client_id, COUNT(*) AS nr, SUM(valoare) AS total
FROM facturi
WHERE data >= '2026-01-01'      -- filtrează RÂNDURI (înainte de grupare)
GROUP BY client_id
HAVING SUM(valoare) > 10000      -- filtrează GRUPURI (după grupare)
ORDER BY total DESC;
```

`WHERE` înainte de grupare, `HAVING` după. Pune cât mai mult în `WHERE` — e mai ieftin.

`COUNT(*)` numără rânduri, `COUNT(coloana)` sare peste NULL. Diferența contează.

## Window functions

Agregare **fără** să colapsezi rândurile:

```sql
SELECT
  numar, valoare,
  SUM(valoare) OVER (PARTITION BY client_id)              AS total_client,
  ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY data DESC) AS rn,
  LAG(valoare) OVER (ORDER BY data)                        AS valoare_anterioara
FROM facturi;
```

**Ultima înregistrare per grup** — pattern-ul cel mai util:
```sql
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY data DESC) rn
  FROM facturi
) t WHERE rn = 1;
```

## CTE

```sql
WITH facturi_2026 AS (
  SELECT * FROM facturi WHERE data >= '2026-01-01'
),
totaluri AS (
  SELECT client_id, SUM(valoare) t FROM facturi_2026 GROUP BY client_id
)
SELECT c.nume, tt.t
FROM totaluri tt JOIN clienti c ON c.id = tt.client_id;
```

CTE-urile fac interogările complexe citibile. În Postgres 12+ sunt inline-uite (optimizate), nu materializate — folosește-le liber.

## UPSERT

```sql
INSERT INTO stoc (produs_id, cantitate) VALUES (1, 10)
ON CONFLICT (produs_id) DO UPDATE
  SET cantitate = stoc.cantitate + EXCLUDED.cantitate;
```

`EXCLUDED` = rândul care s-ar fi inserat. Necesită un index unic pe coloana de conflict. Baza pentru [[Idempotenta in API]].

## Modificări atomice

```sql
-- Corect: fără read-modify-write, vezi [[Tranzactii si nivele de izolare]]
UPDATE stoc SET cantitate = cantitate - 1 WHERE id = 1 AND cantitate > 0;

-- Coadă de joburi, fără dublă procesare
SELECT * FROM jobs WHERE status='pending'
ORDER BY id LIMIT 10 FOR UPDATE SKIP LOCKED;
```

`FOR UPDATE SKIP LOCKED` = coadă de joburi în Postgres, fără Redis. Vezi [[Cozi si background jobs]].

## Diagnostic

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;      -- vezi [[EXPLAIN ANALYZE]]
SELECT * FROM pg_stat_activity WHERE state='active';   -- ce rulează acum
SELECT pg_size_pretty(pg_total_relation_size('facturi'));
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0; -- indexuri moarte
SELECT pg_cancel_backend(<pid>);            -- oprește o interogare
```

## Legături

- [[MOC Baze de date]] · [[Indexuri - cand ajuta si cand nu]] · [[EXPLAIN ANALYZE]]
- [[SQL injection]] · [[Paginare - cursor vs offset]] · [[Tranzactii si nivele de izolare]]
