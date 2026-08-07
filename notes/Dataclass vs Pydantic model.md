---
tags: [python, pydantic]
created: 2026-08-06
type: permanent
---

# Dataclass vs Pydantic model

## Ideea

- **`@dataclass`** — structură de date internă. Zero validare, zero dependențe, rapid.
- **`BaseModel`** (Pydantic) — graniță. Validează, convertește tipuri, serializează, generează schemă JSON.

## Arborele de decizie

| Situația | Alege |
|---|---|
| Date care vin din exterior | `BaseModel` |
| Request / response de API | `BaseModel` |
| Config din env | `BaseSettings` |
| Structură internă între funcțiile tale | `@dataclass` |
| Obiect creat de mii de ori într-o buclă | `@dataclass` (mult mai ieftin) |
| Value object imutabil | `@dataclass(frozen=True)` |

## De ce contează

Pydantic are un cost de validare la fiecare instanțiere. Într-o buclă de 100.000 de iterații, asta se vede. Într-un endpoint apelat o dată per request, e invizibil și câștigi siguranța.

Regula: **Pydantic la margini, dataclass în miez.**

## Capcane

- `pydantic.dataclasses.dataclass` există și e o a treia opțiune — dataclass cu validare. Rar necesar; alege una din cele două clare.
- Un `@dataclass(frozen=True)` e imutabil, ceea ce se aliniază cu stilul de a nu muta obiecte existente. Preferă-l ca default pentru value objects.

## Legături

- Face parte din: [[MOC Python]]
- [[Pydantic - validare la boundary]]
- [[Python type hints]]
