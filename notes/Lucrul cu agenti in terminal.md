---
tags: [note, workflow]
created: 2026-08-11
type: note
status: schelet
---

# Lucrul cu agenti in terminal

Nodul care leagă munca pe cod de munca cu agenți. Ce urmează nu e teorie, sunt
lucruri care s-au dovedit în practică, de obicei pe pielea mea.

## 1. Contextele se separă pe scop

O sesiune are un singur scop. Sesiunea care scrie note în vault nu scrie și cod
în repo. Sesiunea care depanează un prompt nu refactorizează în paralel.

De ce: contextul amestecat produce decizii amestecate. Agentul care „e deja în
zonă" atinge fișiere pe care nu i le-am cerut, iar eu descopăr asta la `git diff`,
nu în momentul respectiv.

Corolar: agenții cu Bash pot face `git commit`. Dacă nu vreau asta, o interzic
explicit în promptul lor, nu sper că nu le trece prin cap.

## 2. Regulile trăiesc în fișiere, nu în conversație

Ce spun în chat se pierde la următoarea sesiune. Ce scriu în `CLAUDE.md` sau în
`rules/` se încarcă din nou, de fiecare dată.

- preferință repetată de trei ori în chat = regulă care trebuia scrisă în fișier;
- regulă care contează mereu → `CLAUDE.md`;
- regulă care contează uneori → `rules/`, citită la cerere.

Detalii de configurare în [[Claude Code - configurare]].

## 3. Ce trebuie să se întâmple automat are nevoie de HOOK

„Te rog să rulezi formatarea după fiecare editare" e o promisiune. Un
`PostToolUse` care rulează formatarea e un mecanism. Diferența: promisiunea se
uită, hook-ul nu.

Regula practică: dacă formulez cerința ca „de fiecare dată când...", răspunsul
corect e un hook, nu o instrucțiune în prompt.

## 4. Verific ce mi se raportează

„Gata, merge" nu e o verificare, e o afirmație.

- Un regex peste `[[...]]` nu e un parser. Trece testul pe exemplele mele și cade
  pe primul link cu alias, pe cod inline, pe link în bloc de cod.
- Un script care merge când îl rulez eu poate cădea când îl rulează altcineva:
  altă cale, alt PATH, alt shell, alte permisiuni, alt encoding.
- Testul care „a trecut" trebuie să fi și rulat. Cer output-ul, nu concluzia.

Același reflex ca la evaluare: [[Esecul tacut in sisteme AI]]. Un sistem care
raportează succes fără să fi făcut treaba e mai periculos decât unul care cade.

## 5. Când merită un subagent

Merită:

- căutare largă în cod, unde rezultatul util e mic dar drumul până la el e lung;
- mai multe investigații independente care pot rula în paralel;
- o revizie cu perspectivă separată (securitate, de exemplu), pe cod deja scris.

Nu merită:

- o sarcină de un fișier și trei linii — costul de coordonare depășește câștigul;
- sarcini dependente una de alta, care oricum se serializează;
- când am nevoie de contextul complet al conversației, pe care subagentul nu-l are.

Vezi [[Cost-aware model routing]] — aceeași logică: cel mai mic lucru care rezolvă
problema.

## 6. Conectori și unelte

MCP (Microsoft 365, GitHub, Context7) extinde ce poate atinge agentul. Cu cât
atinge mai mult, cu atât contează mai mult ce are voie să scrie. Vezi
[[MCP - Model Context Protocol]] și [[Prompt injection - aparare]] — conținutul
citit dintr-un mail sau dintr-un issue e input neîncrezut, nu instrucțiune.

## De răspuns

- Ce reguli din chat trebuie promovate acum în `rules/`?
- Ce comportamente automate încă depind de promisiuni și ar trebui să fie hook-uri?
- Cum arată o verificare minimă pe care o cer la fiecare raport de „gata"?
- Care sunt sarcinile mele recurente care chiar merită subagent dedicat?
- Ce are voie să scrie fiecare conector MCP și unde am pus limita?

Legături: [[MOC AI Engineer]], [[MOC Operatii zilnice]], [[Claude Code - configurare]]
