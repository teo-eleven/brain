---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# Docker Compose - stack local

## Ce e

Descrii un stack multi-container într-un YAML și îl pornești cu o comandă. Pentru
dezvoltare locală înlocuiește un README plin de „instalează întâi Postgres".

Ce contează în practică:

- **services** — fiecare container: imagine sau build, env, porturi, volume.
- **depends_on** — ordinea de pornire. Implicit înseamnă doar „a pornit
  procesul", **nu** „e gata de folosit". Cu `condition: service_healthy` chiar
  așteaptă healthcheck-ul — asta vrei aproape întotdeauna.
- **healthcheck** — comanda care spune dacă serviciul e util, nu doar viu:
  `pg_isready`, `redis-cli ping`, un `curl` pe `/health`.
- **volumes** — named volumes pentru date persistente (Postgres), bind mounts
  pentru cod în dezvoltare (hot reload).
- **profiles** — servicii opționale, pornite doar cu `--profile <nume>`. Bun
  pentru unelte de debug pe care nu le vrei mereu.

## Unde apare la mine

`ecf_app_web-doc_extract_studio` are **7 servicii**: `postgres`, `redis`,
`migrate`, `backend`, `celery-worker`, `celery-beat`, `frontend`.

`migrate` e un container care rulează Alembic și **iese**. Backend-ul depinde de
el cu `service_completed_successfully`, deci nu pornește pe o schemă veche.

### Capcane reale, plătite

- **`NAS_MOUNT`** — documentele stau pe un share de rețea montat în containere.
  Dacă variabila lipsește sau share-ul nu e montat, containerul pornește
  „sănătos" și eșuează abia când primul job caută un fișier. Eroare care arată ca
  o problemă de aplicație, dar e de infrastructură.
- **cursa `initdb` la primul boot** — la prima pornire Postgres rulează
  `initdb`, acceptă conexiuni pe socket local, apoi **repornește**. Un
  healthcheck naiv cu `pg_isready` trece în fereastra aia, `migrate` pornește și
  se lovește de restart. A doua rulare merge — de-aia bug-ul nu apare decât pe
  mașini curate și în CI.

## Comenzi

```bash
docker compose up -d
docker compose ps                        # coloana STATUS: healthy?
docker compose logs -f backend celery-worker
docker compose config                    # YAML rezolvat, cu env expandat
docker compose down -v                   # ȘTERGE volumele — pierzi baza locală
docker compose up -d --build backend     # rebuild doar un serviciu
```

## De răspuns

- Healthcheck-ul de Postgres verifică o conexiune TCP reală pe baza aplicației,
  sau doar `pg_isready` pe socket?
- `NAS_MOUNT` e validat la pornirea backend-ului (fail fast) sau abia la primul
  acces?
- Stack-ul Langfuse (6 containere) și cel de aplicație (7) rulează simultan pe
  laptop? Câtă memorie cere totul?
- Ce servicii ar trebui mutate pe `profiles`, ca `docker compose up` implicit să
  fie mai ușor?

## Cum învăț asta

**Documentație:** https://docs.docker.com/compose

**Primul pas practic** (30 de minute):

1. Un `compose.yaml` cu `postgres:16` (env `POSTGRES_PASSWORD`) și un
   `healthcheck: test: ["CMD-SHELL", "pg_isready -U postgres"]`, `interval: 5s`.
2. Adaugi un al doilea serviciu `app` (orice imagine cu `psql`) cu
   `depends_on: postgres: condition: service_healthy`.
3. `docker compose up -d`, apoi `docker compose ps` — vezi `postgres` trecând
   prin `starting` → `healthy` și `app` pornind abia după.

**Ordinea în care merită citit:**

| Etapă | Ce                                                | De ce în ordinea asta                                        |
| ----- | ------------------------------------------------- | ------------------------------------------------------------ |
| 1     | `services`, porturi, env, `docker compose config` | Vezi YAML-ul rezolvat înainte să depanezi ceva ce nu e acolo |
| 2     | `healthcheck` + `depends_on: condition`           | Aici se rezolvă 90% din „merge a doua oară"                  |
| 3     | Volume (named vs bind) și `profiles`              | Persistența și opționalele contează abia pe stack mare       |

**Capcana de începător:** `depends_on` fără `condition: service_healthy` —
containerul pornește imediat ce procesul vecin există, lovește o bază care încă
face `initdb` și cade; a doua rulare merge, deci crezi că a fost o întâmplare și
bug-ul apare abia în CI, pe mașină curată.

## Legat

- [[Alembic - migrari de schema]]
- [[Celery si Redis - joburi asincrone]]
- [[FastAPI - API async]]
- [[Langfuse - tracing pentru LLM]]
- [[Esecul tacut in sisteme AI]]
- [[MOC Operatii zilnice]]
