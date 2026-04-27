# Sistema Export

[← Torna all'Indice](./README.md)

---

## Stato modulo

**Stato attuale**: **ibrido e frammentato**

In OrtoMio l'export esiste in piu superfici reali, ma non e ancora un framework unificato con catalogo formati enterprise, scheduler, API pubblica completa e pipeline unica di governance.

---

## Famiglie export verificate

### 1) Export operativo client-side (`/app/export`)

- pagina export con tre dataset: `tasks`, `gardens`, `analytics`
- formato `CSV`: download diretto lato browser
- formato `PDF`: non e un PDF engine dedicato; e un report HTML stampabile/salvabile come PDF dal browser
- dati letti dallo storage applicativo locale/utente corrente

Uso corretto: estrazioni rapide, backup pratico, confronto manuale.

### 2) Export API professionale (`/api/export/*`)

- endpoint esposti: `GET /api/export/csv`, `GET /api/export/pdf`
- accesso protetto da tier `PRO`
- tipologie attive: `analytics`, `treatments`
- sorgenti principali: `professional_analytics`, `treatment_register`
- in assenza configurazione Supabase server-side, gli endpoint usano dataset mock di fallback
- route `pdf` oggi restituisce testo/report (`.txt`) e non un PDF binario impaginato

Uso corretto: estrazioni professionali mirate (analytics e trattamenti), con verifica del contenuto in base a ambiente reale vs fallback.

### 3) Export specialistico precision (`Prescription Maps`)

- modulo export tecnico in `MapExportModal` + `geoExportService`
- formati previsti dal servizio: `shapefile`, `kml/kmz`, `isoxml`, `geojson`, `csv`
- gestione metadati export, coordinate system, compatibilita machinery
- tracciamento export in record dedicati (`PrescriptionMapExportRecord` / mapping DB)
- presenza di test dedicati (`geoExportService.test.ts`)

Uso corretto: supporto tecnico per mappe prescrizione e scambio con tool GIS/macchine, con validazione operativa ancora necessaria in campo.

---

## Limiti attuali da mantenere espliciti

- nessuna matrice unica e garantita di tutti i formati export a livello prodotto intero
- nessun scheduler robusto per export ricorrenti cross-modulo
- nessuna API pubblica general-purpose documentata end-to-end
- copertura parziale per compliance/reporting ufficiale multi-standard
- percorsi eterogenei: parte client-side, parte API, parte specialistica di modulo

---

## Cosa non va promesso come chiuso

- piattaforma export unificata enterprise gia pronta
- integrazione universale con qualsiasi ERP/BI/GIS senza validazione per dominio
- PDF professionale strutturato per ogni endpoint `/api/export/pdf`
- governance completa su versioning, delivery, audit e retry cross-modulo

---

## Uso consigliato oggi

1. Per export rapido utente: usare `/app/export` e validare manualmente il file.
2. Per dataset professionali (analytics/trattamenti): usare `/api/export/*` in ambiente con dati reali e tier corretto.
3. Per mappe prescrizione/GIS: usare l'export specialistico del modulo Prescription Maps.
4. Per output compliance ufficiali: trattarli come supporto operativo, non come automazione normativa completa.

---

## Roadmap realistica

- inventario unico delle famiglie export e formati realmente supportati
- convergenza contratti dati/minimum metadata tra client export, API export e export specialistici
- distinzione esplicita tra fallback/mock e dati produttivi in ogni route export
- roadmap per reporting compliance e delivery affidabile solo dopo evidence-ledger coerente

---

[← Torna all'Indice](./README.md)
