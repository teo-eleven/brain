---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# Ground truth pentru evaluare

## De ce e aici

Datasetul agentului „Extracție documente" are 9 cazuri și se construiește în
runde escaladate: documente realiste → brutale → „nivelul următor, construit pe
ce a rezistat". Ground truth-ul vine pe două căi:

- **scris de mână** — ~5 min/caz, citești documentul și notezi valorile corecte;
- **fabricat prin construcție** — `generators/` produce documentul PORNIND de la
  datele corecte, deci adevărul e cunoscut din start, cu cost aproape zero.

Cele 9 documente actuale includ și `extr-11_injection.pdf`, un caz de prompt
injection.

## Ce trebuie știut

**Ce testează fiecare:**

|              | Fabricat                                                  | Real                                                                                                 |
| ------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Cost per caz | ~0 după ce ai generatorul                                 | ~5 min manual                                                                                        |
| Ce verifică  | logica de extracție, cazuri limită construite intenționat | ce se întâmplă cu murdăria din lumea reală: scanări proaste, layout ciudat, abrevieri, câmpuri lipsă |
| Riscul       | testezi ce ai imaginat tu, nu ce există                   | greu de scalat, ground truth-ul poate fi el însuși greșit                                            |

Concluzia practică: fabricatul dă VOLUM și acoperire pe cazuri limită, realul dă
VALIDITATE. Un dataset numai fabricat măsoară cât de bine se potrivește agentul
cu imaginația generatorului.

**Eșantionare stratificată:** nu iei documente la întâmplare. Împarți pe axe care
contează (tip document, calitate scan, densitate câmpuri, limbă, prezența
capcanelor) și te asiguri că fiecare strat are reprezentare. Altfel 9 cazuri
înseamnă practic un singur tip de document repetat.

**Riscul de plafonare:** datasetul devine în timp o colecție de cazuri deja
trecute — fiecare rundă adaugă doar ce a fost reparat, deci scorul crește fără
ca agentul să fie mai bun. Antidot: fiecare rundă nouă trebuie să conțină cazuri
pe care agentul curent le PICĂ, iar cazurile vechi nu se șterg.

## De răspuns

- Care e proporția actuală fabricat/real din cele 9 și care ar trebui să fie?
- Ce axe de stratificare contează cu adevărat pentru extracție și pe câte dintre
  ele am zero acoperire acum?
- Cine verifică ground truth-ul scris de mână? Dacă îl scriu eu și îl și
  evaluez, ce prinde greșeala?
- Cum marchez în dataset cazurile „deja trecute" față de cele noi, ca să pot
  citi scorul pe ambele separat?
- La ce dimensiune de dataset devine relevantă discuția despre non-regresie de
  3pp — și care e drumul de la 9 la acolo?

## Legat

- [[Metrici pentru agenti AI]]
- [[LLM as judge]]
- [[Prompt injection - aparare]]
- [[Evals inainte de prompt changes]]
- [[DeepEval - evaluare automata]]
- [[Fluxul zilnic de evaluare]]
- [[QA AI Agent]]
