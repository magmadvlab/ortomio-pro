import { ActionType, ActionContext } from '@/components/actions/ActionButton';
import { getSupabaseClient } from '@/config/supabase';

export interface InterventionData {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  zoneId?: string;
  zoneName?: string;
  scheduledDate: Date;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  sourceContext: ActionContext;
  parameters: Record<string, any>;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  userId: string;
  gardenId?: string;
}

export interface InterventionFilter {
  status?: InterventionData['status'][];
  type?: ActionType[];
  priority?: InterventionData['priority'][];
  zoneId?: string;
  gardenId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

class InterventionService {
  private getSupabase() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    return supabase;
  }

  /**
   * Crea un nuovo intervento
   */
  async createIntervention(intervention: Omit<InterventionData, 'id' | 'createdAt' | 'userId'>): Promise<InterventionData> {
    try {
      const supabase = this.getSupabase();
      // Ottieni l'utente corrente
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Utente non autenticato');
      }

      const interventionData = {
        ...intervention,
        id: `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Converti i campi per il database
        zone_id: intervention.zoneId,
        zone_name: intervention.zoneName,
        scheduled_date: intervention.scheduledDate.toISOString(),
        assigned_to: intervention.assignedTo,
        source_context: intervention.sourceContext,
        garden_id: intervention.gardenId
      };

      const { data, error } = await supabase
        .from('interventions')
        .insert([interventionData])
        .select()
        .single();

      if (error) {
        console.error('Errore creazione intervento:', error);
        throw new Error(`Errore nella creazione dell'intervento: ${error.message}`);
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error('Errore nel servizio createIntervention:', error);
      throw error;
    }
  }

  /**
   * Ottieni tutti gli interventi dell'utente
   */
  async getInterventions(filter?: InterventionFilter): Promise<InterventionData[]> {
    try {
      const supabase = this.getSupabase();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Utente non autenticato');
      }

      let query = supabase
        .from('interventions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Applica filtri
      if (filter) {
        if (filter.status && filter.status.length > 0) {
          query = query.in('status', filter.status);
        }
        if (filter.type && filter.type.length > 0) {
          query = query.in('type', filter.type);
        }
        if (filter.priority && filter.priority.length > 0) {
          query = query.in('priority', filter.priority);
        }
        if (filter.zoneId) {
          query = query.eq('zone_id', filter.zoneId);
        }
        if (filter.gardenId) {
          query = query.eq('garden_id', filter.gardenId);
        }
        if (filter.dateFrom) {
          query = query.gte('scheduled_date', filter.dateFrom.toISOString());
        }
        if (filter.dateTo) {
          query = query.lte('scheduled_date', filter.dateTo.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Errore recupero interventi:', error);
        throw new Error(`Errore nel recupero degli interventi: ${error.message}`);
      }

      return (data || []).map(this.mapFromDatabase);
    } catch (error) {
      console.error('Errore nel servizio getInterventions:', error);
      throw error;
    }
  }

  /**
   * Ottieni un intervento specifico
   */
  async getIntervention(id: string): Promise<InterventionData | null> {
    try {
      const supabase = this.getSupabase();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Utente non autenticato');
      }

      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Intervento non trovato
        }
        console.error('Errore recupero intervento:', error);
        throw new Error(`Errore nel recupero dell'intervento: ${error.message}`);
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error('Errore nel servizio getIntervention:', error);
      throw error;
    }
  }

  /**
   * Aggiorna un intervento
   */
  async updateIntervention(id: string, updates: Partial<InterventionData>): Promise<InterventionData> {
    try {
      const supabase = this.getSupabase();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Utente non autenticato');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        // Converti i campi per il database
        ...(updates.zoneId !== undefined && { zone_id: updates.zoneId }),
        ...(updates.zoneName !== undefined && { zone_name: updates.zoneName }),
        ...(updates.scheduledDate !== undefined && { scheduled_date: updates.scheduledDate.toISOString() }),
        ...(updates.assignedTo !== undefined && { assigned_to: updates.assignedTo }),
        ...(updates.sourceContext !== undefined && { source_context: updates.sourceContext }),
        ...(updates.gardenId !== undefined && { garden_id: updates.gardenId }),
        ...(updates.completedAt !== undefined && { completed_at: updates.completedAt.toISOString() })
      };

      const { data, error } = await supabase
        .from('interventions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Errore aggiornamento intervento:', error);
        throw new Error(`Errore nell'aggiornamento dell'intervento: ${error.message}`);
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error('Errore nel servizio updateIntervention:', error);
      throw error;
    }
  }

  /**
   * Elimina un intervento
   */
  async deleteIntervention(id: string): Promise<void> {
    try {
      const supabase = this.getSupabase();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Utente non autenticato');
      }

      const { error } = await supabase
        .from('interventions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Errore eliminazione intervento:', error);
        throw new Error(`Errore nell'eliminazione dell'intervento: ${error.message}`);
      }
    } catch (error) {
      console.error('Errore nel servizio deleteIntervention:', error);
      throw error;
    }
  }

  /**
   * Completa un intervento
   */
  async completeIntervention(id: string, notes?: string): Promise<InterventionData> {
    return this.updateIntervention(id, {
      status: 'completed',
      completedAt: new Date(),
      ...(notes && { 
        parameters: { 
          completionNotes: notes 
        }
      })
    });
  }

  /**
   * Ottieni statistiche degli interventi
   */
  async getInterventionStats(gardenId?: string): Promise<{
    total: number;
    byStatus: Record<InterventionData['status'], number>;
    byType: Record<ActionType, number>;
    byPriority: Record<InterventionData['priority'], number>;
    completionRate: number;
  }> {
    try {
      const interventions = await this.getInterventions(gardenId ? { gardenId } : undefined);

      const stats = {
        total: interventions.length,
        byStatus: {
          draft: 0,
          scheduled: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0
        } as Record<InterventionData['status'], number>,
        byType: {
          scouting: 0,
          prescription: 0,
          irrigation: 0,
          treatment: 0
        } as Record<ActionType, number>,
        byPriority: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        } as Record<InterventionData['priority'], number>,
        completionRate: 0
      };

      interventions.forEach(intervention => {
        stats.byStatus[intervention.status]++;
        stats.byType[intervention.type]++;
        stats.byPriority[intervention.priority]++;
      });

      const completedCount = stats.byStatus.completed;
      stats.completionRate = stats.total > 0 ? (completedCount / stats.total) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Errore nel servizio getInterventionStats:', error);
      throw error;
    }
  }

  /**
   * Mappa i dati dal database al formato dell'applicazione
   */
  private mapFromDatabase(data: any): InterventionData {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      description: data.description,
      zoneId: data.zone_id,
      zoneName: data.zone_name,
      scheduledDate: new Date(data.scheduled_date),
      assignedTo: data.assigned_to,
      priority: data.priority,
      sourceContext: data.source_context,
      parameters: data.parameters || {},
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      userId: data.user_id,
      gardenId: data.garden_id
    };
  }
}

export const interventionService = new InterventionService();
