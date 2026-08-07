---
tags: [typescript, types, patterns]
created: 2026-08-06
type: permanent
---

# Discriminated unions

## Ideea

O uniune de tipuri care au un câmp comun literal (`kind`, `status`, `type`) prin care compilatorul le distinge. Fiecare variantă poartă **exact datele care există în acea stare** — nici mai mult, nici mai puțin.

## De ce e cel mai util pattern din TS

Face **stările imposibile imposibil de reprezentat**.

```ts
// PROST: 8 combinații posibile, din care 5 nu au sens
type State = { loading: boolean; data?: User; error?: string };
// loading=true ȘI data ȘI error simultan? compilează.

// BUN: 3 stări, toate valide
type State =
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: string };
```

În a doua formă, `state.data` **nu există** decât după ce ai verificat `status === "success"`. Compilatorul refuză să-l accesezi altfel. Bug-ul „am afișat date vechi în timp ce încărca" devine imposibil de scris.

## Exhaustivitate

```ts
switch (s.status) {
  case "loading": return <Spinner />;
  case "success": return <List data={s.data} />;
  case "error":   return <Err msg={s.error} />;
  default: {
    const _never: never = s;   // adaugi o stare nouă → eroare aici
    throw new Error("stare necunoscută");
  }
}
```

Trucul cu `never` transformă „am uitat să tratez noua stare" din bug de runtime în eroare de compilare.

## Capcane

- Discriminantul trebuie **literal** (`"loading"`), nu `string`. Cu `status: string` narrowing-ul nu funcționează.
- Nu abuza pentru două stări simple — un `boolean` e uneori suficient. Vezi [[KISS DRY YAGNI]].

## Legături

- Face parte din: [[MOC TypeScript]]
- [[TypeScript narrowing si type guards]]
- Aplicat: [[State management - arbore de decizie]] · [[Optimistic UI]]
