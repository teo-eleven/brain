---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# Validarea output-ului LLM

## De ce e aici

Bug-ul din 10.08, commit `5760a64`, e povestea completă a ce se întâmplă când
output-ul modelului e tratat ca date de încredere: JSON tăiat la mijloc
(`finish_reason=length`), parse fail, rezultatul înghițit de `or []` și de un
`except` blanket, iar sistemul a raportat SUCCES cu rezultat gol.

Nimic din lanțul ăsta nu a fost o eroare de model. Modelul și-a făcut treaba
până la plafon. Codul din jur a decis că un eșec de parsare înseamnă „listă
goală".

## Ce trebuie știut

**REGULA DE AUR: niciodată nu tratezi output-ul unui LLM ca date structurate de
încredere.** E text generat, până când o validare independentă spune altceva.
Asta e valabil și când modelul a returnat JSON perfect de 500 de ori la rând.

**Schema forțată vs parsare + retry.** Structured output / function calling la
nivel de furnizor garantează forma (câmpuri, tipuri), nu conținutul — poți primi
un obiect valid cu valori inventate. Parsarea cu retry e mai portabilă între
furnizori și îți dă control pe mesajul de corecție, dar costă apeluri în plus și
maschează ușor problema reală. Practic: schemă forțată unde furnizorul o suportă,
plus validare proprie DUPĂ, plus retry cu eroarea concretă în prompt.

**Output trunchiat = output INVALID.** Nu „parțial", nu „mai bine decât nimic".
`finish_reason=length` trebuie să blocheze pipeline-ul înainte de orice parsare.
Un JSON tăiat care se întâmplă să se închidă sintactic e cel mai periculos caz.

**Ce înseamnă validare completă la boundary:**

- schema (tipuri, câmpuri obligatorii, formate);
- semantica (valorile există în document, sunt în intervale plauzibile);
- meta (`finish_reason`, model folosit, număr de iterații, mod degradat);
- FAIL LOUDLY — niciun default gol care ascunde eșecul.

## De răspuns

- Câte locuri din pipeline mai pot întoarce o valoare goală fără să spună de ce?
- Structured output la Gemini 3 Flash prin LiteLLM se comportă la fel ca la
  furnizorul direct? Ce se pierde prin gateway?
- Retry-ul pe parse fail intră în bugetul de 8 iterații sau e socotit separat?
- Cum deosebesc „câmp gol pentru că lipsește din document" de „câmp gol pentru
  că extracția a eșuat" — sunt reprezentate diferit în output?
- Ce validare semantică e realistă automat și unde ajung inevitabil la judecată?

## Legat

- [[Esecul tacut in sisteme AI]]
- [[Reasoning tokens si bugetul de output]]
- [[Prompt injection - aparare]]
- [[Pydantic v2 - validare la boundary]]
- [[Tool use - function calling]]
- [[MOC AI Engineer]]
