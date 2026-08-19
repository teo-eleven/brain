---
tags: [note, ai]
created: 2026-08-19
type: note
status: schelet
---

# Tipuri de agenti AI

## De ce e aici

Harness-ul din [[QA AI Agent]] evaluează **un** agent: „Extracție" din
doc-extract-studio. La ECF sunt **15**, în 5 repo-uri. Fără o taxonomie, fiecare
agent nou înseamnă un harness nou, scris de la zero de cine se nimerește.

Taxonomia există deja, în `docs/inbox/tipuriagentiecf` (v5, 10.08) — dar stă
într-un HTML pe care nu-l deschide nimeni. Nota asta o aduce în vault, fiindcă
răspunde la întrebarea de care atârnă tot restul: **ce se schimbă când trec de la
un tip de agent la altul, și ce rămâne la fel.**

## Ce trebuie știut

### Două etichete, nu una

Fiecare agent primește **ambele**:

| Nivel                            | Ce descrie                                           | Ce decide                                                      |
| -------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| **1 — tip tehnic**               | cum funcționează (orchestrare, matching, extracție…) | **metodologia**: ce gradere, ce metrici                        |
| **2 — tip funcțional / domeniu** | ce flux acoperă (BIM, recepție materiale, ofertare…) | **datele**: conținutul setului și de unde vine ground truth-ul |

Exemplu: `match-auction-items` e tehnic **matching / rerank** — deci metrici IR
(precision@k, MRR) — și funcțional **estimare / ofertare** — deci datele vin din
caiete de licitație și din catalogul ERP. Două întrebări diferite, două răspunsuri
independente.

### Regulile de decizie — prima care se potrivește câștigă

1. Intrare/ieșire audio-video în timp real? → **Voce / multimodal realtime**
2. Coordonează 2+ sub-agenți, cu decizii de rutare? → **Orchestrare / multi-agent**
3. Apelează tool-uri și **schimbă starea** sistemului? → **Tool-use / mutare de stare**
4. Potrivește text liber cu intrări din catalog, cu scor și rang? → **Matching / rerank**
5. Scoate câmpuri dintr-un document, pe o schemă? → **Extracție → date structurate**
6. Atribuie o etichetă dintr-un set finit? → **Clasificare**
7. Caută în documente și trebuie să citeze sursa? → **Retrieval / RAG**
8. Produce output pe schemă fixă, cu constrângeri verificabile? → **Generare structurată constrânsă** (cazul implicit)

**Excepția, validată de realitate:** „prima care se potrivește" pierde informație la
agenții hibrizi. `bim_riders` e orchestrare **peste** retrieval — are nevoie simultan
de gradere de traiectorie **și** de citare. Iar la agenții multi-pas
(`checklist_assistant`, `Extracție`) unitatea de evaluare e **pasul sau configurația,
nu agentul**. Regula e un punct de plecare, nu o cutie.

### Cei 15 agenți ECF

| Agent                     | Repo                 | Tip tehnic                      | Risc  | Ground truth      |
| ------------------------- | -------------------- | ------------------------------- | ----- | ----------------- |
| `bim_riders`              | ecf-agent-hub        | Orchestrare / multi-agent       | C     | scris de mână     |
| `bim_riders_voice`        | ecf-agent-hub        | Voce / multimodal realtime      | C     | scris de mână     |
| `chatbot`                 | ecf-agent-hub        | Retrieval / RAG                 | C     | scris de mână     |
| `checklist_assistant`     | ecf-agent-hub        | Orchestrare / multi-agent       | B     | scris de mână     |
| `Clasificare`             | doc-extract-studio   | Clasificare                     | B     | calculabil        |
| **`Extracție`**           | doc-extract-studio   | Extracție → date structurate    | B     | scris de mână     |
| `Consolidare (summary)`   | doc-extract-studio   | Generare structurată constrânsă | B     | calculabil        |
| `Copilot chat`            | doc-extract-studio   | Tool-use / mutare de stare      | **A** | scris de mână     |
| **`match-auction-items`** | ecf-match-core       | Matching / rerank               | B     | **deja colectat** |
| `neo4j_agent`             | ecf-neo4j-agent-adk  | Orchestrare / multi-agent       | C\*   | scris de mână     |
| `fam_search_agent`        | ecf-neo4j-agent-adk  | Matching / rerank               | C     | deja colectat     |
| `builder`                 | ecf-monada-agent-adk | Orchestrare / multi-agent       | **A** | calculabil        |
| **`variant_generator`**   | ecf-monada-agent-adk | Generare structurată constrânsă | B     | calculabil        |
| **`opening_placer`**      | ecf-monada-agent-adk | Generare structurată constrânsă | B     | calculabil        |
| `layout_repairer`         | ecf-monada-agent-adk | Generare structurată constrânsă | B     | calculabil        |

**Clasa de risc A înseamnă „mută starea reală"** — creează, șterge, publică.
`builder` are 11 function tools plus 3 AgentTools și cheamă `clear_project` și
`model_in_revit`. Un agent de clasă A greșit nu dă un răspuns prost, ci strică date.

\* `neo4j_agent` e C **doar dacă** `execute_cypher_wrapper` e read-only. Dacă nu e,
Cypher generat de LLM poate scrie sau șterge în graf, iar agentul e clasa A. Întrebare
deschisă către echipă, netrimisă încă.

### Ground truth-ul are trei surse, cu costuri de ordin diferit

1. **Deja colectat** — aprobările umane există în producție. Cost ≈ 0.
2. **Calculabil** — un validator sau un set de constrângeri spune dacă output-ul e
   corect, fără om. Cost = scrisul validatorului, o dată.
3. **Scris de mână** — ~5 min/caz, la nesfârșit.

**Costul dominant al unui pilot e ground truth-ul, nu rularea.** Rularea reală a
suitei costă ~0,06 USD; etichetarea manuală a 100 de cazuri costă o zi de om. De
aici vine ordinea piloților recomandați, care **nu** e ordinea importanței:

- **Pilot 1 — `match-auction-items`.** Ground truth gratuit din aprobările din
  `/approve`, determinist (`temperature: 0`), și rezolvă o nevoie deja scrisă în cod:
  `MIN_SCORE_MARGIN` e dezactivat, cu comentariul „așteaptă calibrare din loguri de
  producție". Cel mai rapid drum până la un baseline real.
- **Pilot 2 — `Extracție`.** Riscul de business cel mai mare (P0 de trunchiere,
  rânduri pierdute silențios). Singurul pilot care cere etichetare manuală. **E cel
  care s-a făcut primul** — corect ca risc, scump ca drum spre baseline.
- **Pilot 3 — `opening_placer` + `variant_generator`.** Cele mai multe constrângeri
  verificabile programatic și zero teste existente pe agenți.

## De răspuns

- `execute_cypher_wrapper` e read-only? Răspunsul mută `neo4j_agent` din C în A.
- Volumele de rulări/lună — singura coloană goală din inventar. Fără ele, regula
  „datasetul e 10–30% din totalul datelor" rămâne un procent fără numitor. Pentru
  doc-extract-studio și match-core e extractibilă singur, din tabela de joburi.
- Cine a scris `tests/perturbation/` din `ecf-neo4j-agent-adk`? Există deja acolo
  perturbații, comparație cu baseline pe 2/3/4 variante și analiză de eșecuri.
  Documentul îl numește **cel mai ieftin câștig disponibil**: de absorbit, nu de
  reconstruit în paralel. Repo-ul nu e clonat local.
- Niciun agent ADK n-are `input_schema` — contractul de intrare există doar în
  prompt, ca JSON descris în text. Deci validarea intrării se testează
  **comportamental**; Pydantic nu prinde nimic pe partea de input. Ce înseamnă asta
  pentru graderi?

## Legat

- [[Cum testez un agent nou]]
- [[Metrici pentru agenti AI]]
- [[Ground truth pentru evaluare]]
- [[QA AI Agent]]
- [[MOC Stack AI]]
- [[MOC AI Engineer]]
