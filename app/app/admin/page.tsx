'use client'

import { useCallback, useEffect, useState } from 'react'
import { Activity, AlertTriangle, Database, Mail, RefreshCw, Settings, Shield, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type AdminOverview = {
  stats: { totalUsers: number; totalGardens: number; activeUsers: number }
  providerHealth: Record<string, 'healthy' | 'error' | 'configured' | 'not_configured'>
  recentAudits: Array<{ id: string; action: string; target_type: string; target_id: string | null; outcome: string; created_at: string }>
}
type AuthUser = { id: string; email: string | null; created_at: string; last_sign_in_at: string | null; is_verified: boolean }

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resendEmail, setResendEmail] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [overviewResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/overview', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/admin/auth-users?per_page=100', { credentials: 'include', cache: 'no-store' }),
      ])
      if (overviewResponse.status === 401 || overviewResponse.status === 403) { window.location.assign('/app'); return }
      if (!overviewResponse.ok || !usersResponse.ok) throw new Error('Dati amministrativi non disponibili')
      setOverview(await overviewResponse.json())
      const userPayload = await usersResponse.json()
      setUsers(Array.isArray(userPayload.users) ? userPayload.users : [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Errore amministrativo')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const resendVerification = async (email: string) => {
    setResendEmail(email)
    try {
      const response = await fetch('/api/admin/auth-users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email }) })
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Reinvio non riuscito')
      await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Reinvio non riuscito') }
    finally { setResendEmail(null) }
  }

  if (loading && !overview) return <div className="min-h-screen flex items-center justify-center text-gray-600">Verifica capability Admin server-side...</div>

  const healthEntries = Object.entries(overview?.providerHealth || {})
  const statCards: Array<{ label: string; value: number; icon: LucideIcon; color: string }> = [
    { label: 'Utenti totali', value: overview?.stats.totalUsers ?? 0, icon: Users, color: 'text-blue-600' },
    { label: 'Orti totali', value: overview?.stats.totalGardens ?? 0, icon: Database, color: 'text-green-600' },
    { label: 'Utenti attivi (7gg)', value: overview?.stats.activeUsers ?? 0, icon: Activity, color: 'text-purple-600' },
  ]
  return <div className="min-h-screen bg-gray-50 p-4"><div className="max-w-7xl mx-auto space-y-6">
    <header className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
      <div className="flex items-center gap-3"><Shield className="h-8 w-8 text-blue-600" /><div><h1 className="text-2xl font-bold">Pannello Amministratore</h1><p className="text-gray-600">Capability e dati risolti esclusivamente dal server</p></div></div>
      <button onClick={() => void load()} className="px-3 py-2 bg-gray-100 rounded-lg flex items-center gap-2"><RefreshCw size={16} />Aggiorna</button>
    </header>
    {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">{error}</div>}

    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map(card => <div key={card.label} className="bg-white p-6 rounded-lg shadow flex justify-between"><div><p className="text-sm text-gray-600">{card.label}</p><p className="text-2xl font-bold">{card.value}</p></div><card.icon className={`h-8 w-8 ${card.color}`} /></div>)}
    </section>

    <section className="bg-white p-6 rounded-lg shadow"><div className="flex items-center gap-2 mb-4"><Settings className="text-green-600" /><h2 className="text-lg font-semibold">Provider health</h2></div>
      <p className="text-sm text-gray-600 mb-4">Mostra soltanto disponibilità/configurazione; nessun secret viene restituito al browser.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{healthEntries.map(([name, status]) => <div key={name} className="border rounded-lg p-3"><div className="text-sm font-medium">{name}</div><div className={`text-sm mt-1 ${status === 'healthy' || status === 'configured' ? 'text-green-700' : 'text-amber-700'}`}>{status}</div></div>)}</div>
    </section>

    <section className="bg-white p-6 rounded-lg shadow"><div className="flex items-center gap-2 mb-4"><Mail className="text-blue-600" /><h2 className="text-lg font-semibold">Utenti Auth</h2></div>
      <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Email</th><th>Verificato</th><th>Creato</th><th>Ultimo accesso</th><th>Azione auditata</th></tr></thead><tbody>
        {users.map(user => <tr key={user.id} className="border-b"><td className="py-3">{user.email || user.id}</td><td>{user.is_verified ? 'Sì' : 'No'}</td><td>{new Date(user.created_at).toLocaleString('it-IT')}</td><td>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('it-IT') : '-'}</td><td>{!user.is_verified && user.email ? <button disabled={resendEmail === user.email} onClick={() => void resendVerification(user.email!)} className="px-3 py-1.5 bg-blue-600 text-white rounded disabled:opacity-50">{resendEmail === user.email ? 'Invio...' : 'Reinvia verifica'}</button> : '-'}</td></tr>)}
        {users.length === 0 && <tr><td colSpan={5} className="py-4 text-gray-500">Nessun utente disponibile.</td></tr>}
      </tbody></table></div>
    </section>

    <section className="bg-white p-6 rounded-lg shadow"><div className="flex items-center gap-2 mb-4"><AlertTriangle className="text-amber-600" /><h2 className="text-lg font-semibold">Audit amministrativo recente</h2></div>
      <div className="space-y-2">{(overview?.recentAudits || []).map(item => <div key={item.id} className="border rounded p-3 text-sm"><span className="font-medium">{item.action}</span> · {item.target_type} {item.target_id || ''} · <span className={item.outcome === 'success' ? 'text-green-700' : 'text-red-700'}>{item.outcome}</span><span className="text-gray-500 float-right">{new Date(item.created_at).toLocaleString('it-IT')}</span></div>)}{!overview?.recentAudits.length && <p className="text-sm text-gray-500">Nessuna azione amministrativa registrata.</p>}</div>
    </section>
  </div></div>
}
