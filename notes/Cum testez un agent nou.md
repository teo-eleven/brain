---
tags: [note, ai]
created: 2026-08-19
type: note
status: schelet
---

# Cum testez un agent nou

## De ce e aici

Harness-ul din [[QA AI Agent]] a fost construit pentru **un** agent, „Extracție".
Întrebarea care urmează inevitabil — și pe care n-o pune nimeni până nu apare al
doilea agent — e: **cât din el se refolosește?**

Nota asta e răspunsul, împărțit în ce e comun tuturor tipurilor din
[[Tipuri de agenti AI]] și ce trebuie scris din nou de fiecare dată.

## Ce trebuie știut

### Ce se refolosește integral, indiferent de tip

Infrastructura, adică partea scumpă:

- **Bucla de măsurare** — dataset → rulare → gradare → verdict → raport, cu cele
  trei moduri (`offline` gratis, `--replay` pe înregistrări, `--real` pe agentul
  viu). Vezi [[Fluxul zilnic de evaluare]].
- **Traseul trace-ului** — [[LiteLLM - gateway pentru modele]] →
  [[Langfuse - tracing pentru LLM]] → grader → scorul scris **înapoi pe trace**.
  Vezi [[Cum citesc un trace]].
- **Graderii independenți de conținut:**

  | Grader                 | Ce verifică                               | De ce merge oriunde                                               |
  | ---------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
  | Integritatea execuției | `finish_reason`, muncă sărită, succes gol | orice agent poate fi trunchiat sau poate „reuși" cu zero rezultat |
  | Cost & latență         | tokeni, pași, timp                        | se citesc din trace, nu din output                                |
  | Prompt injection       | rezistă la instrucțiuni ostile în date    | orice agent care primește text din exterior                       |
  | Consistență (`pass@k`) | aceeași intrare, N rulări                 | nedeterminismul nu ține de tip                                    |

- **Disciplina de raportare** — `applicable=False` ≠ `pass`. Un grader care n-a
  verificat nimic nu se numără ca reușită, altfel un tablou care afișează „% pass"
  arată 100% pe o metrică neexercitată niciodată. Aceeași regulă ca
  „**un «0» nu se arată verde**" — [[Esecul tacut in sisteme AI]].
- **Guard-ul de rețea** din `conftest.py` și sonda de izolare `leak`.

### Ce se scrie din nou, de fiecare dată

Trei lucruri, și doar trei:

1. **Adaptorul de agent** — cum se cheamă agentul și ce întoarce.
2. **Graderii de conținut** — ce înseamnă „corect" pentru tipul ăsta.
3. **Forma golden-ului** — ce se compară cu ce.

Al doilea punct depinde direct de tipul tehnic:

| Tip tehnic                      | Graderi de conținut                                             |
| ------------------------------- | --------------------------------------------------------------- |
| Extracție → date structurate    | schemă, completitudine, duplicate, fidelitate pe câmp           |
| Matching / rerank               | metrici IR: precision@k, recall@k, MRR, marja de scor           |
| Retrieval / RAG                 | citarea sursei, fidelitate față de sursă, acoperire             |
| Clasificare                     | matrice de confuzie, acord pe clasă                             |
| Generare structurată constrânsă | validator de constrângeri — corect prin construcție             |
| Tool-use / mutare de stare      | tool-ul corect, parametrii corecți, starea de după              |
| Orchestrare / multi-agent       | eficiența traiectoriei: drum rezonabil vs bucle și pași inutili |
| Voce / multimodal realtime      | latență percepută, întreruperi, acuratețe de transcriere        |

### Cusătura din cod, azi

**Registrul de graderi e deja generic.** `src/qaharness/graders/__init__.py` spune
explicit: scrii un modul cu un tuplu `GRADERS` și îl pui în `_MODULES` — nu se atinge
nimic altceva. Un tip nou de agent înseamnă un fișier nou, nu o refactorizare.

**Contractul de agent NU e generic.** `agents/base.py` definește
`ExtractionAgent`, cu `run(golden, run_index) -> AgentOutput`, unde `Golden` și
`AgentOutput` sunt formate de rânduri extrase. Un agent de matching întoarce
perechi cu scor, nu rânduri; unul de orchestrare întoarce o traiectorie. **Aici e
lucrarea reală de generalizare**, și e bine că e un singur `Protocol`, nu o
ierarhie.

De reținut înainte de a o face: contractul actual e bun tocmai fiindcă e îngust.
Un `Protocol` lărgit prematur, ca să „încapă orice agent", devine un dicționar
generic în care nu se mai verifică nimic — și atunci graderii primesc `Any`.
Regula: se lărgește la **al doilea** tip concret, nu în anticiparea lui
(vezi YAGNI).

### Ordinea, când apare un agent nou

1. **Etichetează-l pe două niveluri** — [[Tipuri de agenti AI]]. Nivelul 1 îți dă
   graderii, nivelul 2 îți dă datele.
2. **Află de unde vine ground truth-ul** înainte de orice cod. Dacă e „scris de
   mână", costul pilotului e o zi de om, nu o oră — [[Ground truth pentru evaluare]].
3. **Stabilește unitatea de evaluare.** La agenții multi-pas nu e agentul, e pasul
   sau configurația. Dacă greșești aici, toate ratele de mai târziu răspund la altă
   întrebare decât cea pusă.
4. **Ia un eșantion reprezentativ înainte de suita de stres.** La extracție,
   ordinea a fost pe dos — s-a construit suita grea prima, iar eșantionul de 30 de
   documente banale a venit abia pe 13.08. Cazurile grele spun cât de rău poate fi;
   doar cele banale spun cum e de obicei.
5. **Pornește cu graderii comuni**, care merg din prima zi și dau deja un baseline
   de cost, latență și integritate.
6. **Adaugă graderii de conținut**, câte unul, fiecare cu cazuri offline care
   verifică graderul, nu modelul. Un grader netestat e o părere cu autoritate.
7. **Pragurile la urmă**, din date măsurate, nu presupuse. Non-regresia n-are sens
   sub ~100 de cazuri: cu 18, un caz singur valorează ~5pp, iar orice prag de 3pp e
   zgomot statistic.

### Metricile — ce se raportează, la orice agent

**Primary**, stabilite în minuta din 10.08:

- **Task success** — a rezolvat ce s-a cerut? Rezultatul-rege, totul se raportează
  la el.
- **Cost & latență** — tokeni, pași, timp.
- **Prompt injection**.
- **Hallucination rate**.

**Secondary**, de adăugat pe măsură ce apar tipuri care le cer: corectitudine
factuală, **tool-use accuracy** (tool-ul corect, cu parametrii corecți — critic la
workflow-uri), **eficiența traiectoriei** (drum rezonabil vs bucle), **guardrails
și scurgere de date** (important la ERP), **consistență/robustețe** prin `pass@k` pe
N rulări — echivalență semantică, nu diff textual.

Ultimele trei nu se pot exercita pe un agent de extracție într-un singur pas. Apar
abia la primul agent de tip orchestrare sau tool-use — și **atunci** se scriu, nu
înainte.

## De răspuns

- Care e forma minimă a contractului de agent care acoperă și extracția, și
  matching-ul, fără să devină `dict[str, Any]`?
- Un agent de **clasă A** (mută starea reală) se poate evalua deloc pe date reale?
  Sau are nevoie obligatoriu de un mediu sacrificabil — și cine îl întreține?
- `pass@k` cere N rulări, deci N× costul. La ce tipuri merită, și cu ce k?
- Cine deține definiția lui „corect" pentru fiecare domeniu? La extracție punctul
  ăsta e deschis din prima zi și nu se poate ocoli tehnic.
- Cât din `tests/perturbation/` din `ecf-neo4j-agent-adk` e refolosibil ca atare?

## Legat

- [[Tipuri de agenti AI]]
- [[Metrici pentru agenti AI]]
- [[Ground truth pentru evaluare]]
- [[Fluxul zilnic de evaluare]]
- [[Esecul tacut in sisteme AI]]
- [[LLM as judge]]
- [[QA AI Agent]]
- [[MOC AI Engineer]]
