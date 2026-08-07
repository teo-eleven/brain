---
tags: [docker, devops, ref]
created: 2026-08-06
type: cheatsheet
---

# Docker cheatsheet

## Containere

```bash
docker ps                           # ce rulează
docker ps -a                        # inclusiv oprite
docker logs -f --tail 100 <nume>    # loguri live, ultimele 100 linii
docker exec -it <nume> sh           # shell înăuntru (bash dacă există)
docker stop <nume> / start / restart
docker rm -f <nume>
docker stats                        # CPU/RAM live per container
docker inspect <nume>               # tot: rețea, volume, env, mount-uri
```

`docker logs` + `docker exec` acoperă 90% din debugging.

## Imagini

```bash
docker build -t app:dev .
docker build --no-cache -t app:dev .          # ignoră cache-ul
docker images
docker rmi <imagine>
docker history <imagine>                       # layerele + ce le-a creat
docker pull / push <registry>/<img>:<tag>
```

`docker history` arată și `ARG`/`ENV` — de aceea secretele la build sunt vizibile. Vezi [[Secrets management]].

## Compose

```bash
docker compose up -d                # pornește în background
docker compose up --build           # rebuild înainte
docker compose down                 # oprește și șterge containerele
docker compose down -v              # + ȘTERGE VOLUMELE (pierzi datele din DB!)
docker compose logs -f api          # loguri unui singur serviciu
docker compose exec api sh
docker compose ps
docker compose restart api
```

`down -v` șterge datele. Nu-l rula din reflex.

## Curățenie (Docker mănâncă disc)

```bash
docker system df                    # cât ocupă: imagini, containere, volume, cache
docker system prune                 # containere oprite, rețele nefolosite, cache
docker system prune -a              # + imagini nefolosite de niciun container
docker volume prune                 # volume orfane — ATENȚIE la date
docker builder prune                # doar cache-ul de build
```

Începe cu `docker system df` ca să vezi ce ocupă, apoi curăță țintit.

## Debug la o imagine care nu pornește

```bash
docker run --rm -it --entrypoint sh app:dev   # ocolește CMD/ENTRYPOINT
docker run --rm -it app:dev sh -c "ls -la /app"
docker logs <container-mort>                   # logurile rămân după exit
docker inspect <container> --format '{{.State.ExitCode}}'
```

## Volume și rețea

```bash
docker run -v $(pwd):/app app:dev              # bind mount (dev)
docker run -v date:/var/lib/postgresql/data    # volum numit (persistent)
docker network ls
docker network inspect <net>                   # ce containere sunt în ea
```

În Compose, containerele se văd între ele prin **numele serviciului** ca hostname (`postgres:5432`), nu prin `localhost`. Cea mai frecventă confuzie la început.

## Windows specific

- Docker Desktop are nevoie de WSL2 activ
- Bind mount-urile de pe `C:` în WSL sunt lente — pentru proiecte cu multe fișiere, ține codul în WSL
- `$(pwd)` în PowerShell e `${PWD}`

## Legături

- [[MOC DevOps si Deploy]] · [[Docker layer caching]] · [[Docker Compose - stack de dev]]
- [[Health checks]] · [[Secrets management]]
