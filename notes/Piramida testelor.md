---
tags: [testing]
created: 2026-08-06
type: permanent
---

# Piramida testelor

## Ideea

```
      /\      E2E        puține, lente, fragile, dar singurele
     /  \                care verifică că sistemul chiar funcționează
    /----\    Integrare  moderate — API + DB real
   /      \
  /--------\  Unit       multe, rapide, izolate
```

Multe unit, câteva de integrare, foarte puține E2E.

## De ce forma asta

Nu din dogmă — din **cost per informație**:

| Nivel | Durată | Localizează bug-ul | Fragilitate |
|---|---|---|---|
| Unit | ms | exact | mică |
| Integrare | zeci de ms–s | aproximativ | medie |
| E2E | secunde–minute | „ceva e rupt" | mare |

Un test unit care picat îți spune care funcție și de ce. Un E2E care picat îți spune că butonul nu merge — și petreci 20 de minute aflând de ce.

## Anti-pattern: conul de înghețată

Multe E2E, puține unit. Se întâmplă când echipa testează doar prin UI. Rezultat: suită care rulează 40 de minute, picată aleator în 10% din rulări, pe care nimeni nu mai crede și pe care în final o ignoră. **Un test flaky e mai rău decât niciun test** — antrenează echipa să ignore roșul.

## Ce testezi la fiecare nivel

- **Unit** — logică de business, calcule, transformări, validări, cazuri limită. Fără DB, fără rețea.
- **Integrare** — un endpoint cu bază de date reală (Testcontainers / DB de test): serializare, migrări, tranzacții, [[N+1 query problem]], drepturi de acces.
- **E2E** — 3-5 fluxuri critice, cele care aduc bani sau pe care nu-ți permiți să le rupi: login, plată, creare de document. Nu 200 de scenarii.

## Nuanța: „trophy" în loc de piramidă

Pentru aplicații web, mulți argumentează pentru mai multe teste de integrare decât unit — pentru că majoritatea bug-urilor reale apar **între** componente, nu în ele. E un argument bun. Ce rămâne valabil în ambele modele: **puține E2E**.

## Legături

- Face parte din: [[MOC Testare]]
- [[Ce nu merita testat]] · [[Coverage - metrica utila si capcana]]
- [[TDD - red green refactor]] · [[Test doubles - mock stub fake spy]]
