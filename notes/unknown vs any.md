---
tags: [typescript, types]
created: 2026-08-06
type: permanent
---

# unknown vs any

## Ideea

- **`any`** — „nu verifica nimic". Dezactivează TypeScript pe valoarea aia și pe tot ce derivă din ea.
- **`unknown`** — „nu știu ce e, și **nu ai voie să-l folosești** până nu dovedești ce e".

`unknown` e ce ai vrut de fapt de fiecare dată când ai scris `any`.

## De ce contează

```ts
const a: any = JSON.parse(raw);
a.user.name.toUpperCase();     // compilează. crapă la runtime.

const u: unknown = JSON.parse(raw);
u.user;                        // eroare de compilare. bine.
if (isUser(u)) u.name;         // ok, ai verificat
```

`any` e contagios: o valoare `any` propagă lipsa de verificare prin toate operațiile pe care o faci cu ea. Un `any` într-un loc central poate anula type safety-ul pe jumătate de aplicație, silențios.

## Practic

- `JSON.parse` returnează `any` — tratează-l imediat ca `unknown` și validează. Vezi [[Validarea output-ului LLM]] și analogul [[Pydantic - validare la boundary]].
- În `catch (e)`, `e` e `unknown` (cu `useUnknownInCatchVariables`). Corect: nu ai nicio garanție că cineva a aruncat un `Error`.
- Activează `noImplicitAny` în `tsconfig.json`. Dacă un `any` chiar e necesar, scrie-l explicit cu un comentariu care spune de ce — un `any` intenționat e acceptabil, un `any` accidental nu.

## Capcane

- Type assertion (`as User`) e o minciună spusă compilatorului, nu o verificare. Nu rezolvă problema pe care o rezolvă un type guard.
- `as unknown as X` — dublul cast e semnalul clar că faci ceva ce sistemul de tipuri consideră greșit. Uneori necesar, mereu suspect.

## Legături

- Face parte din: [[MOC TypeScript]]
- [[TypeScript narrowing si type guards]] — cum treci de la `unknown` la tip concret
- [[Validarea output-ului LLM]]
