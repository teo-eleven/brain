---
tags: [python, types]
created: 2026-08-06
type: permanent
---

# Python type hints

## Ideea

Type hints nu sunt verificate la runtime de Python. Sunt adnotări citite de tool-uri: mypy, pyright, IDE-ul tău, Pydantic, FastAPI. Python rulează la fel cu sau fără ele.

Deci valoarea lor e: **documentație care nu poate rămâne obsoletă**, pentru că un checker urlă când se desincronizează de cod.

## De ce contează

Fără hints, ca să afli ce primește o funcție trebuie să-i citești corpul. Cu hints, semnătura e contractul. La 3 luni de la scriere, tu ești un colaborator străin al propriului cod.

## Exemplu

```python
from typing import Iterable

def total_facturi(facturi: Iterable[Factura]) -> Decimal:
    return sum((f.valoare for f in facturi), Decimal("0"))
```

Ce am câștigat: știi că poți da un generator (nu doar listă), și că rezultatul e `Decimal`, nu `float` — detaliu care în cod financiar e diferența între corect și greșit.

## Capcane

- **Nu validează nimic la runtime.** `def f(x: int)` acceptă bucuros un string. Dacă vrei validare reală la graniță, ai nevoie de [[Pydantic - validare la boundary]].
- `Optional[X]` înseamnă `X | None`, nu „parametru opțional". Confuzia asta e clasică.
- Adnotarea `Any` e echivalentul lui a nu adnota — vezi [[unknown vs any]] pentru problema identică în TypeScript.
- Hints prea complicate sunt un semnal că funcția face prea multe.

## Practic

- `X | None` în loc de `Optional[X]` (Python 3.10+), `list[str]` în loc de `List[str]` (3.9+)
- Rulează `mypy` sau `pyright` în CI, altfel hints-urile mint în liniște

## Legături

- Face parte din: [[MOC Python]]
- Validare reală: [[Pydantic - validare la boundary]]
- Echivalent TS: [[TypeScript type vs interface]]
