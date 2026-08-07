---
tags: [meta, pkm]
created: 2026-08-06
type: permanent
---

# Note orfane

## Ideea

O notă orfană nu are nicio legătură — nici spre alte note, nici dinspre ele. Există pe disc și e invizibilă în practică. **O notă nelegată e o notă pierdută.**

## De ce apar

- Ai scris-o repede și n-ai apucat să o legi (cazul normal)
- Ideea nu se potrivește cu nimic din vault → semn că e izolată de restul gândirii tale, merită întrebat de ce
- Ai redenumit o notă și linkurile s-au rupt (Obsidian le actualizează automat dacă `alwaysUpdateLinks` e activ — e activ în vaultul ăsta)

## Cum le găsești

**Graph view:** activează *Show orphans* în filtre. Nodurile plutind singure la margine.

**Căutare:** nu există un query nativ curat pentru asta. Cu Dataview:

```dataview
LIST
FROM "notes"
WHERE length(file.inlinks) = 0 AND length(file.outlinks) = 0
```

E în [[Dashboard]] ca query pregătit.

## Ce faci cu ele

Trei opțiuni, în ordinea frecvenței:

1. **Leagă-o.** Găsește MOC-ul de care aparține și 1-2 note frate. 90% din cazuri.
2. **Contopește-o.** Dacă e o idee parțială care aparține unei note existente, mută conținutul și șterge fișierul.
3. **Șterge-o.** Dacă nu se leagă de nimic și nu-ți spune nimic peste 6 luni, nu are valoare. **Ștergerea e o operație validă și sănătoasă** — un vault plin de note moarte devine un vault în care nu mai cauți.

## Ritmul

O dată pe săptămână, în [[Weekly review]], 5 minute. Nu mai mult.

## Nuanța

**Câteva note orfane sunt normale și nu e o problemă.** Nu vânează perfecțiunea — o notă scrisă acum 2 zile care încă n-a fost legată nu e „un defect al sistemului". Ținta e ca nimic să nu stea orfan **luni de zile**.

Similar, linkurile nerezolvate (către note care nu există încă) nu sunt erori — sunt intenții. Un `[[Chunking strategies]]` scris într-un MOC marchează ce vrei să studiezi. Obsidian îl arată gri; e o listă de dorințe, nu o problemă.

## Legături

- Face parte din: [[MOC Vault - cum functioneaza]]
- [[Graph view - ce e util]] · [[Cum scriu o nota permanenta]]
- [[MOC - map of content]]
