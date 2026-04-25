# Sostenibilita' e Ambiente

Questo capitolo descrive il confine attuale del supporto ambientale in OrtoMio. Il prodotto non e' ancora una piattaforma completa di carbon accounting, ESG reporting, certificazione ambientale o gestione economia circolare.

Le promesse piu' ampie sono conservate nel master plan come TODO architetturali, non presentate come funzionalita' correnti.

## Stato attuale

OrtoMio contiene basi reali per decisioni ambientali operative:

- storico meteo persistito con lineage e qualita' del segnale;
- indicatori derivati su bilancio idrico, pressione malattie, umidita' e potere asciugante;
- contesto ambientale usato da irrigazione, prescrizioni, predizioni e diario;
- letture sensori e qualita' acqua dove disponibili;
- indicatori locali di impatto o score ambientale in prescription/cost optimization;
- una tab analytics sostenibilita' con metriche leggere, non auditate.

Queste funzioni aiutano a leggere rischi, finestre operative e uso delle risorse. Non costituiscono ancora reporting ambientale certificabile.

## Evidenza ambientale supportata

Il sistema puo' usare segnali come:

- temperatura, umidita', precipitazioni, vento e condizioni meteo;
- classificazioni di deficit/surplus idrico;
- pressione ambientale favorevole a patogeni;
- storico di stress idrico per zona;
- qualita' dell'acqua irrigua quando registrata;
- esiti di prescrizioni e riduzione input dove collegati a esecuzioni reali.

Il valore di questi segnali dipende dalla fonte: stazione locale, API meteo, dati storici, forecast, input manuale o fallback stimato.

## Cosa non va presentato come attuale

Non sono capability correnti:

- calcolo completo Scope 1, Scope 2 e Scope 3;
- carbon footprint verificata o carbon neutrality;
- crediti carbonio, offset vendibili o audit terza parte;
- calcolo sequestro carbonio biomassa/suolo verificato;
- indici biodiversita' completi e censimenti faunistici/floristici;
- gestione rifiuti, biogas, compost certificato o simbiosi industriale;
- report ESG formale;
- workflow ISO 14001, EMAS, Carbon Trust, Rainforest Alliance o certificazioni analoghe.

## Promesse convertite in TODO

Il master plan traccia le ambizioni valide:

- `T10-IMPLEMENT-01 sustainability evidence ledger`: registro evidenze ambientali con fonte, qualita', assunzioni e audit lineage;
- `T10-IMPLEMENT-02 water efficiency analytics`: indicatori misurati di uso acqua, baseline e confidenza;
- `T10-IMPLEMENT-03 carbon accounting module`: fattori emissivi, Scope 1/2/3, unita', incertezza e riferimenti;
- `T10-IMPLEMENT-04 biodiversity and habitat tracking`: osservazioni, habitat, date monitoraggio e indicatori semplici;
- `T10-IMPLEMENT-05 ESG/export reporting`: report generati solo da evidenze auditabili;
- `T10-DEFER-01 environmental certifications and third-party audit workflows`;
- `T10-DEFER-02 circular-economy and waste/byproduct marketplace workflows`.

## Uso corretto

Usare OrtoMio per migliorare decisioni ambientali operative: irrigazione, trattamenti, finestre meteo, gestione stress e riduzione input quando i dati lo supportano.

Per dichiarazioni pubbliche su carbon footprint, neutralita' carbonica, ESG o certificazioni ambientali serve prima implementare un ledger evidenze e un modello standardizzato verificabile.
