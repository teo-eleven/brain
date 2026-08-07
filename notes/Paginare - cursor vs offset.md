---
tags: [api, database, backend]
created: 2026-08-06
type: permanent
---

# Paginare - cursor vs offset

## Ideea

**Offset:** `LIMIT 20 OFFSET 4000`. Simplu, permite salt la pagina N.
**Cursor:** `WHERE id < 8231 LIMIT 20`. Nu permite salt, dar e stabil și rapid.

## De ce offset se rupe la scală

Două probleme, ambele reale:

**1. Devine lent liniar.** `OFFSET 100000` obligă baza de date să citească și să arunce 100.000 de rânduri înainte să înceapă să numere. Cu cât mergi mai adânc, cu atât e mai lent.

**2. Sare și repetă rânduri.** Dacă cineva inserează un rând în timp ce tu treci de la pagina 2 la 3, tot ce urmează se deplasează cu o poziție: un rând îl vezi de două ori, altul îl ratezi complet. Într-un export „toate facturile" asta înseamnă date lipsă, silențios.

## Cursor, concret

```sql
-- prima pagină
SELECT * FROM facturi ORDER BY id DESC LIMIT 20;
-- următoarea, cu ultimul id primit
SELECT * FROM facturi WHERE id < 8231 ORDER BY id DESC LIMIT 20;
```

Răspunsul API:
```json
{ "items": [...], "next_cursor": "eyJpZCI6ODIzMX0" }
```

Cursorul e opac pentru client (base64 peste ultimele valori de sortare) — asta îți lasă libertatea să schimbi implementarea.

## Care alegi

| Situație | Alege |
|---|---|
| Tabel de admin cu numere de pagină | offset |
| Sub ~10.000 de rânduri | offset (nu complica) |
| Feed / scroll infinit | cursor |
| Export complet / sincronizare | cursor, obligatoriu |
| API public | cursor |

## Capcană importantă

**Sortarea trebuie să fie pe o coloană unică**, altfel cursorul e ambiguu. Dacă sortezi după `data`, adaugi `id` ca tiebreaker:

```sql
ORDER BY data DESC, id DESC
WHERE (data, id) < ('2026-08-01', 8231)
```

Fără tiebreaker, rândurile cu aceeași dată se pot pierde la granița paginii.

## Legături

- Face parte din: [[MOC Backend si API]] · [[MOC Baze de date]]
- [[Indexuri - cand ajuta si cand nu]] — cursorul are nevoie de index pe coloana de sortare
- Aceeași idee: [[Generator vs list comprehension]] — nu încarci tot
