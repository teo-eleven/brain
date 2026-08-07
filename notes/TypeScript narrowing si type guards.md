---
tags: [typescript, types]
created: 2026-08-06
type: permanent
---

# TypeScript narrowing si type guards

## Ideea

Narrowing = TypeScript îngustează singur tipul pe baza fluxului de control. Nu trebuie să-i spui; trebuie doar să scrii verificări pe care le înțelege.

```ts
function f(x: string | number) {
  if (typeof x === "string") {
    x.toUpperCase();   // aici x e string
  } else {
    x.toFixed(2);      // aici e number
  }
}
```

## Ce declanșează narrowing

| Verificare | Îngustează |
|---|---|
| `typeof x === "string"` | primitive |
| `x instanceof Error` | clase |
| `"email" in obj` | prezența unei proprietăți |
| `if (x)` | scoate `null`/`undefined`/falsy |
| `x.kind === "a"` | [[Discriminated unions]] |
| `Array.isArray(x)` | array |

## Type guard custom

Când verificarea e prea complexă, o încapsulezi și îi spui compilatorului ce dovedește:

```ts
function isUser(v: unknown): v is User {
  return typeof v === "object" && v !== null
    && "id" in v && "email" in v;
}
```

`v is User` e promisiunea ta. **TypeScript nu o verifică** — dacă funcția minte, ai un bug de runtime cu type safety aparent. De asta pentru date externe e mai sigur un validator de schemă (Zod) decât un guard scris de mână.

## Capcane

- Narrowing se **pierde** după un `await` sau într-un callback — TypeScript nu poate ști ce s-a schimbat între timp. Extrage valoarea într-o constantă locală.
- `if (x)` pe un `number` elimină și `0`; pe un `string` elimină și `""`. Aproape mereu nu e ce vrei — folosește `!= null`.
- Un guard care returnează `boolean` simplu nu îngustează nimic. Trebuie `v is X`.

## Legături

- Face parte din: [[MOC TypeScript]]
- [[unknown vs any]] · [[Discriminated unions]]
