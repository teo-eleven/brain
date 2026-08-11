---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# Tool use - function calling

## De ce e aici

Agentul „Extracție documente" are buclă agentică, cu **buget de pași: max 8
iterații, orice depășire = fail** (metrică Secondary, prag absolut care blochează
încă din faza 1). Pe 11.08 harness-ul raporta VERDE pe semnale neverificabile, iar
bugetul de pași a primit ca fix o stare explicită „nu se aplică" — pentru
execuțiile unde numărul de iterații pur și simplu nu putea fi citit.

Al doilea fir: la extracție, textul documentului e input, deci orice tool pe care
îl expui devine o suprafață de atac pentru instrucțiuni ascunse în document.

## Ce trebuie știut

**Ce e, mecanic:** îi dai modelului o listă de funcții cu schemă de argumente;
modelul întoarce numele funcției + argumente; TU o execuți; rezultatul se
întoarce în conversație; modelul continuă. Modelul nu execută nimic — propune.

**Bucla agentică:** apel → tool call → execuție → observație → apel din nou,
până la un răspuns final SAU până la limita de pași. Limita nu e o optimizare de
cost, e o siguranță: fără ea, un model care nu găsește un câmp poate încerca la
nesfârșit. La el: 8.

**Validarea argumentelor primite de la model e obligatorie.** Argumentele sunt
output de LLM, deci se aplică regula de aur: schemă, tipuri, intervale,
whitelist pe valori sensibile (căi de fișier, ID-uri, nume de tabele). Modelul
poate cere corect ca formă și absurd ca fond.

**Ce loghezi pe fiecare iterație:** numărul iterației, tool-ul cerut,
argumentele, rezultatul, dacă a fost eroare. Fără asta, „max 8 iterații" e o
regulă pe care nu o poți verifica — exact situația care a produs starea „nu se
aplică".

## De răspuns

- Ce tool-uri are efectiv agentul de extracție acum și de ce are nevoie de buclă
  dacă e un singur pas de extragere?
- Ce declanșează iterația 2+ în practică — retry pe parse fail, bisecție, sau
  altceva? Sunt numărate la fel?
- 8 e o cifră măsurată sau aleasă? Care e distribuția reală a numărului de
  iterații pe cele 9 cazuri?
- Cum arată o încercare de injection care țintește un tool call, și am un caz de
  test pentru ea?
- Când agentul atinge limita de 8, ce se întoarce — eșec explicit sau rezultat
  parțial? (răspunsul corect nu e „parțial")

## Legat

- [[Validarea output-ului LLM]]
- [[Prompt injection - aparare]]
- [[Metrici pentru agenti AI]]
- [[Tracing LLM - spans si context]]
- [[MCP - Model Context Protocol]]
- [[Lucrul cu agenti in terminal]]
