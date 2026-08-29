# 05 — Piano dei materiali: censimento e priorità

**Data:** 28 agosto 2026 · **Metodo:** prima di produrre qualcosa di nuovo, censire ciò che esiste già nel progetto (metodologia §5). Ogni materiale nuovo passa da `03_MATRICE_CLAIM.md` prima della consegna.

## 1. Censimento — cosa esiste già (verificato in questa sessione)

| Materiale | Dove | Stato | Valore riutilizzo |
|---|---|---|---|
| Landing pubblica (copy master approvato) | `app/page.tsx`, `components/landing/`, spec `2026-08-15-ortomio-landing-copy-design.md` | **Live** | fonte del copy; ogni nuovo materiale ne eredita tono e claim |
| Form prova guidata end-to-end | `PilotRequestForm.tsx` → `app/api/support/submit/route.ts` → Supabase `support_requests` | **Verificato funzionante** | punto di conversione unico |
| Documento commerciale interno approfondito | `docs/DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-15_APPROFONDITO.md` | completo, con fonti per claim | miniera di claim (V) e del confronto prima/dopo della governance |
| 35 manuali utente onesti | `docs/manual/*.md` | aggiornati con limiti reali | fonte per FAQ e obiezioni |
| MASTERDOC | `MASTERDOC.md` | canonico | architettura/maturità |
| Logo + payoff ("il tuo assistente smart") | `public/logo.png` | esistente | per one-pager e profili |
| robots.ts / sitemap.ts | `app/` | esistenti | base SEO tecnica già presente |
| Nota: la specifica della prova della "Nota di onestà" (confronto prima/dopo dei manuali) | documento commerciale §4bis/§7 | pronta | 2-3 esempi selezionabili per landing/outreach |

**Non verificato / informazione mancante:** esistenza di un profilo LinkedIn aziendale OrtoMio; presenza su altri canali. Da accertare (azione 9 del piano 90 giorni).

## 2. Cosa manca — tabella prioritaria

| Priorità | Materiale | Destinatario | Fase funnel | Stato | Note |
|---|---|---|---|---|---|
| **P0** | Privacy policy + termini + pagine Impostazioni/Cancella account | visitatori/utenti | trasversale | **da creare** | bloccante GDPR per il form e per ogni campagna; i file vuoti omonimi in root suggeriscono che era pianificato |
| **P0** | Script demo guidata 30' | PO/MAGMA | valutazione | da creare | pezzo forte: pannello di trasparenza sul caso del visitatore; azione 3 del piano 90 giorni |
| **P1** | Template email post-richiesta (ricevuta / proposta demo / follow-up) | richiedenti | valutazione | da creare | oggi il form promette "ti scriviamo" senza processo; azione 4 |
| **P1** | One-pager PDF per outreach | tecnici/titolari | consapevolezza/valutazione | da creare | solo claim (V); azione 8 |
| **P1** | Documento struttura pilota (durata, dati, esiti, consenso citazione) | candidato pilota | decisione | da creare | azione 7 |
| **P2** | Template caso studio (vuoto, pronto a riempirsi col primo pilota) | mercato | tutte | da creare | si riempie solo con dati e consensi reali |
| **P2** | Pagina prezzi | mercato | decisione | da creare | **solo dopo** la decisione di prezzo (giorni 61-90) |
| **P2** | FAQ / gestione obiezioni (dalle demo) | richiedenti | valutazione | da creare dopo le prime demo | alimenta anche lo script demo |
| **P3** | Video demo walkthrough 3' | mercato | consapevolezza | da creare | dopo che lo script è rodato su ≥3 demo reali |
| **P3** | Pagine "alternative to xFarm" ecc. | mercato a confronto | valutazione | **non ora** | condizione di riapertura: casi reali + pricing pubblico (04 §8) |

## 3. Regole di produzione

1. Ordine di produzione = ordine di priorità della tabella; niente viene prodotto "perché è veloce".
2. Ogni materiale nuovo: verifica contro `03_MATRICE_CLAIM.md` + coerenza col copy master della landing + registrazione in questo file (stato → "esiste in [percorso]").
3. Nessun materiale duplica funzioni di uno esistente: se il bisogno è coperto (es. dettagli tecnici → manuali), si linka, non si riscrive.
4. Aggiornare questo file nello stesso commit del materiale prodotto (anti-staticità).

## 4. Pulizia raccomandata (non marketing, ma emersa dal censimento)

I file vuoti in root `Cancella`, `Impostazioni`, `Privacy` (0 byte, 17/08) vanno rimossi o sostituiti dalle pagine reali — il loro nome suggerisce che erano segnaposto delle pagine P0 sopra. Inoltre i riferimenti in `PRODUCT.md` puntano a `docs/DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-01.md`, che è stato sostituito dalla versione `_2026-08-15_APPROFONDITO`: da correggere al prossimo tocco a quel file.
