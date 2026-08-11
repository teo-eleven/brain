---
tags: [note, ai, arhitectura]
created: 2026-08-11
type: note
status: schelet
---

# Eșecul tăcut în sisteme AI

> [!warning] Schelet — de completat de tine
> Contextul și legăturile le-am pus eu. Ideea trebuie s-o scrii tu, altfel nu rămâne.
> Vezi [[Cum scriu o nota permanenta]].

## De ce e aici

**Aceeași greșeală, în trei straturi diferite, în trei zile consecutive:**

| Când        | Unde                | Cum arăta                                                                                                   |
| ----------- | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| 10.08       | `extract.py`        | `or []` și `except` blanket → extracție eșuată devenea rezultat gol, raportat ca succes                     |
| 11.08 dim.  | `litellm_client.py` | `update_current_*` apelat după închiderea span-ului → **no-op tăcut**, codul „scria" în trace fără să scrie |
| 11.08 prânz | harness QA          | verde raportat pe două semnale din §5 **care nu se pot verifica**                                           |

Nu sunt trei bug-uri. E un tipar.

## De răspuns

- Ce au în comun cele trei? De ce apare tocmai în sisteme AI mai des decât în cod obișnuit?
- Când e legitim un fallback tăcut și când e minciună? Unde e linia?
- Cum detectezi clasa asta **înainte** de producție — ce test o prinde?
- De ce e mai grav într-un sistem de _evaluare_ decât într-unul de producție?

## Legat

- [[Validarea output-ului LLM]] — regula de aur, aceeași familie
- [[Observability - logs metrics traces]] — nu poți vedea ce nu emiți
- [[Metrici pentru agenti AI]] — „integritatea execuției" măsoară exact asta
- [[Ce nu merita testat]] — și, prin contrast, ce trebuie testat obligatoriu
