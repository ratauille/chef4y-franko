import React, { useEffect, useState } from 'react';
import { Lead } from '../../types.ts';
import { getLeads } from '../../services/api.ts';
import { MessageSquare, Mail, RefreshCw, UserCheck, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

export const LeadsView: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');

  const fetchLeadsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeads();
      // Sort new / pending leads first
      const sorted = [...data].sort((a, b) => {
        const isNewA = ['nuevo', 'pendiente', 'received', 'pending'].includes((a.estado || a.status || '').toLowerCase());
        const isNewB = ['nuevo', 'pendiente', 'received', 'pending'].includes((b.estado || b.status || '').toLowerCase());
        if (isNewA && !isNewB) return -1;
        if (!isNewA && isNewB) return 1;
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setLeads(sorted);
    } catch (err: any) {
      setError(err.message || 'Error cargando leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsData();
  }, []);

  const getStatusBadge = (status?: string) => {
    const s = (status || 'nuevo').toLowerCase();
    if (['nuevo', 'pendiente', 'received', 'pending'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
          <Clock size={12} /> Nuevo (Sin Atender)
        </span>
      );
    }
    if (s === 'contactado') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <UserCheck size={12} /> Contactado
        </span>
      );
    }
    if (s === 'cotizado') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <FileText size={12} /> Cotizado
        </span>
      );
    }
    if (s === 'confirmado') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={12} /> Confirmado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle size={12} /> Perdido
      </span>
    );
  };

  const handleStatusChange = (leadId: string, newStatus: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, estado: newStatus, status: newStatus } : l))
    );
  };

  const handleAddNote = (leadId: string) => {
    if (!newNote.trim()) return;
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const notes = l.notes || [];
          return { ...l, notes: [...notes, newNote.trim()], lastNote: newNote.trim() };
        }
        return l;
      })
    );
    setNewNote('');
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="text-chef-500" />
            Bandeja de Leads (ChefOS CRM)
          </h2>
          <p className="text-slate-400 mt-1">Gestión directa de solicitudes de clientes potenciales</p>
        </div>
        <button
          onClick={fetchLeadsData}
          className="px-4 py-2 bg-dark-surface border border-dark-border hover:bg-dark-border/50 text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 mb-6 text-rose-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 bg-dark-surface border border-dark-border rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-bg/50 text-slate-400 border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Solicitud / Contacto</th>
                <th className="px-6 py-4 font-medium">Servicio & Detalles</th>
                <th className="px-6 py-4 font-medium">Origen / Atribución</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {leads.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No hay solicitudes registradas aún.
                  </td>
                </tr>
              )}
              {leads.map((lead) => {
                const name = lead.nombre || lead.fullName || 'Sin Nombre';
                const phone = lead.telefono || lead.phone || '';
                const email = lead.email || '';
                const cleanPhone = phone.replace(/\D/g, '');
                const isUnattended = ['nuevo', 'pendiente', 'received', 'pending'].includes(
                  (lead.estado || lead.status || '').toLowerCase()
                );

                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-dark-border/20 transition-colors ${
                      isUnattended ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Reciente'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {phone && <div className="text-slate-200">{phone}</div>}
                      {email && <div className="text-slate-400 text-xs">{email}</div>}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-200 font-medium">
                        {lead.servicio || lead.experienceType || 'Chef Privado'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {lead.serviceDate ? `Fecha: ${lead.serviceDate}` : ''}{' '}
                        {lead.guestCount ? `• ${lead.guestCount} pax` : ''}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div><span className="text-slate-500">Source:</span> {lead.source || 'direct'}</div>
                      <div><span className="text-slate-500">Medium:</span> {lead.medium || 'organic'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={lead.estado || lead.status || 'nuevo'}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-chef-500"
                      >
                        <option value="nuevo">Nuevo</option>
                        <option value="contactado">Contactado</option>
                        <option value="cotizado">Cotizado</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="perdido">Perdido</option>
                      </select>
                      <div className="mt-1">{getStatusBadge(lead.estado || lead.status)}</div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Hola ${name}, me contacto de Chef 4 You respecto a tu solicitud.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium transition-colors flex items-center gap-1"
                            title="Contactar vía WhatsApp"
                          >
                            <MessageSquare size={14} /> WhatsApp
                          </a>
                        )}
                        {email && (
                          <a
                            href={`mailto:${email}?subject=Cotización%20Chef%20Privado%20Chef%204%20You`}
                            className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs font-medium transition-colors flex items-center gap-1"
                            title="Enviar Correo"
                          >
                            <Mail size={14} /> Correo
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
