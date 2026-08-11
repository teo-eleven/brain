---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# Alembic - migrari de schema

## Ce e

Uneltea de migrări pentru SQLAlchemy. Ține schema bazei sub control de versiuni,
la fel cum git ține codul.

Modelul:

- fiecare migrare e o **revizie**, un fișier Python cu `revision` și
  `down_revision` — un lanț, nu o listă. `head` e capătul curent.
- `upgrade()` aplică schimbarea, `downgrade()` o dă înapoi.
- tabelul `alembic_version` din DB spune la ce revizie e baza. Aici se compară
  realitatea cu intenția.

### Autogenerate și limitele lui

`alembic revision --autogenerate` compară modelele SQLAlchemy cu baza și scrie
diferența. Nu e magie, și **nu detectă**:

- redenumiri — vede un DROP și un ADD, deci îți pierde datele coloanei;
- schimbări de tip pe care dialectul nu le expune curat;
- `server_default`, constrângeri CHECK, indecși parțiali, tipuri ENUM (în
  Postgres, ENUM-urile sunt un capitol întreg de dureri);
- orice obiect din DB pe care modelele nu-l descriu — view-uri, triggere.

Regula: autogenerate scrie **schița**, tu **citești fișierul** înainte să-l
comiți. Migrarea generată e cod, nu artefact.

## Unde apare la mine

În `ecf_app_web-doc_extract_studio`, Alembic rulează ca **serviciu separat**
`migrate` în compose: pornește, aplică `upgrade head`, iese. Backend-ul depinde
de terminarea lui cu succes. Nu există stare în care API-ul vorbește cu o bază
nemigrată.

### De ce o schemă desincronizată produce eșecuri care par „de model"

Ăsta e motivul pentru care nota asta stă lângă cele de AI. Dacă o coloană lipsește
sau are alt tip, ce vezi la suprafață e: extracția „nu găsește" un câmp,
rezultatele apar goale, scorul DeepEval scade. Concluzia reflexă e „s-a
înrăutățit modelul" sau „prompt-ul e prost" — și pleci să reglezi prompturi
pentru o problemă de DDL.

Simptomul e identic cu bug-ul de output tăiat: **un eșec de persistare înghițit
de un `except` devine, în amonte, o listă goală**. Diferența se vede doar dacă te
uiți la log-ul workerului, nu la scor. De aceea prima întrebare la o scădere de
metrică e „ce s-a schimbat în infrastructură", nu „ce s-a schimbat în prompt".

## Comenzi

```bash
alembic revision --autogenerate -m "adauga tabela sectiuni"
alembic upgrade head
alembic downgrade -1
alembic current                 # la ce revizie e baza
alembic history --verbose
alembic heads                   # >1 head = branch-uri de migrare, trebuie merge
docker compose run --rm migrate
```

## De răspuns

- Migrarile din repo au `downgrade()` real sau `pass`? Pe care chiar aș putea da
  înapoi în producție?
- Am vreodată două `heads` după un merge de branch-uri? Cum prind asta în CI?
- Migrările care schimbă date (nu doar schema) sunt separate de cele DDL?
- Ar trebui un check în CI care compară modelele cu `head` și cade dacă
  autogenerate ar produce ceva nenul?
- La o scădere de scor, am un mod rapid să exclud schema înainte să investighez
  prompt-ul?

## Legat

- [[Docker Compose - stack local]]
- [[FastAPI - API async]]
- [[Esecul tacut in sisteme AI]]
- [[Metrici pentru agenti AI]]
- [[Cum citesc un trace]]
- [[MOC Operatii zilnice]]
