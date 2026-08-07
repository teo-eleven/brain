---
tags: [snippet, python, reliability]
created: 2026-08-06
type: snippet
lang: python
---

# Retry cu backoff exponential

**Limbaj:** Python · **Testat:** logica e standard, adaptează la clientul tău HTTP

## Problema pe care o rezolvă

Un API extern eșuează temporar. Retry imediat, în buclă, agravează problema: dacă serviciul e supraîncărcat, mii de retry-uri simultane îl țin jos (thundering herd).

Backoff exponențial + jitter distribuie încercările în timp.

## Cod

```python
import asyncio, random
import httpx

RETRIABIL = {408, 429, 500, 502, 503, 504}

async def get_cu_retry(
    client: httpx.AsyncClient,
    url: str,
    max_incercari: int = 4,
    baza: float = 0.5,
    plafon: float = 30.0,
) -> httpx.Response:
    ultima_eroare: Exception | None = None

    for incercare in range(max_incercari):
        try:
            r = await client.get(url, timeout=10.0)
            if r.status_code not in RETRIABIL:
                return r                      # inclusiv 4xx-uri care NU se reîncearcă
            ultima_eroare = httpx.HTTPStatusError(
                f"status {r.status_code}", request=r.request, response=r
            )
            # serverul ne-a spus cât să așteptăm — respectăm
            retry_after = r.headers.get("Retry-After")
            if retry_after and retry_after.isdigit():
                await asyncio.sleep(min(float(retry_after), plafon))
                continue
        except (httpx.TimeoutException, httpx.TransportError) as e:
            ultima_eroare = e

        if incercare == max_incercari - 1:
            break

        # exponential + full jitter
        intarziere = min(baza * (2 ** incercare), plafon)
        await asyncio.sleep(random.uniform(0, intarziere))

    raise ultima_eroare
```

## Cum îl folosesc

```python
async with httpx.AsyncClient() as client:
    r = await get_cu_retry(client, "https://api.exemplu.ro/curs")
    r.raise_for_status()
    date = r.json()
```

## Detaliile care contează

- **Jitter e obligatoriu.** Fără el, 1000 de clienți care eșuează în același moment reîncearcă tot în același moment. `random.uniform(0, delay)` (full jitter) e cel mai simplu și funcționează bine.
- **Nu reîncerca 4xx** (în afară de 408 și 429). Un 400 sau 404 va eșua identic de 4 ori.
- **Respectă `Retry-After`** — vezi [[Rate limiting]]. Serverul știe mai bine decât formula ta.
- **Timeout per încercare**, nu doar total. Fără timeout, o cerere blocată nu ajunge niciodată la retry.
- **Doar operații idempotente.** Un `POST` reîncercat poate crea două resurse — vezi [[Idempotenta in API]].

## Atenție

- Nu pune retry în interiorul unei tranzacții de bază de date: ții rândurile blocate în timp ce aștepți. Vezi [[Tranzactii si nivele de izolare]].
- Retry-ul nu repară un serviciu care e jos de 10 minute. Pentru asta ai nevoie de **circuit breaker**: după N eșecuri consecutive, oprești încercările pentru un interval și eșuezi rapid.
- În producție, `tenacity` (Python) face asta cu decoratori și e bine testat. Codul de mai sus e util ca să înțelegi ce face.

## Legături

- [[Rate limiting]] · [[Idempotenta in API]] · [[Cozi si background jobs]]
- [[Observability - logs metrics traces]] — loghează numărul de retry-uri, e un semnal de sănătate
