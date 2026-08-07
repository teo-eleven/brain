---
tags: [architecture, distributed]
created: 2026-08-06
type: permanent
---

# CAP theorem

## Ideea

Într-un sistem distribuit poți garanta doar două din trei:

- **C**onsistency — toți văd aceleași date în același moment
- **A**vailability — fiecare cerere primește un răspuns
- **P**artition tolerance — sistemul funcționează chiar dacă rețeaua dintre noduri se rupe

## Formularea corectă

„Alege două din trei" e o simplificare înșelătoare. **Partițiile de rețea se întâmplă** — nu sunt o opțiune pe care o refuzi. Deci P e obligatoriu, și alegerea reală e:

> **Când rețeaua se rupe, refuzi cererile (CP) sau răspunzi cu date posibil învechite (AP)?**

Asta e o decizie de business, nu tehnică.

## Exemple

| Sistem | Alegere | De ce |
|---|---|---|
| Postgres (single primary) | CP | preferă să refuze decât să divergă |
| Cassandra, DynamoDB | AP (configurabil) | disponibilitate peste prospețime |
| Redis replicat | AP | replicare asincronă, poți citi învechit |
| Bilete de avion, stoc | trebuie CP | dublă vânzare = bani pierduți |
| Feed, like-uri, contoare | AP e ok | un like întârziat nu deranjează pe nimeni |

## Nuanța: PACELC

CAP vorbește doar despre ce se întâmplă **în timpul unei partiții** — un eveniment rar. PACELC adaugă cazul normal: **Else**, când totul funcționează, alegi între **L**atency și **C**onsistency.

Asta e mai relevant zilnic. O citire de pe un read replica e mai rapidă, dar poate fi cu 200 ms în urmă. Alegi latență peste consistență, de fiecare dată când folosești un replica.

## De ce contează practic

Nu ca teorie, ci ca **întrebare pe care ți-o pui pentru fiecare set de date**:

„Dacă utilizatorul vede o valoare cu 2 secunde învechită, ce se rupe?"

- Numărul de like-uri → nimic
- Soldul contului afișat → jenant, dar tolerabil
- Stocul la finalizarea comenzii → vinzi ce nu ai

Răspunsul îți spune unde ai nevoie de o citire consistentă (din primary, cu lock) și unde poți lua drumul ieftin. Vezi [[Tranzactii si nivele de izolare]] și [[Cache - strategii si invalidare]] — cache-ul e o alegere AP deliberată.

## Legături

- Face parte din: [[MOC Arhitectura]]
- [[Tranzactii si nivele de izolare]] · [[Cache - strategii si invalidare]]
- [[Event driven - baza]] · [[Monolit vs microservicii]]
