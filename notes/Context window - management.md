---
tags: [ai, llm]
created: 2026-08-06
type: permanent
---

# Context window - management

## Ideea

Context window = câți tokeni intră într-o cerere (prompt + răspuns). Modelele moderne au ferestre foarte mari.

**Dar context mai mult nu înseamnă răspuns mai bun.** De obicei înseamnă mai rău.

## De ce mai mult context strică

**1. Lost in the middle.** Modelele acordă cea mai multă atenție începutului și sfârșitului promptului. Informația critică îngropată la mijlocul a 100.000 de tokeni e efectiv invizibilă.

**2. Diluare.** 50 de documente din care 2 sunt relevante = mult zgomot care concurează cu semnalul. Precizia scade.

**3. Cost și latență.** Fiecare token de intrare se plătește la fiecare cerere și adaugă timp.

**4. Instrucțiuni contradictorii.** Într-un context lung, o instrucțiune de la început intră în conflict cu una de la mijloc, și nu poți prezice care câștigă.

## Practica

**Pune ce e important la început și la sfârșit.** Instrucțiunile cheie repetate la final („Amintește-ți: răspunde doar în JSON") funcționează măsurabil mai bine.

**Selecție agresivă, nu „bagă tot".** 3 documente relevante bat 30 mediocre. Asta e argumentul central pentru un [[RAG - pipeline]] cu reranking bun.

**Comprimă istoricul conversației:**
- păstrează integral ultimele N mesaje
- rezumă ce e mai vechi într-un singur mesaj de context
- păstrează separat deciziile/faptele stabilite, nu tot dialogul

**Structurează cu delimitatori clari** (XML tags, markdown headers). Un context lung dar bine marcat se navighează mult mai bine de model decât un bloc de text.

## Interacțiunea cu cache-ul

Structura care ajută cache-ul ajută și calitatea: stabil sus, variabil jos. Vezi [[Prompt caching]]. Dar atenție la tensiune — dacă ai nevoie de instrucțiuni repetate la final pentru calitate, ele nu se cache-uiesc. Compromis conștient, nu accident.

## Semnale că ai prea mult context

- răspunsurile devin generice
- modelul ignoră instrucțiuni pe care le respecta înainte
- amestecă informații din surse diferite
- costul crește dar calitatea în [[Evals inainte de prompt changes]] nu

## Legături

- Face parte din: [[MOC AI si LLM]]
- [[RAG - pipeline]] · [[Prompt caching]] · [[Cost-aware model routing]]
- [[Evals inainte de prompt changes]]
