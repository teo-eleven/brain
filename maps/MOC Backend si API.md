---
tags: [moc, backend]
created: 2026-08-06
type: moc
---

# MOC Backend si API

Parte din [[MOC Programare]].

## Design de API

- [[REST - denumirea resurselor]] — substantive, nu verbe
- [[HTTP status codes care conteaza]] — nu ai nevoie de toate 60
- [[API versioning]] — și de ce ai nevoie de el mai devreme decât crezi
- [[Paginare - cursor vs offset]] — offset se rupe la scală

## Corectitudine

- [[Idempotenta in API]] — clientul VA retrimite requestul
- [[Rate limiting]] — protejezi serverul de clienți, și clienții de ei înșiși

## Structură

- [[Dependency injection]]
- [[Multi-tenancy - patterns]] — un cod, mai mulți clienți
- [[Cozi si background jobs]] — ce nu are ce căuta în request/response

## Date

- [[MOC Baze de date]]
- [[N+1 query problem]] — bug-ul de performanță #1 în API-uri
- [[Cache - strategii si invalidare]]

## Securitate

- [[MOC Securitate]]
- [[Autentificare vs autorizare]]
- [[JWT - ce e si ce nu e]]
- [[CORS explicat]]

## Operare

- [[Health checks]]
- [[Observability - logs metrics traces]]

## De învățat #question

- [ ] Când merită GraphQL în loc de REST (răspunsul cinstit: mai rar decât se crede)
- [ ] Webhooks: retry, semnătură, deduplicare
- [ ] Server-Sent Events vs WebSockets pentru streaming
