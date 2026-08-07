---
tags: [git, convention]
created: 2026-08-06
type: permanent
---

# Conventional commits

## Formatul

```
<tip>(<scop opțional>): <descriere>

<corp opțional>

<footer opțional>
```

Tipuri: `feat` `fix` `refactor` `docs` `test` `chore` `perf` `ci` `build` `style`

```
feat(facturi): adaugă export în format e-Factura

fix(auth): tratează tokenul expirat fără să pice cererea

Tokenul expirat producea 500 în loc de 401 pentru că
excepția de decodare nu era prinsă.

Closes #142
```

## De ce merită

1. **Changelog generat automat** — `feat` și `fix` se grupează singure.
2. **Versionare semantică automată** — `fix` → patch, `feat` → minor, `!` → major.
3. **`git log` devine citibil.** `git log --oneline --grep="^fix"` îți dă toate fixurile.
4. **Te forțează să faci commit-uri coerente.** Dacă nu poți alege un singur tip, commit-ul face prea multe lucruri.

Al patrulea e cel mai valoros și cel mai puțin discutat.

## Breaking changes

```
feat(api)!: schimbă formatul datei în ISO 8601

BREAKING CHANGE: câmpul `data` era `DD.MM.YYYY`, acum e `YYYY-MM-DD`.
```

Fie `!` după scop, fie `BREAKING CHANGE:` în footer. Vezi [[API versioning]].

## Descrierea

- **imperativ**: „adaugă", nu „adăugat" / „am adăugat" (completează „acest commit va...")
- litera mică, fără punct la final
- sub ~72 de caractere
- **de ce**, nu ce. Diff-ul arată *ce* s-a schimbat; mesajul explică *de ce*. Un „fix: corectează calculul" e inutil; „fix: rotunjește TVA la 2 zecimale, altfel totalul diferă de factura tipărită" e util peste 6 luni.

## Capcane

- `chore:` devine coșul de gunoi în care ajunge tot. Dacă ai multe `chore`, probabil sunt de fapt `refactor`, `build` sau `ci`.
- Un commit cu 40 de fișiere și mesaj perfect e încă un commit prost. Convenția nu repară granularitatea.
- Nu adopta unelte de validare (commitlint) înainte să adopți obiceiul — altfel ocolești regula cu `--no-verify`.

## Legături

- Face parte din: [[MOC Git si Workflow]]
- [[Merge vs rebase]] — `rebase -i` curăță mesajele înainte de push
- [[Git bisect]] — commit-uri mici și atomice fac bisect util
- [[API versioning]] · [[Git cheatsheet]]
