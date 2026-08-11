---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# promptfoo - teste pe prompturi

## Ce e

Testare declarativă pe prompturi, descrisă în YAML. Definești prompturile,
furnizorii (modelele) și cazurile de test cu assertions, iar promptfoo rulează
**matricea completă prompt × model × caz** și îți dă un tabel comparativ.

Diferența față de DeepEval, în o propoziție: promptfoo cheamă modelul **direct**,
cu inputuri sintetice, fără să treacă prin aplicație și fără trace-uri de
producție. E bancul de probă, nu observatorul.

Tipuri de assertions utile:

- `contains`, `equals`, `regex` — deterministe.
- `is-json` cu schemă — exact ce trebuie când aștepți JSON structurat.
- `llm-rubric` — judge, pentru ce nu se poate verifica mecanic.
- `cost`, `latency` — praguri pe buget și timp, nu doar pe conținut.

`promptfoo-action` îl bagă în GitHub Actions și comentează diferențele direct în
PR: vezi ce s-a stricat față de prompt-ul anterior fără să deschizi nimic.

## Unde apare la mine

`qa-ai-agent/promptfoo/promptfooconfig.yaml`, cu workflow dedicat în GitHub
Actions, separat de cel de DeepEval. Rulează la PR și la tag.

Rolul lui în flux: **înainte** de a schimba un prompt de extracție, îl trec prin
matricea promptfoo — repede, ieftin, pe cazuri fixe. Abia ce trece pe acolo
ajunge în aplicație, unde Langfuse îl vede în producție și DeepEval îl notează pe
trace-uri reale.

Aici prind și regresiile de format: dacă un prompt nou începe să scoată JSON
invalid pe un caz de margine, `is-json` cade în CI, nu în producție.

## Comenzi

```bash
npx promptfoo@latest eval -c promptfoo/promptfooconfig.yaml
npx promptfoo@latest view          # UI local, comparație vizuală
npx promptfoo@latest eval --filter-pattern "anexa"   # doar unele cazuri
```

```yaml
prompts: [file://prompts/extract_v3.txt]
providers: [google:gemini-3-flash, openai:gpt-4o-mini]
tests:
  - vars: { document: file://fixtures/factura_01.txt }
    assert:
      - type: is-json
      - type: cost
        threshold: 0.01
```

## De răspuns

- Cazurile din `promptfooconfig.yaml` se suprapun cu `datasets/` sau sunt un set
  paralel care poate diverge?
- Rulez matricea pe mai multe modele sau doar pe Gemini 3 Flash? Merită efortul
  de comparație multi-model?
- Pragurile de `cost` și `latency` sunt setate din date reale sau ghicite?
- Cine se uită la comentariul din PR când matricea semnalează o regresie?

## Legat

- [[Evals inainte de prompt changes]]
- [[DeepEval - evaluare automata]]
- [[Ground truth pentru evaluare]]
- [[LLM as judge]]
- [[Validarea output-ului LLM]]
- [[QA AI Agent]]
- [[MOC AI Engineer]]
