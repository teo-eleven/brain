---
tags: [typescript, types]
created: 2026-08-06
type: permanent
---

# TypeScript type vs interface

## Ideea

Pentru forma unui obiect, sunt aproape identice. Diferențele reale:

| | `interface` | `type` |
|---|---|---|
| Declaration merging (două declarații se unesc) | da | nu |
| Union / intersection / condiționale | nu | da |
| Mapped types, template literals | nu | da |
| Mesaje de eroare | uneori mai clare | uneori expandate urât |

## Regula practică

**`interface` pentru forme de obiect care ar putea fi extinse. `type` pentru orice altceva** — uniuni, alias-uri, tipuri derivate.

Dar sincer: e o decizie de consistență, nu de corectitudine. Alege una pentru proiect și nu te mai gândi. Timpul irosit pe dezbaterea asta e mai mare decât orice câștig.

## Unde diferența chiar contează

`type` poate face lucruri pe care `interface` nu poate:

```ts
type Status = "loading" | "success" | "error";      // union
type Keys = keyof Factura;                          // derivat
type Partial2<T> = { [K in keyof T]?: T[K] };       // mapped
```

Iar `interface` poate face un lucru pe care `type` nu poate — și de obicei nu-l vrei:

```ts
interface Window { myApp: App }   // se unește cu Window global
```

Merging-ul e util pentru augmentarea tipurilor unei librării externe. În codul tău propriu e o sursă de confuzie.

## Legături

- Face parte din: [[MOC TypeScript]]
- Cel mai util pattern cu `type`: [[Discriminated unions]]
- [[TypeScript generics - baza]]
- Echivalent Python: [[Python type hints]]
