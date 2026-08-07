---
tags: [git]
created: 2026-08-06
type: permanent
---

# Merge vs rebase

## Ideea

- **`merge`** — creează un commit nou care unește două istorii. Istoricul e adevărat, dar ramificat.
- **`rebase`** — **rescrie** commit-urile tale peste vârful altei ramuri. Istoric liniar, dar hash-uri noi (deci commit-uri diferite, tehnic).

## Singura regulă care nu se negociază

**Nu faci rebase pe o ramură pe care lucrează altcineva.**

Rebase schimbă hash-urile. Colegul are commit-urile vechi; ale tale sunt „noi" cu același conținut. Următorul lui `pull` produce un istoric duplicat sau un conflict absurd. Pe `main`/`master`, niciodată.

## Practica bună

```bash
# Îți actualizezi ramura de feature (doar a ta) — istoric curat
git switch feature/x
git rebase main

# Integrezi în main — păstrezi contextul că a fost un feature
git switch main
git merge --no-ff feature/x
```

**Rebase pentru a te actualiza, merge pentru a integra.** Asta rezolvă 95% din dezbatere.

## Compromisul real

| | merge | rebase |
|---|---|---|
| Istoric | adevărat, ramificat | curat, liniar |
| `git bisect` | mai greu de citit | ușor — vezi [[Git bisect]] |
| Conflicte | o dată, la merge | posibil la fiecare commit rebazat |
| Siguranță | nedistructiv | rescrie istoria |

## De ce cearta e mai mare decât diferența

Pentru un proiect de 1-3 oameni, ambele funcționează perfect. Costul unei convenții inconsecvente e mai mare decât diferența dintre cele două opțiuni. Alege una, scrie-o în README, treci la treabă.

## Ce merită știut în plus

- `git pull --rebase` (sau `git config pull.rebase true`) evită commit-urile „Merge branch 'main' into main" care apar din pull-uri obișnuite. Merită setat global.
- `git rebase -i` pentru curățarea commit-urilor **înainte** de push: comasezi „fix typo", „wip", „iar typo" într-unul coerent. Foarte util pentru [[Conventional commits]].
- Dacă un rebase merge prost: `git rebase --abort`. Dacă ai deja terminat și regreți: [[Git reflog te salveaza]].
- **Squash merge** la PR dă istoric foarte curat pe main, dar pierde commit-urile intermediare. Bun pentru feature-uri mici, prost pentru cele mari unde pașii contează.

## Legături

- Face parte din: [[MOC Git si Workflow]]
- [[Branching strategies]] · [[Conventional commits]]
- [[Git reflog te salveaza]] · [[Git cheatsheet]]
