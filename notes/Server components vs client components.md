---
tags: [react, frontend, nextjs]
created: 2026-08-06
type: permanent
---

# Server components vs client components

## Ideea

- **Server Component** (default în Next.js App Router) — rulează **doar pe server**. Codul lui nu ajunge niciodată în bundle-ul trimis browserului.
- **Client Component** (`"use client"`) — cod trimis în browser, cu interactivitate.

## De ce contează

Un Server Component poate accesa direct baza de date, secrete, fișiere — pentru că nu ajunge la utilizator. Și nu costă niciun kilobyte de JavaScript.

```jsx
// app/facturi/page.tsx — Server Component
export default async function Page() {
  const facturi = await db.query("SELECT ...");   // direct, fără API
  return <Lista facturi={facturi} />;
}
```

Nu mai ai nevoie de un endpoint intermediar doar ca să-ți alimentezi propria pagină.

## Ce NU poate un Server Component

- `useState`, `useEffect`, orice hook
- handlere de evenimente (`onClick`)
- API-uri de browser (`window`, `localStorage`)

Când ai nevoie de ele → `"use client"`.

## Regula de compoziție

**Împinge `"use client"` cât mai jos în arbore.** Nu marchezi pagina întreagă ca client doar pentru un buton.

```
Page (server)
└── Tabel (server)
    └── ButonExport (client)   ← doar ăsta ajunge în bundle
```

Un Server Component poate randa un Client Component. Invers nu (un client poate primi unul ca `children`, dar nu-l poate importa).

## Capcane

- **Props-urile trecute server → client sunt serializate.** Nu poți trece funcții, clase, `Date` cu metode custom. Doar date simple.
- `"use client"` e contagios în jos: tot ce importă un client component devine client. De asta poziția în arbore contează.
- Un secret citit într-un fișier care are `"use client"` **ajunge în browser**. Vezi [[Secrets management]].
- Server Components sunt specifice framework-urilor cu suport (Next.js App Router). Nu există în React SPA clasic cu Vite.

## Legături

- Face parte din: [[MOC Frontend]]
- [[React - model mental de re-render]] · [[useEffect - cand NU]]
- [[Secrets management]]
