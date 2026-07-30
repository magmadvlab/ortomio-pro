// Olive Grove Advanced Features Service
// Persists maturity tracking (Jaén Index) and olive fly monitoring
// (Bactrocera oleae) against the canonical tables created by
// supabase/migrations/20260119020000_create_olive_advanced_features.sql

import { getSupabaseClient } from '../config/supabase'
import type { OliveMaturityData, OliveFlyTrap, OliveFlyMonitoring } from '../types/olive'

function getSupabase() {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase client not available. Please configure your environment variables.')
  }
  return client
}

type MaturityRow = {
  id: string
  olive_grove_id: string
  measurement_date: string
  invaiatura_percentage: number
  color_stage: OliveMaturityData['color_stage']
  pulp_firmness: OliveMaturityData['pulp_firmness']
  detachment_force: OliveMaturityData['detachment_force']
  estimated_oil_content: number
  oil_quality_prediction: OliveMaturityData['oil_quality_prediction']
  maturity_index: number | null
  harvest_recommendation: OliveMaturityData['harvest_recommendation']
  harvest_window_days: number | null
  location: string | null
  variety: string | null
  sample_size: number | null
  notes: string | null
  photos: string[] | null
  created_at: string
  updated_at: string
}

function fromMaturityRow(row: MaturityRow): OliveMaturityData {
  return {
    id: row.id,
    oliveGroveId: row.olive_grove_id,
    measurementDate: new Date(row.measurement_date),
    invaiatura_percentage: row.invaiatura_percentage,
    color_stage: row.color_stage,
    pulp_firmness: row.pulp_firmness,
    detachment_force: row.detachment_force,
    estimated_oil_content: row.estimated_oil_content,
    oil_quality_prediction: row.oil_quality_prediction,
    maturity_index: row.maturity_index ?? undefined,
    harvest_recommendation: row.harvest_recommendation,
    harvest_window_days: row.harvest_window_days ?? undefined,
    location: row.location ?? undefined,
    variety: row.variety ?? undefined,
    sample_size: row.sample_size ?? undefined,
    notes: row.notes ?? undefined,
    photos: row.photos ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export type NewMaturityReading = Omit<OliveMaturityData, 'id' | 'oliveGroveId' | 'createdAt' | 'updatedAt'>

export async function getMaturityReadings(oliveGroveId: string): Promise<OliveMaturityData[]> {
  const { data, error } = await getSupabase()
    .from('olive_maturity_tracking')
    .select('*')
    .eq('olive_grove_id', oliveGroveId)
    .order('measurement_date', { ascending: true })

  if (error) throw error
  return (data as MaturityRow[]).map(fromMaturityRow)
}

export async function createMaturityReading(oliveGroveId: string, reading: NewMaturityReading): Promise<OliveMaturityData> {
  const { data, error } = await getSupabase()
    .from('olive_maturity_tracking')
    .insert({
      olive_grove_id: oliveGroveId,
      measurement_date: reading.measurementDate.toISOString().split('T')[0],
      invaiatura_percentage: reading.invaiatura_percentage,
      color_stage: reading.color_stage,
      pulp_firmness: reading.pulp_firmness,
      detachment_force: reading.detachment_force,
      estimated_oil_content: reading.estimated_oil_content,
      oil_quality_prediction: reading.oil_quality_prediction,
      maturity_index: reading.maturity_index ?? null,
      harvest_recommendation: reading.harvest_recommendation,
      harvest_window_days: reading.harvest_window_days ?? null,
      location: reading.location ?? null,
      variety: reading.variety ?? null,
      sample_size: reading.sample_size ?? null,
      notes: reading.notes ?? null,
      photos: reading.photos ?? null
    })
    .select()
    .single()

  if (error) throw error
  return fromMaturityRow(data as MaturityRow)
}

type FlyTrapRow = {
  id: string
  olive_grove_id: string
  trap_code: string
  trap_type: OliveFlyTrap['trap_type']
  installation_date: string
  location: string
  gps_latitude: number | null
  gps_longitude: number | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

function fromFlyTrapRow(row: FlyTrapRow): OliveFlyTrap {
  return {
    id: row.id,
    oliveGroveId: row.olive_grove_id,
    trap_code: row.trap_code,
    trap_type: row.trap_type,
    installation_date: new Date(row.installation_date),
    location: row.location,
    gps_latitude: row.gps_latitude ?? undefined,
    gps_longitude: row.gps_longitude ?? undefined,
    is_active: row.is_active,
    notes: row.notes ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export type NewFlyTrap = Omit<OliveFlyTrap, 'id' | 'oliveGroveId' | 'createdAt' | 'updatedAt' | 'is_active'>

export async function getFlyTraps(oliveGroveId: string): Promise<OliveFlyTrap[]> {
  const { data, error } = await getSupabase()
    .from('olive_fly_traps')
    .select('*')
    .eq('olive_grove_id', oliveGroveId)
    .order('trap_code', { ascending: true })

  if (error) throw error
  return (data as FlyTrapRow[]).map(fromFlyTrapRow)
}

export async function createFlyTrap(oliveGroveId: string, trap: NewFlyTrap): Promise<OliveFlyTrap> {
  const { data, error } = await getSupabase()
    .from('olive_fly_traps')
    .insert({
      olive_grove_id: oliveGroveId,
      trap_code: trap.trap_code,
      trap_type: trap.trap_type,
      installation_date: trap.installation_date.toISOString().split('T')[0],
      location: trap.location,
      gps_latitude: trap.gps_latitude ?? null,
      gps_longitude: trap.gps_longitude ?? null,
      notes: trap.notes ?? null
    })
    .select()
    .single()

  if (error) throw error
  return fromFlyTrapRow(data as FlyTrapRow)
}

export async function setFlyTrapActive(trapId: string, isActive: boolean): Promise<OliveFlyTrap> {
  const { data, error } = await getSupabase()
    .from('olive_fly_traps')
    .update({ is_active: isActive })
    .eq('id', trapId)
    .select()
    .single()

  if (error) throw error
  return fromFlyTrapRow(data as FlyTrapRow)
}

type FlyMonitoringRow = {
  id: string
  trap_id: string | null
  olive_grove_id: string
  inspection_date: string
  adults_captured: number
  females_captured: number | null
  males_captured: number | null
  olives_sampled: number | null
  olives_infested: number | null
  infestation_percentage: number | null
  damage_level: OliveFlyMonitoring['damage_level']
  threshold_exceeded: boolean
  intervention_recommended: boolean
  intervention_urgency: OliveFlyMonitoring['intervention_urgency']
  temperature: number | null
  humidity: number | null
  notes: string | null
  treatment_applied: boolean | null
  treatment_date: string | null
  treatment_product: string | null
  created_at: string
  updated_at: string
}

function fromFlyMonitoringRow(row: FlyMonitoringRow): OliveFlyMonitoring {
  return {
    id: row.id,
    trap_id: row.trap_id || '',
    oliveGroveId: row.olive_grove_id,
    inspection_date: new Date(row.inspection_date),
    adults_captured: row.adults_captured,
    females_captured: row.females_captured ?? undefined,
    males_captured: row.males_captured ?? undefined,
    olives_sampled: row.olives_sampled ?? undefined,
    olives_infested: row.olives_infested ?? undefined,
    infestation_percentage: row.infestation_percentage ?? undefined,
    damage_level: row.damage_level,
    threshold_exceeded: row.threshold_exceeded,
    intervention_recommended: row.intervention_recommended,
    intervention_urgency: row.intervention_urgency,
    temperature: row.temperature ?? undefined,
    humidity: row.humidity ?? undefined,
    notes: row.notes ?? undefined,
    treatment_applied: row.treatment_applied ?? undefined,
    treatment_date: row.treatment_date ? new Date(row.treatment_date) : undefined,
    treatment_product: row.treatment_product ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export type NewFlyMonitoringReading = Omit<OliveFlyMonitoring, 'id' | 'oliveGroveId' | 'createdAt' | 'updatedAt'>

export async function getFlyMonitoringReadings(oliveGroveId: string): Promise<OliveFlyMonitoring[]> {
  const { data, error } = await getSupabase()
    .from('olive_fly_monitoring')
    .select('*')
    .eq('olive_grove_id', oliveGroveId)
    .order('inspection_date', { ascending: true })

  if (error) throw error
  return (data as FlyMonitoringRow[]).map(fromFlyMonitoringRow)
}

export async function createFlyMonitoringReading(oliveGroveId: string, reading: NewFlyMonitoringReading): Promise<OliveFlyMonitoring> {
  const { data, error } = await getSupabase()
    .from('olive_fly_monitoring')
    .insert({
      trap_id: reading.trap_id || null,
      olive_grove_id: oliveGroveId,
      inspection_date: reading.inspection_date.toISOString().split('T')[0],
      adults_captured: reading.adults_captured,
      females_captured: reading.females_captured ?? null,
      males_captured: reading.males_captured ?? null,
      olives_sampled: reading.olives_sampled ?? null,
      olives_infested: reading.olives_infested ?? null,
      infestation_percentage: reading.infestation_percentage ?? null,
      damage_level: reading.damage_level,
      threshold_exceeded: reading.threshold_exceeded,
      intervention_recommended: reading.intervention_recommended,
      intervention_urgency: reading.intervention_urgency,
      temperature: reading.temperature ?? null,
      humidity: reading.humidity ?? null,
      notes: reading.notes ?? null,
      treatment_applied: reading.treatment_applied ?? null,
      treatment_date: reading.treatment_date ? reading.treatment_date.toISOString().split('T')[0] : null,
      treatment_product: reading.treatment_product ?? null
    })
    .select()
    .single()

  if (error) throw error
  return fromFlyMonitoringRow(data as FlyMonitoringRow)
}
