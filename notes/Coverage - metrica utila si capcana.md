---
tags: [testing, metrics]
created: 2026-08-06
type: permanent
---

# Coverage - metrica utila si capcana

## Ideea

Coverage măsoară ce linii **s-au executat** în timpul testelor. Nu măsoară ce s-a **verificat**.

```python
def test_creeaza():
    creeaza_factura(date)     # 100% coverage pe funcție
                              # zero assert. testul nu poate eșua.
```

Testul de mai sus dă coverage complet și valoare zero. Coverage-ul nu poate distinge între ăsta și un test bun.

## Ce e util la coverage

E un detector de **absență**, nu un certificat de calitate:

- Un raport care arată 20% pe modulul de calcul al taxelor → există un risc real, evident.
- Un fișier cu 0% → nimeni nu l-a testat niciodată.
- **Coverage diferențial** pe un PR („codul nou e acoperit?") e mult mai util decât procentul global.

Citește-l ca „unde n-am fost deloc", nu ca „cât de bine am testat".

## Capcana lui 100%

Ultimele 15% costă disproporționat și acoperă cod care aproape nu contează: getteri, `__repr__`, ramuri de eroare imposibile, cod de logging. Efortul ar fi mai bine investit în cazuri limită pe cele 85% deja „acoperite".

Un prag de 100% obligatoriu produce teste scrise **pentru metrică**, nu pentru corectitudine. Ăsta e legea lui Goodhart aplicată la testare: când o măsură devine țintă, încetează să fie o măsură bună.

## Praguri rezonabile

| Cod | Țintă |
|---|---|
| Logică de business, calcule, bani | 90%+ |
| API / servicii | 80% |
| Glue code, config, DTO-uri | oricât iese |
| Global | ~80%, ca semnal, nu ca poartă rigidă |

Un CI care blochează la scăderea coverage-ului pe **codul nou** e mai util decât unul care cere un prag global.

## Ce măsoară mai bine calitatea testelor

**Mutation testing** (`mutmut`, `cosmic-ray`, Stryker): schimbă intenționat codul (`>` → `>=`, `+` → `-`) și verifică dacă vreun test observă. Dacă poate strica logica fără să apară roșu, testele tale nu verifică nimic.

E lent și nu-l rulezi la fiecare commit, dar o rulare pe modulul critic e revelatoare.

## Legături

- Face parte din: [[MOC Testare]]
- [[Ce nu merita testat]] · [[Piramida testelor]]
- [[pytest cheatsheet]]
