---
tags: [meta]
created: 2026-08-06
type: index
---

# 00 START HERE

Ăsta e vaultul tău. Citește pagina asta o dată, apoi n-o mai deschizi — de aici înainte punctul tău de intrare zilnic e [[Dashboard]] și daily note-ul de azi.

## Regula unică

> **Nu te întrebi niciodată „unde pun asta?". Răspunsul e mereu: în daily note-ul de azi.**

Structura apare din linkuri, nu din foldere. Când menționezi ceva important, îl pui în `[[paranteze duble]]`. Obsidian creează nota automat. Restul se aranjează singur.

## Ce e unde

| Folder | Ce ține | Cât de des îl atingi |
|---|---|---|
| `daily/` | un fișier per zi — jurnal, taskuri, log | **zilnic** |
| `notes/` | note permanente: o idee per fișier | de câteva ori pe zi |
| `maps/` | MOC-uri = note-index pe teme ([[MOC - map of content]]) | săptămânal |
| `projects/` | starea proiectelor active | săptămânal |
| `cheatsheets/` | referință rapidă (comenzi, sintaxă) | când uiți o comandă |
| `snippets/` | cod copy-paste-abil, testat | când scrii cod |
| `decisions/` | ADR-uri: decizii tehnice + motivul lor | rar, dar salvator |
| `people/` | oameni + context despre ei | rar |
| `weekly/` | review săptămânal | vineri |
| `inbox/` | ce n-ai avut timp să procesezi | golește-l vineri |
| `_templates/` | template-uri | nu îl deschizi manual |
| `attachments/` | imagini, PDF-uri (automat) | nu îl deschizi manual |

## Primele 5 minute în Obsidian

1. **Deschide graph view** — iconița de graf în bara din stânga, sau `Ctrl+G`. Vezi tot ce e aici, colorat pe categorii (daily = albastru, maps = mov, projects = verde). Joacă-te cu el 2 minute.
2. **`Ctrl+O`** — quick switcher. Scrie 3 litere din orice notă și sari la ea. Ăsta e cel mai folosit shortcut din Obsidian, de departe.
3. **`Ctrl+Shift+F`** — căutare în tot vaultul.
4. **Deschide o notă** din `notes/` și uită-te jos, la panoul **Backlinks**: vezi ce alte note o menționează. Nu ai construit tu lista aceea — a apărut din linkuri.
5. **Creează daily note-ul de azi**: `Ctrl+P` → scrie „daily" → *Open today's daily note*. Template-ul se aplică automat.

Restul shortcut-urilor sunt în [[Obsidian cheatsheet]].

## Cele 4 tipuri de notă (singurele reguli de care ai nevoie)

1. **Daily note** — jurnalul zilei. Punctul de intrare pentru orice.
2. **Notă permanentă** — o idee, atomică, cu cuvintele tale. Vezi [[Nota atomica]] și [[Cum scriu o nota permanenta]].
3. **Notă de proiect** — starea unui lucru în lucru + linkuri la tot ce ține de el.
4. **MOC** — notă-index care adună linkuri pe o temă. Înlocuiește folderele. Vezi [[MOC - map of content]].

## Convenția de tag-uri

Tag-urile sunt secundare — **linkurile sunt principalele**. Folosește tag-uri doar pentru filtrare transversală:

- `#python` `#typescript` `#sql` `#docker` — tehnologie
- `#todo` — ceva de făcut care nu e într-un daily note
- `#question` — ceva ce nu înțeleg încă și vreau să revin
- `#seed` — notă începută, incompletă (opusul unei note „gata")
- `#ref` — referință externă (link, carte, video)

## Ce să NU faci (greșelile clasice)

- **Nu construi structura perfectă înainte să scrii.** Vaultul asta e deja mai structurat decât ai nevoie. Scrie în el 2 săptămâni înainte să schimbi ceva.
- **Nu copia articole întregi.** O notă permanentă e reformulată cu cuvintele tale, altfel n-ai învățat nimic. Vezi [[Feynman technique]].
- **Nu face foldere adânci.** Vezi [[ADR 002 - Structura vault fara foldere adanci]].
- **Nu urmări graful global** ca instrument de lucru. Vezi [[Graph view - ce e util]] pentru ce e util și ce e hype.

## Plugin-uri de instalat (după prima săptămână, nu acum)

Settings → Community plugins → Browse:

| Plugin | De ce | Prioritate |
|---|---|---|
| **Dataview** | query-uri peste note: „toate taskurile nebifate din 30 de zile". [[Dashboard]] îl folosește deja. | mare |
| **Templater** | template-uri cu logică (data de ieri/mâine, prompt-uri) | medie |
| **Calendar** | navigare vizuală prin daily notes | medie |
| **Excalidraw** | desene/diagrame în vault | mică |

Pentru istoric de modificări nu ai nevoie de niciun plugin: **File recovery** e deja activ (`Ctrl+P` → *File recovery*) și păstrează snapshot-uri locale ale fiecărei note.

## Vaultul și Claude Code

Totul aici e markdown pe disc, deci Claude Code poate lucra direct în vault. Vezi [[Second Brain]] pentru ce merită automatizat și ce nu.

---

**Următorul pas:** deschide [[Dashboard]].
