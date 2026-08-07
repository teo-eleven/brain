---
tags: [git, ref]
created: 2026-08-06
type: cheatsheet
---

# Git cheatsheet

## Zilnic

```bash
git status -sb                      # scurt, cu info de branch
git switch -c feature/x             # ramură nouă (modern, în loc de checkout -b)
git switch main                     # schimbă ramura
git add -p                          # stage interactiv, pe bucăți — cel mai util add
git commit -m "feat: ..."           # vezi [[Conventional commits]]
git push -u origin feature/x        # prima dată, setează upstream
```

## Ce am făcut / ce s-a schimbat

```bash
git log --oneline --graph --all -20
git log -p -- cale/fisier.py        # istoricul unui fișier, cu diff
git log -S "numeFunctie"            # commit-urile care au ADĂUGAT/ȘTERS acest text
git blame cale/fisier.py            # cine a scris fiecare linie
git diff                            # nestaged
git diff --staged                   # staged
git diff main...HEAD                # tot ce aduce ramura mea
```

`git log -S` (pickaxe) e subutilizat: găsește când a apărut o linie de cod.

## Anulări (de la blând la brutal)

```bash
git restore fisier.py               # aruncă modificările din working tree
git restore --staged fisier.py      # unstage, păstrează modificările
git commit --amend                  # modifică ultimul commit (NU dacă e pushed)
git revert <hash>                   # commit nou care anulează — sigur pe ramuri partajate
git reset --soft HEAD~1             # șterge commitul, PĂSTREAZĂ modificările staged
git reset --mixed HEAD~1            # șterge commitul, păstrează în working tree
git reset --hard HEAD~1             # șterge tot. recuperabil doar prin reflog
```

## Salvare temporară

```bash
git stash push -m "wip login"
git stash list
git stash pop                       # aplică și șterge
git stash apply stash@{1}           # aplică, păstrează în listă
git stash -u                        # include fișiere untracked
```

## Sincronizare

```bash
git fetch --all --prune             # aduce tot, curăță ramurile șterse remote
git pull --rebase                   # fără merge commit inutil
git rebase main                     # actualizează ramura mea (vezi [[Merge vs rebase]])
git merge --no-ff feature/x         # integrează păstrând contextul
```

## Salvarea

```bash
git reflog                          # tot ce a făcut HEAD → vezi [[Git reflog te salveaza]]
git reset --hard ORIG_HEAD          # anulează ultimul merge/rebase
git bisect start                    # vezi [[Git bisect]]
git fsck --lost-found               # commit-uri orfane
```

## Curățenie

```bash
git branch --merged main            # ramuri deja integrate
git branch -d feature/x             # șterge local (sigur)
git push origin --delete feature/x  # șterge remote
git clean -nd                       # DRY RUN: ce fișiere untracked s-ar șterge
git clean -fd                       # șterge-le (ireversibil)
```

Rulează **mereu** `git clean -nd` înainte de `-fd`.

## Config util

```bash
git config --global pull.rebase true
git config --global init.defaultBranch main
git config --global alias.lg "log --oneline --graph --all -20"
git config --global core.autocrlf input      # Windows: LF în repo, CRLF local
```

## Legături

- [[MOC Git si Workflow]] · [[Merge vs rebase]] · [[Conventional commits]]
- [[Git bisect]] · [[Git reflog te salveaza]] · [[Branching strategies]]
