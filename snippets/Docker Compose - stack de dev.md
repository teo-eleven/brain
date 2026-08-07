---
tags: [snippet, docker, devops]
created: 2026-08-06
type: snippet
lang: yaml
---

# Docker Compose - stack de dev

**Limbaj:** YAML · **Testat:** schelet standard, adaptează porturile și versiunile

## Problema pe care o rezolvă

Un mediu de dezvoltare complet (API + Postgres + Redis) pornit cu o comandă, identic pe orice mașină. Fără „la mine merge".

## Cod

```yaml
# compose.yaml
services:
  api:
    build:
      context: .
      target: dev                      # stage din Dockerfile multi-stage
    ports: ["8000:8000"]
    volumes:
      - ./app:/app/app:ro              # hot reload, read-only în container
    environment:
      DATABASE_URL: postgresql+asyncpg://dev:dev@db:5432/app
      REDIS_URL: redis://cache:6379/0
      LOG_LEVEL: DEBUG
    env_file: [.env]                   # secretele NU în compose.yaml
    depends_on:
      db:    { condition: service_healthy }
      cache: { condition: service_started }
    command: uvicorn app.main:app --host 0.0.0.0 --reload

  db:
    image: postgres:17-alpine
    ports: ["5432:5432"]               # expus ca să te conectezi cu un client GUI
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev -d app"]
      interval: 5s
      timeout: 3s
      retries: 10

  cache:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --save "" --appendonly no    # fără persistență în dev

volumes:
  pgdata:
```

## Cum îl folosesc

```bash
docker compose up -d              # pornește tot
docker compose logs -f api        # urmăresc API-ul
docker compose exec db psql -U dev -d app
docker compose exec api pytest
docker compose down               # oprește
docker compose down -v            # + ȘTERGE datele din pgdata
```

## Detaliile care contează

- **`depends_on` cu `condition: service_healthy`** — fără healthcheck, `depends_on` așteaptă doar *pornirea* containerului, nu ca Postgres să accepte conexiuni. API-ul crapă la start pe „connection refused". Cea mai frecventă problemă din Compose. Vezi [[Health checks]].
- **Hostname = numele serviciului.** Din `api`, baza de date e la `db:5432`, nu `localhost:5432`. `localhost` în container e containerul însuși.
- **Volum numit pentru date** (`pgdata`), bind mount pentru cod. Datele supraviețuiesc lui `down`; codul se sincronizează live.
- **`target: dev`** din Dockerfile multi-stage — imagine de dev cu toolchain, imagine de prod slabă. Vezi [[Docker layer caching]].
- **`.env` în `.gitignore`**, `.env.example` comis. Vezi [[Secrets management]].

## Atenție

- `down -v` șterge volumele. Pierzi baza de date locală.
- Parolele `dev:dev` sunt acceptabile **doar** local. Nu copia fișierul pe un server.
- Porturile expuse pe `0.0.0.0` sunt accesibile din rețeaua locală. Pe un laptop într-o rețea publică, leagă-le la `127.0.0.1:5432:5432`.
- Pe Windows, bind mount-urile din `C:` în WSL2 sunt lente cu multe fișiere mici — ține codul în WSL pentru proiecte mari.

## Legături

- [[Docker cheatsheet]] · [[Docker layer caching]] · [[Health checks]]
- [[Secrets management]] · [[12 factor app]] · [[MOC DevOps si Deploy]]
