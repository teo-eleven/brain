---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# Cost-aware model routing

## De ce e aici

Stack-ul agentului de extracție trece prin LiteLLM ca gateway, cu Gemini 3 Flash
ca model de lucru — adică deja alegerea „modelul mic întâi". Costul e una din
cele 4 metrici PRIMARY: p95 ≤ 30s la latență, cost +20% warning, +50% fail.

Al doilea motiv e infrastructura: proxy-ul ECF a căzut de DOUĂ ori într-o
singură zi. O rulare de evaluare cu 8 din 9 joburi eșuate nu e un rezultat despre
agent, e zgomot de infrastructură. Dacă harness-ul nu face diferența, ajunge să
raporteze o „regresie" care nu există — încă o formă de eșec tăcut.

## Ce trebuie știut

**Modelul mic întâi, escaladare doar când trebuie.** Regula practică: pornești
cu cel mai ieftin model care trece pragul de task success, și escaladezi doar pe
cazurile care eșuează (documente brutale, secțiuni ambigue). Escaladarea
neselectivă anulează tot beneficiul.

**Escaladarea trebuie să aibă declanșator explicit** — parse fail după retry,
încredere joasă, secțiune care a picat la bisecție. Nu „uneori folosim modelul
mare".

**Fallback la furnizor căzut** e alt lucru decât routing pe complexitate.
Fallback-ul e disponibilitate; routing-ul e cost. Amândouă trec prin gateway,
dar se configurează separat și trebuie raportate separat.

**Regula de aur după căderile de proxy:** orice rulare degradată — model de
fallback, retry-uri peste normal, joburi eșuate din motive de rețea — se
DECLARĂ. Metrica „Integritatea execuției: 0 rulări degradate nedeclarate" există
exact pentru asta. O rulare degradată nedeclarată contaminează baseline-ul.

**Ce trebuie să fie vizibil în trace pentru fiecare apel:** modelul efectiv
folosit (nu cel cerut), costul, latența, dacă a fost fallback.

## De răspuns

- Am configurat deja fallback în LiteLLM sau căderile de proxy se propagă direct
  ca joburi eșuate?
- Ce prag de joburi eșuate ar trebui să INVALIDEZE automat o rulare de evaluare
  (1 din 9? 2?)
- Există un caz real unde Gemini 3 Flash nu e suficient și ar trebui escaladat —
  sau presupun asta fără dovezi?
- Cum separ în raport latența modelului de latența infrastructurii? p95 de 30s
  măsoară care dintre ele?
- Costul de referință pentru +20%/+50% e fixat la ce moment și cine îl
  actualizează când se schimbă prețurile?

## Legat

- [[LiteLLM - gateway pentru modele]]
- [[Metrici pentru agenti AI]]
- [[Esecul tacut in sisteme AI]]
- [[Context window - management]]
- [[Fluxul zilnic de evaluare]]
- [[MOC Operatii zilnice]]
