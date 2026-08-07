---
tags: [api, backend, architecture]
created: 2026-08-06
type: permanent
---

# Idempotenta in API

## Ideea

O operație e idempotentă dacă executarea ei de N ori are același efect ca o singură dată.

`GET`, `PUT`, `DELETE` sunt idempotente prin definiție. **`POST` nu e** — și exact acolo e problema.

## De ce contează

**Clientul va retrimite requestul.** Nu „poate". Va. Timeout de rețea, utilizator care dă dublu-click, retry automat din librăria HTTP, mobil care pierde semnalul. Serverul a procesat cererea, răspunsul nu a ajuns, clientul reîncearcă.

Fără protecție: două facturi, două plăți, două emailuri.

## Soluția: idempotency key

Clientul generează un UUID per **intenție** (nu per request) și îl trimite în header:

```
POST /plati
Idempotency-Key: 7f3a9c12-...
```

Serverul:
1. caută cheia într-un store (Redis / tabel dedicat, TTL 24h)
2. dacă există → întoarce **răspunsul salvat**, fără să reproceseze
3. dacă nu → procesează, salvează (cheie → răspuns) **în aceeași tranzacție**

Punctul 3 e critic: dacă salvezi cheia separat de efect, un crash între cele două te lasă cu una din ele.

## Varianta ieftină

O **constrângere unică în baza de date** pe ceva care identifică natural operația (`numar_factura`, `client_id + luna`). A doua încercare lovește constrângerea și întorci `409` — vezi [[HTTP status codes care conteaza]]. Nu e la fel de curat, dar e mult mai bun decât nimic și nu necesită infrastructură.

## Capcane

- Cheia trebuie generată de **client**, la începutul intenției. Dacă o generează la fiecare retry, nu servește la nimic.
- Nu confunda cu deduplicare pe conținut: două plăți identice legitime (aceeași sumă, același client, la 2 minute) trebuie să treacă amândouă.
- Webhook-urile primite de tine au aceeași problemă în oglindă: procesorul extern **va** livra de două ori. Tratează-le idempotent.

## Legături

- Face parte din: [[MOC Backend si API]] · [[MOC Arhitectura]]
- [[Cozi si background jobs]] — jobul poate rula de două ori
- [[Tranzactii si nivele de izolare]] · [[Event driven - baza]]
