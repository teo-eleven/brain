---
tags: [moc, testing]
created: 2026-08-06
type: moc
---

# MOC Testare

Parte din [[MOC Programare]].

## Strategie

- [[Piramida testelor]] — multe unit, puține E2E
- [[Ce nu merita testat]] — la fel de important ca ce meriți să testezi
- [[Coverage - metrica utila si capcana]] — 100% coverage nu înseamnă zero bug-uri

## Practică

- [[TDD - red green refactor]]
- [[Test doubles - mock stub fake spy]] — patru lucruri diferite, un singur cuvânt folosit
- [[pytest cheatsheet]]

## Legat

- [[Debugging metodic]] — un bug reprodus e un test care lipsește
- [[Evals inainte de prompt changes]] — testarea pentru sisteme cu LLM
- [[MOC Git si Workflow]] — testele rulează în CI, nu pe laptopul tău

## De învățat #question

- [ ] Property-based testing (Hypothesis) — merită efortul?
- [ ] Testcontainers pentru teste de integrare cu DB real
- [ ] Snapshot testing: util sau doar zgomot în review?
- [ ] Cât de mult mock e prea mult (semnal de design prost)
