---
tags: [meta]
created: 2026-08-06
type: index
---

# Dashboard

Pagina de start de zi cu zi. Pune-o la **bookmark** (`Ctrl+P` → *Bookmark current file*) ca s-o ai mereu la un click.

## Astăzi

- [[00 START HERE]] — cum funcționează vaultul
- Daily note de azi: `Ctrl+P` → *Open today's daily note*
- [[Inbox]] — ce am aruncat aici și n-am procesat

### Unde am lucrat azi

> **[[Azi.canvas|🗺 Harta zilei]]** — ziua curentă poziționată în afara grafului, la dreapta,
> cu ședințele Teams dedesubt. Poziții fixe, ce graph view-ul nu poate face.

Notele marcate `#azi-focus` (nota zilei, **magenta**) și `#azi` (proiectele atinse, **verde**) —
în [[Graph view - ce e util|graph view]] ies din paleta restului. Le mută automat
`scripts/sync-daily.ps1`.

```dataview
LIST
FROM #azi
SORT file.name ASC
```

### Commit-urile de azi

```dataview
TABLE WITHOUT ID file.link AS "Zi", file.mtime AS "Actualizat"
FROM "daily"
SORT file.name DESC
LIMIT 3
```

## Hărți (MOC-uri)

Punctele de intrare pe teme. Fiecare adună notele relevante.

| | |
|---|---|
| [[MOC Programare]] — rădăcina | [[MOC Arhitectura]] |
| [[MOC Python]] | [[MOC TypeScript]] |
| [[MOC Backend si API]] | [[MOC Frontend]] |
| [[MOC Baze de date]] | [[MOC DevOps si Deploy]] |
| [[MOC Securitate]] | [[MOC Testare]] |
| [[MOC Git si Workflow]] | [[MOC AI si LLM]] |
| [[MOC Invatare si Cariera]] | [[MOC Vault - cum functioneaza]] |

## Proiecte active

- [[ADM Expert]]
- [[Pizza Punto]]
- [[Second Brain]]

## Referință rapidă

[[Git cheatsheet]] · [[Docker cheatsheet]] · [[SQL cheatsheet]] · [[PowerShell cheatsheet]] · [[Regex cheatsheet]] · [[pytest cheatsheet]] · [[Obsidian cheatsheet]]

---

## Query-uri live

> [!warning] Necesită plugin-ul **Dataview**
> Până îl instalezi (Settings → Community plugins → Browse → „Dataview"), blocurile de mai jos apar ca text simplu. Nu e o eroare.

### Taskuri nebifate din ultimele 30 de zile

```dataview
TASK
WHERE !completed AND file.folder = "daily"
SORT file.name DESC
LIMIT 40
```

### Note atinse ultima dată acum mult (candidate de revizuit)

```dataview
TABLE file.mtime AS "Modificat"
FROM "notes"
SORT file.mtime ASC
LIMIT 15
```

### Note marcate ca incomplete

```dataview
LIST
FROM #seed OR #question
SORT file.name ASC
```

### Ultimele 10 zile

```dataview
LIST
FROM "daily"
SORT file.name DESC
LIMIT 10
```

### Decizii tehnice luate

```dataview
TABLE created AS "Data", status AS "Status"
FROM "decisions"
SORT created DESC
```

---

## Fără Dataview — echivalente native

Funcționează din prima, fără plugin. Lipește în bara de căutare (`Ctrl+Shift+F`):

| Ce vrei | Query de căutare |
|---|---|
| Taskuri nebifate | `task-todo:""` |
| Taskuri nebifate doar în daily | `path:daily task-todo:""` |
| Note incomplete | `tag:#seed OR tag:#question` |
| Tot despre Python | `tag:#python` |
| Note fără nicio legătură | Graph view → filtrează, vezi [[Note orfane]] |
