---
tags: [security, frontend]
created: 2026-08-06
type: permanent
---

# XSS

## Ideea

Cross-Site Scripting = input de utilizator ajunge în pagină și e interpretat ca **JavaScript** în loc de text. Atacatorul rulează cod în browserul altui utilizator, cu sesiunea acelui utilizator.

## Tipuri

| Tip | Cum ajunge |
|---|---|
| **Stored** | salvat în DB (comentariu), servit tuturor — cel mai grav |
| **Reflected** | dintr-un parametru de URL, într-un link trimis victimei |
| **DOM-based** | JS-ul din pagină scrie input în DOM fără sanitizare |

## Regula: escape la IEȘIRE, nu la intrare

Contraintuitiv, dar corect: **escapezi când afișezi**, nu când salvezi.

Motivul: escapingul depinde de **context**. Același text are nevoie de tratament diferit în HTML, în atribut, în URL, în JavaScript, în CSS. Dacă escapezi la intrare, ai stricat datele și tot nu ai acoperit toate contextele.

Salvezi datele curate. Afișezi escapat, potrivit contextului.

## În practică ești deja protejat, până nu ieși din protecție

React, Vue, Angular și motoarele de template moderne escapează automat. Vulnerabilitatea apare când o ocolești explicit:

```jsx
// Protejat automat
<div>{comentariu}</div>

// Vulnerabilitate deschisă intenționat
<div dangerouslySetInnerHTML={{ __html: comentariu }} />
```

Numele lui `dangerouslySetInnerHTML` e literal un avertisment. Echivalente: `innerHTML`, `v-html`, `[innerHTML]`, `|safe` în Jinja, `{{{ }}}` în Handlebars.

## Dacă chiar ai nevoie de HTML de la utilizator

Editor rich text, de exemplu. Atunci **sanitizezi cu o librărie matură** — DOMPurify — niciodată cu regex-uri proprii. Lista de vectori (`onerror`, `javascript:`, SVG, entități encodate) e prea lungă pentru a fi acoperită manual.

## Straturi suplimentare

- **Cookie `HttpOnly`** — JavaScript nu poate citi tokenul de sesiune. Un XSS rămâne grav, dar nu-ți fură direct sesiunea. Vezi [[JWT - ce e si ce nu e]] pentru de ce localStorage e mai riscant.
- **Content Security Policy** — blochează scripturi inline și surse neautorizate. Cel mai eficient strat secundar.
- `Cookie: SameSite=Lax` — și pentru CSRF.

## Legături

- Face parte din: [[MOC Securitate]] · [[MOC Frontend]]
- [[SQL injection]] — aceeași clasă de problemă: date interpretate ca cod
- [[OWASP Top 10 - pe scurt]] · [[JWT - ce e si ce nu e]]
