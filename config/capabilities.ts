import { getEnabledFeatures, type FeatureFlag } from '@/config/features'

export type CapabilityRole = 'user' | 'admin'
export type CapabilityTier = 'FREE' | 'PLUS' | 'PRO'
export type CapabilityProvider = 'supabase' | 'sentinel' | 'thingsboard'
export type CapabilityMaturity = 'stable' | 'beta' | 'simulation'
export type CapabilityTarget = 'desktop' | 'mobile' | 'bottom' | 'search' | 'help'

export type CapabilityIcon =
  | 'dashboard'
  | 'farm'
  | 'garden'
  | 'planner'
  | 'plants'
  | 'health'
  | 'advice'
  | 'diary'
  | 'orchard'
  | 'olive'
  | 'vineyard'
  | 'irrigation'
  | 'nutrition'
  | 'mechanical'
  | 'certifications'
  | 'prediction'
  | 'satellite'
  | 'map'
  | 'analytics'
  | 'smart'
  | 'export'
  | 'help'
  | 'settings'
  | 'admin'
  | 'drone'
  | 'traceability'
  | 'harvest'
  | 'seedbed'
  | 'calendar'

export interface CapabilityDescriptor {
  id: string
  label: string
  description: string
  group: string
  icon: CapabilityIcon
  route?: `/app${string}`
  helpHref?: `/docs/manual/${string}`
  roles: CapabilityRole[]
  tiers: CapabilityTier[]
  providers?: CapabilityProvider[]
  providerRequirement?: 'required' | 'optional'
  schema?: string[]
  maturity: CapabilityMaturity
  targets: CapabilityTarget[]
  featureFlag?: FeatureFlag
  searchResultTypes?: string[]
  bottomOrder?: number
}

export interface CapabilityAccess {
  role: CapabilityRole
  tier: CapabilityTier
  providers: Record<CapabilityProvider, boolean>
  schema: Record<string, boolean>
  enabledFeatures: FeatureFlag[]
}

const ALL_ROLES: CapabilityRole[] = ['user', 'admin']
const ALL_TIERS: CapabilityTier[] = ['FREE', 'PLUS', 'PRO']
const PRO: CapabilityTier[] = ['PRO']
const APP_TARGETS: CapabilityTarget[] = ['desktop', 'mobile', 'search', 'help']

export const CAPABILITIES: CapabilityDescriptor[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Sintesi operativa del tuo spazio agricolo.', group: 'PRINCIPALE', icon: 'dashboard', route: '/app', helpHref: '/docs/manual/27-quick-start', roles: ALL_ROLES, tiers: ALL_TIERS, maturity: 'stable', targets: [...APP_TARGETS, 'bottom'], bottomOrder: 1 },
  { id: 'farm', label: 'Centro operativo', description: 'Vista coordinata di campi, segnali e priorità.', group: 'PRINCIPALE', icon: 'farm', route: '/app/farm', helpHref: '/docs/manual/34-director-orchestrator', roles: ALL_ROLES, tiers: PRO, maturity: 'beta', targets: [...APP_TARGETS, 'bottom'], bottomOrder: 2 },
  { id: 'garden', label: 'Appezzamenti', description: 'Gestione di orti, zone e filari.', group: 'PRINCIPALE', icon: 'garden', route: '/app/garden', helpHref: '/docs/manual/29-interface-navigation', roles: ALL_ROLES, tiers: ALL_TIERS, schema: ['gardens'], maturity: 'stable', targets: [...APP_TARGETS, 'bottom'], searchResultTypes: ['garden'], bottomOrder: 3 },
  { id: 'planner', label: 'Planner AI', description: 'Pianificazione assistita delle colture.', group: 'PRINCIPALE', icon: 'planner', route: '/app/planner', helpHref: '/docs/manual/09-planner-ai-chat', roles: ALL_ROLES, tiers: ALL_TIERS, maturity: 'beta', targets: [...APP_TARGETS, 'bottom'], featureFlag: 'PLANNER_BASE', bottomOrder: 4 },
  { id: 'planner-classic', label: 'Piano colturale', description: 'Piano colturale strutturato e verificabile.', group: 'PRINCIPALE', icon: 'planner', route: '/app/planner-classic', helpHref: '/docs/manual/30-use-cases', roles: ALL_ROLES, tiers: ALL_TIERS, maturity: 'stable', targets: APP_TARGETS },
  { id: 'plants', label: 'Piante', description: 'Anagrafica e stato delle singole piante.', group: 'PRINCIPALE', icon: 'plants', route: '/app/plants', helpHref: '/docs/manual/21-individual-plants', roles: ALL_ROLES, tiers: ALL_TIERS, schema: ['garden_plants'], maturity: 'stable', targets: APP_TARGETS, featureFlag: 'INDIVIDUAL_PLANTS' },
  { id: 'health', label: 'Salute', description: 'Osservazioni, rischi e interventi fitosanitari.', group: 'PRINCIPALE', icon: 'health', route: '/app/health', helpHref: '/docs/manual/16-nutrition-treatments', roles: ALL_ROLES, tiers: ALL_TIERS, maturity: 'stable', targets: APP_TARGETS, searchResultTypes: ['treatment'] },
  { id: 'advice', label: 'Consigli AI', description: 'Suggerimenti agronomici contestuali.', group: 'PRINCIPALE', icon: 'advice', route: '/app/advice', helpHref: '/docs/manual/07-ai-overview', roles: ALL_ROLES, tiers: ALL_TIERS, maturity: 'beta', targets: APP_TARGETS, featureFlag: 'ADVICE_BASE' },
  { id: 'diary', label: 'Diario operativo', description: 'Timeline canonica di attività ed esiti.', group: 'PRINCIPALE', icon: 'diary', route: '/app/diary', helpHref: '/docs/manual/10-activity-registry', roles: ALL_ROLES, tiers: ALL_TIERS, schema: ['daily_diary_entries'], maturity: 'beta', targets: APP_TARGETS, featureFlag: 'JOURNAL', searchResultTypes: ['task'] },
  { id: 'seedbed', label: 'Semenzaio', description: 'Gestione di semi e semine.', group: 'PRINCIPALE', icon: 'seedbed', route: '/app/semenzaio', helpHref: '/docs/manual/30-use-cases', roles: ALL_ROLES, tiers: ALL_TIERS, maturity: 'stable', targets: APP_TARGETS, searchResultTypes: ['seed'] },
  { id: 'harvest', label: 'Raccolti', description: 'Registro delle raccolte e delle rese.', group: 'PRINCIPALE', icon: 'harvest', route: '/app/harvest', helpHref: '/docs/manual/22-business-intelligence', roles: ALL_ROLES, tiers: ALL_TIERS, maturity: 'stable', targets: APP_TARGETS, searchResultTypes: ['harvest'] },
  { id: 'calendar', label: 'Calendario', description: 'Vista calendario di tutte le attività pianificate.', group: 'PRINCIPALE', icon: 'calendar', route: '/app/calendar', helpHref: '/docs/manual/29-interface-navigation', roles: ALL_ROLES, tiers: ALL_TIERS, maturity: 'stable', targets: APP_TARGETS },

  { id: 'orchard', label: 'Frutteto', description: 'Gestione agronomica del frutteto.', group: 'COLTURE SPECIALIZZATE', icon: 'orchard', route: '/app/orchard', helpHref: '/docs/manual/18-orchard-management', roles: ALL_ROLES, tiers: PRO, maturity: 'stable', targets: APP_TARGETS, featureFlag: 'ORCHARD' },
  { id: 'olives', label: 'Oliveto', description: 'Gestione agronomica dell’oliveto.', group: 'COLTURE SPECIALIZZATE', icon: 'olive', route: '/app/olives', helpHref: '/docs/manual/19-olive-management', roles: ALL_ROLES, tiers: PRO, maturity: 'stable', targets: APP_TARGETS, featureFlag: 'OLIVE_GROVE' },
  { id: 'vineyard', label: 'Vigneto', description: 'Gestione agronomica del vigneto.', group: 'COLTURE SPECIALIZZATE', icon: 'vineyard', route: '/app/vineyard', helpHref: '/docs/manual/20-vineyard-management', roles: ALL_ROLES, tiers: PRO, maturity: 'stable', targets: APP_TARGETS, featureFlag: 'VINEYARD' },

  { id: 'irrigation', label: 'Irrigazione', description: 'Fabbisogno, piani, esecuzioni e misure.', group: 'GESTIONE PROFESSIONALE', icon: 'irrigation', route: '/app/irrigation', helpHref: '/docs/manual/15-irrigation-system', roles: ALL_ROLES, tiers: PRO, maturity: 'beta', targets: APP_TARGETS, featureFlag: 'IRRIGATION_BASE' },
  { id: 'nutrition', label: 'Nutrizione e trattamenti', description: 'Piani nutrizionali e compatibilità degli interventi.', group: 'GESTIONE PROFESSIONALE', icon: 'nutrition', route: '/app/nutrition', helpHref: '/docs/manual/16-nutrition-treatments', roles: ALL_ROLES, tiers: PRO, maturity: 'beta', targets: APP_TARGETS, featureFlag: 'NUTRITION_BASE' },
  { id: 'mechanical', label: 'Lavorazioni', description: 'Lavorazioni meccaniche, costi ed esiti.', group: 'GESTIONE PROFESSIONALE', icon: 'mechanical', route: '/app/mechanical-work', helpHref: '/docs/manual/17-mechanical-operations', roles: ALL_ROLES, tiers: PRO, maturity: 'beta', targets: APP_TARGETS, featureFlag: 'MECHANICAL_WORK_BASE', searchResultTypes: ['mechanical'] },
  { id: 'certifications', label: 'Certificazioni', description: 'Evidenze e dossier di conformità.', group: 'GESTIONE PROFESSIONALE', icon: 'certifications', route: '/app/certifications', helpHref: '/docs/manual/04-certifications', roles: ALL_ROLES, tiers: PRO, maturity: 'beta', targets: APP_TARGETS, featureFlag: 'CERTIFICATIONS_BASE' },

  { id: 'predictions', label: 'Predizioni AI', description: 'Previsioni sperimentali su resa, acqua e rischio.', group: 'ANALYTICS E SMART', icon: 'prediction', route: '/app/ai-predictions', helpHref: '/docs/manual/01-ai-predictions', roles: ALL_ROLES, tiers: PRO, maturity: 'beta', targets: APP_TARGETS, featureFlag: 'AI_PREDICTIONS' },
  { id: 'ndvi', label: 'NDVI satellitare', description: 'Analisi Sentinel reale con provenienza e quality gate.', group: 'ANALYTICS E SMART', icon: 'satellite', route: '/app/ndvi', helpHref: '/docs/manual/05-ndvi-satellite', roles: ALL_ROLES, tiers: PRO, providers: ['sentinel'], providerRequirement: 'required', maturity: 'beta', targets: APP_TARGETS },
  { id: 'prescription-maps', label: 'Prescription Maps', description: 'Mappe di prescrizione e tracciamento applicazioni.', group: 'ANALYTICS E SMART', icon: 'map', route: '/app/prescription-maps', helpHref: '/docs/manual/06-prescription-maps', roles: ALL_ROLES, tiers: PRO, maturity: 'beta', targets: APP_TARGETS },
  { id: 'analytics', label: 'Analytics', description: 'Indicatori tecnici ed economici.', group: 'ANALYTICS E SMART', icon: 'analytics', route: '/app/analytics', helpHref: '/docs/manual/22-business-intelligence', roles: ALL_ROLES, tiers: PRO, maturity: 'stable', targets: APP_TARGETS, featureFlag: 'ANALYTICS' },
  { id: 'smart', label: 'Smart Hub', description: 'Dispositivi e automazioni con stato osservato.', group: 'ANALYTICS E SMART', icon: 'smart', route: '/app/smart', helpHref: '/docs/manual/14-smart-hub', roles: ALL_ROLES, tiers: PRO, providers: ['thingsboard'], providerRequirement: 'optional', maturity: 'beta', targets: APP_TARGETS },
  { id: 'export', label: 'Export', description: 'Esportazioni autorizzate e report.', group: 'ANALYTICS E SMART', icon: 'export', route: '/app/export', helpHref: '/docs/manual/23-export-system', roles: ALL_ROLES, tiers: PRO, maturity: 'beta', targets: APP_TARGETS, featureFlag: 'PROFESSIONAL_DASHBOARD' },

  { id: 'help', label: 'Manuale utente', description: 'Guida alle capability realmente disponibili.', group: 'SUPPORTO', icon: 'help', route: '/app/help', helpHref: '/docs/manual/27-quick-start', roles: ALL_ROLES, tiers: ALL_TIERS, maturity: 'stable', targets: ['desktop', 'mobile', 'search'] },
  { id: 'settings', label: 'Impostazioni', description: 'Preferenze personali e configurazione.', group: 'SUPPORTO', icon: 'settings', route: '/app/settings', helpHref: '/docs/manual/29-interface-navigation', roles: ALL_ROLES, tiers: ALL_TIERS, maturity: 'stable', targets: ['desktop', 'mobile', 'search', 'bottom'], bottomOrder: 99 },
  { id: 'satellite-config', label: 'Configurazione satellite', description: 'Stato provider Sentinel senza esposizione dei secret.', group: 'AMMINISTRAZIONE', icon: 'satellite', route: '/app/satellite-config', helpHref: '/docs/manual/05-ndvi-satellite', roles: ['admin'], tiers: PRO, providers: ['sentinel'], providerRequirement: 'optional', maturity: 'beta', targets: APP_TARGETS },
  { id: 'admin', label: 'Admin', description: 'Gestione amministrativa riservata.', group: 'AMMINISTRAZIONE', icon: 'admin', route: '/app/admin', helpHref: '/docs/manual/26-integration-api', roles: ['admin'], tiers: PRO, maturity: 'stable', targets: APP_TARGETS },

  { id: 'drone-reference', label: 'Simulatore missione drone', description: 'Laboratorio simulato, non produce evidenza operativa.', group: 'LABORATORIO', icon: 'drone', helpHref: '/docs/manual/02-drone-operations', roles: ALL_ROLES, tiers: PRO, maturity: 'simulation', targets: ['help'] },
  { id: 'traceability-reference', label: 'Tracciabilità demo', description: 'Dimostrazione blockchain senza valore certificativo.', group: 'LABORATORIO', icon: 'traceability', helpHref: '/docs/manual/03-traceability', roles: ALL_ROLES, tiers: PRO, maturity: 'simulation', targets: ['help'] },
]

export const TECHNICAL_ROUTES = [
  { route: '/app/reports', classification: 'technical', canonicalEntry: '/app/export' },
  { route: '/app/zones', classification: 'legacy-alias', canonicalEntry: '/app/garden/zones' },
  { route: '/app/pianifica', classification: 'legacy-alias', canonicalEntry: '/app/planner' },
] as const

const tierRank: Record<CapabilityTier, number> = { FREE: 0, PLUS: 1, PRO: 2 }

export function isCapabilityVisible(
  capability: CapabilityDescriptor,
  access: CapabilityAccess,
  target: CapabilityTarget,
  enabledFeatures?: Set<FeatureFlag>,
) {
  if (!capability.targets.includes(target)) return false
  if (!capability.roles.includes(access.role)) return false
  if (!capability.tiers.some(tier => tierRank[access.tier] >= tierRank[tier])) return false
  if (capability.featureFlag && enabledFeatures && !enabledFeatures.has(capability.featureFlag)) return false
  if (capability.providerRequirement === 'required' && capability.providers?.some(provider => !access.providers[provider])) return false
  if (capability.schema?.some(table => access.schema[table] === false)) return false
  return true
}

export function getVisibleCapabilities(
  access: CapabilityAccess,
  target: CapabilityTarget,
  enabledFeatures?: Set<FeatureFlag>,
) {
  return CAPABILITIES.filter(capability =>
    isCapabilityVisible(capability, access, target, enabledFeatures),
  )
}

export function getCapabilityBadge(capability: CapabilityDescriptor) {
  if (capability.maturity === 'simulation') return 'Simulazione'
  if (capability.maturity === 'beta') return 'Beta'
  return null
}

export function getSearchResultRoute(type: string) {
  return CAPABILITIES.find(capability => capability.searchResultTypes?.includes(type))?.route ?? '/app'
}

export const DEFAULT_CAPABILITY_ACCESS: CapabilityAccess = {
  role: 'user',
  tier: 'PRO',
  providers: { supabase: false, sentinel: false, thingsboard: false },
  schema: {},
  enabledFeatures: getEnabledFeatures(),
}

export function getEnabledFeaturesForAccess(access: CapabilityAccess): Set<FeatureFlag> {
  return new Set(access.enabledFeatures)
}
