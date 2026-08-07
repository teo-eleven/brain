---
tags: [meta, obsidian, pkm]
created: 2026-08-06
type: permanent
---

# Graph view - ce e util

## Ideea

Graful vizualizează notele ca noduri și linkurile ca muchii. Arată spectaculos. E util în vreo 4 moduri concrete, și inutil în cel mai promovat.

## Ce e util

**1. Graful local (`Ctrl+Shift+G` sau panoul lateral).** Doar vecinii notei curente, 1-2 nivele. Ăsta îl folosești zilnic — arată contextul imediat al ideii la care lucrezi.

**2. Găsirea notelor orfane.** Nodurile fără nicio muchie sunt note pe care le-ai scris și le-ai pierdut. Vezi [[Note orfane]].

**3. Clustere care ar trebui legate.** Două grupuri dense, separate complet. Dacă ambele sunt despre lucruri conexe, ai găsit o legătură pe care n-ai făcut-o — de acolo apar ideile bune.

**4. Teme subdezvoltate.** Un nod mare, cu multe backlinkuri, dar cu conținut subțire = temă la care revii des și pe care n-ai aprofundat-o niciodată.

## Ce e hype

**Graful global cu 2000 de noduri.** Arată fantastic în screenshot, nu-ți spune nimic. Devine „hairball" — o minge de păianjen fără structură lizibilă. Nimeni nu-l folosește ca instrument de lucru după prima săptămână.

Nu construi vaultul pentru graf. Graful e un **efect secundar** al faptului că scrii linkuri, nu scopul.

## Ce îl face lizibil

În vaultul ăsta e deja configurat (`.obsidian/graph.json`):

- **grupuri de culori pe cale** — `path:daily` albastru, `path:maps` mov, `path:projects` verde etc. Structura devine vizibilă instant.
- **filtre în bara de căutare a grafului** — `path:notes -path:daily` ascunde jurnalul și lasă doar ideile. Cel mai util filtru.
- **`nodeSizeMultiplier`** crescut — hub-urile ies în evidență
- **repel/link distance** ajustate ca să nu se lipească totul într-un bulgăre

## Valoarea reală, în ordine

**daily notes > căutare > backlinkuri > MOC-uri > graph view**

Graful e ultimul. Util, plăcut, dar nu e motorul sistemului. Dacă ai o zi în care ai chef să te joci, joacă-te cu el — dar nu-l confunda cu munca.

## Legături

- Face parte din: [[MOC Vault - cum functioneaza]]
- [[Note orfane]] · [[MOC - map of content]] · [[Obsidian cheatsheet]]
