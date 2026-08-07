---
tags: [database, devops, migration]
created: 2026-08-06
type: permanent
---

# Migrari zero-downtime

## Ideea

În timpul unui deploy, codul vechi și codul nou rulează **simultan** (rolling update). Deci schema trebuie să fie compatibilă cu ambele versiuni, în același moment.

Consecința: **nu redenumești și nu ștergi niciodată într-un singur pas.**

## Pattern-ul expand / contract

Redenumirea `nume` → `nume_complet`, în 4 deploy-uri:

1. **Expand** — adaugi `nume_complet` (nullable). Codul vechi îl ignoră, funcționează.
2. **Backfill + dublă scriere** — codul nou scrie în ambele, citește din vechi. Umpli datele istorice în batch-uri.
3. **Switch** — codul nou citește din `nume_complet`. Încă scrie în ambele.
4. **Contract** — după ce ești sigur că nimic nu mai atinge `nume`, îl ștergi.

Pare mult. E patru PR-uri mici în loc de o noapte de downtime plus panica de rollback.

## Operații periculoase

| Operație | Problema | Alternativa |
|---|---|---|
| `ADD COLUMN NOT NULL` fără default | rescrie tabela, lock lung | adaugi nullable, umpli, apoi constrângi |
| `DROP COLUMN` | codul vechi crapă | contract, la sfârșit |
| Redenumire | ambele versiuni se rup | expand/contract |
| `CREATE INDEX` | lock de scriere pe tabelă | `CREATE INDEX CONCURRENTLY` (Postgres) |
| Schimbare de tip | rescriere completă | coloană nouă + migrare |

## Reguli

- **Migrarea rulează înaintea codului nou**, și trebuie să fie compatibilă cu codul vechi. Asta e regula din care derivă toate celelalte.
- Fiecare migrare are un **down** testat. Un `down` nescris e un rollback imposibil la 2 noaptea.
- Backfill-ul în batch-uri (1000 de rânduri, pauză), nu `UPDATE` pe 10 milioane de rânduri într-o tranzacție.
- Testează migrarea pe o **copie a datelor de producție**, nu pe o bază de dev cu 20 de rânduri. Durata scalează neliniar.

## Capcane

- Cu [[Multi-tenancy - patterns]] pe schemă per tenant, migrarea trebuie rulată de N ori — automatizează sau vei uita un tenant.
- Un lock pe o tabelă mare într-un moment de trafic mare = downtime, chiar dacă „migrarea a durat 3 secunde". Vezi `lock_timeout`.
- ORM-ul care generează migrări automat produce uneori exact operațiile periculoase din tabel. Citește SQL-ul generat, mereu.

## Legături

- Face parte din: [[MOC Baze de date]] · [[MOC DevOps si Deploy]]
- [[Strategii de deploy]] · [[API versioning]] — aceeași logică de compatibilitate
- [[Tranzactii si nivele de izolare]]
