---
tags: [moc, meta]
created: 2026-08-11
type: moc
---

# MOC Vault

Cum funcționează vaultul ăsta. Reconstruit de la zero pe **11.08.2026**, după ce prima versiune
ajunsese la 150 de note și un graf ilizibil.

## Ce am învățat din prima versiune

- **Un graf care arată tot nu răspunde la nicio întrebare.** 128 de noduri și 830 de legături
  formează un ghem. Soluția nu e altă paletă, ci mai puține noduri pe ecran, alese după o
  întrebare — vezi [[Graph view - vederi]]
- **Notele scrise de altcineva nu se rețin.** Scheletele cu întrebări deschise sunt mai utile
  decât notele complete pe care nu le-ai scris tu
- **Nu turna zeci de noduri deodată.** Adaugi ce chiar deschizi

## Structura

| Folder         | Ce conține                               |
| -------------- | ---------------------------------------- |
| `notes/`       | note permanente — o idee per notă        |
| `maps/`        | MOC-uri — hărți de navigare, nu conținut |
| `projects/`    | proiecte active                          |
| `daily/`       | jurnalul zilnic, generat parțial automat |
| `meetings/`    | ședințe care au produs decizii           |
| `cheatsheets/` | referință rapidă                         |
| `decisions/`   | ADR-uri — decizii tehnice cu motivul lor |
| `_templates/`  | șabloane, filtrate din graf              |

## Convenții

- Nume de fișiere **fără diacritice**, conținut **în română, cu diacritice**
- Linkuri `[[Nume]]` fără cale — `newLinkFormat: shortest`
- Structura apare din linkuri, nu din foldere adânci
- `status: schelet` în frontmatter = notă de completat

## Automatizare

`scripts/sync-daily.ps1` scrie commit-urile zilei în nota zilei, între markeri, și mută tagurile
`#azi-focus` / `#azi`. Rulează singur la fiecare `git commit`, dintr-un hook `PostToolUse`
configurat în `~/.claude/settings.json`.

## Capcane plătite

- Configul grafului se scrie **doar la ieșirea completă din Obsidian** (`Ctrl+Q`, nu X)
- Iconița ⟲ din panoul Filters **resetează tot**, fără confirmare
- `.obsidian/graph.json` e versionat → un config bun se recuperează din git. **Commit după
  fiecare reglaj care îți place**
- Query-urile Dataview **nu produc legături** în graf

## Legat

- [[Graph view - vederi]] · [[MOC AI Engineer]] · [[Dashboard]]
