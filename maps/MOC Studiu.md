---
tags: [moc, studiu]
created: 2026-08-12
type: moc
---

# MOC Studiu

Coada de învățare. **[[MOC AI Engineer]]** spune _ce știu_; asta spune _la ce lucrez acum_ și
_ce urmează_.

Nodul ăsta e portocaliu în graf, la fel ca notele marcate `#studiu` — vezi
[[Graph view - vederi]]. `Ctrl+O` → „studiu" te aduce direct aici.

## Cum se folosește

1. Iei o notă din coada de mai jos și îi pui tag-ul `#studiu` — devine portocalie în graf.
2. O completezi: scoți `status: schelet` din frontmatter și scrii ideea **cu vorbele tale**.
3. Scoți `#studiu`. Marcajul e temporar — dacă rămâne pe 20 de note, nu mai iese nimic în evidență.

Ține **2-3 note** marcate simultan, nu mai multe.

---

## Acum — atinse direct de munca pe [[QA AI Agent]]

Astea au deja context real din trei zile de lucru, deci sunt cel mai ieftin de completat:

- [[Esecul tacut in sisteme AI]] — a apărut trei zile la rând, în trei straturi diferite
- [[Tracing LLM - spans si context]] — ce nu ajunge în trace nu se poate măsura
- [[Ground truth pentru evaluare]] — degradarea tăcută se vede **doar** prin golden
- [[Experiment inainte de concluzie]] — separatorul părea limită de model; era promptul
- [[Inregistrare si reluare in teste]] — suita rulează gratis, fără rețea

## Urmează — evaluare

- [[Metrici pentru agenti AI]] — cele 4 Primary și pragurile pe clasă de risc
- [[LLM as judge]] — ce se verifică determinist și ce cere judecată
- [[Evals inainte de prompt changes]] — fără evals, orice schimbare de prompt e ghicit
- [[Fluxul zilnic de evaluare]] — cum arată o zi de iterat pe graderi
- [[Versionarea prompturilor]] — fără versiune, nu știi ce s-a schimbat între două rulări
- [[DeepEval - evaluare automata]] · [[promptfoo - teste pe prompturi]]

## Urmează — limite și costuri

- [[Context window - management]] — context mai mare ≠ răspuns mai bun
- [[Reasoning tokens si bugetul de output]] — gândirea consumă din bugetul de răspuns
- [[Cost-aware model routing]] — modelul mic întâi, escaladezi doar când trebuie

## Mai târziu — stack

- [[Langfuse - tracing pentru LLM]] · [[LiteLLM - gateway pentru modele]]
- [[FastAPI - API async]] · [[Pydantic v2 - validare la boundary]]
- [[Celery si Redis - joburi asincrone]] · [[Alembic - migrari de schema]]
- [[Docker Compose - stack local]] · [[uv - pachete Python rapid]]

## Mai târziu — capabilități și securitate

- [[Tool use - function calling]] · [[MCP - Model Context Protocol]]
- [[Prompt injection - aparare]] — la extracție, documentul **este** input-ul
- [[Validarea output-ului LLM]] — regula de aur, merită scrisă cu vorbele tale

## Unelte

- [[Claude Code - configurare]] · [[Lucrul cu agenti in terminal]] · [[Debugging un prompt]]
- [[Cum citesc un trace]] — în ce ordine te uiți

---

## Ce am învățat

Lecții transferabile, cu data. Ce se repetă aici merită promovat într-o notă permanentă.

### 2026-08-12

Din munca pe [[QA AI Agent]] — vezi [[2026-08-12]]:

- **Un raport poate agrega pe altă unitate decât definește specul, și tot pare corect.**
  Numărătoarea mergea pe gradări, nu pe cazuri: `task_success` avea 18 cazuri și raporta 36,
  fiindcă doi graderi scriu pe aceeași metrică. Numărul nu era absurd, deci nu sărea în ochi.
  **Verifică unitatea de agregare, nu doar valoarea.**
- **„Nu s-a măsurat" nu e „a trecut".** O metrică pe care suita n-a exercitat-o primește `n/a`,
  niciodată `ok`. A patra zi consecutivă pe aceeași temă — [[Esecul tacut in sisteme AI]].
- **Configurația duplicată diverge în tăcere.** Citirea și scrierea din Langfuse aveau fiecare
  propria copie a host-ului și a cheilor. Nimic nu crapă când schimbi un implicit într-un loc și
  îl ratezi în celălalt — doar se comportă diferit. Un singur loc pentru o valoare.
- **Publicarea repetată trebuie să fie idempotentă.** Id-ul item-ului = `case_id`, deci a doua
  rulare suprascrie. Fără asta rămân două versiuni ale aceluiași caz și nu mai știi care e
  adevărul curent.
- **Un caz care nu-și poartă contextul nu se poate reproduce.** Promptul se scrie întreg în
  fiecare item, chiar dacă 14 din 18 îl au identic — aici s-a dovedit că o singură frază schimbă
  rezultatul ([[Experiment inainte de concluzie]]).

Din vault — vezi [[Graph view - vederi]]:

- **Linkurile generate de Dataview nu produc muchii în graf.** Un hub construit din query-uri
  arată gol în graph view. Hub-urile se fac pe legături `[[...]]` scrise.
- **Obsidian nu interpretează tag-uri în cod inline.** Un `` `#studiu` `` în text explicativ nu
  colorează nota — util când documentezi chiar tag-ul pe care îl folosești.
- **Configul de graf se pierde dacă Obsidian e pornit.** Aplicația își rescrie
  `.obsidian/graph.json` din memorie la ieșire. `Ctrl+Q`, nu X.

## Legat

- [[MOC AI Engineer]] — rădăcina · [[MOC Stack AI]] · [[MOC Vault]] · [[Dashboard]]
