---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# Celery si Redis - joburi asincrone

## Ce e

Celery e o coadă de task-uri distribuită pentru Python. Scoți munca lungă din
ciclul request/response și o dai unui proces separat.

Piesele:

- **broker** — coada propriu-zisă. La mine Redis. Producătorul (API-ul) pune
  mesaje, consumatorii le iau.
- **worker** (`celery -A app worker`) — procesul care execută task-urile. Se
  scalează pe orizontală: mai mulți workeri, aceeași coadă.
- **beat** (`celery -A app beat`) — planificatorul. Trimite task-uri periodice pe
  coadă la ore fixe. **Un singur beat**, altfel dublezi joburile programate.
  Beat nu execută nimic — doar programează.
- **result backend** — unde se scriu rezultatele și starea. Tot Redis, de obicei.

De ce e nevoie: HTTP are timeout, iar un apel de model plus parsare de PDF poate
dura minute. Un request care ține conexiunea deschisă atâta e o cădere care
așteaptă momentul potrivit.

## Unde apare la mine

În `ecf_app_web-doc_extract_studio`, extracția rulează **ca job Celery per
secțiune**. Documentul e împărțit, fiecare secțiune devine un task. Endpoint-ul
FastAPI pune în coadă și returnează imediat.

`celery-worker` și `celery-beat` sunt **containere separate** în compose,
alături de `redis`. Separarea nu e cosmetică: le scalezi și le repornești
independent, și în loguri vezi imediat cine a căzut.

Granularitatea per secțiune e și ce a făcut posibilă **bisecția recursivă** de la
bug-ul cu JSON tăiat: dacă o secțiune eșuează, o tai în două și reîncerci, în loc
să pierzi documentul întreg. Un task = o unitate de retry.

Fiecare task ar trebui să fie un span în Langfuse — altfel trace-ul se rupe la
granița dintre API și worker, unde contextul nu se propagă singur.

## Comenzi

```bash
docker compose logs -f celery-worker
docker compose exec celery-worker celery -A app inspect active     # ce rulează acum
docker compose exec celery-worker celery -A app inspect reserved   # ce așteaptă
docker compose exec redis redis-cli llen celery                    # cât e coada
```

## De reținut

Task-urile trebuie idempotente. Celery poate livra un mesaj de două ori (retry,
worker căzut după execuție dar înainte de ack), iar un task de extracție care
scrie de două ori duplică date.

## De răspuns

- Contextul de trace Langfuse se propagă din API în worker, sau fiecare task
  produce un trace orfan?
- Câte retry-uri are un task de extracție și ce se întâmplă după ultimul — dead
  letter, sau tăcere?
- Ce rulează efectiv pe `celery-beat`? Curățenie, re-scoring, sau doar
  moștenire?
- Redis e persistent (AOF/RDB) sau pierd coada la restart?
- Bisecția recursivă are limită de adâncime? Ce se întâmplă pe un document
  patologic?

## Legat

- [[FastAPI - API async]]
- [[Docker Compose - stack local]]
- [[Tracing LLM - spans si context]]
- [[Esecul tacut in sisteme AI]]
- [[Reasoning tokens si bugetul de output]]
- [[MOC Stack AI]]
