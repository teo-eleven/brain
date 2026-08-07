---
tags: [api, http, backend]
created: 2026-08-06
type: permanent
---

# HTTP status codes care conteaza

## Ideea

Sunt vreo 60. Ai nevoie de ~12. Restul sunt trivia.

| Cod | Când | Detaliu care contează |
|---|---|---|
| **200** | OK, cu conținut | |
| **201** | Creat | pune și `Location: /facturi/42` |
| **204** | OK, fără conținut | tipic pentru DELETE |
| **400** | Request malformat | sintaxă / tip greșit |
| **401** | Nu știu cine ești | lipsă/invalid token → **autentificare** |
| **403** | Știu cine ești, n-ai voie | → **autorizare** |
| **404** | Nu există | *sau: nu-ți spun că există* |
| **409** | Conflict de stare | duplicat, versiune învechită |
| **422** | Sintaxă ok, semantică nu | validare de business eșuată |
| **429** | Prea multe cereri | pune `Retry-After` |
| **500** | Am greșit eu | nu expune stack trace |
| **503** | Temporar indisponibil | folosit la deploy/mentenanță |

## Distincțiile pe care lumea le greșește

**401 vs 403** — „cine ești" vs „ce poți". Vezi [[Autentificare vs autorizare]].

**400 vs 422** — 400 = n-am putut parsa. 422 = am parsat, dar „valoare: -5" nu e o factură validă. Nu toți sunt de acord cu distincția asta; fixează-o în proiect și fii consecvent.

**403 vs 404** — dacă simpla existență a unei resurse e informație sensibilă, întorci 404 chiar dacă știi că există. Altfel un atacator enumeră resurse comparând răspunsurile.

## Reguli practice

- **Nu întoarce 200 cu `{"error": ...}` în body.** Clienții, proxy-urile și monitoringul se uită la status. Un 200 cu eroare înăuntru sparge orice alertare.
- Corpul erorii să aibă formă consistentă în tot API-ul: `{ "error": { "code": "...", "message": "...", "details": [...] } }`.
- `code` e pentru cod (stabil, nu se traduce), `message` e pentru om.

## Legături

- Face parte din: [[MOC Backend si API]]
- [[REST - denumirea resurselor]] · [[Rate limiting]] · [[Idempotenta in API]]
