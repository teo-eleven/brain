---
tags: [project]
created: 2026-08-11
type: project
status: active
---

# QA AI Agent

## Într-o propoziție

Evaluarea automată a agenților AI de la ECF: un harness care rulează cazuri de
test peste agentul real, citește trace-urile și scoate scoruri comparabile în timp.

## Cele două repo-uri

**Agentul evaluat** — `D:\teodor.fotciuc\ecf_app_web-doc_extract_studio`
Agentul „Extracție documente", branch `qa/langfuse-tracing`.
FastAPI + Celery + Redis + Postgres, Docker Compose cu 7 servicii.

**Harness-ul** — `D:\teodor.fotciuc\qa-ai-agent`
Pe `uv` (vezi [[uv - pachete Python rapid]]). CLI: `qaharness`.
Structură: `datasets/`, `evals/deepeval/`, `generators/`, `promptfoo/`,
`stack/langfuse/`, `baselines/`, `runs/`, `src/qaharness/`.

## Stack-ul — „Varianta 1", self-hosted

```
Agent → LiteLLM → Gemini 3 Flash
          ↓ callback
       Langfuse (trace)
          ↓ citește
       DeepEval → scrie scorul înapoi pe trace

promptfoo — separat, pe prompturi
GitHub Actions — harness.yml + promptfoo.yml, la PR și la tag
```

Componente: [[LiteLLM - gateway pentru modele]],
[[Langfuse - tracing pentru LLM]], [[DeepEval - evaluare automata]],
[[promptfoo - teste pe prompturi]].

**De ce self-hosted și nu SaaS:** datele de client rămân la firmă. A fost
criteriul decisiv, nu costul.

## Starea actuală

> Recitită din repo pe **19.08**. Aproape tot ce urmează după `9090265` (13.08, 08:34)
> există **doar în working tree** — vezi „Probleme cunoscute".

- Checklistul „prima zi" — terminat.
- **Suita de stres** (`extr_real.yaml`), 9 documente reale: 6 pass / 3 warn.
- **Eșantion reprezentativ** (`extr_baseline.yaml`), 30 de documente banale — patru
  tipuri amestecate, 4–40 rânduri, fără nicio capcană deliberată: **28 pass / 2 warn /
  0 fail** (`runs/baseline-01.json`, 13.08). Opusul suitei de stres: arată cum se
  comportă agentul pe munca obișnuită, nu doar pe cazurile grele.
- 25 de cazuri offline care verifică graderii (testează harness-ul, nu modelul);
  suita de teste a crescut între timp la ~514 (cifra din `conftest.py`).

Din cele 4 metrici Primary (vezi [[Metrici pentru agenti AI]]):

| Metrică            | Stare                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| Cost & latență     | acoperit — pe eșantion: **0,0056 USD/caz**, p50 **11,9 s**, p95 **16,6 s**  |
| Task success       | **agregarea merge** — 0,933 vs prag 0,90, verdict `ok` pe cele 30 de cazuri |
| Prompt injection   | grader existent — [[Prompt injection - aparare]]                           |
| Hallucination rate | cere golden pe toate cazurile — [[Ground truth pentru evaluare]]           |

**Agregarea metricilor a fost greșită până pe 12.08:** raportul număra gradări,
nu cazuri, fiindcă doi graderi raportează pe aceeași metrică. `metrics.py` dă
acum o valoare, un prag și un verdict per metrică, cu `n/a` distinct de `ok`
pentru metricile pe care suita nu le-a exercitat. **Verificat pe suită pe 13.08:**
raportul scoate `value` / `threshold` / `verdict` / `applicable` per metrică, cu
defalcare pe categorie. Deci „task success" nu mai e în lucru — e doar necomis.

### Robustețea rulării — singurul lucru comis pe 13.08 (`9090265`)

Trei fire, aceeași formă de defect (detalii în [[2026-08-13]]):

- **O excepție pe un caz nu mai aruncă batch-ul.** Cazul căzut devine `fail` cu
  detaliul excepției, în loc să dispară din raport — un caz dispărut ar face suita să
  arate mai mică și mai verde decât e. Grader dedicat, `EXECUTION_FAILURE_GRADER`,
  ținut deliberat în afara lui `ALL_GRADERS`: e semnal de infrastructură, nu
  măsurătoare de conținut.
- **`grade_outputs` — un singur loc pentru gradare.** Aceeași secvență apărea identic
  în trei locuri; o etapă nouă uitată într-unul ar fi dat verdicte diferite între
  `--replay` și `--real` pe aceleași date, adică fix premisa harness-ului.
- **`class_agreement` umfla acordul.** Eticheta era căutată ca **subșir**, deci putea
  doar să **crească** acordul, niciodată să-l scadă — și exact metrica aia se
  urmărește când se iterează promptul judecătorului.

## Tabloul live — `tools/live/`

Un tablou servit local (`:8090`) care adună într-un ecran trei surse cu viteze
diferite: agentul prin Studio (2s), harness-ul recalculat din înregistrări (15s)
și ce e publicat în [[Langfuse - tracing pentru LLM]] (30s). Citește prin **proxy
propriu**, doar `GET` și doar rutele publice — cheile rămân în proces, nu ajung
niciodată în pagină.

Panou adăugat pe 12.08: **Teste automate în Langfuse** — dataset-ul cu items-urile
lui, rulările de dataset și evaluatorii automați. Adică ce ar rula _Langfuse_ în
spate, separat de ce publică harness-ul nostru acolo.

**Ce s-a văzut de-abia când a fost pus pe ecran:** dataset-ul are **18 items**
publicate, dar **0 rulări de dataset** și **0 reguli de evaluare**. În Langfuse nu
rulează automat nimic. Judecătorul activ al proiectului rămâne
[[DeepEval - evaluare automata]], care rulează în harness și scrie prin API — 881
de scoruri din API, **0** de la evaluator, **0** de la om. Cei 22 de „evaluators"
din instanță sunt șabloanele livrate de Langfuse, nelegate de nicio regulă; vezi
[[LLM as judge]] pentru de ce unul pornit pe fiecare observație e o decizie de
cost, nu una gratuită.

Regula de afișare a panoului: **un „0" nu se arată verde.** „0 rulări" înseamnă
„nu rulează nimic", nu „totul e în regulă" — [[Esecul tacut in sisteme AI]], a
cincea zi la rând în care aceeași formă de defect apare pe alt strat.

**Adăugat după 13.08, necomis — lanțul de corelare.** `AgentOutput` reține acum
`job_id`, `external_id` și `project_slug`, ca tabloul să poată sări între caz, jobul
din Studio și trace-ul din Langfuse **în ambele sensuri** (panou nou,
`tools/live/panels/trail.js`). Înregistrările mai vechi din `fixtures/real/` aveau
câmpurile goale, dar datele nu s-au pierdut: fiecare trace le poartă în `metadata`, iar
`tools/backfill_correlation.py` le scrie înapoi în fixture — **repară metadate, nu
rerulează niciun caz**. Alternativa (o rulare reală nouă) ar fi costat bani ca să
repete un test care își spusese deja rezultatul. Nu suprascrie niciodată o valoare deja
prezentă; completează doar golurile.

## Auditul de siguranță — cele 9 măsuri de la Ștefan

`docs/03-audit-siguranta.md` (14.08), analiză **read-only**: nimic modificat, nimic
instalat, niciun serviciu atins, fiecare afirmație cu dovada în `cale:linie`. Regula de
bază a raportului: **se modifică exclusiv `qa-ai-agent`** — `doc-extract-studio`,
`ecf-ai-langfuse`, `ecf-agent-hub` și `stack/` rămân intacte. Raportul se oprește
deliberat înainte de implementare, cum s-a cerut. Materialele schimbate cu Ștefan stau
în `docs/schimb-stefan/`.

Ce a ieșit deja din el, tot în working tree:

- **Sonda de izolare între proiecte** — `src/qaharness/isolation.py` plus comanda
  `qaharness leak`: verifică dacă datele unui proiect se văd din altul. Potrivirea se
  face pe **căi exacte**, nu pe fragmente (`/jobs` e prefix al `/jobs/{id}`, iar o
  potrivire pe fragment ar servi răspunsul listei și pe rutele jobului), iar marcajele
  au o lungime minimă, ca o potrivire să nu poată fi coincidență.
- **Codul de ieșire al lui `leak`, dezambiguizat.** Recenzia a găsit că faza de
  pregătire putea arunca `httpx.ConnectError` (aplicația oprită) și ieșea tot cu
  `exit 1` — **același cod ca „scurgere dovedită"**. Un script de CI care verifică
  `exit == 1` ar fi raportat o breșă de date când, de fapt, aplicația era jos. Aceeași
  linie ca [[Esecul tacut in sisteme AI]], în varianta scumpă: alarma sună, dar pentru
  altceva decât crezi.
- **Guard de rețea pe toată suita** — `conftest.py`, singura suprafață globală din
  repo, ținută cât mai mică: loopback permis, orice conexiune non-locală ridică
  excepție. Loopback-ul rămâne deschis **deliberat**, fiindcă `test_real_agent.py`
  dovedește că „port închis ≠ MCP dezactivat" conectându-se la `127.0.0.1:1` și
  așteptând connection refused; un guard care blochează tot ar șterge exact cazul ăla.

Testele lovesc **politica de detecție**, nu o instanță reală: zero rețea, totul
injectat — `tests/test_isolation.py`, `tests/test_cli_leak.py`.

### Cei 5 pași — terminați pe 19.08, plus cei 2 opționali

Auditul transformase cele 9 măsuri într-o **ordine minimă de integrare**, fiecare pas
cu commit și verificare proprii, ca să fie reversibil independent.

| Pas | Ce | Stare |
| --- | --- | --- |
| 1 | `pythonpath = ["src", "."]` | era deja făcut |
| 2 | markeri declarați + `--strict-markers` + `xfail_strict` | era deja făcut |
| 3 | `conftest.py`, guard autouse, loopback permis | era deja făcut |
| 4 | comandă canonică unică, în trei locuri | **revizuit 19.08** — îi lipsea `--extra evals` |
| 5 | `.python-version` + venv pe 3.11 | **făcut 19.08** (`de31701`) |
| 6 | SHA-ul de git în raport | **făcut 19.08** (`e1378a4`) |
| 7 | procesul plan→aprobare→rulare, scris | **făcut 19.08** (`91cfc1d`) |

**Ce a scos la iveală pasul 5 — mai important decât pasul în sine.** Pe un venv
recreat de la zero, suita **nu se colecta deloc**: șase module cădeau la import cu
`No module named 'httpx'`. Comanda documentată cerea doar `--extra dev`, dar trei
module din bibliotecă îl importă la nivel de modul. Mergea local **doar fiindcă
venv-ul acumulase `--extra real` dintr-o sincronizare veche**, iar CI-ul n-a rulat
niciodată — repo-ul n-are remote.

Un mediu murdar ascunde exact genul ăsta de dependență nedeclarată, și singurul mod
în care iese la iveală e recrearea lui de la zero.

**Al doilea lucru, aceeași formă:** comanda canonică n-avea `--extra evals`, deci
`tests/test_deepeval_metrics.py` **se sărea în tăcere** (`importorskip`) și suita
raporta verde cu **13 teste mai puține** — fix pe judecătorul LLM, componenta cu
acordul pe clasă 0/4. Măsurat: 518 în loc de 531. Contradicția care a dat-o de gol:
`PYTEST_DISABLE_PLUGIN_AUTOLOAD=1` există *tocmai* fiindcă deepeval aduce șase
plugin-uri — dacă nu era instalat, variabila n-avea ce tăia.

[[Esecul tacut in sisteme AI]], a doua oară în aceeași zi, pe alt strat: **un modul
sărit arată la fel ca unul care trece.**

**Contorul de teste, făcut auto-verificabil.** Rămăsese în urmă de trei ori (auditul
găsise „423" când erau 514, și observase că fusese și *scăzut*, 432 → 423). Reparația
n-a fost să scriu cifra a patra oară:
`tests/test_documentatie_numar_teste.py` compară ce scrie în README (două locuri), în
ghid și în `conftest.py` cu `len(session.items)` — numărul real colectat. Auditul
folosește numărul ca **criteriu** la fiecare pas („dacă după un pas colectarea scade,
ceva s-a ascuns"), iar un criteriu comparat cu o cifră învechită nu verifică nimic.
Raportul de audit e exclus deliberat: acolo „514" e o măsurătoare datată, iar un
raport nu se rescrie ca să rămână adevărat.

## Judecătorul de fidelitate, măsurat

`experiments/validare_fidelitate.py` a măsurat judecătorul `deepeval_denumire_fidelity`
contra golden-ului determinist, și cifrele nu sunt bune: **recall 2/4**, **precizie
2/5**, **acord pe clasă 0/4** — n-a numit corect clasa niciodată. Cel mai grav caz:
`SIT-B run0` are **două** defecte reale („secti une" = cuvânt tăiat, „autobasculanta" =
diacritic lipsă) și a primit scor **1.000**, adică perfect.

Mecanismul suspectat: judecătorul **mediază impresia** peste tot documentul — 18–20 de
rânduri corecte ascund 1–2 stricate — în loc să trateze orice defect ca descalificant.
Criteriile actuale nu spun asta explicit nicăieri. `experiments/prompt_judecator.py`
încearcă două reparații **structural diferite**, nu două reformulări ale aceluiași
text: `cot` (adaugă `evaluation_steps` — enumerare valoare-cu-valoare înainte de scor)
și `zero_tolerance` (rescrie regula de scor explicit, „un rând stricat din douăzeci NU
e fidel", cu exemplele reale găsite în documente). Experimentul e scris; **rezultatul
nu e salvat în `runs/`**.

**Lecția, plătită deja o dată:** prima versiune a refolosit cifrele de mai sus ca
referință fixă, ca să economisească ~16 apeluri. Rulat din nou, pe același eșantion,
„baseline" a ieșit cu precizie **2/2**, nu 2/5 — fiindcă eșantionul crescuse între timp
**și** fiindcă judecătorul e zgomotos între rulări (același text, aceleași criterii,
scoruri diferite). Un baseline măsurat în alte condiții nu e baseline. Acum toate
variantele, inclusiv baseline, se măsoară **în aceeași rulare**. Vezi [[LLM as judge]]
și [[Experiment inainte de concluzie]].

Eșantionul rămâne mic — patru rulări cu defect real —, deci un singur caz mișcă
recall-ul cu ~25 de puncte. Cifrele sunt direcție, nu rată stabilă.

**Descoperit pe 19.08: o parte din acordul pe clasă 0/4 nu era vina judecătorului.**
Referința deterministă știa să numească doar trei clase din patru. `classify_defect`
scria explicit de ce lipsește a patra — „nu se poate distinge determinist o traducere
de conținut chiar diferit", adică **nu exista dicționar** — deci `anglicizare` cădea în
`alt_continut`. Un judecător care spunea corect „anglicizare" era numărat drept
dezacord. Măsurătoarea unui instrument de măsură are și ea nevoie de o riglă bună:
[[Experiment inainte de concluzie]].

## Corectura lexicală nesolicitată — „phenolic"

Pe cele 30 de documente banale agentul a extras totul corect, cu **două excepții
identice**:

```
golden : Cofraj din placaj fenolic pentru stâlpi
extras : Cofraj din placaj phenolic pentru stâlpi
```

Nu o omisiune — o **corectură pe care nu i-a cerut-o nimeni**. `extr_lexical.yaml`
a fost construit ca să răspundă la o întrebare precisă: e un caz izolat sau o **clasă
întreagă** de termeni tehnici românești pe care modelul îi „normalizează" spre engleză?

Experimentul are un set de risc și un martor, două documente banale în rest:

| Caz   | Ce conține                                                       | Rezultat |
| ----- | ----------------------------------------------------------------- | -------- |
| LEX-A | **30 de termeni** cu formă englezească apropiată (fenolic, fosfat, clorură, epoxidic, aluminiu…) | `warn` — **149/150 câmpuri corecte** |
| LEX-B | **15 termeni martor**, fără cognat grafic (glet, diblu, șapă, cofraj) | `pass` curat |

**Răspunsul e „nu e o clasă".** Din 45 de termeni, singurul alterat a fost
`LEXA-001` — adică **exact „fenolic"**, din nou. Ceilalți 29 de termeni de risc au
trecut neatinși. Ipoteza largă („modelul anglicizează terminologia tehnică") e
**infirmată**; ce rămâne e un termen anume, reproductibil în document nou și rulare
nouă.

Cifra de suită („2 cazuri, task success 0,5, sub prag") e înșelătoare aici și merită
reținută ca atare: **unitatea de măsură a suitei e documentul, dar unitatea
experimentului e termenul.** Un document cu 1 câmp greșit din 150 coboară rata la 0,5
fiindcă sunt doar două documente. Verdictul pe suită și concluzia experimentului
răspund la întrebări diferite — vezi [[Metrici pentru agenti AI]].

Defectul e exact genul pe care validarea deterministă după extracție îl prinde și pe
care judecătorul îl ratează — [[Validarea output-ului LLM]]. Pentru un singur termen
reproductibil, plasa e o listă de termeni protejați, nu un prompt mai lung.

### Plasa, construită pe 19.08 — `qaharness.lexicon` (`d8912f3`)

Experimentul a produs și **dicționarul care lipsea**: 27 de perechi (rădăcină
românească → forme englezești), potrivite pe rădăcină fiindcă golden-ul e aproape mereu
flexionat („epoxidică", „siliconic"). Cu el, `classify_defect` capătă a patra clasă, pe
poziția 3, între `cuvant_taiat` și `alt_continut`.

Detectorul e **conservator prin proiectare**, nu din prudență vagă. Trei situații în
care răspunde `None` în loc să ghicească: număr diferit de cuvinte; un cuvânt diferit
neexplicat, chiar dacă altele sunt explicate; termen absent din dicționar. Motivul e
direcția erorii — un fals „anglicizare" umflă acordul pe clasă exact cum îl umfla
potrivirea pe subșir din `class_agreement`, reparată pe 13.08: **mereu în sus,
niciodată în jos.**

Traducerile pure sunt lăsate afară deliberat: `ventil` → „valve", `hidrofor`,
`condensator`. N-au cognat grafic, deci acolo un fals pozitiv n-ar putea fi deosebit de
conținut chiar diferit.

Verificat pe înregistrarea reală `LEX-A-run0`: 30/30 rânduri comparate, o singură
diferență, clasificată acum `anglicizare` în loc de `alt_continut`. 531 de teste
(16 noi), 0 eșecuri, acoperire 85%.

**Ce NU s-a făcut, și de ce:** harness-ul acum *numește* defectul; nu-l *repară*.
Reparația ar fi în doc-extract-studio, iar regula auditului e că se modifică exclusiv
`qa-ai-agent`. Harness-ul măsoară, nu cârpește agentul.

## Probleme cunoscute

**Fără remote git — decizie, nu scăpare.** Harness-ul există doar local. E ales
deliberat: repo-ul conține detalii din proiecte de serviciu. Riscul rămâne real
(un incident pe laptop = pierdere totală) și e **asumat**, nu de rezolvat prin
publicare. Aceeași regulă ca la vault — vezi [[MOC Vault]].

**Rezolvat pe 19.08.** Cele 163 de intrări au intrat în două commit-uri, exact pe
distincția rămasă deschisă din 14.08:

| Commit    | Ce                                                                | Cât                  |
| --------- | ------------------------------------------------------------------ | -------------------- |
| `d279e37` | cod, teste, documentație, suite noi, generatoare                   | 59 fișiere, +22681   |
| `65196e6` | corpus: 43 de documente generate, 62 de înregistrări reale        | 105 fișiere          |

Decizia pe corpus a fost **intră în repo**, fiindcă asta era deja convenția (14 PDF-uri
și 20 de fixtures erau urmărite dinainte) și fiindcă documentele sunt **generate**, nu
de la clienți. `.git` a crescut de la 2,8 MB la 29 MB — costul real al deciziei, plătit
o dată.

Creșterea, până s-a oprit: 19 (11.08) → 38 → 67 (12.08) → 163 (14.08) → 163 (19.08).
Șase zile în care numărul n-a mai crescut doar fiindcă nu s-a mai lucrat, nu fiindcă
s-ar fi salvat ceva.

Tiparul nu era al proiectului ăstuia: pe 18.08 se numărau trei proiecte consecutive cu
aceeași formă — [[ADM Expert]] (~4 ore peste noapte), QA AI Agent (163 de intrări,
patru zile), [[Trupa 9 - site]]. Nu e neglijență pe un proiect anume, e cum lucrez.
Riscul de fond rămâne: **fără remote, un incident pe laptop e tot pierdere totală.**
Commit-ul acoperă doar partea evitabilă.

**Separatorul ambiguu — rezolvat: era promptul.** `1.750 to` → 1750, 6/6
cantități citite de 1000× mai mare, reproductibil în 4 rulări. Părea limită de
model exact fiindcă era reproductibil. Experimentul
(`experiments/separator_ambiguu.py`, commit `d141dfd`) a arătat că se repară din
prompt.

Lecția, mai valoroasă decât defectul: **reproductibilitatea dovedește că _există_
o cauză, nu _care_ e cauza** — [[Experiment inainte de concluzie]].

Dacă reapare la alt format, plasa rămâne aceeași: **validare deterministă după
extracție** ([[Validarea output-ului LLM]]). Metoda: [[Debugging un prompt]].

## Dincolo de un singur agent

Harness-ul evaluează **un** agent din **15** inventariați la ECF, în 5 repo-uri.
Taxonomia pe două niveluri, cei 15 agenți etichetați și ordinea piloților
recomandați: [[Tipuri de agenti AI]]. Ce se refolosește din harness la un tip nou
de agent și ce se scrie de fiecare dată: [[Cum testez un agent nou]].

Două lucruri de acolo care ating direct proiectul ăsta:

- **Pilotul recomandat ca cel mai ieftin nu e extracția**, ci `match-auction-items`
  (ground truth gratuit din aprobările existente, `temperature: 0`). Extracția e
  pilotul cu **riscul** cel mai mare, dar și singurul care cere etichetare manuală.
- **`ecf-neo4j-agent-adk` are deja `tests/perturbation/`** — perturbații, comparație
  cu baseline, analiză de eșecuri. „Cel mai ieftin câștig disponibil", scris în
  propriul document și nefolosit încă. Repo-ul nu e clonat local.

## Rutina

Zilnic: [[Fluxul zilnic de evaluare]].
Trace-uri: [[Cum citesc un trace]].
Prompturi: [[Versionarea prompturilor]] și [[Evals inainte de prompt changes]].

## Următorii pași

- [x] ~~Comis lucrul din working tree~~ — 19.08, două commit-uri: `d279e37` (cod) și
      `65196e6` (corpus). Working tree curat
- [x] ~~Decizie pe separatorul ambiguu~~ — e promptul (`d141dfd`, 11.08)
- [x] ~~Remote git pentru harness~~ — rămâne local, deliberat
- [x] ~~Publicat dataset-ul în Langfuse~~ — 18 items pe instanța reală, verificat
      în API pe 12.08 (nu mai e doar `--dry-run`)
- [x] ~~Task success — agregarea~~ — rulată și verificată pe eșantionul de 30 (13.08):
      0,933 vs prag 0,90, cu defalcare pe categorie
- [ ] **Rulare de dataset în Langfuse** — items-urile există, experimentul peste
      ele nu; se vede în tablou ca „0 rulări". Neatins din 12.08
- [ ] Decis dacă evaluatorul de fidelitate se pornește — regula se creează
      dezactivată, deliberat (cost pe proxy). Până atunci, judecător = DeepEval
- [ ] **Rulat `prompt_judecator.py` și salvat rezultatul** — cele două variante contra
      baseline-ului, toate în aceeași rulare
- [x] ~~„fenolic" — decis plasa~~ — `qaharness.lexicon`, dicționar explicit,
      conservator (`d8912f3`). Harness-ul numește acum defectul
- [ ] **Remăsurat acordul pe clasă** al judecătorului, acum că referința știe să
      numească toate cele patru clase. Cifra 0/4 era măsurată cu o riglă incompletă
- [ ] **Al doilea tip de agent** — [[Cum testez un agent nou]]. Contractul
      `ExtractionAgent` e îngust prin construcție; se lărgește la al doilea tip
      concret, nu în anticiparea lui
- [x] ~~Cele 9 măsuri de siguranță~~ — toți cei 5 pași plus cei 2 opționali, 19.08
- [ ] Ground truth pentru cele 9 documente reale
- [ ] Prag de regresie în CI
- [ ] **Remote pentru CI, sau acceptat explicit că `harness.yml` e cod mort** — n-a
      rulat niciodată, și de-asta două defecte de mediu au trăit luni de zile

Legături: [[MOC Stack AI]], [[MOC AI Engineer]], [[MOC Operatii zilnice]], [[MOC Studiu]]
