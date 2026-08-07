---
tags: [react, frontend]
created: 2026-08-06
type: permanent
---

# React - model mental de re-render

## Ideea

Componenta e o **funcție de la state la UI**. Când state-ul se schimbă, React reapelează funcția și compară rezultatul cu cel precedent. Ce diferă, ajunge în DOM.

Cele patru afirmații din care derivă aproape totul:

1. **Un re-render nu e o actualizare de DOM.** Funcția rulează din nou; DOM-ul se atinge doar unde e diferență. Un re-render „inutil" e mult mai ieftin decât pare.
2. **State-ul e un snapshot.** În timpul unui render, valorile state-ului sunt fixe. `setCount(count + 1)` de două ori la rând incrementează o dată — ambele văd același `count`. Cu `setCount(c => c + 1)` incrementează de două ori.
3. **Setarea state-ului nu e imediată.** Citirea variabilei imediat după `set` dă valoarea veche. Nu e un bug.
4. **Un părinte care se re-randează re-randează copiii**, indiferent de props — dacă nu sunt memoizați.

## De ce contează

80% din bug-urile „React se comportă ciudat" sunt una din cele patru. Mai ales #2 și #3.

## Când optimizezi

**Nu întâi.** Ordinea corectă:

1. Mută state-ul mai jos în arbore (state local în loc de global) — rezolvă majoritatea problemelor gratis
2. Ridică conținutul static în afara componentei care se re-randează
3. Măsoară cu React DevTools Profiler
4. **Abia apoi** `memo` / `useMemo` / `useCallback`

Memoizarea nu e gratuită: are cost de comparație și de memorie, și complică codul. Aplicată orbește, adesea încetinește.

## Capcane

- Un obiect sau array creat inline (`style={{...}}`, `data={[...]}`) e o referință nouă la fiecare render → anulează orice `memo` al copilului.
- `key` din index într-o listă care se reordonează produce stare atașată elementului greșit. Folosește un id stabil.
- `useEffect` folosit ca reacție la schimbări de props e de obicei greșit — vezi [[useEffect - cand NU]].

## Legături

- Face parte din: [[MOC Frontend]]
- [[useEffect - cand NU]] · [[State management - arbore de decizie]]
- [[Server components vs client components]]
