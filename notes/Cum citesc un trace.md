---
tags: [note, workflow]
created: 2026-08-11
type: note
status: schelet
---

# Cum citesc un trace

Un trace [[Langfuse - tracing pentru LLM]] se citește în ordine fixă. Dacă sar
peste primul pas, ajung să depanez un prompt care de fapt a fost tăiat.

## Ordinea

### 1. `finish_reason`

Primul lucru, întotdeauna.

- `stop` → modelul a terminat singur. Output-ul e complet.
- `length` / `max_tokens` → output tăiat. Orice concluzie despre calitate e
  invalidă. Cresc bugetul și rulez din nou. Vezi
  [[Reasoning tokens si bugetul de output]].
- `content_filter`, `tool_calls`, `error` → alt drum de investigație.

Un JSON invalid cu `finish_reason: length` nu e o problemă de prompt. E o
problemă de buget.

### 2. Tokeni și cost

Input, output, reasoning (dacă modelul le raportează separat). Aici văd:

- dacă promptul a crescut pe nesimțite (context umflat, documente duplicate);
- dacă reasoning-ul mănâncă bugetul înainte să apuce să scrie răspunsul;
- costul per caz, singura metrică Primary deja acoperită din trace. Vezi
  [[Cost-aware model routing]] și [[Metrici pentru agenti AI]].

### 3. Pașii (spans)

Abia acum mă uit la structura arborelui: ce a apelat ce, în ce ordine, cu ce
latență. Caut:

- pași care se repetă (retry ascuns);
- span-uri cu latență disproporționată;
- input-ul exact primit de model, nu ce cred eu că i-am trimis.

Vezi [[Tracing LLM - spans si context]].

## Cum leg un trace de un caz de test

Fără legătură explicită, un trace e o poveste orfană. Ce folosesc:

- un ID de caz pus în metadata trace-ului la pornire;
- `tags` pentru rulare / branch / versiune de prompt;
- același ID în `runs/` din harness, ca să pot face join după.

[[DeepEval - evaluare automata]] citește trace-ul și scrie scorul înapoi — deci
identificatorul trebuie să existe înainte de scor, nu după.

## Semne că trace-ul minte

- **Span închis prea devreme** → update-urile ulterioare se pierd. Vezi un pas
  „reușit" fără datele care au venit după închidere.
- Trace fără span-uri copil, deși știu că au fost mai mulți pași → context
  pierdut între procese (Celery worker separat, task async).
- Cost 0 sau tokeni 0 la un pas care sigur a chemat modelul → callback ratat.
- Trace duplicat pentru același job → retry care nu apare ca retry.
- Timpi care nu se adună: suma span-urilor mult sub durata totală → lipsesc pași.

Regula: dacă trace-ul contrazice logurile aplicației, întâi cred logurile și
repar instrumentarea.

## De răspuns

- Ce câmp de metadata devine cheia canonică între trace și caz de test?
- Cum detectez automat trace-urile incomplete, înainte să intre în scor?
- Merită un span dedicat pentru validarea post-extracție?
- Ce fac cu trace-urile din rulări invalide: le șterg sau le marchez?
- Câte zile de retenție îmi trebuie ca să pot compara cu baseline-uri vechi?

Legături: [[MOC Stack AI]], [[MOC Operatii zilnice]], [[QA AI Agent]]
