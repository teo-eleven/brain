---
tags: [api, rest, backend]
created: 2026-08-06
type: permanent
---

# REST - denumirea resurselor

## Ideea

URL-ul identifică un **lucru** (substantiv, la plural). Metoda HTTP spune ce faci cu el. Verbul nu are ce căuta în cale.

```
GET    /facturi              listă
POST   /facturi              creează
GET    /facturi/42           una
PATCH  /facturi/42           modifică parțial
PUT    /facturi/42           înlocuiește complet
DELETE /facturi/42           șterge
GET    /facturi/42/linii     sub-resursă
```

Nu: `/getFacturi`, `/facturaCreate`, `/deleteFactura?id=42`.

## De ce contează

Consistența înseamnă că un client nou ghicește corect endpoint-ul fără să citească documentația. Iar cache-urile, proxy-urile și browserele se comportă predictibil doar dacă respecti semantica metodelor (GET nu modifică nimic, niciodată).

## Acțiuni care nu sunt CRUD

Uneori chiar ai o acțiune. Două soluții acceptabile:

```
POST /facturi/42/anulare          # sub-resursă care reprezintă acțiunea
POST /facturi/42:trimite          # verb explicit, separat cu :
```

Nu te chinui să forțezi tot în CRUD. „Trimite factura pe email" nu e un update.

## Convenții care merită fixate din prima

- plural mereu (`/facturi`, nu `/factura`)
- kebab-case în cale (`/note-credit`)
- filtrare/sortare în query string: `?status=plata&sort=-data`
- fără extensii (`.json`) — folosești `Accept`

## Capcane

- **`PUT` înlocuiește tot.** Dacă clientul trimite un obiect parțial cu PUT, câmpurile lipsă ar trebui să devină null. Majoritatea vor de fapt `PATCH`.
- Nesting mai adânc de 2 nivele devine imposibil de întreținut: `/clienti/1/facturi/2/linii/3/taxe` → expune `/linii/3/taxe` direct.
- Pluralizarea în română e inconsistentă. Alege o singură formă și documentează-o.

## Legături

- Face parte din: [[MOC Backend si API]]
- [[HTTP status codes care conteaza]] · [[API versioning]] · [[Paginare - cursor vs offset]]
- [[Idempotenta in API]]
