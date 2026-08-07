---
tags: [moc, database, sql]
created: 2026-08-06
type: moc
---

# MOC Baze de date

Parte din [[MOC Programare]].

## Performanță

- [[Indexuri - cand ajuta si cand nu]]
- [[N+1 query problem]] — vine din ORM, nu din SQL
- [[EXPLAIN ANALYZE]] — nu ghicești de ce e lent, măsori
- [[Connection pooling]] — de ce API-ul cade la 100 de utilizatori

## Corectitudine

- [[Tranzactii si nivele de izolare]]
- [[Idempotenta in API]] — legat: constrângeri unice te salvează

## Schimbarea schemei

- [[Migrari zero-downtime]] — adaugi, nu redenumești
- [[Multi-tenancy - patterns]] — coloană vs schemă vs bază separată

## Referință

- [[SQL cheatsheet]]

## Legat

- [[Cache - strategii si invalidare]] — baza de date nu e cache
- [[Observability - logs metrics traces]] — slow query log

## De învățat #question

- [ ] Când merită un index parțial / pe expresie
- [ ] JSONB în Postgres: unde e granița cu o coloană normală
- [ ] Read replicas și lag-ul de replicare — ce se rupe
- [ ] Soft delete: chiar merită? (de obicei nu)
