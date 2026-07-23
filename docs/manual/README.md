# Manuale utente OrtoMio

- **Versione:** release candidate locale P0-P8
- **Aggiornamento:** 23 luglio 2026
- **Fonte:** `docs/manual`
- **Stato remoto:** non distribuito; rollout differito fino ai gate staging
- **Copia pubblica:** `public/docs/manual`, generata dalla fonte

## Come leggere gli stati

Questi stati corrispondono al campo `maturity` di `config/capabilities.ts`, la fonte reale che genera il badge mostrato nell'interfaccia (`stable`/`beta`/`simulation`) — non sono una valutazione soggettiva di questo manuale.

- **Operativo locale:** percorso persistente e autorizzato verificato nella baseline.
- **Beta:** la funzione è completa e testata in locale, **ma non è mai stata provata sul campo** — nessun pilot con dati reali di un'azienda cliente, nessun test RLS negativo su più aziende reali, nessun contract test contro il provider esterno reale (dove previsto). "Beta" qui non significa "codice incompleto": significa "funziona, ma non ancora dimostrato fuori dall'ambiente di sviluppo." Non promuovere una capability da Beta a Operativo locale senza quella prova concreta, anche se il codice sembra pronto.
- **Disattivato:** implementato ma nascosto dalla capability server-side (feature flag spento) — indipendente dalla maturità: una funzione può essere "beta" e comunque attiva, oppure tecnicamente più matura ma tenuta spenta in attesa di una decisione di prodotto.
- **Simulazione:** laboratorio separato, senza valore operativo o certificativo.
- **Indisponibile:** provider o schema richiesto non verificato.

## Matrice sintetica

| Dominio | Stato della baseline | Nota |
| --- | --- | --- |
| Garden, task, colture specializzate (frutteto/oliveto/vigneto) | Operativo locale | La verifica dello schema/RLS remoto resta obbligatoria. |
| Centro operativo | Beta | Aggrega segnali e priorità di più appezzamenti; non provato con dati multi-azienda reali. |
| Planner AI | Beta | Pianificazione assistita testata in locale; non provato su casi d'uso reali estesi. |
| Consigli AI | Beta | Suggerimenti agronomici contestuali; non validati da un agronomo su casi reali. |
| Diario, irrigazione, nutrizione, lavorazioni | Beta | Write persistenti e lifecycle verificati localmente; pilot non eseguito. |
| Salute e monitoraggio | Beta | Alert deterministici e persistenti; non sostituiscono diagnosi professionale. |
| Predizioni AI | Disattivato | Motore riproducibile; manca validazione staging/outcome. |
| NDVI Sentinel | Beta/indisponibile | Solo dati reali con provenienza; senza provider non produce valori. |
| Prescription Maps | Beta | Persistenza atomica; validazione campo-macchina ancora necessaria. |
| Smart Hub | Beta | Telemetria e lifecycle comando; nessuna garanzia fisica senza ack. |
| Certificazioni ed export | Beta | Dossier ed export auditati; nessuna certificazione ufficiale automatica. |
| Drone e blockchain | Simulazione | Isolati dai KPI e dai dossier reali. |
| Admin e rollout | Admin-only | Stato e cambi capability risolti server-side e auditati. |

## Capitoli

### Decisione e pianificazione

- [AI e supporto decisionale](./07-ai-overview.md)
- [Predizioni AI](./01-ai-predictions.md)
- [Planner AI](./09-planner-ai-chat.md)
- [Director Orchestrator](./34-director-orchestrator.md)
- [Diario automatico](./35-automated-diary.md)

### Operazioni

- [Registro attività](./10-activity-registry.md)
- [Irrigazione](./15-irrigation-system.md)
- [Nutrizione e trattamenti](./16-nutrition-treatments.md)
- [Lavorazioni meccaniche](./17-mechanical-operations.md)
- [Piante individuali](./21-individual-plants.md)

### Precision, IoT e conformità

- [NDVI satellitare](./05-ndvi-satellite.md)
- [Prescription Maps](./06-prescription-maps.md)
- [Smart Hub](./14-smart-hub.md)
- [Certificazioni](./04-certifications.md)
- [Certificazione biologica](./04b-bio-certification-guide.md)
- [Export](./23-export-system.md)

### Uso e supporto

- [Guida rapida](./27-quick-start.md)
- [Interfaccia e navigazione](./29-interface-navigation.md)
- [Integrazioni e API](./26-integration-api.md)
- [Roadmap](./32-roadmap.md)
- [Supporto](./33-support-contacts.md)

### Laboratori simulati

- [Drone](./02-drone-operations.md)
- [Tracciabilità blockchain](./03-traceability.md)

## Regole di sicurezza

Verifica sempre il garden attivo prima di scrivere dati. Una previsione o una raccomandazione è supporto decisionale, non sostituisce un agronomo. Un comando IoT è eseguito solo dopo conferma telemetrica. Gli export di conformità raccolgono evidenze: l'esito ufficiale appartiene all'organismo competente.
