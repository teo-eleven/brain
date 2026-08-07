---
tags: [architecture, principles]
created: 2026-08-06
type: permanent
---

# Cuplare si coeziune

## Ideea

- **Cuplare** — cât de mult depinde un modul de altele. **Vrei puțină.**
- **Coeziune** — cât de mult au de-a face lucrurile dintr-un modul între ele. **Vrei multă.**

Ținta: module care fac un lucru bine (coeziv) și știu cât mai puțin despre restul (decuplat).

## De ce e singura metrică de design care contează real

Toate celelalte reguli de design sunt cazuri particulare ale acestora două:

- SOLID → moduri de a reduce cuplarea
- [[Dependency injection]] → decuplare de implementări concrete
- „funcții mici" → coeziune
- „organizează pe feature, nu pe tip de fișier" → coeziune
- cod greu de testat → cuplare prea mare, vezi [[TDD - red green refactor]]

## Simptome de cuplare mare

- Schimbi o linie și se rup 5 module fără legătură aparentă
- Ca să testezi o funcție trebuie să mock-uiești 6 dependențe — vezi [[Test doubles - mock stub fake spy]]
- Nu poți înțelege un fișier fără să deschizi alte 4
- Un import cyclic
- Un modul care importă un altul doar pentru o constantă

## Simptome de coeziune mică

- Un fișier `utils.py` de 800 de linii cu funcții care n-au nimic în comun
- O clasă `Manager` / `Helper` / `Service` care face 12 lucruri diferite
- Ca să implementezi un feature, atingi 9 foldere

## Organizarea pe feature crește coeziunea

```
# Coeziune mică: pe tip de fișier
models/factura.py, client.py
services/factura.py, client.py
routes/factura.py, client.py

# Coeziune mare: pe domeniu
facturi/  model.py  service.py  routes.py  tests.py
clienti/  model.py  service.py  routes.py  tests.py
```

În a doua formă, tot ce ține de facturi e într-un loc. Poți șterge folderul și ai șters feature-ul. Poți da folderul altcuiva.

## Capcana

**Zero cuplare e imposibilă** — un sistem în care nimic nu depinde de nimic nu face nimic. Scopul nu e absența cuplării, e cuplare **în direcția potrivită**: multe module depind de puține abstracții stabile, nu invers.

Și decuplarea excesivă (interfețe peste tot, evenimente pentru orice) își are propriul cost: nu mai poți urmări fluxul prin cod. Vezi [[KISS DRY YAGNI]].

## Legături

- Face parte din: [[MOC Arhitectura]] · [[MOC Programare]]
- [[KISS DRY YAGNI]] · [[Dependency injection]]
- [[Monolit vs microservicii]] · [[Event driven - baza]]
