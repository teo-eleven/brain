---
tags: [regex, ref]
created: 2026-08-06
type: cheatsheet
---

# Regex cheatsheet

## Bazele

```
.        orice caracter (fără newline, dacă nu e flag DOTALL)
\d \D    cifră / non-cifră
\w \W    [a-zA-Z0-9_] / opusul
\s \S    spațiu alb / non-spațiu
[abc]    unul din a, b, c
[^abc]   orice ÎN AFARĂ de a, b, c
[a-z]    interval
\b       graniță de cuvânt        ← subutilizat, foarte util
^ $      început / sfârșit (de string, sau de linie cu flag MULTILINE)
```

## Cantificatori

```
*        0 sau mai multe
+        1 sau mai multe
?        0 sau 1 (opțional)
{3}      exact 3
{2,5}    între 2 și 5
{2,}     minim 2
*? +? ?? lazy (cât mai puțin)  ← vezi mai jos
```

**Greedy vs lazy** — cea mai frecventă capcană:

```
Text:  <a><b>
<.+>   → <a><b>      greedy: ia cât poate
<.+?>  → <a>         lazy: ia minimul
```

Dacă un regex „ia prea mult", ai nevoie de lazy.

## Grupuri

```
(abc)          grup de captură — accesibil ca \1 sau group(1)
(?:abc)        grupare fără captură (mai eficient)
(?P<nume>abc)  grup denumit (Python) → group("nume")
(?<nume>abc)   grup denumit (JS, .NET)
a|b            alternativă
```

Grupurile denumite fac regexurile complexe citibile. Folosește-le.

## Lookaround

Verifică fără să consume:

```
(?=abc)     lookahead pozitiv    — urmat de abc
(?!abc)     lookahead negativ    — NU urmat de abc
(?<=abc)    lookbehind pozitiv   — precedat de abc
(?<!abc)    lookbehind negativ   — NU precedat de abc
```

Exemplu: prețul fără simbol în match → `\d+(?= lei)`

## Pattern-uri utile

```python
r"^\d{4}-\d{2}-\d{2}$"                    # dată ISO
r"^RO\d{2,10}$"                           # CUI românesc cu prefix
r"^[\w.+-]+@[\w-]+\.[\w.]+$"              # email — SIMPLIFICAT, vezi mai jos
r"^\+?4?0?7\d{8}$"                        # telefon mobil RO
r"\b[A-Z]{2,}\b"                          # acronime
r"(?m)^\s*#.*$"                           # comentarii, pe linii (MULTILINE)
r"\s+"                                    # normalizare spații → re.sub(r"\s+", " ", t)
```

## Python

```python
import re
re.search(p, t)                  # prima potrivire oriunde → Match sau None
re.match(p, t)                   # doar de la ÎNCEPUT
re.fullmatch(p, t)               # tot stringul
re.findall(p, t)                 # listă de potriviri (sau de tupluri, dacă ai grupuri)
re.finditer(p, t)                # iterator de Match — mai bun pentru multe rezultate
re.sub(p, repl, t)               # înlocuire (repl poate fi funcție)
re.split(p, t)
rx = re.compile(p, re.I | re.M)  # compilat, refolosit

# flaguri
re.I  IGNORECASE      re.M  MULTILINE (^ $ pe linii)
re.S  DOTALL (. include \n)      re.X  VERBOSE (regex pe mai multe linii, cu comentarii)
```

`re.VERBOSE` pentru orice regex peste 40 de caractere:

```python
rx = re.compile(r"""
    ^(?P<serie>[A-Z]{2,4})     # seria facturii
    -(?P<numar>\d{1,8})$       # numărul
""", re.X)
```

## Când NU folosești regex

- **HTML/XML** → parser (BeautifulSoup, lxml). HTML nu e limbaj regulat.
- **JSON, CSV** → parser dedicat
- **Validare de email „completă"** → regexul RFC-complet e nefolosibil. Verifică `@` + trimite un email de confirmare. Asta e singura validare reală.
- **Text natural cu variație mare** → vezi skill-ul `regex-vs-llm-structured-text`: regex pentru cazurile clare, LLM pentru restul.

## Capcane

- **Catastrophic backtracking**: `(a+)+b` pe un string lung de `a` blochează procesul (ReDoS). Evită cantificatori imbricați.
- **Escape la input de utilizator**: `re.escape(input)` dacă construiești pattern din date externe.
- Testează pe [regex101.com](https://regex101.com) — arată pas cu pas ce face motorul.

## Legături

- [[MOC Programare]] · [[MOC Python]]
- [[Validarea output-ului LLM]] · [[Pydantic - validare la boundary]] · [[SQL injection]]
