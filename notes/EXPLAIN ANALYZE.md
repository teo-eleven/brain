---
tags: [database, sql, performance]
created: 2026-08-06
type: permanent
---

# EXPLAIN ANALYZE

## Ideea

`EXPLAIN` arată planul pe care baza de date **intenționează** să-l execute (estimări).
`EXPLAIN ANALYZE` **execută** interogarea și arată ce s-a întâmplat real (timpi și număr de rânduri efective).

Nu ghicești niciodată de ce e lentă o interogare. O măsori.

## Ce cauți, în ordine

1. **Seq Scan pe tabelă mare** → lipsește un index, sau nu poate fi folosit. Vezi [[Indexuri - cand ajuta si cand nu]].
2. **Diferență mare între `rows=` estimat și `actual rows=`** → statistici învechite (`ANALYZE tabela`) sau o condiție pe care planificatorul nu o poate estima. Estimările greșite duc la planuri greșite.
3. **Nested Loop cu multe iterații** → adesea un [[N+1 query problem]] mutat în SQL, sau un JOIN fără index pe cheia străină.
4. **Sort cu `external merge Disk`** → sortarea nu a încăput în `work_mem` și a folosit disc. Ori index pe `ORDER BY`, ori `work_mem` mai mare.
5. **Filter care aruncă majoritatea rândurilor** (`Rows Removed by Filter: 90000`) → citești mult ca să păstrezi puțin; condiția ar trebui în index.

## Cum îl rulezi util

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT ... ;
```

`BUFFERS` arată câte blocuri au venit din cache (`shared hit`) și câte de pe disc (`read`). O interogare „rapidă" care citește tot din cache poate fi lentă în producție, unde cache-ul e ocupat cu altceva.

## Capcane

- **`ANALYZE` execută interogarea.** Pe un `UPDATE`/`DELETE` modifică date. Rulează-l într-o tranzacție cu `ROLLBACK`.
- Prima rulare e lentă (cache rece), a doua rapidă. Rulează de 2-3 ori.
- Planul de pe laptopul tău cu 100 de rânduri nu are nicio legătură cu planul de producție. Testează pe date de volum realist.
- Citește planul **de jos în sus și de la interior spre exterior** — nodul cel mai adânc se execută primul.

## Legături

- Face parte din: [[MOC Baze de date]]
- [[Indexuri - cand ajuta si cand nu]] · [[N+1 query problem]]
- [[Debugging metodic]] — aceeași disciplină: măsoară, nu presupune
