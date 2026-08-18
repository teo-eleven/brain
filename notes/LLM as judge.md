---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# LLM as judge

## De ce e aici

La extracția pe schemă configurabilă, o parte din metrici se verifică
determinist (câmp cu câmp față de ground truth) — completitudine, task success
pe valori exacte. Dar hallucination rate (prag ≤ 1%) și „e răspunsul ăsta
echivalent semantic cu adevărul?" nu se rezolvă cu `==`. Acolo intră un model
care judecă.

Contextul e cel din 11.08: harness-ul raportase deja VERDE pe semnale care nu se
pot verifica. Un judge prost pus e exact același tip de eșec, doar mai greu de
văzut — pare că ai măsurat ceva.

## Ce trebuie știut

**Determinist întâi, judecată doar unde nu se poate altfel.** Dacă valoarea
corectă e „1234,56" și modelul a scris „1234.56", asta e normalizare, nu
judecată. Regula: epuizezi comparațiile mecanice (exact match, normalizare,
regex, validare de schemă) și abia ce rămâne merge la judge. Fiecare metrică
mutată la judge e o metrică cu zgomot în plus.

**Cine judecă judecătorul.** Un judge se validează pe un set de cazuri cu
verdict uman cunoscut — inclusiv cazuri unde răspunsul corect e „fail". Dacă
judge-ul nu prinde eșecurile pe care le-ai marcat manual, nu e folosibil.
Acordul cu omul e el însuși o metrică, măsurată periodic.

**Ce model ca judge:** de regulă altul decât cel evaluat, sau cel puțin nu
aceeași instanță/prompt. Un model care se judecă pe sine e indulgent.

**Bias-uri documentate:**

- răspunsuri lungi punctate mai bine decât cele scurte și corecte;
- preferință pentru propriul stil de scriere;
- ordinea opțiunilor contează la comparații A/B (schimbă ordinea și rulează de
  două ori);
- indulgență la scoruri intermediare — rubricile cu 5 trepte se aglomerează la 3-4.

**Setup minim:** `temperature=0`, rubrică explicită cu criterii binare, cere
motivarea ÎNAINTE de verdict, verdict din vocabular închis (nu scor liber).

## Ce s-a întâmplat când judecătorul a fost validat (12.08)

Validarea din paragraful „cine judecă judecătorul" **s-a făcut** — pe judecătorul
de fidelitate a transcrierii câmpului „denumire", 15 rulări judecabile din 20,
cu verdict cunoscut. Rezultatul:

| Ce                      | Cât                                                                 |
| ----------------------- | ------------------------------------------------------------------- |
| recall                  | **50%** (TP 2, FN 2) — a ratat jumătate din rulările cu defect real |
| precizie                | **40%** (TP 2, FP 3) — a inventat mai multe defecte decât a găsit   |
| acord pe clasa greșelii | **0 din 4**                                                         |

Deci exact eșecul descris teoretic: un judecător care nu prinde ce ai marcat
manual **nu e folosibil ca prag**. Ce s-a făcut în loc de a-l arunca: rămâne
afișat, dar ca **scor orientativ, cu rezultatul validării scris lângă el** în
interfață. Motivul e important — un scor de 1.000 arătat singur ar fi ascuns
exact defectul pe care validarea l-a găsit. Vezi
[[Esecul tacut in sisteme AI]].

**Al doilea judecător, ținut oprit deliberat.** Platforma (Langfuse) poate rula
propriul evaluator LLM peste fiecare observație. Regula lui e creată
**dezactivată**, din două motive care se adună: costă la fiecare rulare, și doi
judecători care scriu scoruri pe aceleași trace-uri produc două surse de adevăr
care nu se potrivesc. Judecător activ: unul singur, DeepEval, în harness.

Lecția generală: **un judecător nevalidat și un judecător validat-și-picat nu se
tratează la fel.** Primul e necunoscut, al doilea e o măsurătoare cunoscută ca
slabă — și poate rămâne în interfață, dacă slăbiciunea lui e afișată cu el.

## De răspuns

- Care metrici din setul actual sunt deterministe și care ar avea nevoie de
  judge? Am făcut lista explicit sau am presupus?
- Ce model folosesc ca judge dacă tot stack-ul merge pe Gemini 3 Flash prin
  LiteLLM — merită un model mai scump doar pentru judecată?
- ~~Am un set de verdicte umane pe care să validez judge-ul?~~ — da, s-a
  construit și s-a rulat (12.08). Întrebarea nouă: **15 rulări sunt destule ca
  să declari un judecător nefolosibil?** Cu 4 cazuri pozitive, un singur caz
  mutat schimbă recall-ul cu 25 de puncte.
- Cum intră costul judge-ului în bugetul total de evaluare (rulez pe fiecare caz
  la fiecare rundă)?
- Ce fac când judge-ul și verificarea deterministă nu sunt de acord — cine câștigă?
- Un judecător cu recall 50% merită reparat (prompt, model, rubrică) sau înlocuit
  cu o verificare deterministă mai bună? Fidelitatea transcrierii chiar cere
  judecată, sau e normalizare mascată?

## Legat

- [[Ground truth pentru evaluare]]
- [[Metrici pentru agenti AI]]
- [[Validarea output-ului LLM]]
- [[DeepEval - evaluare automata]]
- [[promptfoo - teste pe prompturi]]
- [[Fluxul zilnic de evaluare]]
- [[Esecul tacut in sisteme AI]] — de ce scorul se afișează cu validarea lui lângă
- [[Langfuse - tracing pentru LLM]] — unde ar rula al doilea judecător, ținut oprit
