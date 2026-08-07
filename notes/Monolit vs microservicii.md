---
tags: [architecture]
created: 2026-08-06
type: permanent
---

# Monolit vs microservicii

## Ideea

Microserviciile rezolvă o problemă **organizațională**, nu una tehnică: mai multe echipe care vor să livreze independent, fără să se aștepte reciproc.

Dacă nu ai problema aia, plătești costul fără să iei beneficiul.

## Ce plătești

Ce era un apel de funcție devine un apel de rețea. Consecințele:

- **poate eșua** → retry, timeout, circuit breaker
- **poate ajunge de două ori** → [[Idempotenta in API]] obligatoriu
- **nu are tranzacții** → consistență eventuală, saga, compensații
- **trebuie versionat** → [[API versioning]] între serviciile tale
- **trebuie urmărit** → tracing distribuit, vezi [[Observability - logs metrics traces]]
- **debug local** → 8 containere ca să pornești aplicația

Un bug care traversa 3 funcții acum traversează 3 servicii, 3 seturi de loguri și 2 cozi.

## Începe monolit

Un **monolit modular** — module cu granițe clare în interiorul unui singur deploy — îți dă majoritatea beneficiilor organizatorice fără costul distribuției. Vezi [[Cuplare si coeziune]].

Când un modul chiar are nevoie de scalare sau deploy independent, îl extragi. Dacă granițele erau bune, extragerea e mecanică. Dacă nu erau, ai aflat asta ieftin, în loc să descoperi granițele greșite după ce le-ai transformat în API-uri de rețea.

**Invers e mult mai greu:** unificarea a 12 microservicii într-un monolit e un proiect de luni.

## Când microserviciile chiar se justifică

- Echipe multiple (5+ dezvoltatori per serviciu) care se blochează reciproc la deploy
- O componentă cu profil de scalare radical diferit (procesare video vs CRUD)
- Cerințe de izolare (conformitate, date reglementate)
- Stack tehnologic obligatoriu diferit pentru o parte

Observă că trei din patru sunt despre oameni și constrângeri, nu despre performanță.

## Semnalul de alarmă

Dacă serviciile tale trebuie deployate împreună ca să funcționeze, sau dacă un feature necesită modificări în 4 servicii simultan, **ai un monolit distribuit** — cel mai rău din ambele lumi: cuplarea unui monolit plus complexitatea rețelei.

## Legături

- Face parte din: [[MOC Arhitectura]]
- [[Cuplare si coeziune]] · [[KISS DRY YAGNI]]
- [[Event driven - baza]] · [[CAP theorem]] · [[Idempotenta in API]]
