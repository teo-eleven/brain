---
tags: [typescript, types]
created: 2026-08-06
type: permanent
---

# TypeScript generics - baza

## Ideea

Un generic e un **parametru de tip**: scrii funcția o dată, iar tipul concret vine de la apelant. E exact ca un parametru normal, doar că valoarea lui e un tip.

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

first([1, 2, 3]);        // T = number
first(["a"]);            // T = string
```

Fără generic ai fi scris `any[]` și ai fi pierdut tipul la ieșire.

## Constrângeri

`extends` limitează ce poate fi `T`:

```ts
function sortBy<T, K extends keyof T>(items: T[], key: K): T[] { ... }

sortBy(facturi, "valoare");   // ok
sortBy(facturi, "inexistent"); // eroare de compilare
```

Asta e locul unde generics devin chiar utile: nu doar păstrează tipul, îl **validează**.

## Când NU folosești generics

- Dacă tipul e cunoscut, scrie-l. Un generic folosit o singură dată, într-un singur loc, e complexitate fără câștig.
- Dacă ai `<T, U, V, W>` și trei constrângeri condiționale, aproape sigur ai un design prea abstract. Vezi [[KISS DRY YAGNI]].

Regula: **un generic se justifică când relația dintre intrare și ieșire trebuie păstrată.** Dacă nu există o astfel de relație, nu-ți trebuie.

## Capcane

- Numele `T`, `U` nu spun nimic. `TItem`, `TKey` se citesc mai bine în erori.
- Default-uri (`<T = string>`) ascund uneori faptul că inferența a eșuat.
- Erorile de generics sunt cele mai urâte din TypeScript. Citește-le de jos în sus.

## Legături

- Face parte din: [[MOC TypeScript]]
- [[TypeScript type vs interface]] · [[Discriminated unions]]
