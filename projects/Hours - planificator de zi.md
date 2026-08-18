---
tags: [project, personal]
created: 2026-08-18
type: project
status: active
---

# Hours - planificator de zi

## Într-o propoziție

Planificatorul zilei de lucru: pontaj de 9 ore cu pauza de masă automată, sarcini, ședințe și
memento-uri — totul în browser, în IndexedDB, fără backend și fără cont.

## Unde e codul

```
github.com/tewtzu-ctrl/hours       # privat, creat 14.08
```

**Fără copie locală pe mașina de serviciu** — vezi [[Proiecte personale]].

```
src/core/time/     tickStore, useNow, useTickEffect, dateKeys, time travel pentru dev
src/core/db/       conexiunea IndexedDB + validare zod la fiecare citire
src/core/alerts/   coada de alerte, AlertHost, corpuri specializate
src/core/errors/   AppError (db | validation | unexpected)
src/app/           EngineRoot, bootstrap, zi nouă, tema
src/shared/        i18n (tot textul român), formatare de timp, primitive UI
```

TypeScript + React, `npm run verify` = typecheck + lint + teste, prag de acoperire **80% pe toate
cele patru metrici**. Interfața e în română; datele nu părăsesc mașina.

## Ce face

- **Pontaj** — pornești ziua, aplicația derivă ora estimată de final (`start + 9h`), timpul lucrat,
  cel rămas și progresul pe un inel. Pauza 13:00–14:00 pornește și se oprește singură, fiecare
  tranziție cu un pop-up care se poate anula.
- **Sarcini** pe ziua curentă, cu confirmare la ștergere.
- **Ședințe** — subiect, oră, durată, participanți, notițe, pre-alertă. Fiecare ședință derivă
  automat două memento-uri: pre-alertă și start.
- **Memento-uri** — manuale sau derivate; cele scăpate cât aplicația era închisă apar într-un
  **singur sumar**, nu în cinci pop-up-uri.
- **Zi nouă** — la trecerea de miezul nopții ziua precedentă se arhivează și pontajul repornește.

## Cele patru decizii care explică tot codul

**1. Nimic nu se acumulează.** Nu există niciun `elapsed += 1000`. Fiecare cifră afișată e o funcție
pură de `(stare persistată, nowMs)`. Un tick întârziat, ratat sau throttled de browser nu poate
corupe nicio valoare — nu există stare derivată de coruptibil.

**2. O singură sursă de timp.** `core/time/tickStore.ts` e un singleton auto-corector care se
re-ancorează la granița secundei, consumat prin `useNow()` (`useSyncExternalStore`), deci toate
componentele văd exact aceeași milisecundă în același commit. Un **test de arhitectură** interzice
`Date.now()`, `new Date()` și `performance.now()` oriunde în afara `src/core/time` — de asta
time-travel-ul din panoul de dev și `vi.setSystemTime` din teste se aplică global, nu pe bucăți.

Testul ăsta e partea de reținut: regula nu e scrisă într-un README, e **executabilă**. O regulă de
arhitectură care nu are test moare la a treia grabă.

**3. Dedupe prin date persistate, nu prin steaguri în memorie.** `breaks[]` pentru pauză, `firedAt`
pentru memento-uri, `endNotifiedAt` pentru finalul zilei. Ordinea e mereu **persistă → actualizează
starea → arată modalul**: dacă tabul moare cu pop-upul deschis, marcajul e deja durabil, deci nimic
nu se re-declanșează la reload.

**4. Un singur canal de notificare.** Toate pop-upurile — inclusiv confirmările de ștergere — trec
printr-o coadă FIFO, iar `AlertHost` randează doar capul cozii. Două alerte simultane se pun la
rând, nu se suprapun.

**Validare la fiecare citire, nu la fiecare scriere.** `readValidated.ts` trece prin zod tot ce vine
din IndexedDB: datele persistate sunt o graniță ca oricare alta, fiindcă versiunea de ieri a
aplicației le-a scris cu alt cod. Aceeași idee ca [[Pydantic v2 - validare la boundary]], pe alt
strat.

## Zile

| Ziua           | Ce                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| [[2026-08-14]] | repo inițializat la **15:48**, aplicația întreagă la **15:49** — un singur commit, +16012 linii, 142 fișiere |
| [[2026-08-15]] | validarea de formular lăsată să-și dețină mesajele, eticheta pauzei dezambiguizată; PR #1 închis la 20:08    |

Cele două commit-uri din 14.08, la 13 secunde distanță, spun clar că lucrul s-a făcut înainte și a
fost împins în bloc — la fel ca la [[Trupa 9 - site]] și pe [[ADM Expert]].

## Deschis

- [ ] Fără copie locală aici — dacă discul personal cade, GitHub e singurul loc unde există
- [ ] Nefolosit încă în ziua reală de lucru; rutina din [[MOC Operatii zilnice]] rămâne pe vault și
      pe notele de zi, nu pe el

## Legat

- [[Proiecte personale]] · [[MOC Operatii zilnice]]
- [[Pydantic v2 - validare la boundary]] — validare la graniță, aici cu zod

#personal
