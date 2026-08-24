import React, { useEffect, useState } from 'react';
import { Lead } from '../../types.ts';
import { getTrashLeads, restoreLead, permanentlyDeleteLead } from '../../services/api.ts';
import { Trash2, RotateCcw, RefreshCw, X, ShieldAlert, Check } from 'lucide-react';

export const TrashView: React.FC = () => {
  const [trashLeads, setTrashLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Permanent Delete Modal State
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchTrashData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrashLeads();
      setTrashLeads(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la papelera.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashData();
  }, []);

  const handleRestore = async (id: string, name: string) => {
    try {
      await restoreLead(id);
      setTrashLeads((prev) => prev.filter((l) => l.id !== id));
      setMessage(`Lead "${name}" restaurado exitosamente a la bandeja principal.`);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert('Error restaurando lead: ' + err.message);
    }
  };

  const handlePermanentDelete = async () => {
    if (!leadToDelete) return;
    if (confirmInput.trim() !== 'ELIMINAR') {
      alert('Debes escribir exactamente "ELIMINAR" para confirmar.');
      return;
    }

    setDeleting(true);
    try {
      await permanentlyDeleteLead(leadToDelete.id);
      const deletedName = leadToDelete.nombre || leadToDelete.fullName || leadToDelete.id;
      setTrashLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
      setMessage(`Lead "${deletedName}" eliminado permanentemente.`);
      setTimeout(() => setMessage(null), 4000);
      setLeadToDelete(null);
      setConfirmInput('');
    } catch (err: any) {
      alert('Error al eliminar permanentemente: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getReasonBadge = (reason?: string) => {
    const r = (reason || 'otro').toLowerCase();
    const map: Record<string, { label: string; color: string }> = {
      prueba: { label: 'Prueba', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      duplicado: { label: 'Duplicado', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
      spam: { label: 'Spam', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
      lead_viejo: { label: 'Lead Viejo', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
      otro: { label: 'Otro', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    };
    const style = map[r] || map.otro;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${style.color}`}>
        {style.label}
      </span>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Trash2 className="text-rose-500" />
            Papelera de Leads (ChefOS CRM)
          </h2>
          <p className="text-slate-400 mt-1">Leads retirados manualmente. Puedes restaurarlos o eliminarlos permanentemente.</p>
        </div>
        <button
          onClick={fetchTrashData}
          className="px-4 py-2 bg-dark-surface border border-dark-border hover:bg-dark-border/50 text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar Papelera
        </button>
      </header>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-6 text-emerald-400 text-sm flex items-center gap-2">
          <Check size={18} />
          {message}
        </div>
      )}

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
                <th className="px-6 py-4 font-medium">Cliente Descartado</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Servicio & Detalles</th>
                <th className="px-6 py-4 font-medium">Motivo de Retiro</th>
                <th className="px-6 py-4 font-medium">Estado Previo</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {trashLeads.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    La papelera está vacía. No hay leads descartados.
                  </td>
                </tr>
              )}
              {trashLeads.map((lead) => {
                const name = lead.nombre || lead.fullName || 'Sin Nombre';
                const email = lead.email || 'N/A';
                const phone = lead.telefono || lead.phone || 'N/A';
                const deletedAtFormatted = lead.deletedAt ? new Date(lead.deletedAt).toLocaleString() : 'Reciente';

                return (
                  <tr key={lead.id} className="hover:bg-dark-border/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">ID: {lead.id}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Descartado: {deletedAtFormatted}</div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="text-slate-200">{phone}</div>
                      <div className="text-slate-400">{email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-200 font-medium">{lead.servicio || lead.experienceType || 'Chef Privado'}</div>
                      <div className="text-xs text-slate-400">
                        {lead.serviceDate ? `Fecha: ${lead.serviceDate}` : ''} {lead.guestCount ? `• ${lead.guestCount} pax` : ''}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getReasonBadge(lead.deleteReason)}
                      {lead.deletedBy && <div className="text-[11px] text-slate-500 mt-1">Por: {lead.deletedBy}</div>}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-slate-300 uppercase tracking-wider text-[11px]">
                        {lead.previousStatus || 'nuevo'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(lead.id, name)}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium transition-colors flex items-center gap-1"
                          title="Restaurar lead a la bandeja principal"
                        >
                          <RotateCcw size={13} /> Restaurar
                        </button>
                        <button
                          onClick={() => {
                            setLeadToDelete(lead);
                            setConfirmInput('');
                          }}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded text-xs font-medium transition-colors flex items-center gap-1"
                          title="Eliminar definitivamente de Firestore"
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación Estricta para Eliminación Permanente */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setLeadToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 text-rose-500">
              <ShieldAlert size={32} />
              <h3 className="text-xl font-bold text-white">Eliminación Permanente</h3>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-xs text-rose-300 space-y-1">
              <p className="font-semibold">⚠️ Acción Irreversible</p>
              <p>Este documento será borrado definitivamente de Firestore. No se podrá recuperar.</p>
            </div>

            <div className="text-xs text-slate-300 bg-dark-bg p-3 rounded-lg space-y-1 border border-dark-border">
              <div><strong className="text-slate-400">Nombre:</strong> {leadToDelete.nombre || leadToDelete.fullName || 'Sin nombre'}</div>
              <div><strong className="text-slate-400">Correo:</strong> {leadToDelete.email || 'Sin correo'}</div>
              <div><strong className="text-slate-400">Teléfono:</strong> {leadToDelete.telefono || leadToDelete.phone || 'Sin teléfono'}</div>
              <div><strong className="text-slate-400">ID Único:</strong> <code className="text-amber-400 font-mono">{leadToDelete.id}</code></div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-slate-300 font-medium">
                Escribe <span className="font-bold text-rose-400 font-mono">ELIMINAR</span> para confirmar:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Escribe ELIMINAR..."
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setLeadToDelete(null)}
                className="flex-1 py-2.5 bg-dark-bg border border-dark-border text-slate-300 rounded-xl text-sm hover:bg-dark-border/50"
              >
                Cancelar
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={confirmInput.trim() !== 'ELIMINAR' || deleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
