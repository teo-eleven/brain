---
tags: [python, async]
created: 2026-08-06
type: permanent
---

# Python async - model mental

## Ideea

`async` nu face codul mai rapid. Face ca **așteptarea** să nu blocheze. Un singur thread, un event loop, care rulează cod până întâlnește un `await` — atunci pune sarcina pe pauză și trece la altceva.

Analogia: un chelner cu 10 mese. Nu gătește mai repede. Doar nu stă lângă bucătărie așteptând o comandă, în timp ce alte 9 mese așteaptă să comande.

## De ce contează

Async ajută **numai la I/O-bound** (rețea, disc, DB). La CPU-bound nu ajută deloc — vezi [[Python GIL]]. Dacă pui un calcul greu într-un `async def` fără `await`, blochezi tot event loop-ul și API-ul tău îngheață pentru toți utilizatorii simultan.

## Exemplu

```python
# GREȘIT: 3 requesturi secvențial, 3 secunde
for url in urls:
    r = await client.get(url)

# CORECT: 3 requesturi concurent, ~1 secundă
results = await asyncio.gather(*(client.get(u) for u in urls))
```

## Capcane

- **Un apel sincron blocant într-o funcție async otrăvește tot.** `requests.get()`, `time.sleep()`, un driver de DB sincron — toate blochează event loop-ul. Folosește `httpx`, `asyncio.sleep`, driver async. Sau împinge-le în `asyncio.to_thread()`.
- `async def` fără niciun `await` înăuntru nu are niciun rost.
- Nu poți apela o corutină fără `await` — primești un obiect corutină, nu rezultatul. Uitat `await` = bug silențios.
- Excepțiile din `gather` — implicit prima excepție anulează tot. `return_exceptions=True` schimbă comportamentul.

## Legături

- Face parte din: [[MOC Python]]
- Limita reală: [[Python GIL]]
- Consecință în API: [[Connection pooling]]
- Ce nu ține de request: [[Cozi si background jobs]]
