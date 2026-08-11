---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# Esecul tacut in sisteme AI

## De ce e aici

Trei zile consecutive, trei bug-uri diferite, aceeași temă: sistemul raporta
verde peste ceva care nu funcționa. Toate au apărut în infrastructura de
evaluare a agentului „Extracție documente" (PDF → date structurate pe schemă
configurabilă), pe stack-ul LiteLLM → Gemini 3 Flash, cu Langfuse pentru trace.

| #   | Când                    | Unde                                                                                   | Cum arăta                                                                                                                                                                                                   |
| --- | ----------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 10.08, commit `5760a64` | `max_tokens=16384` hardcodat; Gemini 3 Flash consumă thinking tokens din același buget | JSON tăiat la mijloc, `finish_reason=length`, parse fail înghițit de `or []` și un `except` blanket → succes raportat cu rezultat gol                                                                       |
| 2   | 11.08, commit `b1c56f6` | drop-in-ul `langfuse.openai` închide span-ul când `create()` se întoarce               | orice `update_current_*` de după e NO-OP tăcut: codul pare că scrie în trace, nu scrie nimic. Tokenii și `finish_reason` existau doar în logurile Celery → 2 din 4 metrici PRIMARY nemăsurabile programatic |
| 3   | 11.08                   | harness-ul de evaluare                                                                 | raporta VERDE pe două semnale care nu se pot verifica deloc                                                                                                                                                 |

Fixuri, pe rând: `max_tokens` scos (default = maximul modelului, override prin
`LLM_MAX_OUTPUT_TOKENS`), `LLM_REASONING_EFFORT=low`, `finish_reason` expus pe
toate căile, bisecție recursivă pe secțiuni la output trunchiat, fail loudly;
span părinte `llm_call` în `_create_completion` ca punct unic; semnalele
neverificabile nu mai au voie să raporteze pass, iar bugetul de pași primește
starea explicită „nu se aplică".

## Ideea

Un sistem AI preferă să pară că merge decât să recunoască ce nu știe. Modelul
completează, codul din jur înghite excepția, iar raportul iese verde. Nu e o
eroare de model — e o alegere de design în codul din jurul lui.

Într-o infrastructură de evaluare asta e forma cea mai gravă. Un evaluator care
minte nu produce doar un rezultat greșit, ci încredere nejustificată: mai
departe iei decizii pe baza unui semnal care nu există. Un test care nu poate
eșua nu e test.

Trei tipare de recunoscut:

- **Default care ascunde**: `or []`, `except Exception: pass`, valori goale
  tratate ca valide.
- **Instrumentare care nu instrumentează**: apelul se face, dar nu ajunge nicăieri.
- **Verde pe semnal inexistent**: metrică raportată pass fără să existe date
  care s-o susțină. Aici „nu se aplică" e răspunsul corect, nu „pass".

## De răspuns

- Cum detectez a patra apariție înainte să o găsesc din întâmplare? Există un
  test care verifică faptul că metricile chiar au sursă de date?
- Ce ar trebui să însemne „nu se aplică" în raportul final — pass, fail, sau o
  a treia stare care blochează publicarea rezultatului?
- Câte dintre `except`-urile din codul agentului sunt acolo pentru robustețe și
  câte pentru că cineva nu voia să vadă eroarea?
- Se poate scrie o regulă mecanică (lint, test, hook) care interzice `or []` /
  `except` blanket pe căile de parsare?
- Dacă un evaluator poate minți, cine evaluează evaluatorul și cât de des?

## Legat

- [[Reasoning tokens si bugetul de output]]
- [[Tracing LLM - spans si context]]
- [[Validarea output-ului LLM]]
- [[Metrici pentru agenti AI]]
- [[Cum citesc un trace]]
- [[QA AI Agent]]
- [[MOC AI Engineer]]
