---
tags: [note, ai, observability]
created: 2026-08-11
type: note
status: schelet
---

# Tracing LLM — spans și context

> [!warning] Schelet — de completat de tine

## De ce e aici

Bug real, 11.08 (`b1c56f6`): drop-in-ul `langfuse.openai` **își închide span-ul când `create()`
se întoarce**. Orice `update_current_*` apelat după acel moment nu mai are context și devine un
**no-op tăcut** — codul pare că scrie în trace, dar nu scrie nimic.

Soluția: un span **părinte** (`llm_call`) deschis în jurul apelului, care ține contextul viu cât
se procesează răspunsul.

Consecința practică era gravă: tokenii și `finish_reason` existau doar în logurile Celery, deci
2 din 4 metrici Primary nu se puteau măsura programatic — doar cu grep pe logurile containerului.

## De răspuns

- Ce e un span, ce e un trace, cum se imbrică — și de ce contează ordinea de închidere?
- De ce instrumentarea automată (drop-in) nu ajunge pentru un agent?
- Ce trebuie să ajungă pe span ca o metrică să fie calculabilă fără să citești loguri?
- Unde e punctul unic prin care trec toate apelurile? (la tine: `_create_completion`)
- Cum verifici că un span chiar s-a scris, dat fiind că eșecul e tăcut?

## Legat

- [[Observability - logs metrics traces]] — nota-mamă
- [[Esecul tacut in sisteme AI]] — no-op-ul tăcut e exact tiparul ăla
- [[Metrici pentru agenti AI]] — ce nu emiți, nu poți măsura
