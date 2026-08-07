---
tags: [api, backend, security]
created: 2026-08-06
type: permanent
---

# Rate limiting

## Ideea

Limitezi câte cereri poate face un client într-un interval. Protejezi serverul de abuz, dar și de clienți proști cu retry în buclă infinită.

## Algoritmi, pe scurt

| Algoritm | Cum | Compromis |
|---|---|---|
| **Fixed window** | max 100/minut, resetare la minut fix | simplu, dar permite 200 la granița dintre minute |
| **Sliding window** | fereastră mobilă | corect, mai scump |
| **Token bucket** | găleată care se umple constant, fiecare cerere ia un token | permite burst controlat — **cel mai practic** |
| **Leaky bucket** | ieșire la debit constant | netezește traficul |

Token bucket e default-ul bun: acceptă un vârf scurt (utilizator care încarcă o pagină cu 10 requesturi) dar limitează media.

## Ce răspunzi

```
HTTP 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1754500000
```

`Retry-After` nu e opțional dacă vrei clienți care se comportă bine. Fără el, clientul ghicește — și de obicei ghicește „imediat".

## Pe ce cheie limitezi

Ordinea de la cel mai bun la cel mai slab:
1. **user / API key** — corect, un utilizator nu afectează alții
2. **IP** — nesigur: un NAT corporate = 200 de oameni pe un IP
3. **global** — protejează serverul, dar un abuziv blochează pe toți

Ideal: limite pe mai multe nivele simultan (per user + global de siguranță).

## Capcane

- **Limitele nu trebuie egale pe toate endpoint-urile.** `POST /login` merită 5/minut (protecție brute-force), `GET /facturi` merită 100.
- Cu mai multe instanțe de server, contorul trebuie **partajat** (Redis). În memorie locală, N instanțe = N × limita.
- Nu limita health check-urile — vezi [[Health checks]] — altfel orchestratorul crede că ai murit.
- Client-side: dacă TU consumi un API cu rate limit, ai nevoie de [[Retry cu backoff exponential]], nu de retry imediat.

## Legături

- Face parte din: [[MOC Backend si API]] · [[MOC Securitate]]
- [[HTTP status codes care conteaza]] · [[Retry cu backoff exponential]]
- [[Observability - logs metrics traces]] — alertează pe rata de 429
