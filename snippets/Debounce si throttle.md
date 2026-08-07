---
tags: [snippet, typescript, frontend]
created: 2026-08-06
type: snippet
lang: typescript
---

# Debounce si throttle

**Limbaj:** TypeScript · **Testat:** pattern standard

## Problema pe care o rezolvă

- **Debounce** — „așteaptă până se oprește". Utilizatorul tastează 10 caractere → **1** request, după ce s-a oprit.
- **Throttle** — „maxim o dată la N ms". Scroll continuu → un handler la fiecare 200 ms, nu la fiecare pixel.

Confuzia dintre ele e clasică: **debounce pentru input, throttle pentru evenimente continue.**

## Cod

```ts
function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms = 300,
): ((...args: A) => void) & { cancel: () => void } {
  let t: ReturnType<typeof setTimeout> | undefined;
  const wrapped = (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
  wrapped.cancel = () => { if (t) clearTimeout(t); t = undefined; };
  return wrapped;
}

function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  ms = 200,
): (...args: A) => void {
  let ultim = 0;
  let programat: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    const acum = Date.now();
    const rest = ms - (acum - ultim);
    if (rest <= 0) {
      ultim = acum;
      fn(...args);
    } else if (!programat) {
      // asigură execuția ultimului apel (trailing edge)
      programat = setTimeout(() => {
        ultim = Date.now();
        programat = undefined;
        fn(...args);
      }, rest);
    }
  };
}
```

## În React — hook

```tsx
function useDebounced<T>(valoare: T, ms = 300): T {
  const [debounced, setDebounced] = useState(valoare);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(valoare), ms);
    return () => clearTimeout(t);      // curățarea e esențială
  }, [valoare, ms]);
  return debounced;
}

// utilizare
const [text, setText] = useState("");
const q = useDebounced(text, 300);

useEffect(() => {
  if (!q) return;
  let anulat = false;
  caută(q).then(r => { if (!anulat) setRezultate(r); });
  return () => { anulat = true; };     // previne race condition
}, [q]);
```

Varianta cu `useDebounced` pe **valoare** e mai bună decât debounce pe funcție în React: nu ai probleme cu referințe stale de closure. Vezi [[useEffect - cand NU]].

## Atenție

- **Fără cleanup, ai memory leak** și update-uri pe componente demontate.
- Un `debounce()` creat inline în corpul componentei se recreează la fiecare render → nu debounce-uiește nimic. Trebuie `useMemo`/`useRef`, sau varianta pe valoare de mai sus.
- Pentru autocomplete ai nevoie și de **anularea requestului anterior** (`AbortController` sau flagul `anulat`), nu doar de debounce. Debounce reduce numărul de cereri; nu garantează ordinea răspunsurilor.
- 300 ms e un default bun pentru căutare. Sub 150 ms nu economisești nimic; peste 500 ms se simte lent.
- Pentru scroll/resize, preferă `requestAnimationFrame` sau `IntersectionObserver`/`ResizeObserver` — sunt proiectate exact pentru asta și mai eficiente decât throttle manual.

## Legături

- [[MOC Frontend]] · [[useEffect - cand NU]] · [[React - model mental de re-render]]
- [[Rate limiting]] — aceeași idee, pe server
