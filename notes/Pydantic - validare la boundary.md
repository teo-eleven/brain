---
tags: [python, validation, pydantic]
created: 2026-08-06
type: permanent
---

# Pydantic - validare la boundary

## Ideea

Validezi **o dată, la granița sistemului**, și în interior lucrezi cu obiecte despre care ai garanția că sunt valide. Granițele sunt: request HTTP, răspuns de la un API extern, fișier încărcat, variabile de mediu, output de LLM.

Pydantic transformă „sper că are câmpul `email`" în „obiectul ăsta ARE `email`, altfel n-ar exista".

## De ce contează

Alternativa e validare împrăștiată: `if "email" in data` prin 12 locuri, fiecare puțin diferit, unele lipsă. Bug-urile apar exact în cele lipsă.

[[Python type hints]] nu validează nimic la runtime. Pydantic e piesa care le face să conteze real.

## Exemplu

```python
class FacturaIn(BaseModel):
    numar: str = Field(min_length=1, max_length=32)
    valoare: Decimal = Field(gt=0)
    email_client: EmailStr
    data: date

# La graniță: ori primești un obiect valid, ori o eroare 422 clară.
def creeaza(payload: FacturaIn) -> Factura: ...
```

De la linia asta încolo, în tot codul, `payload.valoare` e sigur un `Decimal` pozitiv. Nu mai verifici niciodată.

## Capcane

- **Nu valida de 5 ori în interior.** Odată la graniță, apoi ai încredere. Validarea repetată e cost fără câștig.
- Mesajele de eroare Pydantic sunt bune pentru dezvoltator, nu pentru utilizator final. Le mapezi în ceva uman în stratul de UI.
- Pydantic v1 vs v2 au API-uri diferite (`.dict()` → `.model_dump()`, validatori diferiți). Verifică versiunea înainte să copiezi cod de pe net.
- `Decimal` pentru bani, mereu. `float` pentru bani e un bug care apare la a 1000-a factură.

## Legături

- Face parte din: [[MOC Python]]
- [[Python type hints]] · [[Dataclass vs Pydantic model]]
- Aplicat critic: [[Validarea output-ului LLM]]
- Echivalent la ieșire: [[XSS]] (escape la boundary-ul de output)
