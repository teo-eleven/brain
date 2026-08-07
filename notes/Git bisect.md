---
tags: [git, debugging]
created: 2026-08-06
type: permanent
---

# Git bisect

## Ideea

Căutare binară prin istoricul git ca să găsești commit-ul care a introdus un bug. 1000 de commit-uri → **10 verificări**, nu 1000.

## Cum

```bash
git bisect start
git bisect bad                  # HEAD e rupt
git bisect good v1.4.0          # aici mergea

# git te pune pe un commit din mijloc. Testezi.
git bisect good     # sau: git bisect bad
# ... repetă ~log2(n) ori

git bisect reset                # revine unde erai
```

La final git îți spune exact commit-ul vinovat.

## Automat — aici devine puternic

```bash
git bisect start HEAD v1.4.0
git bisect run pytest tests/test_facturi.py::test_total
```

`git bisect run` rulează comanda pe fiecare pas: exit 0 = good, non-zero = bad. Pleci de la calculator și te întorci la răspuns.

Convenția pentru `bisect run`: exit **125** înseamnă „nu pot testa acest commit" (build rupt) — git îl sare în loc să-l marcheze bad.

## Când e cel mai util

- „Mergea săptămâna trecută" și nu ai idee ce s-a schimbat
- Regresie de performanță (scriptul poate măsura timpul și întoarce non-zero peste un prag)
- Bug apărut după un merge cu 50 de commit-uri

## Ce îl face să funcționeze bine

**Commit-uri mici și atomice.** Dacă un commit are 40 de fișiere, bisect te duce la el și tot nu știi ce anume l-a rupt. Vezi [[Conventional commits]].

**Fiecare commit trebuie să compileze.** Un istoric cu commit-uri intermediare rupte face bisect frustrant — de aici valoarea unui `rebase -i` care curăță înainte de push, vezi [[Merge vs rebase]].

## Capcane

- Uită `git bisect reset` și rămâi într-un detached HEAD, confuz.
- Cu un bug intermitent, bisect te minte: un „good" fals te trimite în ramura greșită a căutării. Asigură-te că testul e deterministic înainte.
- Dacă `main` are merge commits din feature branches, bisect intră și în ele — de obicei util, uneori confuz. `--first-parent` limitează la commit-urile de pe main.

## Legături

- Face parte din: [[MOC Git si Workflow]]
- [[Debugging metodic]] — bisect e căutare binară aplicată la timp
- [[Git reflog te salveaza]] · [[Git cheatsheet]] · [[Conventional commits]]
