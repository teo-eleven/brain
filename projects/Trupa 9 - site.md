---
tags: [project, personal]
created: 2026-08-18
type: project
status: active
---

# Trupa 9 - site

## Într-o propoziție

Site pentru **Trupa 9 Suceava** — muzică live pentru evenimente: hero cu intro video, membrii
trupei, playlist pe genuri, galerie, clipuri de pe YouTube, parteneri.

## Unde e codul

```
github.com/tewtzu-ctrl/trupa9-site        # privat, creat 18.08 la 14:48
```

**Fără copie locală pe mașina de serviciu.** Nu există nici în `D:\teodor.fotciuc`, nici în
profilul de utilizator — vezi [[Proiecte personale]].

```
site/index.html
site/css/      theme-oferta, hero, membri, playlist, galerie, media, parteneri, aparitie, sugestie
site/js/       membri, playlist, galerie, media, ferestre, aparitie, sugestie
site/fonts/    Bebas Neue + Raleway (webfonts locale), plus slick și themify din tema veche
site/vendor/   aos
tools/serve.py server local, o singură comandă
```

**Static, fără build.** HTML/CSS/JS scrise direct, fonturi servite local, o singură pagină cu
ferestre (`ferestre.js`) în loc de rute.

## Cum a apărut

Punctul zero, **17.08 la 14:02** (`a181fff`): „mirror local al trupa9.ro (Hugo static output)" —
2134 de linii, 59 de fișiere. Nu s-a pornit de la zero, s-a pornit de la **ieșirea statică a
sitului existent**, peste care s-a lucrat. De aici și `scss/critical.min.css` și
`js/script.min.js`, moștenite din tema veche și încă în repo.

Cele 13 commit-uri de după, în aceeași zi (14:14 → 17:42), ating doar **32 de fișiere** — deci nu
s-a mai adăugat structură, s-a înlocuit aspectul: identitatea vizuală din **oferta 2026** aplicată
pe tot situl, hero cu coperta ofertei și apoi cu intro video pe ecran complet, siglă aurie
transparentă în antet cu tranziție la derulare, portretele reale ale membrilor pe format 3:4,
playlist reorganizat pe genuri muzicale.

## Ce s-a făcut pe 18.08

| Ora   | Commit    | Ce                                                               | Linii                  |
| ----- | --------- | ---------------------------------------------------------------- | ---------------------- |
| 14:47 | `88427dc` | redesign complet: galerie, media de pe YouTube, parteneri, mobil | +2220/−696, 99 fișiere |
| 14:55 | `e333137` | `tools/serve.py` — server local, pornire cu o comandă            | +84                    |
| 15:06 | `817dcb7` | clipurile porneau doar pe telefon → pornirea automată scoasă     | +31/−27                |
| 15:19 | `e72660d` | buton de sugestii, cu verificare în repertoriul existent         | +518/−28               |

Commit-ul de la 14:47 e cel care a și **creat repo-ul pe GitHub** (14:48) — lucrul de pe 17.08 și
redesignul au stat necomise până atunci. Același tipar ca pe [[ADM Expert]]: munca intră în git a
doua zi, în bloc.

**Buton de sugestii (`sugestie.js`, 171 de linii).** Vizitatorul propune o piesă, iar propunerea e
verificată **în repertoriul existent** înainte de a fi trimisă — adică validare la intrare, cu
răspuns către cel care a scris, nu o casetă care înghite orice. Aceeași regulă ca la câmpul
`Buget propus` din [[ADM Expert]]: vezi [[Validarea output-ului LLM]] pentru forma generală și
[[Esecul tacut in sisteme AI]] pentru ce se întâmplă când lipsește.

**Pornirea automată a clipurilor.** Mesajul commit-ului e o observație de comportament, nu de cod:
„porneau doar pe telefon". Autoplay-ul e permis diferit pe mobil și pe desktop, deci
funcționalitatea „merge" exact acolo unde n-ai testat. Scoasă complet — controlul rămâne la
vizitator.

## Deschis

- [ ] **Cum se publică.** Repo-ul e un mirror al `trupa9.ro`, dar nu conține nimic despre deploy:
      fără workflow, fără configurare de gazdă. De verificat ce rulează acum pe domeniu.
- [ ] **Fișierele minificate moștenite** (`scss/*.min.css`, `js/script.min.js`) — dacă noile `css/`
      și `js/` le înlocuiesc complet, sunt greutate moartă care se încarcă degeaba.
- [ ] Fără copie locală aici și fără intrare în `$TRACKED` — zilele de lucru pe el se consemnează
      de mână.

## Zile

- [[2026-08-17]] — mirror-ul și identitatea vizuală, 14 commit-uri
- [[2026-08-18]] — redesign, server local, fix la clipuri, sugestii

## Legat

- [[Proiecte personale]]

#personal
