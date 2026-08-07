---
tags: [architecture, patterns, backend]
created: 2026-08-06
type: permanent
---

# Dependency injection

## Ideea

O funcție/clasă nu își creează singură dependențele — le **primește**. Atât. Nu ai nevoie de framework, container sau adnotări.

```python
# Fără DI: imposibil de testat fără DB reală
def creeaza_factura(date):
    db = PostgresConnection(URL_HARDCODAT)
    ...

# Cu DI: dependența vine din afară
def creeaza_factura(date, db: Database):
    ...
```

## De ce contează

Trei câștiguri, în ordinea importanței:

1. **Testabilitate.** În test dai un fake/in-memory. Fără DI ești obligat să faci monkey-patching — vezi [[Test doubles - mock stub fake spy]].
2. **Cuplare redusă.** Codul depinde de o interfață, nu de o implementare concretă. Vezi [[Cuplare si coeziune]].
3. **Configurare într-un singur loc.** Cine construiește ce e vizibil la marginea aplicației, nu împrăștiat.

## În FastAPI

```python
async def get_db() -> AsyncIterator[Session]:
    async with SessionLocal() as s:
        yield s

@app.post("/facturi")
async def creeaza(payload: FacturaIn, db: Session = Depends(get_db)):
    ...
```

În test, `app.dependency_overrides[get_db] = get_test_db` — și ai înlocuit baza de date fără să atingi codul endpoint-ului. Vezi [[FastAPI - dependency de tenant]].

## Capcane

- **Nu injecta tot.** Dacă injectezi `datetime.now`, un logger și 6 servicii într-o funcție, semnătura devine ilizibilă. Injectează ce trebuie înlocuit în test sau ce variază pe medii.
- Containerele de DI cu auto-wiring magic (rezolvare prin reflecție) fac stack trace-urile ilizibile. În Python și TypeScript, DI manual e aproape mereu suficient.
- DI ≠ „interfață pentru fiecare clasă". O interfață cu o singură implementare, creată „pentru viitor", e [[KISS DRY YAGNI]] încălcat.

## Legături

- Face parte din: [[MOC Arhitectura]] · [[MOC Backend si API]] · [[MOC Python]]
- [[Cuplare si coeziune]] · [[Test doubles - mock stub fake spy]]
- [[Multi-tenancy - patterns]] — tenantul se injectează, nu se citește global
