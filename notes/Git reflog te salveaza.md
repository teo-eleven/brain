---
tags: [git]
created: 2026-08-06
type: permanent
---

# Git reflog te salveaza

## Ideea

`git reflog` e un jurnal local al fiecărei poziții pe care a avut-o `HEAD`. Reset-uri, checkout-uri, rebase-uri, merge-uri, amend-uri — tot.

Consecința: **dacă un commit a existat vreodată local, poate fi recuperat**, chiar dacă nicio ramură nu îl mai indică.

## Recuperarea

```bash
git reflog
# a1b2c3d HEAD@{0}: reset --hard HEAD~3
# 9f8e7d6 HEAD@{1}: commit: adaugă export e-Factura   ← ăsta îl vreau
# ...

git reset --hard 9f8e7d6            # revin exact acolo
# sau, mai sigur:
git switch -c recuperare 9f8e7d6    # ramură nouă, fără să pierd starea actuală
```

Varianta cu ramură nouă e preferabilă: nu suprascrie nimic dacă ai greșit commit-ul.

## Ce recuperează

| Situație | Recuperabil |
|---|---|
| `reset --hard` greșit | **da** |
| Rebase catastrofal | **da** — `ORIG_HEAD` sau reflog |
| Commit-uri de pe o ramură ștearsă | **da** |
| `commit --amend` care a înlocuit un commit bun | **da** |
| Modificări nesalvate (necommise) | **nu** — reflog urmărește commit-uri |
| `git stash drop` | parțial — `git fsck --unreachable` uneori |

Linia importantă: **reflog vede doar ce a fost commis.** Un `reset --hard` peste modificări necommise le pierde definitiv. De aici obiceiul: commit des, chiar și „wip" — poți curăța istoricul mai târziu cu `rebase -i`.

## Limitări

- **Local, nu se sincronizează.** Reflogul tău nu ajunge la coleg și invers.
- Expiră: ~90 de zile pentru commit-uri accesibile, ~30 pentru cele orfane. Nu e arhivă.
- Nu e substitut pentru push. Un laptop pierdut ia reflogul cu el.

## Comenzi conexe utile

```bash
git reflog show main            # istoricul unei ramuri anume
git fsck --lost-found           # commit-uri orfane pe care reflogul nu le mai are
git reset --hard ORIG_HEAD      # anulează ultimul merge/rebase
```

## Legături

- Face parte din: [[MOC Git si Workflow]]
- [[Merge vs rebase]] — plasa de siguranță pentru rebase
- [[Git cheatsheet]] · [[Git bisect]]
