---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# FastAPI - API async

## Ce e

Framework web Python pe ASGI, construit peste Starlette (HTTP) și Pydantic
(validare). Rulează sub `uvicorn`.

Ce îl definește:

- **ASGI, nu WSGI** — un singur worker poate ține multe conexiuni în așteptare pe
  I/O. Contează enorm când fiecare request stă câteva secunde după un model.
- **dependency injection** — `Depends()` pentru sesiune DB, utilizator curent,
  configurație. Dependențele se compun și se pot suprascrie în teste, ceea ce e
  singurul motiv serios pentru care merită folosite.
- **`response_model`** — schema de ieșire, validată și filtrată la serializare.
  Ce nu e în model nu iese din API, deci nu scurgi câmpuri din greșeală.
- **OpenAPI automat** — `/docs` și `/openapi.json` generate din semnături și
  modele. Documentația nu poate rămâne în urmă, pentru că nu e scrisă de mână.

### Capcana `async def` vs `def`

- `async def` cu un apel **blocant** înăuntru (requests sincron, I/O de fișier,
  driver DB sincron) **blochează event loop-ul întreg**. Un endpoint lent oprește
  tot serverul.
- `def` simplu e rulat de FastAPI într-un **threadpool** — sigur, dar limitat ca
  număr de fire.

Regula: `async def` doar dacă tot ce e înăuntru e `await`-abil. Altfel `def`.

## Unde apare la mine

Backend-ul din `ecf_app_web-doc_extract_studio`: FastAPI + uvicorn, SQLAlchemy
async cu asyncpg, Pydantic v2. Containerul `backend` din compose.

Extracția propriu-zisă **nu** rulează în request — e trimisă ca job Celery, iar
endpoint-ul returnează imediat un id de job. Exact motivul pentru care există
`celery-worker` ca serviciu separat: un PDF de 200 de pagini nu are ce căuta
într-un timeout HTTP.

## Comenzi

```bash
uvicorn app.main:app --reload --port 8000
curl localhost:8000/openapi.json | jq '.paths | keys'
docker compose logs -f backend
```

## De răspuns

- Am endpoint-uri `async def` care cheamă ceva blocant? Cum le găsesc, altfel
  decât citind fiecare?
- Sesiunea async de SQLAlchemy e injectată prin `Depends` cu cleanup corect pe
  excepție?
- `response_model` e pus peste tot, sau unele rute returnează dict-uri libere?
- Endpoint-ul care pornește jobul de extracție validează documentul înainte de a
  pune în coadă, sau eroarea apare abia în worker?

## Cum învăț asta

**Documentație:** https://fastapi.tiangolo.com

**Primul pas practic** (30 de minute):

1. `pip install "fastapi[standard]" uvicorn` într-un venv curat.
2. În `main.py`: un `class Item(BaseModel)` cu două câmpuri și un
   `@app.get("/items/{id}", response_model=Item)` care întoarce date fixe.
3. `uvicorn main:app --reload` și deschide `localhost:8000/docs` — vezi schema
   generată automat din model și dai request direct din pagină.

**Ordinea în care merită citit:**

| Etapă | Ce | De ce în ordinea asta |
|---|---|---|
| 1 | Path/query params + `response_model` | E scheletul oricărei rute; fără el restul n-are unde se prinde |
| 2 | `Depends()` și override în teste | Sesiunea DB și autentificarea intră aici, nu în corpul rutei |
| 3 | `async def` vs `def` + rute care pun în coadă | Abia după ce ai I/O real vezi de ce contează event loop-ul |

**Capcana de începător:** pui `async def` pe o rută care cheamă ceva blocant
(`requests.get`, driver DB sincron) — nu crapă nimic, dar blochezi event loop-ul
și tot serverul stă până se termină acel apel, inclusiv pentru ceilalți clienți.

## Legat

- [[Pydantic v2 - validare la boundary]]
- [[Celery si Redis - joburi asincrone]]
- [[Docker Compose - stack local]]
- [[Alembic - migrari de schema]]
- [[MCP - Model Context Protocol]]
- [[MOC Stack AI]]
