---
tags: [note, workflow]
created: 2026-08-11
type: note
status: schelet
---

# Fluxul zilnic de evaluare

Rutina de lucru pe [[QA AI Agent]]. Ordinea contează: fără stack pornit corect,
tot ce vine după e zgomot.

## 1. Pornesc stack-ul agentului

```
cd D:\teodor.fotciuc\ecf_app_web-doc_extract_studio
git status              # trebuie sa fiu pe qa/langfuse-tracing
docker compose up -d
docker compose ps       # toate 7 serviciile "running", nu "restarting"
```

Dacă un serviciu se tot restartează, opresc aici. Nu rulez nimic peste un stack
pe jumătate viu.

## 2. Verific gateway-ul și tracing-ul

- [[LiteLLM - gateway pentru modele]] răspunde? Un `/health` sau o cerere mică.
- [[Langfuse - tracing pentru LLM]] primește? Trag o extracție de test și văd
  dacă apare trace-ul. Dacă nu apare, callback-ul e mort și restul zilei e pierdut.
- Proxy-ul / rețeaua firmei: dacă pică, joburile eșuează în lanț.

## 3. Rulez o extracție reală

Un singur document, din cele 9 de referință. Scopul nu e scorul, e să confirm
că lanțul Agent → LiteLLM → Gemini 3 Flash → Langfuse merge cap-coadă.

## 4. Citesc trace-ul

Detaliile în [[Cum citesc un trace]]. Pe scurt: `finish_reason`, apoi tokeni și
cost, apoi pașii.

## 5. Rulez suita

```
cd D:\teodor.fotciuc\qa-ai-agent
uv run qaharness --help
```

Cele 25 de cazuri offline verifică graderii, nu agentul. Dacă ele cad, problema
e în harness, nu în model. Vezi [[DeepEval - evaluare automata]] și
[[promptfoo - teste pe prompturi]].

## 6. Compar cu baseline

`baselines/` vs `runs/`. Diferența e semnalul. Un scor absolut fără baseline nu
îmi spune nimic. Vezi [[Evals inainte de prompt changes]].

## Înainte să cred un rezultat

- Câte joburi au rulat efectiv, câte au eșuat? Dacă 8 din 9 au picat pentru că
  proxy-ul era jos, ăla nu e rezultat, e infrastructură căzută.
- Eșecul a fost tăcut sau explicit? Vezi [[Esecul tacut in sisteme AI]].
- A fost tăiat output-ul? Vezi [[Reasoning tokens si bugetul de output]].
- Am rulat pe același set de date ca baseline-ul?
- Se reproduce? O rulare e anecdotă. Vezi [[Debugging un prompt]].

## De răspuns

- Care e pragul minim de joburi reușite sub care declar rularea invalidă?
- Merită un smoke test automat care oprește suita dacă stack-ul nu e sănătos?
- Unde ține evidența rulărilor invalide, ca să nu le recompar din greșeală?
- Cât de des refac baseline-ul și cine decide că noul baseline e „bun"?
- Rutina asta trebuie să ruleze zilnic sau doar înainte de PR?

Legături: [[MOC Operatii zilnice]], [[MOC Stack AI]], [[MOC AI Engineer]]
