---
tags: [moc, security]
created: 2026-08-06
type: moc
---

# MOC Securitate

Parte din [[MOC Programare]].

> Regula de bază: **nu ai încredere în nimic care vine din afară.** Input de utilizator, răspuns de API, conținut de fișier, output de LLM — toate sunt ostile până le validezi.

## Panorama

- [[OWASP Top 10 - pe scurt]] — punctul de plecare

## Injection

- [[SQL injection]] — parametrizare, nu escaping
- [[XSS]] — escape la ieșire, nu la intrare
- [[Prompt injection - aparare]] — aceeași familie, dar datele _sunt_ instrucțiunile

## Identitate

- [[Autentificare vs autorizare]] — două lucruri diferite, confundate constant
- [[JWT - ce e si ce nu e]] — nu e sesiune și nu e criptat
- [[Hashing parole]] — bcrypt/argon2, niciodată SHA
- [[CORS explicat]] — nu e un mecanism de securitate pentru serverul tău

## Secrete

- [[Secrets management]]

## Aplicat

- [[Validarea output-ului LLM]] — un LLM e input de utilizator, nu cod de încredere
- [[Multi-tenancy - patterns]] — cel mai periculos bug: date scurse între clienți

## De învățat #question

- [ ] CSRF: chiar mai contează cu SameSite=Lax default?
- [ ] Content Security Policy — configurare minimă utilă
- [ ] Rotația secretelor fără downtime
- [ ] Dependency scanning: `npm audit` / `pip-audit` în CI
- [ ] Prompt injection — vectorul nou, încă prost înțeles
