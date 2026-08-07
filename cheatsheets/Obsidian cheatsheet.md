---
tags: [obsidian, meta, ref]
created: 2026-08-06
type: cheatsheet
---

# Obsidian cheatsheet

## Shortcut-uri esențiale

| Shortcut | Ce face |
|---|---|
| **`Ctrl+O`** | **Quick switcher — cel mai folosit. Scrie 3 litere, sari la notă.** |
| `Ctrl+P` | Command palette (orice comandă, inclusiv „daily note") |
| `Ctrl+Shift+F` | Căutare în tot vaultul |
| `Ctrl+F` | Căutare în nota curentă |
| `Ctrl+N` | Notă nouă |
| `Ctrl+E` | Comută editare / preview |
| `Ctrl+G` | Graph view |
| `Ctrl+click` pe link | Deschide în panou nou |
| `Alt+←` / `Alt+→` | Navigare înapoi / înainte |
| `Ctrl+Alt+←/→` | Comută între panouri |
| `Ctrl+,` | Setări |

Dacă înveți doar unul: **`Ctrl+O`**.

## Sintaxă de linkuri

```markdown
[[Nota]]                    link simplu
[[Nota|alt text]]           link cu text afișat diferit
[[Nota#Secțiune]]           link la un heading
[[Nota#^abc123]]            link la un bloc anume
![[Nota]]                   TRANSCLUDE (afișează conținutul notei aici)
![[imagine.png]]            imagine
![[Nota#Secțiune]]          transclude doar o secțiune
```

Transcluderea (`![[...]]`) e subutilizată: poți construi un MOC care afișează efectiv secțiuni din alte note.

## Sintaxă utilă

```markdown
#tag  #tag/imbricat
> [!note] Callout
> [!warning] Avertisment
> [!tip] Sfat
- [ ] task nebifat
- [x] task bifat
%% comentariu invizibil în preview %%
==text evidențiat==
^blocId                     ancoră la sfârșitul unui paragraf
```

Callout-urile disponibile: `note`, `tip`, `info`, `warning`, `danger`, `success`, `question`, `example`, `quote`.

## Operatori de căutare

```
tag:#python                 după tag
path:daily                  în cale
file:2026-08                în numele fișierului
line:(a b)                  ambele pe aceeași linie
task-todo:""                toate taskurile nebifate
task:""                     toate taskurile
/regex/                     expresie regulată
"frază exactă"
-excludere                  exclude termenul
```

Combinabile: `path:daily task-todo:"" -tag:#done`

## Comenzi din Command Palette (`Ctrl+P`)

- *Open today's daily note*
- *Insert template*
- *Rename file* — actualizează automat toate linkurile
- *Insert current date / time*
- *Open graph view* / *Open local graph*
- *Toggle bookmark*
- *Move file to another folder*

## Panouri care merită deschise

- **Backlinks** (jos în notă, sau panou lateral) — ce menționează nota curentă. **Cel mai valoros panou.**
- **Outgoing links** — ce menționează nota, inclusiv linkurile nerezolvate
- **Local graph** — vecinii imediați
- **Outline** — cuprinsul notei

## Bookmark-uri

`Ctrl+P` → *Bookmark current file*. Pune la bookmark: [[Dashboard]], [[00 START HERE]], daily note-ul.

## Plugin-uri de instalat

Settings → Community plugins → Turn on → Browse:

| Plugin | Pentru ce |
|---|---|
| **Dataview** | query-uri peste note — [[Dashboard]] îl folosește deja |
| **Templater** | template-uri cu logică (data de ieri/mâine) |
| **Calendar** | navigare vizuală prin daily notes |
| **Excalidraw** | desene și diagrame |
| **Omnisearch** | căutare mai bună, fuzzy |

## Recuperarea unei versiuni anterioare

`Ctrl+P` → **File recovery** → *Open saved snapshots*. Plugin core, deja activ, păstrează versiuni locale ale fiecărei note. Ăsta e mecanismul de istoric în vaultul ăsta — vezi [[ADR 001 - Vault local markdown pe D]].

## Legături

- [[MOC Vault - cum functioneaza]] · [[00 START HERE]] · [[Dashboard]]
- [[Graph view - ce e util]] · [[Conventii de denumire in vault]]
