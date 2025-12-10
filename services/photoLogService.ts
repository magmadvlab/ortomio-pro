/**
 * Photo Log Service
 * Manages plant photo logs for time-lapse functionality
 */

import { PlantPhotoLog } from '../types';
import { getSupabaseClient } from '../config/supabase';
import { analyzePlantHealth } from './photoAnalysisService';
import { fileToBase64 } from './photoAnalysisService';

const STORAGE_KEY = 'ortoPhotoLogs';

export class PhotoLogService {
  /**
   * Get photo logs for a task
   */
  static async getPhotoLogs(taskId: string): Promise<PlantPhotoLog[]> {
    const supabase = getSupabaseClient();
    
    if (supabase) {
      // Use Supabase
      const { data, error } = await supabase
        .from('photo_logs')
        .select('*')
        .eq('task_id', taskId)
        .order('photo_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching photo logs from Supabase:', error);
        return this.getPhotoLogsLocal(taskId);
      }
      
      return (data || []).map(db => this.mapFromDB(db));
    }
    
    // Fallback to localStorage
    return this.getPhotoLogsLocal(taskId);
  }

  /**
   * Get photo logs from localStorage
   */
  private static getPhotoLogsLocal(taskId: string): PlantPhotoLog[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    try {
      const all = JSON.parse(saved) as PlantPhotoLog[];
      return all.filter(log => log.taskId === taskId);
    } catch {
      return [];
    }
  }

  /**
   * Create photo log with automatic AI analysis
   */
  static async createPhotoLog(
    taskId: string,
    gardenId: string,
    photoFile: File,
    plantName: string,
    expectedPhase: string,
    daysFromPlanting: number,
    photoUrl?: string // If already uploaded to Supabase Storage
  ): Promise<PlantPhotoLog> {
    // Convert file to base64 for analysis
    const photoBase64 = await fileToBase64(photoFile);
    
    // Analyze plant health with Gemini Vision
    let analysisResult;
    try {
      analysisResult = await analyzePlantHealth(
        photoBase64,
        plantName,
        expectedPhase,
        daysFromPlanting
      );
    } catch (error) {
      console.error('Error analyzing plant health:', error);
      analysisResult = {
        isHealthy: true,
        growthRate: 'normal',
        issues: [],
        confidence: 0.5,
      };
    }

    const newLog: Omit<PlantPhotoLog, 'id' | 'createdAt'> = {
      taskId,
      gardenId,
      photoUrl: photoUrl || photoBase64, // Use URL if provided, otherwise base64
      photoDate: new Date().toISOString().split('T')[0],
      daysFromPlanting,
      analysisResult,
    };

    const supabase = getSupabaseClient();
    
    if (supabase) {
      // Use Supabase
      const { data, error } = await supabase
        .from('photo_logs')
        .insert({
          task_id: taskId,
          garden_id: gardenId,
          photo_url: newLog.photoUrl,
          photo_date: newLog.photoDate,
          days_from_planting: newLog.daysFromPlanting,
          analysis_result: newLog.analysisResult,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating photo log in Supabase:', error);
        return this.createPhotoLogLocal(newLog);
      }
      
      return this.mapFromDB(data);
    }
    
    // Fallback to localStorage
    return this.createPhotoLogLocal(newLog);
  }

  /**
   * Create photo log in localStorage
   */
  private static createPhotoLogLocal(
    log: Omit<PlantPhotoLog, 'id' | 'createdAt'>
  ): PlantPhotoLog {
    const newLog: PlantPhotoLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const all = this.getAllPhotoLogsLocal();
    all.push(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    
    return newLog;
  }

  /**
   * Get all photo logs from localStorage
   */
  private static getAllPhotoLogsLocal(): PlantPhotoLog[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    try {
      return JSON.parse(saved) as PlantPhotoLog[];
    } catch {
      return [];
    }
  }

  /**
   * Map from database format
   */
  private static mapFromDB(db: any): PlantPhotoLog {
    return {
      id: db.id,
      taskId: db.task_id,
      gardenId: db.garden_id,
      photoUrl: db.photo_url,
      photoDate: db.photo_date,
      daysFromPlanting: db.days_from_planting,
      analysisResult: db.analysis_result,
      notes: db.notes,
      createdAt: db.created_at,
    };
  }

  /**
   * Delete photo log
   */
  static async deletePhotoLog(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    
    if (supabase) {
      const { error } = await supabase
        .from('photo_logs')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting photo log from Supabase:', error);
        this.deletePhotoLogLocal(id);
      }
      return;
    }
    
    this.deletePhotoLogLocal(id);
  }

  /**
   * Delete photo log from localStorage
   */
  private static deletePhotoLogLocal(id: string): void {
    const all = this.getAllPhotoLogsLocal();
    const filtered = all.filter(log => log.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}

