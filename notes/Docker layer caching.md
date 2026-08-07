---
tags: [docker, devops, performance]
created: 2026-08-06
type: permanent
---

# Docker layer caching

## Ideea

Fiecare instrucțiune din `Dockerfile` creează un layer. Docker refolosește un layer din cache dacă instrucțiunea **și tot ce a intrat înainte** sunt neschimbate. O singură invalidare invalidează **tot ce urmează**.

Deci ordinea instrucțiunilor determină durata build-ului.

## Regula

**De la ce se schimbă rar, la ce se schimbă des.** Codul tău se schimbă la fiecare commit; dependențele o dată pe lună.

```dockerfile
# GREȘIT: orice modificare de cod reinstalează toate dependențele
COPY . .
RUN pip install -r requirements.txt

# CORECT: pip rulează din nou doar când requirements.txt se schimbă
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
```

Diferența practică: build de 8 secunde în loc de 3 minute, la fiecare commit.

## Multi-stage build

Compilezi într-o imagine grasă, copiezi doar rezultatul într-una slabă:

```dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

Imaginea finală nu contine `node_modules`, nici toolchain-ul, nici codul sursă. Mai mică, mai rapid de tras, și mai puțină suprafață de atac.

## Alte lucruri care contează

- **`.dockerignore`** — fără el, `COPY . .` trimite `node_modules`, `.venv`, `.git` în context. Build lent și cache invalidat de fișiere irelevante.
- `npm ci` / `pip install --no-cache-dir` — reproductibil și fără cache inutil în layer.
- Nu instala nimic cu `latest` — build-ul devine nereproductibil.

## Capcane

- **Layer-ele sunt aditive.** Un `RUN rm secret.txt` pe o linie separată nu șterge fișierul din layer-ul precedent — cine trage imaginea îl poate extrage. Vezi [[Secrets management]].
- În CI, cache-ul e gol la fiecare rulare dacă nu-l configurezi explicit (`cache-from`, registry cache). Optimizarea Dockerfile-ului nu ajută dacă CI-ul nu are cache.
- `COPY . .` urmat de un build care generează fișiere în director poate produce rezultate diferite local vs CI.

## Legături

- Face parte din: [[MOC DevOps si Deploy]]
- [[Docker cheatsheet]] · [[Docker Compose - stack de dev]]
- [[12 factor app]] · [[Secrets management]]
