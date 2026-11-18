export const MANUAL_UPDATED = '18 novembre 2026'

export const MANUAL_GROUPS = [
  { title: 'Inizia da qui', slugs: ['27-quick-start', '36-access-account', '29-interface-navigation', '44-daily-checklist', '43-glossary'] },
  { title: 'Organizza terreni e colture', slugs: ['37-gardens-zones-rows', '21-individual-plants', '46-seeds-nursery', '18-orchard-management', '19-olive-management', '20-vineyard-management'] },
  { title: 'Pianifica e registra il lavoro', slugs: ['34-director-orchestrator', '09-planner-ai-chat', '38-calendar-tasks', '15-irrigation-system', '16-nutrition-treatments', '17-mechanical-operations', '39-health-monitoring', '40-harvest', '10-activity-registry', '35-automated-diary'] },
  { title: 'Leggi dati, suggerimenti e dispositivi', slugs: ['07-ai-overview', '08-global-ai-chat', '01-ai-predictions', '05-ndvi-satellite', '06-prescription-maps', '14-smart-hub', '22-business-intelligence', '24-sustainability', '28-economic-benefits'] },
  { title: 'Documenti, account e assistenza', slugs: ['04-certifications', '04b-bio-certification-guide', '23-export-system', '41-settings-organization', '26-integration-api', '45-administration', '42-troubleshooting', '33-support-contacts', '11-agronomist-consultations'] },
  { title: 'Esempi e percorsi guidati', slugs: ['30-use-cases', '32-roadmap', '02-drone-operations', '03-traceability', '25-research-development', '31-success-stories'] },
] as const

export type ManualChapter = {
  slug: string
  title: string
  group: string
  summary: string
  content: string
}
