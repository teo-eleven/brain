---
tags: [react, frontend, ux]
created: 2026-08-06
type: permanent
---

# Optimistic UI

## Ideea

Actualizezi interfața **imediat**, presupunând că operația va reuși, și corectezi doar dacă eșuează. Utilizatorul nu vede niciodată spinner pentru acțiuni care reușesc în 99% din cazuri.

## De ce contează

Un like cu spinner de 300 ms pare rupt. Un like instant care se retrage o dată la 100 de încercări pare rapid. Percepția vitezei bate viteza reală.

## Cum arată

```jsx
async function adaugaComentariu(text) {
  const temp = { id: `temp-${crypto.randomUUID()}`, text, pending: true };
  setComentarii(c => [...c, temp]);                // 1. optimist, imediat

  try {
    const real = await api.post("/comentarii", { text });
    setComentarii(c => c.map(x => x.id === temp.id ? real : x));   // 2. înlocuiește
  } catch (e) {
    setComentarii(c => c.filter(x => x.id !== temp.id));           // 3. retrage
    toast.error("Nu s-a putut salva. Încearcă din nou.");           // 4. spune de ce
  }
}
```

Cele patru părți sunt obligatorii. Fără pasul 4, utilizatorul vede conținutul dispărând fără explicație — mai rău decât un spinner.

## Când o folosești

**Da:** like, favorite, bifă de task, ștergere din listă, reordonare, editare de text — operații cu rată de eșec mică și consecințe reversibile.

**Nu:** plăți, semnături, orice ireversibil, orice unde serverul calculează valori pe care clientul nu le poate anticipa (număr de factură, total cu taxe, stoc rezervat). Acolo aștepți răspunsul real.

## Capcane

- **Id-uri temporare.** Dacă utilizatorul dă click pe elementul optimist înainte să vină id-ul real, ai un request către `/comentarii/temp-abc`. Blochează acțiunile pe elementele `pending`.
- **Retragere vizibilă.** Rollback-ul trebuie să fie evident (toast + element care dispare), altfel utilizatorul crede că s-a salvat.
- Cu React Query, `onMutate` + `onError` cu snapshot al cache-ului face asta corect și mai simplu decât manual.
- Serverul rămâne singura sursă de adevăr. Optimismul e strict o iluzie de UI, nu o decizie de business. Serverul trebuie să valideze la fel de strict.
- Retry-ul unei mutații optimiste are nevoie de [[Idempotenta in API]] — altfel un retry creează două comentarii.

## Legături

- Face parte din: [[MOC Frontend]]
- [[State management - arbore de decizie]] · [[Discriminated unions]]
- [[Idempotenta in API]]
