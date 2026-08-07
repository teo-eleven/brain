---
tags: [react, frontend]
created: 2026-08-06
type: permanent
---

# useEffect - cand NU

## Ideea

`useEffect` e pentru **sincronizarea cu ceva din afara React**: un timer, un event listener pe `window`, un WebSocket, o librărie de hartă, `document.title`.

Nu e pentru „rulează cod când se schimbă X".

## Cazurile în care NU îți trebuie

**1. Date derivate din props sau state**
```jsx
// GREȘIT: un render în plus, stare duplicată care se poate desincroniza
const [total, setTotal] = useState(0);
useEffect(() => setTotal(items.reduce(...)), [items]);

// CORECT: calculează în timpul renderului
const total = items.reduce(...);
```

**2. Resetarea state-ului când se schimbă un prop**
```jsx
// GREȘIT
useEffect(() => setSelected(null), [listId]);

// CORECT: key schimbă identitatea componentei, React o remontează curat
<Lista key={listId} />
```

**3. Reacție la un eveniment de utilizator**
Logica aparține în handler, nu într-un effect declanșat de o schimbare de state.

**4. Transformarea datelor pentru afișare**
Sortare, filtrare, formatare — toate în timpul renderului. `useMemo` doar dacă profiler-ul arată că e scump.

## Când DA îți trebuie

- abonare la un event extern (cu curățare în return)
- `setInterval` / `setTimeout`
- sincronizare cu `localStorage`, `document`, `window`
- integrare cu o librărie non-React
- fetch — **dar** de preferat prin React Query / SWR / loader de framework, care rezolvă race conditions, cache și retry în locul tău

## Capcana clasică: race condition la fetch

Două cereri pornite la schimbare rapidă de props se pot întoarce în ordine inversă → afișezi datele vechi. Fixul minim:

```jsx
useEffect(() => {
  let anulat = false;
  fetch(url).then(r => r.json()).then(d => { if (!anulat) setData(d); });
  return () => { anulat = true; };
}, [url]);
```

## Legături

- Face parte din: [[MOC Frontend]]
- [[React - model mental de re-render]] · [[State management - arbore de decizie]]
- [[Server components vs client components]] — cel mai bun fetch e cel care nu se face în client
