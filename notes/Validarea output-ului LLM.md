---
tags: [ai, llm, security, validation]
created: 2026-08-06
type: permanent
---

# Validarea output-ului LLM

## Regula

**Output-ul unui LLM e input de utilizator, nu date structurate de încredere.** Îl validezi la fel de strict ca un formular completat de un străin ostil.

Nu conteaza cât de bine merge în 100 de teste. Al 101-lea răspuns va avea un câmp lipsă, un `null` neașteptat, un JSON cu text explicativ înainte, sau o valoare din afara enumerării.

## Cele trei nivele de validare

**1. Sintactic** — e JSON valid? Parsează.
**2. Schematic** — are câmpurile așteptate, cu tipurile corecte? Pydantic / Zod.
**3. Semantic** — valorile au sens în domeniul tău? `valoare > 0`, `data` nu e în viitor, `cui` există în baza ta.

Nivelul 3 se sare cel mai des și e cel care prinde greșelile plauzibile — un LLM nu inventează un JSON invalid, dar inventează un CUI care arată perfect valid.

```python
class Extractie(BaseModel):
    cui: str = Field(pattern=r"^RO\d{2,10}$")
    total: Decimal = Field(gt=0)
    data: date

    @field_validator("data")
    def nu_in_viitor(cls, v):
        if v > date.today():
            raise ValueError("dată în viitor")
        return v
```

## Structured output nu elimină validarea

API-urile moderne pot **forța** o schemă JSON. Asta rezolvă nivelele 1 și 2 — foarte util, folosește-l mereu. Dar nivelul 3 rămâne integral al tău: schema garantează că `total` e un număr, nu că e numărul corect.

## Ce faci la eșec

Ordinea, de la ieftin la scump:

1. **Retry cu eroarea în prompt** — „JSON-ul tău a eșuat validarea: `total` trebuie > 0. Corectează." Rezolvă majoritatea cazurilor.
2. **Retry cu temperature mai mică** sau model mai capabil — vezi [[Cost-aware model routing]]
3. **Fallback determinist** — regex, parser clasic, valoare default
4. **Escaladare la om** — pentru date critice (financiare, medicale, juridice), asta nu e o rușine, e designul corect

**Maxim 2-3 retry-uri.** O buclă nelimitată de retry e o factură nelimitată.

## Securitate

- **Nu executa niciodată** cod, SQL sau comenzi generate de LLM fără sandbox și listă albă. Vezi [[SQL injection]].
- Output-ul afișat în HTML trebuie escapat — un LLM poate produce `<script>`, mai ales dacă input-ul îl instruia să o facă. Vezi [[XSS]].
- **Prompt injection**: dacă LLM-ul citește conținut din exterior (email, pagină web, PDF încărcat), acel conținut poate conține instrucțiuni. Tratează rezultatul ca provenind de la autorul conținutului, nu de la tine.
- Un LLM cu acces la tool-uri moștenește permisiunile tool-urilor. Dă-i strict minimul. Vezi [[Tool use - function calling]].

## Legături

- Face parte din: [[MOC AI si LLM]] · [[MOC Securitate]]
- [[Pydantic - validare la boundary]] · [[unknown vs any]]
- [[Evals inainte de prompt changes]] · [[Tool use - function calling]]
