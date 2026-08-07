---
tags: [moc, git]
created: 2026-08-06
type: moc
---

# MOC Git si Workflow

Parte din [[MOC Programare]].

## Fundamentele

- [[Merge vs rebase]] — și de ce cearta e mai mare decât diferența
- [[Branching strategies]] — trunk-based vs git flow
- [[Conventional commits]] — mesaje care generează changelog

## Când s-a rupt ceva

- [[Git reflog te salveaza]] — aproape nimic nu e pierdut definitiv
- [[Git bisect]] — găsești commit-ul vinovat în log(n) pași

## Referință

- [[Git cheatsheet]]

## Legat

- [[MOC DevOps si Deploy]] — CI pleacă de la push
- [[ADR 001 - Vault local markdown pe D]] — vaultul ăsta e versionabil
- [[Cum citesc un codebase nou]] — `git log` e prima ta sursă

## De învățat #question

- [ ] `git worktree` — lucrezi pe 2 branch-uri simultan fără stash
- [ ] Hooks locale: pre-commit pentru lint/format
- [ ] Monorepo: merită sau nu la 2-3 proiecte?
- [ ] Squash vs merge commit la PR — ce pierzi din istoric
