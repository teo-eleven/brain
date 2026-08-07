---
tags: [ai, llm, rag]
created: 2026-08-06
type: permanent
---

# RAG - pipeline

## Ideea

Retrieval-Augmented Generation: cauți bucăți relevante din datele tale, le pui în prompt, modelul răspunde pe baza lor. Rezolvă „modelul nu știe despre documentele mele" fără fine-tuning.

## Pipeline-ul

```
Indexare (offline):
  documente → chunking → embeddings → vector store

Interogare (online):
  întrebare → embedding → căutare top-k → rerank → prompt → răspuns + citări
```

## Partea grea e retrieval, nu generarea

Asta e concluzia contraintuitivă a oricui a construit un RAG: **dacă bucățile corecte ajung în prompt, orice model decent răspunde bine. Dacă nu ajung, niciun model nu te salvează.**

Deci efortul se duce în retrieval, nu în prompt engineering.

## Chunking — cel mai subestimat detaliu

- **Prea mic** → pierzi contextul, o propoziție fără antecedent nu înseamnă nimic
- **Prea mare** → diluare, vezi [[Context window - management]]
- **Start bun:** 300–800 tokeni, cu 10-15% overlap
- **Mai bine:** taie pe **granițe semantice** (secțiuni, titluri, paragrafe), nu la N caractere
- Păstrează metadata cu fiecare chunk: titlu document, secțiune, dată, sursă — folosită la filtrare și la citare

## Căutare hibridă bate căutarea vectorială pură

Embeddings prind sensul dar ratează potrivirile exacte: coduri de produs, nume proprii, numere de articol, termeni rari. Combinație:

- **vectorial** (semantic) + **BM25/full-text** (lexical) → contopite cu Reciprocal Rank Fusion

Apoi **reranking** cu un cross-encoder pe top-50 → top-5. Rerankingul e adesea cea mai mare îmbunătățire de calitate per efort din tot pipeline-ul.

## Ce trebuie să existe

- **Citări obligatorii.** Fiecare afirmație cu sursa. Fără citări, utilizatorul nu poate verifica, și tu nu poți depana.
- **Comportament la „nu știu".** Dacă retrievalul întoarce nimic relevant, modelul trebuie să spună asta, nu să inventeze. Instrucțiune explicită în prompt + prag de scor.
- **Evals pe retrieval separat de generare.** Măsoară recall@k pe un set de întrebări cu răspunsuri cunoscute. Dacă recall-ul e slab, nu ai o problemă de prompt. Vezi [[Evals inainte de prompt changes]].
- **Filtrare pe permisiuni la retrieval.** Un chunk din documentul altui tenant care ajunge în prompt e o scurgere de date. Vezi [[Multi-tenancy - patterns]].

## Când NU ai nevoie de RAG

- Datele încap în prompt (sub câteva zeci de mii de tokeni) → pune-le direct, cu [[Prompt caching]]
- Ai nevoie de agregări („câte facturi în iunie") → asta e SQL, nu retrieval. Un LLM care generează SQL peste o schemă cunoscută e mult mai potrivit.
- Datele se schimbă la fiecare secundă → reindexarea devine problema principală

## Legături

- Face parte din: [[MOC AI si LLM]]
- [[Context window - management]] · [[Prompt caching]]
- [[Evals inainte de prompt changes]] · [[Validarea output-ului LLM]]
