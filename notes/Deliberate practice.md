---
tags: [learning, career]
created: 2026-08-06
type: permanent
---

# Deliberate practice

## Ideea

Repetiția nu produce progres. Progresul vine din practică **deliberată**: la limita competenței, cu feedback rapid, cu intenție explicită de îmbunătățire.

De asta 5 ani de experiență pot însemna 5 ani de progres — sau primul an repetat de 5 ori.

## Cele patru condiții

1. **Chiar peste nivelul tău actual.** Confortabil = nu înveți. Imposibil = te blochezi. Zona de progres e îngustă și inconfortabilă.
2. **Feedback rapid și clar.** Fără să știi dacă ai greșit, repeți greșeala.
3. **Intenție specifică.** Nu „vreau să fiu mai bun la Python". Ci „vreau să scriu cod async fără să blochez event loop-ul".
4. **Repetiție cu corecție.** Nu doar mai mult; mai bine, conștient.

## De ce programarea e greu de practicat deliberat

Munca zilnică încalcă în general condiția 1 și 2:

- **Faci ce știi deja.** E rațional — livrezi. Dar nu e practică.
- **Feedback-ul e lent.** Afli că arhitectura a fost proastă după 6 luni, când nu mai poți lega cauza de decizie.
- **Nu ai timp de reflecție.** Următorul task începe imediat.

Deci practica deliberată în programare trebuie **construită intenționat**, nu așteptată de la job.

## Cum o construiești

**Feedback rapid:**
- teste — vezi [[TDD - red green refactor]]. Ciclul roșu-verde e cea mai bună buclă de feedback din programare.
- code review în care ceri explicit critică, nu aprobare
- reproducerea unui bug înainte de fix

**La limita competenței:**
- implementează de la zero ceva ce folosești mereu (un mic ORM, un router, un event bus) — înțelegi mecanismul, nu doar API-ul
- alege deliberat tehnica pe care o eviți (async, generics, SQL avansat)
- citește codul cuiva mai bun — vezi [[Cum citesc un codebase nou]]

**Reflecție:**
- [[Weekly review]]: ce m-a blocat și de ce
- notă permanentă pentru fiecare lecție — vezi [[Cum scriu o nota permanenta]]
- un blocaj care apare de două ori merită o notă, nu o a treia rezolvare improvizată

## Ce contează cel mai mult, realist

**Reflecția structurată.** E cel mai ignorat pas și cel mai ieftin. Vaultul ăsta există în mare parte pentru asta: transformă experiență brută în lecții pe care le poți recupera.

Fără reflecție, experiența nu se compune — se acumulează.

## Legături

- Face parte din: [[MOC Invatare si Cariera]]
- [[Feynman technique]] · [[Cum scriu o nota permanenta]]
- [[Debugging metodic]] · [[TDD - red green refactor]]
