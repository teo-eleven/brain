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
| 4   | 12.08, fără commit      | platforma de evaluare (Langfuse) + stratul de afișare                                  | **absența execuției nu producea niciun semnal**: dataset publicat (18 items), dar 0 rulări de dataset, 0 reguli de evaluare, 0 scoruri de la un evaluator automat. Configurarea exista, execuția nu         |

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
- **Configurare confundată cu execuție** (adăugat 12.08): dataset publicat,
  evaluator definit, coadă creată — și zero rulări. Nimic nu semnalizează
  absența, fiindcă „nu s-a întâmplat nimic" nu produce niciun artefact. Primele
  trei tipare mint despre un rezultat; ăsta lasă impresia de acoperire acolo
  unde nu s-a măsurat nimic.

## Cum a fost găsită a patra (12.08)

Nu de un test, ci **punând inventarul pe ecran**. Un test verifică ce te-ai
gândit să întrebi; a patra formă exista tocmai fiindcă nimeni nu formulase
întrebarea „dar rulează ceva din ce am configurat?". Panoul care listează
dataset, rulări și evaluatori a răspuns la ea în momentul în care a existat.

De aici, regula de afișare aplicată în tablou: **un „0" nu se arată verde.**
Fiecare cifră are trei stări distincte — valoare citită, **zero cu motivul
scris lângă**, și „?" separat pentru „n-am putut citi". Ultimele două confundate
sunt exact tiparul din tabel, mutat în interfață: un panou gol și liniștit spune
„totul e în regulă" despre ceva ce n-a fost măsurat.

Corolar din aceeași zi: judecătorul automat afișat **cu rezultatul validării
lui lângă**, nu singur. Vezi [[LLM as judge]] — validat, ratează jumătate din
defectele reale, deci un scor de 1.000 arătat fără context ar fi fost a cincea
apariție.

## De răspuns

- ~~Cum detectez a patra apariție înainte să o găsesc din întâmplare?~~ —
  răspuns parțial pe 12.08: **prin inventar vizibil, nu prin test.** Rămâne
  întrebarea mai grea: ce inventar _nu_ am pus încă pe ecran?
- Există un test care verifică faptul că metricile chiar au sursă de date?
- Se poate verifica mecanic „configurat, dar niciodată rulat"? Un check care
  compară ce e definit în platformă cu ce are execuții în ultimele N zile.
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
