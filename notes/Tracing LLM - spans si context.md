---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# Tracing LLM - spans si context

## De ce e aici

11.08, commit `b1c56f6`. Drop-in-ul `langfuse.openai` (înlocuiești importul și
gata, ai tracing) își închide span-ul în momentul în care `create()` se
întoarce. Orice `update_current_generation` / `update_current_span` scris DUPĂ
apel e NO-OP tăcut: codul pare că scrie în trace, nu scrie nimic, nu aruncă
nimic.

Consecință concretă: numărul de tokeni și `finish_reason` existau doar în
logurile Celery, deci 2 din cele 4 metrici PRIMARY nu se puteau măsura
programatic. Harness-ul citea trace-ul și găsea câmpuri goale.

Fix: span părinte `llm_call` creat în `_create_completion` — punctul unic prin
care trec TOATE apelurile la model. Atributele se atașează pe span-ul părinte,
care e încă deschis când apelul intern s-a terminat.

## Ce trebuie știut

**Ierarhia:** trace = o execuție completă (un document extras); span = o etapă
(pregătire prompt, apel, parsare, validare); generation = span specializat
pentru un apel la model, cu prompt, răspuns, tokeni, cost, model, latență.

**Instrumentarea automată nu ajunge pentru un agent.** Ea vede apeluri HTTP
izolate. Un agent are buclă, decizii, retry-uri, iterații. Ce vrei să vezi în
trace e povestea execuției, nu lista de request-uri. Diferența dintre „3 apeluri
la model" și „3 iterații din care a doua a fost un retry după parse fail" e
exact ce te interesează.

**Punctul unic de trecere.** Dacă orice apel la model trece prin aceeași
funcție, ai un singur loc unde deschizi span-ul, atașezi metadata și închizi.
Fără el, instrumentarea se împrăștie în N locuri și oricare poate fi uitat.

**Cum verifici că un span chiar s-a scris:** nu te uita în cod, te uiți în
Langfuse. Un test de instrumentare care rulează un caz și apoi CITEȘTE trace-ul
verificând că există câmpurile obligatorii (tokeni, `finish_reason`, model) e
singurul care prinde un NO-OP tăcut.

## De răspuns

- Există deja un test care citește înapoi trace-ul și verifică prezența
  câmpurilor, sau verificarea e încă manuală?
- Ce alte biblioteci din stack au același comportament de auto-close pe care
  documentația nu-l spune explicit?
- Ce metadata ar trebui obligatorie pe fiecare `llm_call`, ca listă fixă
  refuzată la lipsă?
- Cum leg un trace de cazul de test din dataset, ca să pot sări din raport
  direct în execuția care a eșuat?
- Cât cost și latență adaugă tracing-ul complet și contează la scara la care
  rulez?

## Legat

- [[Esecul tacut in sisteme AI]]
- [[Langfuse - tracing pentru LLM]]
- [[Cum citesc un trace]]
- [[Metrici pentru agenti AI]]
- [[Tool use - function calling]]
- [[MOC Stack AI]]
