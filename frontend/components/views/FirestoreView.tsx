import React, { useEffect, useState } from 'react';
import { Search, Filter, Database, ChevronRight, RefreshCw, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getLeads, createLead } from '../../services/api.ts';
import { Lead } from '../../types.ts';

export const FirestoreView: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.message || 'Error de conexión con el backend de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const generarLeadPrueba = async () => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setError(null);

    const leadPrueba = {
      nombre: 'Leopoldo Cortés',
      email: 'leo.cortes@ejemplo.com',
      telefono: '+52 322 123 4567',
      servicio: 'Cena 4 Tiempos - Francesa',
      estado: 'pendiente',
    };

    try {
      const result = await createLead(leadPrueba);
      if (result && result.success) {
        setSuccessMessage(`¡Lead de prueba inyectado en Firestore con éxito! ID: ${result.id}`);
        await fetchLeads();
      } else {
        throw new Error('No se pudo guardar el lead.');
      }
    } catch (err: any) {
      console.error('Error creando lead de prueba:', err);
      setError(err.message || 'Error guardando lead en Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    const name = (lead.nombre || lead.fullName || '').toString().toLowerCase();
    const email = (lead.email || '').toString().toLowerCase();
    const phone = (lead.telefono || lead.phone || '').toString().toLowerCase();
    const service = (lead.servicio || lead.experienceType || '').toString().toLowerCase();
    const id = lead.id.toLowerCase();
    return id.includes(term) || name.includes(term) || email.includes(term) || phone.includes(term) || service.includes(term);
  });

  const getStatusColor = (status?: string) => {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
      case 'pendiente':
      case 'pending':
      case 'received':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'confirmado':
      case 'confirmed':
      case 'ready':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelado':
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Database size={16} />
            <span>chefos-502422</span>
            <ChevronRight size={14} />
            <span className="text-slate-200">leads (colección)</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Firestore Data Explorer</h2>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={generarLeadPrueba}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-chef-600 hover:bg-chef-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle size={16} />
            {isSubmitting ? 'Guardando...' : 'Generar lead de prueba'}
          </button>
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="p-2 bg-dark-surface border border-dark-border rounded-lg text-slate-300 hover:text-white hover:bg-dark-border/50 transition-colors"
            title="Recargar leads"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por ID, nombre, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-chef-500 w-64"
            />
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 flex items-center gap-3">
          <AlertTriangle size={20} className="shrink-0" />
          <div>
            <strong>Error al conectar con Firestore:</strong> {error}
            <div className="mt-1 text-xs text-red-400">
              Asegúrate de ejecutar <code>gcloud auth application-default login</code> para autenticar Firestore localmente.
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center gap-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex-1 bg-dark-surface border border-dark-border rounded-xl overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw size={28} className="animate-spin text-chef-500" />
            <p>Cargando documentos de Firestore...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-dark-bg/50 text-slate-400 border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Document ID</th>
                    <th className="px-6 py-4 font-medium">Nombre / Cliente</th>
                    <th className="px-6 py-4 font-medium">Contacto</th>
                    <th className="px-6 py-4 font-medium">Servicio</th>
                    <th className="px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredLeads.map((lead) => {
                    const name = lead.nombre || lead.fullName || 'Sin nombre';
                    const contact = lead.email || lead.telefono || lead.phone || '-';
                    const service = lead.servicio || lead.experienceType || lead.serviceArea || '-';
                    const status = lead.estado || lead.status || 'pendiente';
                    return (
                      <tr key={lead.id} className="hover:bg-dark-border/20 transition-colors cursor-pointer">
                        <td className="px-6 py-4 font-mono text-chef-500 font-medium">{lead.id}</td>
                        <td className="px-6 py-4 text-slate-200 font-medium">{name}</td>
                        <td className="px-6 py-4 text-slate-400 truncate max-w-[220px]">{contact}</td>
                        <td className="px-6 py-4 text-slate-300 truncate max-w-[200px]">{service}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                            {status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(lead.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredLeads.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 py-12">
                <Database size={32} className="text-slate-600 mb-2" />
                <p className="font-medium text-slate-400">No se encontraron leads en Firestore</p>
                <p className="text-xs">Haz clic en "Generar lead de prueba" para insertar el primer documento.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
