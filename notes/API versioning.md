---
tags: [api, backend]
created: 2026-08-06
type: permanent
---

# API versioning

## Ideea

Din momentul în care un client care nu-l controlezi consumă API-ul tău, nu mai poți schimba nimic incompatibil. Versionarea e mecanismul prin care evoluezi fără să rupi clienții existenți.

## Variante

| Metodă | Exemplu | Verdict |
|---|---|---|
| În cale | `/v1/facturi` | urât teoretic, **cel mai practic** |
| În header | `Accept: application/vnd.app.v1+json` | „corect" REST, greu de testat manual |
| În query | `?version=1` | evită-l, se pierde la redirect |
| Pe dată | `Api-Version: 2026-08-06` | folosit de Stripe, excelent pentru evoluție continuă |

Alege `/v1/` dacă nu ai un motiv puternic pentru altceva. Poți da un URL cuiva pe chat și funcționează — subestimezi cât contează asta.

## Ce e breaking și ce nu

**Breaking (necesită versiune nouă):**
- ștergi sau redenumești un câmp
- schimbi tipul unui câmp (`"5"` → `5`)
- adaugi validare mai strictă
- schimbi un status code întors
- faci un câmp opțional obligatoriu

**Non-breaking (safe):**
- adaugi un câmp nou în răspuns
- adaugi un endpoint nou
- adaugi un parametru **opțional**

Regula clientului tolerant: **adăugarea e safe doar dacă clienții ignoră câmpurile necunoscute.** Dacă un client validează strict schema, chiar și adăugarea rupe. Documentează așteptarea asta.

## Practic

- Versionează **API-ul întreg**, nu fiecare endpoint separat. Versiuni per-endpoint devin o matrice imposibilă.
- Nu ține mai mult de 2 versiuni active. Fiecare versiune veche e cod care trebuie testat la fiecare release.
- Anunță deprecarea cu dată fixă și header `Deprecation` / `Sunset`. Apoi respectă data.

## Capcane

- Versionarea nu e o scuză să nu gândești designul din prima. `/v2` la 3 luni de la lansare e un semnal de design grăbit.
- Migrările de bază de date au aceeași problemă în oglindă: vezi [[Migrari zero-downtime]].

## Legături

- Face parte din: [[MOC Backend si API]]
- [[REST - denumirea resurselor]] · [[HTTP status codes care conteaza]]
- [[Migrari zero-downtime]] · [[Conventional commits]] — `feat!:` marchează breaking change
