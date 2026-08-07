---
tags: [moc, devops]
created: 2026-08-06
type: moc
---

# MOC DevOps si Deploy

Parte din [[MOC Programare]].

## Containere

- [[Docker layer caching]] — de ce build-ul tău durează 5 min degeaba
- [[Docker cheatsheet]]
- [[Docker Compose - stack de dev]] — snippet

## Principii

- [[12 factor app]] — bătrân, dar încă cel mai bun checklist
- [[Secrets management]] — niciodată în cod, niciodată în imagine

## Livrare

- [[Strategii de deploy]] — rolling, blue-green, canary
- [[Health checks]] — liveness ≠ readiness
- [[Migrari zero-downtime]] — deploy-ul e ușor, schema e greu

## Operare

- [[Observability - logs metrics traces]]
- [[Cozi si background jobs]]

## Legat

- [[MOC Git si Workflow]] — CI/CD pleacă de la git
- [[MOC Securitate]]

## De învățat #question

- [ ] GitHub Actions: cache, matrix, reusable workflows
- [ ] IaC: merită Terraform la scara la care lucrez?
- [ ] Log aggregation ieftin pentru proiecte mici
- [ ] Backup & restore — testat, nu presupus
