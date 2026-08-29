# 00 — Principi vincolanti per tutto il lavoro marketing di OrtoMio

**Data:** 28 agosto 2026 · **Stato:** vincolante, adattamento del §0 della metodologia GTM al contesto OrtoMio.

Questi vincoli valgono per ogni output (landing, one-pager, email, post, script demo, proposte). Vanno dichiarati all'inizio di ogni sessione di lavoro marketing e applicati anche quando non ripetuti.

## I vincoli

1. **Nessuna percentuale, risultato, cliente, testimonianza, timeline o risparmio inventato.** Il test è quello che ha bocciato la finta success story "Il Poggio Verde" (documento commerciale §7.1): se un'azienda, una cifra o una citazione non esiste nei dati reali del progetto, non entra nel materiale.
2. **Nessuna promessa di rischio zero.** L'agricoltura ha variabilità strutturale; il prodotto riduce incertezza organizzativa, non elimina il rischio.
3. **Il prodotto non sostituisce procedure, normative, formazione o giudizio professionale.** La decisione resta umana: il sistema propone e argomenta. Vale per certificazioni (bio, GlobalG.A.P.), difesa fitosanitaria, piani agronomici.
4. **Nessuna promessa di integrazione tecnica non verificata.** API pubbliche: `external-api: not-in-release-scope` nel codice runtime. Import Excel: inesistente. Telematica macchine (John Deere, Case IH): helper mock. Nessuna di queste si menziona come funzionalità.
5. **Nessuna scarsità artificiale, countdown finto, tattica manipolativa.** L'unica urgenza utilizzabile nel copy è quella agronomica reale (finestre di intervento, stagioni).
6. **"Lead qualificato" ha una definizione esplicita** (vedi 04_STRATEGIA_GTM §2): mai una visita, un click o un download.
7. **In ogni documento si distingue sempre:** fatto verificato (con fonte) / ipotesi da validare / raccomandazione. Le tre cose non si mescolano.
8. **Le informazioni mancanti si dichiarano**, non si colmano con plausibilità.
9. **Niente marketing SaaS generico:** ogni messaggio è legato a un ruolo concreto (chi decide in azienda, chi consiglia, chi risponde della certificazione) e a un meccanismo reale del prodotto.
10. **Coerenza col copy master approvato** (`docs/superpowers/specs/2026-08-15-ortomio-landing-copy-design.md`) e col posizionamento in `PRODUCT.md`. Ogni scostamento va proposto esplicitamente e motivato, mai introdotto silenziosamente.
11. **Rispetto della maturità delle capability** (`config/capabilities.ts`): ciò che è beta non si presenta come stabile; drone e blockchain (simulazione) non si vendono né si implicano.
12. **I claim dei competitor restano dei competitor.** Esempio concreto: "risparmio idrico fino al 50%" è un claim di Agricolus, non nostro. Mai prenderlo in prestito per analogia, nemmeno implicitamente ("come altre piattaforme…").
13. **La distinzione misurato/stimato/assente/simulato vale anche per i numeri di marketing:** se citiamo una cifra, si dichiara cosa è (misura interna, stima, illustrativo).
14. **Prompt-tipo per aprire una sessione di lavoro marketing:**

> Prima di iniziare qualunque materiale su OrtoMio, questi sono i vincoli obbligatori che valgono per ogni output: [lista sopra]. Applicali sempre, anche quando non lo ripeto. Se in un punto ti mancano dati per rispettarli, dichiaralo esplicitamente invece di inventare o generalizzare. Prima di scrivere, confronta ogni affermazione prevista con docs/gtm/03_MATRICE_CLAIM.md.
