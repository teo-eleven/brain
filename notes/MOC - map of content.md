---
tags: [meta, pkm]
created: 2026-08-06
type: permanent
---

# MOC - map of content

## Ideea

Un MOC e o notă care **nu conține informație**, doar linkuri organizate pe o temă. Un cuprins scris de tine.

## De ce înlocuiește folderele

Un fișier stă într-un singur folder. O notă poate apărea în **oricâte MOC-uri**.

[[Idempotenta in API]] aparține la fel de mult în:
- [[MOC Backend si API]]
- [[MOC Arhitectura]]

Cu foldere trebuia să alegi. Cu MOC-uri, nu.

Al doilea avantaj: **un MOC exprimă cum gândești tu tema**, cu grupări și comentarii („cele care contează cel mai mult", „de învățat"). Un folder e o listă alfabetică fără opinie.

## Când creezi unul

**Nu la început.** Un MOC creat înainte să ai note e un folder gol cu pași în plus.

Regula: când ai **5-7 note pe o temă** și începi să te pierzi, faci un MOC. Îl lași să crească organic din note, nu invers.

Semnal clar: te-ai întrebat de două ori „unde era nota despre X?" — ai nevoie de un MOC.

## Ce pui într-un MOC

- linkuri **grupate pe subteme**, nu alfabetic
- **o propoziție de context** lângă fiecare link: de ce e acolo, ce spune
- link către MOC-ul părinte și cele frate
- o secțiune **„de învățat" cu `#question`** — lacunele conștientizate. Aici e cea mai mare valoare: știi ce nu știi.

## Ierarhia din vaultul ăsta

```
[[Dashboard]]
└── [[MOC Programare]]           rădăcina
    ├── [[MOC Python]]           limbaje
    ├── [[MOC Backend si API]]   straturi
    └── [[MOC Securitate]]       transversal
```

Maxim 3 nivele. Mai adânc și navigarea devine mai lentă decât căutarea.

## Capcane

- **MOC-uri care duplică folderele.** Dacă `MOC Python` conține exact fișierele din folderul `python/`, nu ai câștigat nimic. Valoarea vine din grupare și context, sau din faptul că adună note din locuri diferite.
- **MOC care devine notă.** Dacă începi să explici concepte în MOC, extrage-le într-o notă separată.
- MOC-uri prea multe, prea mici. Sub 5 linkuri, nu merită.

## Legături

- Face parte din: [[MOC Vault - cum functioneaza]]
- [[Nota atomica]] · [[Zettelkasten pe scurt]]
- [[ADR 002 - Structura vault fara foldere adanci]]
