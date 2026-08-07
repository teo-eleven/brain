---
tags: [architecture]
created: 2026-08-06
type: permanent
---

# Event driven - baza

## Ideea

În loc să apelezi direct pe cine are nevoie de informație, **publici un fapt** și cine e interesat se abonează.

```
# Cuplat: serviciul de facturi știe despre toți consumatorii
factura.creeaza() → trimite_email() → actualizeaza_raport() → notifica_contabil()

# Decuplat: publică un fapt, nu știe cine ascultă
factura.creeaza() → publish("factura.creata", {id: 42})
                      ├── serviciul de email
                      ├── serviciul de rapoarte
                      └── serviciul de notificări
```

Adaugi un consumator nou fără să atingi codul care publică. Ăsta e câștigul.

## Comandă vs eveniment

Distincția care ține designul curat:

- **Comandă** — imperativ, un destinatar, poate fi refuzată: `TrimiteFactura`
- **Eveniment** — la trecut, fapt consumat, zero sau mai mulți destinatari: `FacturaTrimisa`

Numele la trecut nu e cosmetic: te împiedică să transformi evenimentele în apeluri de funcție deghizate. Dacă publisher-ul așteaptă ca cineva anume să facă ceva anume, ai o comandă, nu un eveniment — și nu ai câștigat decuplare, doar ai ascuns-o.

## Ce plătești

- **Fluxul devine invizibil.** Nu poți urmări execuția cu „go to definition". Ai nevoie de tracing — vezi [[Observability - logs metrics traces]].
- **Consistență eventuală.** Raportul e actualizat „în curând", nu instant. Interfața trebuie să reflecte asta onest.
- **Ordinea nu e garantată.** `FacturaAnulata` poate ajunge înaintea lui `FacturaCreata`.
- **Livrare dublă.** Consumatorii trebuie idempotenți — vezi [[Idempotenta in API]].
- **Debug greu.** Un bug traversează mai multe procese și mai multe momente în timp.

## Ce trebuie să conțină un eveniment

```json
{
  "event_id": "uuid",           // pentru deduplicare la consumator
  "type": "factura.creata",
  "version": 1,                 // schema evoluează
  "occurred_at": "2026-08-06T14:30:00Z",
  "data": { "factura_id": 42, "tenant_id": 7 }
}
```

**Date minime: ID-uri, nu obiecte complete.** Consumatorul citește starea actuală. Un obiect complet în eveniment devine o copie învechită și te leagă la schema publisher-ului.

`event_id` e ce permite consumatorului să ignore duplicatele.

## Când NU

Pentru un monolit cu 3 module, un apel de funcție e mai bun: sincron, tipizat, urmăribil, testabil. Event-driven adaugă complexitate reală — vezi [[KISS DRY YAGNI]] și [[Monolit vs microservicii]].

Semnalul că ai nevoie: **mai mulți consumatori independenți** pentru același fapt, sau nevoia ca publisher-ul să nu aștepte.

## Legături

- Face parte din: [[MOC Arhitectura]]
- [[Cozi si background jobs]] · [[Idempotenta in API]]
- [[Monolit vs microservicii]] · [[CAP theorem]] · [[Cuplare si coeziune]]
