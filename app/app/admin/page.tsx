'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Database, Settings, Activity, AlertTriangle } from 'lucide-react';
import { getSupabaseClient } from '@/config/supabase';

interface AdminStats {
  totalUsers: number;
  totalGardens: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGardens: 0,
    activeUsers: 0,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      // Check if user is admin (you can implement your own logic here)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_superadmin')
        .eq('id', user.id)
        .single();

      const hasAdminAccess = profile?.role === 'admin' || profile?.is_superadmin;
      
      if (!hasAdminAccess) {
        alert('Accesso negato. Solo gli amministratori possono accedere a questa pagina.');
        window.location.href = '/app';
        return;
      }

      setIsAdmin(true);
      await loadStats();
    } catch (error) {
      console.error('Error checking admin access:', error);
      alert('Errore nel controllo dei permessi');
      window.location.href = '/app';
    }
  };

  const loadStats = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      
      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total gardens
      const { count: gardensCount } = await supabase
        .from('gardens')
        .select('*', { count: 'exact', head: true });

      // Get active users (logged in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', sevenDaysAgo);

      setStats({
        totalUsers: usersCount || 0,
        totalGardens: gardensCount || 0,
        activeUsers: activeUsersCount || 0,
        systemHealth: 'healthy'
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
      setStats(prev => ({ ...prev, systemHealth: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifica Accesso...</h2>
          <p className="text-gray-600">Controllo dei permessi di amministratore in corso</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pannello Amministratore</h1>
              <p className="text-gray-600">Gestione sistema OrtoMio</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utenti Totali</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalUsers}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Orti Totali</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalGardens}
                </p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utenti Attivi (7gg)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.activeUsers}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stato Sistema</p>
                <p className={`text-2xl font-bold ${
                  stats.systemHealth === 'healthy' ? 'text-green-600' :
                  stats.systemHealth === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {stats.systemHealth === 'healthy' ? 'OK' :
                   stats.systemHealth === 'warning' ? 'WARN' : 'ERROR'}
                </p>
              </div>
              {stats.systemHealth === 'healthy' ? (
                <Settings className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestione Utenti</h3>
            <p className="text-gray-600 mb-4">
              Visualizza e gestisci gli utenti registrati nel sistema
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Gestisci Utenti
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Database</h3>
            <p className="text-gray-600 mb-4">
              Monitoraggio e manutenzione del database
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Stato Database
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurazione</h3>
            <p className="text-gray-600 mb-4">
              Impostazioni globali del sistema
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Configurazioni
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Sistema</h3>
            <p className="text-gray-600 mb-4">
              Visualizza i log e gli errori del sistema
            </p>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Visualizza Log
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup</h3>
            <p className="text-gray-600 mb-4">
              Gestione backup e ripristino dati
            </p>
            <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              Gestisci Backup
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche</h3>
            <p className="text-gray-600 mb-4">
              Report dettagliati sull'utilizzo del sistema
            </p>
            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Visualizza Report
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Versione:</span>
              <span className="ml-2 text-gray-600">OrtoMio v2.0.0</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Ambiente:</span>
              <span className="ml-2 text-gray-600">
                {process.env.NODE_ENV === 'production' ? 'Produzione' : 'Sviluppo'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Ultimo Aggiornamento:</span>
              <span className="ml-2 text-gray-600">19 Gennaio 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
