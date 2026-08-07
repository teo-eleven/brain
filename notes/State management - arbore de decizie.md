---
tags: [react, frontend, architecture]
created: 2026-08-06
type: permanent
---

# State management - arbore de decizie

## Ideea

Majoritatea aplicațiilor nu au nevoie de o librărie de state management. Au nevoie de state pus în locul potrivit.

## Arborele

```
Datele vin de la server?
├── DA  → React Query / SWR / loader de framework
│         (NU în useState — ai nevoie de cache, refetch, stale, retry)
└── NU
    ├── E în URL prin natura lui? (filtru, tab, pagină, căutare)
    │   → searchParams / router
    │     Test: dacă utilizatorul dă refresh sau trimite linkul, trebuie păstrat?
    ├── Îl folosește o singură componentă?
    │   → useState local
    ├── Îl folosesc 2-3 componente apropiate?
    │   → useState în părintele comun, pasat prin props
    ├── Îl folosește tot arborele, se schimbă rar? (temă, user, limbă)
    │   → Context
    └── Global, complex, se schimbă des?
        → Zustand / Jotai / Redux
```

## Greșeala #1

**Datele de server ținute în state global.** Ajungi să reimplementezi manual cache, invalidare, loading, error, refetch — prost. React Query face asta în 3 linii și mai bine.

Un state global cu „lista de facturi" e aproape mereu semnul că lipsește un data-fetching layer.

## Greșeala #2

**Context pentru date care se schimbă des.** Orice consumator de context se re-randează la fiecare schimbare, fără posibilitate de selecție parțială. Pentru state care se schimbă la fiecare tastă, Context e cea mai proastă alegere. Zustand permite selectori.

## Greșeala #3

**Ignorarea URL-ului ca state.** Filtre și taburi în `useState` = utilizatorul nu poate da linkul, refresh-ul pierde tot, butonul „back" nu funcționează cum se așteaptă. URL-ul e state gratuit, persistent și partajabil.

## Formă bună pentru state de UI

Nu boolean-uri paralele. [[Discriminated unions]]:

```ts
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; msg: string }
  | { status: "ready"; data: Factura[] };
```

## Legături

- Face parte din: [[MOC Frontend]] · [[MOC Arhitectura]]
- [[React - model mental de re-render]] · [[useEffect - cand NU]]
- [[Discriminated unions]] · [[Optimistic UI]] · [[KISS DRY YAGNI]]
