---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# Pydantic v2 - validare la boundary

## Ce e

Validare de date pe bază de type hints, cu nucleul rescris în Rust în v2 —
suficient de rapid încât să nu ai scuza „e prea scump să validez".

Ideea centrală: **validezi la marginea sistemului**. Ce intră din exterior
(request HTTP, răspuns de API, fișier, output de LLM) trece printr-un model. Ce
circulă în interior e deja tipizat și de încredere. Fără asta, fiecare funcție
ajunge să verifice defensiv aceleași lucruri.

Ce folosesc efectiv:

- `model_validate(data)` — dintr-un dict/obiect; `model_validate_json(s)` direct
  din string JSON, fără `json.loads` intermediar.
- `Field(...)` — constrângeri și metadata: `ge`, `le`, `min_length`, `pattern`,
  `description` (ajunge în OpenAPI **și** în schema de tool).
- validatori: `@field_validator` pentru un câmp, `@model_validator` pentru
  reguli între câmpuri.
- `pydantic-settings` — `BaseSettings` citește configul din env și îl validează
  la pornire. Aplicația crapă la boot cu mesaj clar, nu la ora 3 noaptea cu
  `None` într-un câmp.

## Unde apare la mine

Pydantic v2 e peste tot în `ecf_app_web-doc_extract_studio`: request/response
models în FastAPI, config din env, și — partea care contează cel mai mult —
**schema de ieșire a extracției**.

### De ce contează special la output de LLM

Un model de limbaj nu are contract. Poate returna JSON valid cu câmpuri lipsă,
JSON cu tipuri greșite, JSON înfășurat în ` ```json `, sau JSON **tăiat la
jumătate** — cazul meu real, când `max_tokens=16384` se consuma pe thinking
tokens și `finish_reason` ieșea `length`.

Bug-ul n-a fost că parsarea a eșuat. Bug-ul a fost că eșecul a fost **înghițit**:
un `except` blanket plus un `or []` transformau JSON-ul tăiat în „am extras zero
secțiuni". Sistemul raporta succes pe date pierdute.

Regula pe care am scos-o de acolo: `model_validate_json()` care aruncă
`ValidationError`, prinsă **explicit**, logată cu payload-ul brut și cu
`finish_reason`, și tratată ca eroare — niciodată ca listă goală.

## Comenzi

```python
from pydantic import BaseModel, Field, ValidationError

class Sectiune(BaseModel):
    titlu: str = Field(min_length=1)
    pagina: int = Field(ge=1)

try:
    s = Sectiune.model_validate_json(raw)
except ValidationError as e:
    log.error("output LLM invalid", extra={"raw": raw, "finish": finish_reason})
    raise
```

## De răspuns

- Câte locuri mai am unde output-ul modelului ajunge în cod fără `model_validate`?
- `or []` și `except Exception` — unde mai apar în repo-ul de extracție?
- Merită un retry automat pe `ValidationError`, sau asta doar ascunde iar
  problema în spatele unui cost dublu?
- Configul din env e validat integral la boot, sau unele variabile sunt citite
  lazy, târziu?

## Cum învăț asta

**Documentație:** https://docs.pydantic.dev

**Primul pas practic** (30 de minute):

1. `pip install pydantic` și scrie un `class Sectiune(BaseModel)` cu
   `titlu: str = Field(min_length=1)` și `pagina: int = Field(ge=1)`.
2. `Sectiune.model_validate({"titlu": "Intro", "pagina": 1})` — trece.
3. `Sectiune.model_validate({"titlu": "", "pagina": "x"})` într-un `try` și
   printează `e.errors()` — vezi lista de dict-uri cu `loc`, `type`, `msg`.

**Ordinea în care merită citit:**

| Etapă | Ce                                                      | De ce în ordinea asta                                        |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------ |
| 1     | Modele + `Field` + forma lui `ValidationError`          | Fără să știi cum arată eroarea nu poți loga util             |
| 2     | `@field_validator` / `@model_validator`                 | Regulile între câmpuri vin după ce tipurile stau în picioare |
| 3     | `model_validate_json` pe output de LLM + `BaseSettings` | Cazurile reale murdare, unde validarea chiar te salvează     |

**Capcana de începător:** prinzi `ValidationError` într-un `except Exception`
și întorci `[]` sau `None` — parsarea eșuată devine „zero rezultate", sistemul
raportează succes pe date pierdute și nu ai nici măcar payload-ul brut în log.

## Legat

- [[Validarea output-ului LLM]]
- [[Esecul tacut in sisteme AI]]
- [[Reasoning tokens si bugetul de output]]
- [[FastAPI - API async]]
- [[Tool use - function calling]]
- [[MOC Stack AI]]
