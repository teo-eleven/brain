---
tags: [python, performance]
created: 2026-08-06
type: permanent
---

# Generator vs list comprehension

## Ideea

- `[x for x in ...]` → construiește **toată lista în memorie**, acum.
- `(x for x in ...)` → construiește un **generator**, care produce elementele unul câte unul, la cerere.

Diferența e o singură pereche de paranteze și un ordin de mărime în consum de memorie.

## De ce contează

Citește un CSV de 2 GB cu list comprehension → procesul moare. Cu generator → merge cu 50 MB RAM.

```python
# 2 GB în RAM
linii = [l for l in open("export.csv")]

# constant, indiferent de mărime
linii = (l for l in open("export.csv"))
total = sum(1 for _ in linii)
```

## Când alegi lista

- Ai nevoie de `len()`
- Parcurgi de mai multe ori (**un generator se consumă o singură dată** — a doua iterație dă zero elemente)
- Ai nevoie de indexare `x[3]`
- Datele sunt mici și clar mărginite

## Capcane

- **Generatorul consumat e cea mai frecventă surpriză.** Îl treci printr-un `sum()`, apoi printr-un `max()` — al doilea primește gol, fără eroare.
- Un generator care ține deschis un fișier / o conexiune ține resursa ocupată cât trăiește.
- `sum(x for x in y)` nu are nevoie de paranteze duble — Python permite forma scurtă când generatorul e singurul argument.

## Legături

- Face parte din: [[MOC Python]]
- Aceeași idee la scală: [[Paginare - cursor vs offset]] — nu încarci tot
- [[Python type hints]] — adnotează cu `Iterator[X]`, nu `list[X]`
