---
tags: [devops, architecture]
created: 2026-08-06
type: permanent
---

# 12 factor app

## Ideea

Un set de 12 reguli (Heroku, 2011) pentru aplicații care se pot deploya și scala fără dureri. Vechi, dar încă cel mai bun checklist de „e gata de producție?".

## Cele care contează cel mai mult

**1. Config în environment** — nu în cod, nu în fișiere comise. Aceeași imagine rulează în dev/staging/prod, diferă doar variabilele. Vezi [[Secrets management]].

**2. Procese stateless** — nicio stare în memoria procesului între cereri. Sesiuni în Redis, fișiere în object storage. Altfel nu poți rula 2 instanțe, deci nu poți face [[Strategii de deploy]] fără downtime.

**3. Dependențe declarate explicit** — `requirements.txt` / `package-lock.json` cu versiuni fixate. Niciodată „e instalat pe server". Vezi [[Python virtual environments]].

**4. Paritate dev/prod** — aceeași bază de date, aceeași versiune. SQLite în dev + Postgres în prod = bug-uri care apar doar în producție.

**5. Logurile ca flux** — scrii pe `stdout`, nu în fișiere. Colectarea e treaba infrastructurii. Vezi [[Observability - logs metrics traces]].

**6. Build / release / run separate** — build-ul produce un artefact imuabil; release-ul îl combină cu config; run-ul îl execută. Nu modifici codul pe server.

**7. Admin ca procese one-off** — migrările și scripturile rulează în același environment, cu același cod, nu prin SSH manual.

## Cele mai puțin relevante azi

„Port binding" și „concurrency prin procese" sunt în mare parte rezolvate de containere și orchestratoare. Nu le ignora, dar nu mai sunt decizii pe care le iei tu.

## De ce încă merită

Nu pentru că sunt 12 sau pentru autoritatea listei. Pentru că fiecare punct corespunde unei clase de incidente reale. Cele mai multe probleme de „merge pe laptopul meu" sunt încălcări ale punctelor 1, 3 sau 4.

## Legături

- Face parte din: [[MOC DevOps si Deploy]] · [[MOC Arhitectura]]
- [[Secrets management]] · [[Strategii de deploy]] · [[Health checks]]
- [[Docker layer caching]] · [[Observability - logs metrics traces]]
