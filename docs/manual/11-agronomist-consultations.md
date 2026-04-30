# Consultazioni Agronomo

[← Torna all'Indice](./README.md)

---

## Stato Modulo

**Stato attuale**: parzialmente persistito, non marketplace.

Esistono tipi, componenti UI e metodi nello storage provider per gestire agronomi, consultazioni e advice. Il service dedicato `agronomistService.ts` però contiene ancora helper leggeri/stub per diverse letture, quindi il dominio non va presentato come piattaforma consulenziale completa.

**Percorso dichiarato**: Sidebar → Salute → Tab "Agronomi"

---

## Cosa è disponibile oggi

- tipi per agronomi, consultazioni e advice
- componenti per ricerca/contatto/consultation form/lista
- persistenza tramite `SupabaseStorageProvider` su tabelle `agronomists`, `agronomist_consultations` e `agronomist_advice`
- collegamento opzionale di consultazioni a giardino e task
- advice collegabile a task, categoria, priorità, data/stagione e stato applicato

---

## Cosa non è chiuso

- marketplace di agronomi verificati
- booking con disponibilità real-time
- pagamenti, fatture, abbonamenti e SLA
- prescrizioni applicate automaticamente a workflow e registri operativi
- rating, ranking, matching professionale o copertura nazionale garantita
- metriche ROI dei risultati consulenziali

---

## Uso corretto oggi

Usa questa area per:
- registrare contatti o riferimenti agronomici dove il provider lo supporta
- salvare consultazioni e consigli tecnici
- collegare advice a task quando il flusso lo consente
- preparare materiale operativo usando registri, storico e allegati

Non usarla come:
- marketplace professionale completo
- sistema contrattuale di consulenza
- garanzia che una prescrizione sia stata eseguita o abbia prodotto outcome
- sostituto di responsabilità professionale esterna

---

## Moduli utili per una consulenza reale

- [Planner AI](./09-planner-ai-chat.md): per task, priorità e passaggio all'esecuzione
- [Registro Attività](./10-activity-registry.md): per ricostruire lo storico
- [Sistema Irrigazione](./15-irrigation-system.md): per dati irrigui reali e log
- [Nutrizione e Trattamenti](./16-nutrition-treatments.md): per trattamenti e note operative
- [Smart Hub](./14-smart-hub.md): solo come supporto parziale, non come fonte IoT sempre stabile

---

## Backlog tracciato

Per rendere il modulo un prodotto consulenziale completo servirebbe:
- consolidare `agronomistService.ts` sulla stessa persistenza del provider
- UX completa per richieste, report, prescrizioni e follow-up
- workflow esplicito advice → task → operazione → outcome
- gestione privacy/documenti/allegati più robusta
- eventuale marketplace/booking/pagamenti come dominio separato

---

[← Torna all'Indice](./README.md)
