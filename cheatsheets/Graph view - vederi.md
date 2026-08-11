---
tags: [cheatsheet, meta]
created: 2026-08-11
type: cheatsheet
---

# Graph view — vederi

Un graf care arată tot nu răspunde la nicio întrebare. Comuți vederea după ce vrei să afli.

**Cum:** graph view → iconița de **lupă** → lipești filtrul. Obsidian îl salvează în
`.obsidian/graph.json` la **închiderea completă** a aplicației (`Ctrl+Q`).

---

## 1. Tot — activă acum

```
-path:_templates
```

Toate notele, fără șabloane. Merge cât timp vaultul e mic. Când devine ghem, treci pe una din
vederile de mai jos.

## 2. Jurnal — „ce am făcut și când"

Doar zilele, săptămânile și proiectele.

```
-path:notes -path:maps -path:cheatsheets -path:snippets -path:decisions -path:inbox -path:people -path:_templates
```

## 3. Cunoștințe — „ce știu despre X"

Doar notele permanente și hărțile lor.

```
-path:daily -path:weekly -path:projects -path:meetings -path:_templates
```

## 4. Local graph — cel mai util

**`Ctrl+P` → „Open local graph"**, cu nota deschisă. Arată doar vecinătatea ei — pe nota zilei
răspunde exact la „ce se petrece azi", fără niciun filtru.

| Setare         | Valoare   | De ce                           |
| -------------- | --------- | ------------------------------- |
| **Depth**      | 2         | 1 e prea sărac, 3 redevine ghem |
| Incoming links | pornit    | vezi cine te referă             |
| Outgoing links | pornit    |                                 |
| Neighbor links | **oprit** | altfel se încâlcește            |

Setările lui stau în `workspace.json`, care e în `.gitignore` — **nu se versionează**.

---

## Culorile configurate

| Query            | Culoare                  |
| ---------------- | ------------------------ |
| `tag:#azi-focus` | magenta — ziua curentă   |
| `tag:#azi`       | verde — atins azi        |
| `path:daily`     | violet                   |
| `path:projects`  | chihlimbar               |
| `path:maps`      | cyan — hub-urile         |
| `path:notes`     | albastru — masa grafului |

## Ce nu se poate

- **Un nod anume nu poate fi mai mare.** Mărimea = numărul de linkuri primite; `Node size` e global
- **Nodurile nu se pot poziționa.** Layoutul e o simulare de forțe. Pentru control real pe poziție
  și mărime → **Canvas**

## Legat

- [[MOC Vault]]
