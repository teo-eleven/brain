---
tags: [testing, tdd]
created: 2026-08-06
type: permanent
---

# TDD - red green refactor

## Ciclul

1. **RED** — scrii un test care eșuează. Îl rulezi și **verifici că eșuează**.
2. **GREEN** — cea mai simplă implementare care îl trece. Chiar dacă e urâtă.
3. **REFACTOR** — cureți codul, testele rămân verzi.

Pași mici. Minute, nu ore.

## De ce pasul 1 include „verifici că eșuează"

Un test care trece din prima nu testează nimic — fie funcționalitatea exista deja, fie testul e greșit (assert pe ceva mereu adevărat, fixture care nu se aplică, test care nici nu rulează).

**Un test care nu a fost văzut roșu nu e un test.** Ăsta e punctul cel mai des sărit și cel care dă cea mai multă valoare.

## De ce funcționează

Nu în principal pentru acoperire. Pentru **design**:

- Ca să scrii testul întâi, trebuie să decizi interfața înainte de implementare — te forțează să gândești din perspectiva apelantului.
- Cod greu de testat = cod prost cuplat. Testul e primul consumator și primul semnal de design. Vezi [[Cuplare si coeziune]] și [[Dependency injection]].
- Te oprește din a scrie cod „pentru viitor" — vezi [[KISS DRY YAGNI]].

## Unde TDD e clar cel mai valoros

- **Bug fix.** Întâi un test care reproduce bug-ul (roșu), apoi fixul. Ai și dovada că era rupt și protecție contra regresiei. Aici TDD nu se discută.
- Logică de business cu multe cazuri limită.
- Refactorizare: testele existente sunt plasa de siguranță.

## Unde e mai puțin potrivit

- Explorare / prototip — nu știi încă ce construiești, deci nu poți scrie assertul
- UI vizual — „arată bine" nu se exprimă ca assert
- Cod de integrare cu un API extern pe care nu-l înțelegi încă

Onest: puțini fac TDD strict tot timpul. Ce merită păstrat indiferent: **test înainte de fix**, mereu.

## Capcane

- Teste care testează implementarea, nu comportamentul → orice refactorizare le sparge. Vezi [[Ce nu merita testat]].
- Refactorul (pasul 3) sărit → codul „green" urât rămâne pentru totdeauna.
- Pași prea mari: scrii 6 teste, apoi implementezi tot. Ai pierdut feedback-ul rapid.

## Legături

- Face parte din: [[MOC Testare]]
- [[Piramida testelor]] · [[Test doubles - mock stub fake spy]]
- [[pytest cheatsheet]] · [[Debugging metodic]]
