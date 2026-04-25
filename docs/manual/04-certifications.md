# CENTRO CERTIFICAZIONI

[← Torna all'Indice](./README.md)

---

## STATO MODULO

**Stato attuale**: **Operativo con elementi parziali**

Questo modulo esiste davvero nell'app e non va descritto come semplice slide di prodotto. Oggi espone una route dedicata e un dashboard che organizza piu percorsi di compliance agricola, ma non tutte le certificazioni hanno lo stesso livello di maturita.

**Percorso dichiarato**: Sidebar -> **"Certificazioni"**

---

## COSA E DISPONIBILE OGGI

- dashboard certificazioni con tab dedicate per `BIO`, `GlobalG.A.P.`, `SQNPI` e `GRASP`
- form strutturato per certificazione biologica `EU 2018/848`
- calcolo indicativo di conformita BIO basato sui dati inseriti
- dashboard `GlobalG.A.P. IFA` con overview di readiness, requisiti e azioni
- servizi dedicati per compliance `GlobalG.A.P.`, incluse strutture per `CB/FV`
- export di audit package e generazione di template documentali per alcuni requisiti
- base dati e servizi unificati per stato certificazioni, deadline, documenti e attivita

Evidenze principali nel codice:
- route [app/app/certifications/page.tsx](/Volumes/990P/ortomio-main/app/app/certifications/page.tsx:1)
- dashboard [components/certifications/CertificationsDashboard.tsx](/Volumes/990P/ortomio-main/components/certifications/CertificationsDashboard.tsx:1)
- form BIO [components/certifications/BioCertificationForm.tsx](/Volumes/990P/ortomio-main/components/certifications/BioCertificationForm.tsx:1)
- dashboard GlobalG.A.P. [components/compliance/GlobalGapDashboard.tsx](/Volumes/990P/ortomio-main/components/compliance/GlobalGapDashboard.tsx:1)
- servizi [services/globalGapComplianceService.ts](/Volumes/990P/ortomio-main/services/globalGapComplianceService.ts:1), [services/globalGapCbFvService.ts](/Volumes/990P/ortomio-main/services/globalGapCbFvService.ts:1), [services/unifiedCertificationsService.ts](/Volumes/990P/ortomio-main/services/unifiedCertificationsService.ts:1)

---

## COME LEGGERE LE SINGOLE AREE

### Certificazione Biologica

Da considerare **presente e usabile come supporto operativo** per raccogliere dati aziendali, pratiche, tracciabilita e controlli.

Il form BIO oggi consente di:
- inserire dati azienda e certificazione
- registrare superfici biologiche, in conversione e convenzionali
- dichiarare pratiche e vincoli rilevanti
- verificare un punteggio indicativo di conformita

Limite importante:
- il salvataggio passa da callback UI e non equivale da solo a una pratica certificativa completa gia chiusa verso un ente esterno

### GlobalG.A.P.

Da considerare **la parte piu strutturata del modulo**.

Nel codice esistono:
- dashboard dedicata
- overview di compliance e readiness
- checklist e azioni correttive
- servizi con copertura ampia per record `CB/FV`
- export documentale e audit package
- primitive per tracciabilita lotti, monitoraggi, analisi acqua, fertilizzazione, raccolta e rischi microbiologici

Limiti importanti:
- alcune azioni in UI sono ancora simulate
- la presenza di servizi e tabelle non significa che l'intero percorso sia gia validato su casi reali o pronto come sostituto di audit specialistico

### SQNPI e GRASP

Da considerare **anticipati / non ancora consolidati**.

Nel dashboard sono presenti come tab informative, ma oggi non hanno lo stesso livello operativo di BIO e GlobalG.A.P.

---

## COSA NON VA PRESENTATO COME CHIUSO OGGI

- certificazione automatica end-to-end verso organismi esterni
- conformita normativa garantita dal software senza revisione professionale
- integrazione diretta gia operativa con enti certificatori
- workflow uniformemente maturo per tutte le certificazioni elencate
- readiness GlobalG.A.P. da usare come unica fonte ufficiale di audit senza verifica umana

---

## USO CONSIGLIATO OGGI

Usa questo modulo per:
- organizzare dati e documenti di compliance
- preparare verifiche interne
- raccogliere evidenze utili a BIO e GlobalG.A.P.
- individuare gap documentali o operativi prima di audit e rinnovi

Non usarlo come:
- sostituto di consulente o organismo certificatore
- prova che l'intera azienda sia gia conforme solo perche il dashboard mostra uno score

---

## COLLEGAMENTI UTILI

- [📋 Registro Attività](./10-activity-registry.md): utile per ricostruire le operazioni
- [🌱 Nutrizione e Trattamenti](./16-nutrition-treatments.md): rilevante per registri input e trattamenti
- [🚜 Operazioni Meccaniche](./17-mechanical-operations.md): utile per evidenze operative e attrezzature
- [📤 Sistema Export](./23-export-system.md): utile per estrazioni documentali, con prudenza

---

[← Torna all'Indice](./README.md)
