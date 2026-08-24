import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CalendarCheck, Database, FileText, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardMetrics } from '../../services/api.ts';
import { DashboardMetrics } from '../../types.ts';

const emptyMetrics: DashboardMetrics = { leads: 0, quotes: 0, reservations: 0, pendingLeads: 0, recentActivity: [] };

export const DashboardView: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (e: any) {
      console.error('Error fetching dashboard metrics:', e);
      setError(e.message || 'Error consultando métricas desde el backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">ChefOS Overview</h2>
          <p className="text-slate-400">Datos en tiempo real desde Firestore (Proyecto: chefos-502422)</p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="p-2 bg-dark-surface border border-dark-border rounded-lg text-slate-300 hover:text-white hover:bg-dark-border/50 transition-colors"
          title="Recargar métricas"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
          <strong>No se pudieron cargar las métricas de Firestore:</strong> {error}
          <div className="mt-1 text-xs text-yellow-400">
            Asegúrate de tener corriendo la API Fastify (<code>npm run start-fastify --prefix backend</code>) y Google ADC configurado.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Leads totales" value={metrics.leads} loading={loading} icon={<Activity className="text-blue-500" size={24} />} />
        <StatCard title="Cotizaciones" value={metrics.quotes} loading={loading} icon={<FileText className="text-purple-500" size={24} />} />
        <StatCard title="Reservaciones" value={metrics.reservations} loading={loading} icon={<CalendarCheck className="text-emerald-500" size={24} />} />
        <StatCard title="Leads pendientes" value={metrics.pendingLeads} loading={loading} icon={<AlertCircle className="text-chef-500" size={24} />} />
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Actividad reciente</h3>
        <div className="h-72 w-full">
          {metrics.recentActivity && metrics.recentActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} name="Leads" />
                <Line type="monotone" dataKey="quotes" stroke="#a855f7" strokeWidth={2} name="Cotizaciones" />
                <Line type="monotone" dataKey="reservations" stroke="#10b981" strokeWidth={2} name="Reservas" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Database size={24} className="text-slate-600" />
              <span>Sin actividad histórica agregada aún</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; loading?: boolean; icon: React.ReactNode }> = ({ title, value, loading, icon }) => (
  <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-slate-400 font-medium">{title}</h3>
      {icon}
    </div>
    {loading ? (
      <div className="h-9 w-16 bg-slate-800 animate-pulse rounded" />
    ) : (
      <p className="text-3xl font-bold text-white">{value}</p>
    )}
  </div>
);
