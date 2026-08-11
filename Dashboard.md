---
tags: [meta]
created: 2026-08-11
type: note
---

# Dashboard

## Azi

```dataview
LIST
FROM "daily"
SORT file.day DESC
LIMIT 3
```

Nota zilei se creează singură la primul `git commit` din repo-urile urmărite
(`scripts/sync-daily.ps1`, rulat dintr-un hook).

## Hărți

|                                |                         |
| ------------------------------ | ----------------------- |
| [[MOC AI Engineer]] — rădăcina | [[MOC Stack AI]]        |
| [[MOC Operatii zilnice]]       | [[MOC Sedinte]]         |
| [[MOC Vault]]                  | [[Graph view - vederi]] |

## Proiecte

```dataview
TABLE status AS "Stare", file.mday AS "Atins"
FROM "projects"
SORT file.mday DESC
```

## De completat — schelete

Note cu context și întrebări, dar fără ideea scrisă de mine:

```dataview
LIST
FROM "notes"
WHERE status = "schelet"
SORT file.name ASC
```

## Întrebări deschise

```dataview
TASK
FROM "maps"
WHERE !completed
LIMIT 10
```

## Ședințe recente

```dataview
LIST
FROM "meetings"
SORT file.day DESC
LIMIT 5
```

## Note orfane

Fără linkuri de intrare — ori le legi, ori le ștergi:

```dataview
LIST
FROM "notes"
WHERE length(file.inlinks) = 0
SORT file.name ASC
LIMIT 15
```
