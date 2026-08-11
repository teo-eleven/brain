---
tags: [note, workflow]
created: 2026-08-11
type: note
status: schelet
---

# Versionarea prompturilor

Promptul e cod. Dacă schimbă comportamentul sistemului în producție, atunci
intră în git, are versiune și are teste. Altfel e o variabilă globală pe care o
modifică oricine, oricând, fără urmă.

## Regulile

1. **Promptul stă în fișier, în repo.** Nu în baza de date, nu lipit în chat, nu
   într-un câmp de config editabil din UI fără istoric.
2. **Are versiune explicită** — nume de fișier versionat sau câmp de versiune
   trimis mai departe în trace, ca să pot lega scorul de varianta exactă.
3. **Are teste** — un set de cazuri care trebuie să treacă, nu „am încercat și
   părea mai bine".
4. **Se schimbă câte unul o dată**, ca în [[Debugging un prompt]].

## De ce un prompt schimbat fără eval e ghicit

Fără eval, singura dovadă că merge e că a mers pe exemplul la care mă uitam eu.
Asta acoperă un caz din câteva sute. Prompturile au regresii laterale: repari
formatul datelor și strici extragerea cantităților, pentru că ai adăugat o
instrucțiune care concurează cu alta.

Un eval îmi dă exact ce nu îmi dă intuiția: **ce s-a stricat în altă parte**.
Vezi [[Evals inainte de prompt changes]].

## Legătura cu baseline-urile

- `baselines/` = rezultatul acceptat, la o versiune de prompt și de model.
- `runs/` = rularea curentă.
- Comparația celor două e testul de non-regresie.

Reguli practice:

- Baseline-ul e valid doar pentru combinația (prompt, model, set de date). Se
  schimbă unul dintre ele → baseline nou, marcat ca atare.
- Nu actualizez baseline-ul „ca să treacă". Îl actualizez când accept conștient
  un comportament nou și scriu de ce.
- Rulările invalide (stack căzut, proxy jos) nu devin niciodată baseline. Vezi
  [[Fluxul zilnic de evaluare]].

## În CI

`harness.yml` și `promptfoo.yml` rulează la PR și la tag. Ce vreau de la ele:

- PR care atinge un fișier de prompt → rulează evalul, nu doar linting;
- diferența față de baseline apare în PR, nu într-un log pe care nu-l citește
  nimeni;
- pragurile sunt scrise undeva, nu negociate în comentarii.

Vezi [[promptfoo - teste pe prompturi]] și [[DeepEval - evaluare automata]].

## Ce mai versionez pe lângă prompt

- Versiunea de model și parametrii (temperature, max tokens).
- Schema de output așteptată — vezi [[Validarea output-ului LLM]].
- Setul de date de eval și [[Ground truth pentru evaluare]].
- Definiția judecătorului, dacă folosesc [[LLM as judge]].

Un scor comparat între două versiuni de judecător e o comparație falsă.

## De răspuns

- Unde stau fizic prompturile în repo-ul agentului și cine are voie să le modifice?
- Versiunea de prompt ajunge în trace? Dacă nu, cum leg scorul de variantă?
- Ce prag de regresie blochează un PR și ce prag doar avertizează?
- Cum versionez schimbările de model, care nu trec prin git-ul meu?
- Merită un changelog scurt pe prompt, cu motivul fiecărei schimbări?

Legături: [[MOC AI Engineer]], [[MOC Stack AI]], [[QA AI Agent]]
