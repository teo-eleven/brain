---
tags: [architecture, performance]
created: 2026-08-06
type: permanent
---

# Cache - strategii si invalidare

## Ideea

Cache-ul schimbă **prospețimea** pe **viteză**. Întrebarea nu e „vreau cache?" ci „cât de învechite pot fi datele astea, în secunde?".

Dacă răspunsul e „zero", nu poți face cache. Dacă e „30 de secunde", ai câștigat enorm cu foarte puțin.

## Straturi

De la cel mai aproape de utilizator la cel mai departe:

1. **Browser** — `Cache-Control`, imagini, JS/CSS cu hash în nume
2. **CDN** — conținut static, răspunsuri publice
3. **Aplicație** — Redis, memorie locală
4. **Bază de date** — buffer pool (gratuit, nu-l administrezi)

Cel mai ieftin cache e cel de la stratul 1-2: nici măcar nu ajunge la serverul tău.

## Strategii de scriere

| Strategie | Cum | Compromis |
|---|---|---|
| **Cache-aside** | citești din cache, la miss încarci și pui | simplu, **default-ul bun** |
| **Write-through** | scrii în cache și în DB simultan | cache mereu proaspăt, scrieri mai lente |
| **Write-behind** | scrii în cache, DB mai târziu | rapid, risc de pierdere la crash |

## Invalidare — partea grea

Trei opțiuni, în ordinea preferinței:

**1. TTL.** Expiră după N secunde. Simplu, robust, imperfect. **Începe mereu aici.** Un TTL de 60 de secunde rezolvă 90% din cazuri fără nicio complexitate.

**2. Invalidare la scriere.** Ștergi cheia când datele se schimbă. Corect, dar trebuie să te amintești în **fiecare** loc care scrie — și cineva va uita.

**3. Chei versionate.** `factura:42:v7`. Nu inviolidezi nimic, scrii sub o cheie nouă; cea veche expiră singură. Elegant, evită invalidarea ratată.

## Capcane

- **Cache stampede** — cheia populară expiră, 1000 de cereri simultane lovesc DB-ul în același moment. Fix: lock pe recalculare, sau TTL cu jitter aleator.
- **Cache-uirea răspunsurilor autenticate** — dacă cheia nu include utilizatorul/tenantul, un utilizator vede datele altuia. Cel mai grav bug posibil de cache. Vezi [[Multi-tenancy - patterns]].
- **Cache-uirea erorilor** — un 500 cache-uit 5 minute prelungește pana.
- **Memorie locală cu N instanțe** — N cache-uri inconsecvente. Pentru date care trebuie consistente, Redis.
- **Cache ca acoperire pentru interogări proaste.** Dacă ai nevoie de cache ca să faci un endpoint utilizabil, uită-te întâi la [[N+1 query problem]] și [[Indexuri - cand ajuta si cand nu]]. Cache-ul peste o interogare de 3 secunde ascunde problema până la primul miss.

## Regula practică

Măsoară întâi. Cache-ul adaugă o clasă întreagă de bug-uri greu de reprodus (funcționează la mine, e cache-uit). Nu-l adăuga preventiv — vezi [[KISS DRY YAGNI]].

## Legături

- Face parte din: [[MOC Arhitectura]] · [[MOC Backend si API]]
- [[N+1 query problem]] · [[Indexuri - cand ajuta si cand nu]]
- [[CAP theorem]] — cache-ul e consistență eventuală, voit
