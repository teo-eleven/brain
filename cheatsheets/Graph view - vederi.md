---
tags: [cheatsheet]
created: 2026-08-11
type: cheatsheet
---

# Graph view — vederi

> Un graf care arată tot nu răspunde la nicio întrebare. 128 de noduri și 830 de legături
> formează un ghem în care ochiul nu urmărește nimic. Soluția nu e altă paletă de culori, ci
> **mai puține noduri pe ecran, alese după o întrebare anume**.

## Cum comuți vederea

Deschide graph view → iconița de **lupă** (sus-stânga în panou) → lipești filtrul de mai jos.
Obsidian îl salvează singur în `.obsidian/graph.json` **la închiderea aplicației**.

---

## 1. Jurnal — „ce am făcut și când"

**Activă acum.** 13 noduri din 128: zilele, review-urile săptămânale, proiectele.

```
-path:notes -path:maps -path:cheatsheets -path:snippets -path:decisions -path:inbox -path:people -path:_templates
```

Culori: `#azi-focus` magenta · `#azi` verde · `daily` violet · `weekly` violet închis ·
`projects` chihlimbar.

## 2. Cunoștințe — „ce știu despre X"

Doar notele permanente și hărțile lor. Fără jurnal, fără proiecte.

```
path:notes OR path:maps
```

Dacă `OR` nu se comportă, varianta echivalentă prin excluderi:

```
-path:daily -path:weekly -path:projects -path:cheatsheets -path:snippets -path:inbox -path:people -path:_templates
```

## 3. Tot, fără schele — graful complet, curățat

```
-path:_templates
```

Util rar: e tot un ghem, dar măcar fără cele 9 șabloane.

---

## Local graph — cel mai util dintre toate

**`Ctrl+P` → „Open local graph"**, cu nota deschisă.

Arată doar vecinătatea notei curente. Deschis pe nota zilei, răspunde exact la
„ce se petrece azi" — fără niciun filtru.

Reglaje care contează, din panoul lui:

| Setare         | Valoare   | De ce                                              |
| -------------- | --------- | -------------------------------------------------- |
| **Depth**      | 2         | 1 e prea sărac, 3 redevine ghem                    |
| Incoming links | pornit    | vezi cine te referă, nu doar pe cine referi        |
| Outgoing links | pornit    |                                                    |
| Neighbor links | **oprit** | altfel apar legături între vecini și se încâlcește |

Local graph se salvează în `workspace.json`, care e în `.gitignore` — deci setările lui
**nu se versionează** și se pierd la resetarea spațiului de lucru.

---

## Capcane, plătite pe 11.08

- **Configul se scrie la ieșirea din Obsidian.** Orice modificare făcută în `graph.json` cu
  aplicația pornită e suprascrisă. Închiderea trebuie să fie completă (`Ctrl+Q`) — butonul X
  lasă procesul în tray și configul tot se rescrie.
- **Iconița ⟲ din panoul Filters resetează tot**, fără confirmare: grupurile de culoare, forțele,
  filtrul. Așa s-au pierdut 13 grupuri de culoare deodată.
- **`.obsidian/graph.json` e versionat**, deci o configurație bună se poate recupera cu
  `git show <commit>:.obsidian/graph.json`. Merită un commit după fiecare reglaj care îți place.
- Mărimea unui nod în graph view = **numărul de linkuri primite**. Nu se poate forța pentru un
  nod anume; `Node size` e global. Pentru control real pe poziție și mărime → `Azi.canvas`.
- Query-urile Dataview **nu produc legături în graf**. Vezi [[Note orfane]].

## Note legate

- [[MOC Vault - cum functioneaza]] · [[Obsidian cheatsheet]]
