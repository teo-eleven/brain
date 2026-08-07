---
tags: [database, sql, performance]
created: 2026-08-06
type: permanent
---

# Indexuri - cand ajuta si cand nu

## Ideea

Un index e o structură separată (B-tree) care permite găsirea rândurilor fără scanarea tabelei. Costul: spațiu pe disc + **scriere mai lentă** (fiecare INSERT/UPDATE actualizează fiecare index).

## Când ajută

- Coloane din `WHERE` cu **selectivitate mare** (puține rânduri se potrivesc)
- Coloane de `JOIN` (cheile străine — care în multe DB-uri **nu** primesc index automat)
- Coloane de `ORDER BY` (evită sortarea)
- Coloana de cursor la [[Paginare - cursor vs offset]]

## Când NU ajută

- **Selectivitate mică.** Index pe `activ` boolean, unde 95% sunt `true`: planificatorul îl ignoră și face scan, corect. Nu e un bug, e alegerea bună.
- Tabele mici (câteva mii de rânduri): scanarea completă e mai rapidă decât indirectarea.
- Coloane pe care le **transformi** în query: `WHERE LOWER(email) = ...` nu folosește indexul pe `email`. Ai nevoie de index pe expresie: `CREATE INDEX ON users (LOWER(email))`.
- `LIKE '%text%'` — wildcard la început face indexul B-tree inutil. Ai nevoie de full-text search sau trigram (`pg_trgm`).

## Index compus: ordinea contează

```sql
CREATE INDEX ON facturi (tenant_id, data);
```

Folosit pentru: `WHERE tenant_id = 1`, și `WHERE tenant_id = 1 AND data > '...'`.
**Nu** pentru: `WHERE data > '...'` singur.

Regula stângii: indexul se folosește doar de la prima coloană încolo, în ordine. Pentru [[Multi-tenancy - patterns]], `tenant_id` merge mereu primul.

## Cum decizi

Nu ghici. `EXPLAIN ANALYZE` înainte și după — vezi [[EXPLAIN ANALYZE]]. Dacă planul nu se schimbă, indexul e cost fără câștig; șterge-l.

## Capcane

- **Prea multe indexuri e o problemă reală.** 8 indexuri pe o tabelă cu scrieri intense = scrieri de 3× mai lente.
- Indexuri duplicate/redundante: dacă ai `(a, b)`, un index separat pe `(a)` e inutil.
- Un index nefolosit consumă spațiu și încetinește scrierile la infinit. În Postgres: `pg_stat_user_indexes` arată `idx_scan = 0` pentru cele moarte.

## Legături

- Face parte din: [[MOC Baze de date]]
- [[EXPLAIN ANALYZE]] · [[N+1 query problem]] · [[SQL cheatsheet]]
