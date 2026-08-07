---
tags: [architecture, principles]
created: 2026-08-06
type: permanent
---

# KISS DRY YAGNI

## Cele trei

- **KISS** — *Keep It Simple.* Cea mai simplă soluție care funcționează.
- **DRY** — *Don't Repeat Yourself.* Extrage logica repetată.
- **YAGNI** — *You Aren't Gonna Need It.* Nu construi pentru un viitor imaginat.

## Tensiunea reală

Nu sunt compatibile automat. **DRY aplicat prea devreme încalcă KISS și YAGNI.**

Vezi două bucăți de cod care arată la fel și le unifici. Peste o lună, una trebuie să se schimbe. Adaugi un parametru. Apoi încă unul. Ajungi la o funcție cu 5 flag-uri booleene care face patru lucruri diferite — mai greu de înțeles decât cele două copii de la început.

**Regula de trei:** duplică o dată fără remușcări. La a **treia** apariție, abstractizează. Atunci ai văzut destule variante ca să știi care e forma corectă.

## Coincidență vs duplicare reală

Distincția care contează:

- **Duplicare reală** — același *motiv de schimbare*. Dacă cerința se schimbă, ambele locuri trebuie să se schimbe împreună. → unifică.
- **Coincidență** — cod care arată la fel acum, din motive diferite. → lasă-le separate.

Validarea unui CUI de client și validarea unui CUI de furnizor arată identic. Dar dacă mâine regulile pentru furnizori diferă, unificarea a fost o greșeală. Întreabă „se vor schimba mereu împreună?", nu „arată la fel?".

## YAGNI, concret

Semnale că îl încalci:
- interfață cu o singură implementare, creată „pentru când vom avea altele"
- parametru de configurare pe care nimeni nu l-a schimbat niciodată
- suport pentru mai multe baze de date, când folosești una
- generic cu 4 parametri de tip, folosit într-un singur loc
- „strat de abstracție" peste o librărie pe care nu ai schimbat-o niciodată

Costul nu e doar codul scris. E că orice modificare viitoare trebuie să treacă prin abstracția pe care ai ghicit-o greșit.

## Nuanța onestă

YAGNI nu înseamnă „nu gândi înainte". Deciziile **greu reversibile** (schema bazei de date, formatul unui API public, alegerea limbajului) merită gândite în avans. Vezi [[Migrari zero-downtime]] și [[API versioning]] pentru cât costă să le schimbi.

Regula practică: **aplică YAGNI la ce poți schimba ieftin mâine; gândește înainte la ce nu poți.**

## Legături

- Face parte din: [[MOC Arhitectura]] · [[MOC Programare]]
- [[Cuplare si coeziune]] · [[Monolit vs microservicii]]
- [[Ce nu merita testat]] · [[Nota atomica]] — aceeași idee: o unitate, un scop
