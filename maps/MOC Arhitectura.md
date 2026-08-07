---
tags: [moc, architecture]
created: 2026-08-06
type: moc
---

# MOC Arhitectura

Parte din [[MOC Programare]].

> Arhitectura nu e despre diagrame. E despre ce decizii poți schimba ieftin mai târziu și ce decizii te blochează.

## Principii

- [[KISS DRY YAGNI]] — cele trei pe care le încalci cel mai des
- [[Cuplare si coeziune]] — singura metrică de design care contează real

## Structură

- [[Monolit vs microservicii]] — începe monolit, aproape mereu
- [[Multi-tenancy - patterns]]
- [[Dependency injection]]

## Comunicare

- [[Event driven - baza]]
- [[Cozi si background jobs]]
- [[Idempotenta in API]] — obligatoriu în sisteme distribuite

## Limite fizice

- [[CAP theorem]] — de ce nu poți avea tot
- [[Cache - strategii si invalidare]]
- [[Connection pooling]]

## Decizii documentate

- [[ADR 001 - Vault local markdown pe D]]
- [[ADR 002 - Structura vault fara foldere adanci]]

## De învățat #question

- [ ] Hexagonal / ports & adapters: merită la proiecte mici?
- [ ] CQRS — când chiar e justificat
- [ ] Saga pattern pentru tranzacții distribuite
- [ ] Cum documentez arhitectura fără să devină obsoletă în 2 luni (C4 model?)
