import React, { useEffect, useState, useRef } from 'react';
import { Lead } from '../../types.ts';
import { getLeads, updateLeadStatus, addLeadNote, trashLead, batchTrashLeads, markLeadViewed } from '../../services/api.ts';
import {
  MessageSquare,
  Mail,
  RefreshCw,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  Eye,
  CheckSquare,
  Square,
  X,
  Sparkles
} from 'lucide-react';

export const LeadsView: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note Modal & Selected Lead
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Checkbox Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkReason, setBulkReason] = useState<string>('prueba');

  // Single Trash Modal
  const [leadToTrash, setLeadToTrash] = useState<Lead | null>(null);
  const [singleTrashReason, setSingleTrashReason] = useState<string>('prueba');

  // Alerts & Notifications
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [newLeadToast, setNewLeadToast] = useState<string | null>(null);
  const [highlightedLeadId, setHighlightedLeadId] = useState<string | null>(null);

  const isInitialMount = useRef(true);

  // Short Web Audio synth tone for new lead alert
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  };

  const fetchLeadsData = async (isPoll = false) => {
    if (!isPoll) setLoading(true);
    setError(null);
    try {
      const data = await getLeads();
      const sorted = [...data].sort((a, b) => {
        const isNewA = ['nuevo', 'pendiente', 'received', 'pending'].includes((a.estado || a.status || '').toLowerCase());
        const isNewB = ['nuevo', 'pendiente', 'received', 'pending'].includes((b.estado || b.status || '').toLowerCase());
        if (isNewA && !isNewB) return -1;
        if (!isNewA && isNewB) return 1;
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      // Detect New Lead during Polling
      if (isPoll && sorted.length > 0) {
        const lastSeenTime = localStorage.getItem('chefos_last_seen_time');
        const newestLead = sorted[0];
        const newestTime = newestLead.createdAt ? new Date(newestLead.createdAt).getTime() : 0;

        if (lastSeenTime && newestTime > Number(lastSeenTime)) {
          const leadName = newestLead.nombre || newestLead.fullName || 'Nuevo Cliente';
          setHighlightedLeadId(newestLead.id);
          setNewLeadToast(`¡Nuevo lead recibido: ${leadName}!`);
          playAlertSound();

          if ('Notification' in window && Notification.permission === 'granted') {
            const notif = new Notification('Nuevo lead en ChefOS', {
              body: 'Tienes una nueva solicitud por atender',
              icon: '/assets/chef-perfil.png',
            });
            notif.onclick = () => window.focus();
          }

          setTimeout(() => setHighlightedLeadId(null), 10000);
          setTimeout(() => setNewLeadToast(null), 6000);
        }
      }

      if (sorted.length > 0) {
        const maxTime = Math.max(...sorted.map((l) => (l.createdAt ? new Date(l.createdAt).getTime() : 0)));
        localStorage.setItem('chefos_last_seen_time', String(maxTime));
      }

      setLeads(sorted);
    } catch (err: any) {
      setError(err.message || 'Error cargando leads. Verifica la clave administrativa.');
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  // Initial Fetch + 60s Interval Polling
  useEffect(() => {
    fetchLeadsData(false);
    const interval = setInterval(() => {
      fetchLeadsData(true);
    }, 60000); // Polling estrictamente cada 60 segundos

    return () => clearInterval(interval);
  }, []);

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones de escritorio.');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      alert('¡Notificaciones de escritorio activadas correctamente!');
    } else {
      alert('Permiso de notificaciones denegado. Las alertas se mostrarán dentro de ChefOS.');
    }
  };

  const handleLeadInteraction = async (leadId: string) => {
    setSelectedLeadId(selectedLeadId === leadId ? null : leadId);
    const targetLead = leads.find((l) => l.id === leadId);
    if (targetLead && !targetLead.firstViewedAt) {
      try {
        await markLeadViewed(leadId);
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, firstViewedAt: new Date().toISOString() } : l))
        );
      } catch (_) {}
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(leads.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkTrash = async () => {
    if (selectedIds.length === 0) return;

    // Check if any selected lead is confirmed
    const confirmedCount = leads.filter((l) => selectedIds.includes(l.id) && (l.estado === 'confirmado' || l.status === 'confirmado')).length;
    if (confirmedCount > 0) {
      const confirmWarning = confirm(
        `⚠️ ADVERTENCIA: Has seleccionado ${confirmedCount} lead(s) CONFIRMADO(S).\n\n¿Estás seguro de moverlos a la papelera?`
      );
      if (!confirmWarning) return;
    }

    try {
      await batchTrashLeads(selectedIds, bulkReason);
      setLeads((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
      setSelectedIds([]);
    } catch (err: any) {
      alert('Error en descarte masivo: ' + err.message);
    }
  };

  const handleConfirmSingleTrash = async () => {
    if (!leadToTrash) return;

    try {
      await trashLead(leadToTrash.id, singleTrashReason);
      setLeads((prev) => prev.filter((l) => l.id !== leadToTrash.id));
      setLeadToTrash(null);
    } catch (err: any) {
      alert('Error al mover a papelera: ' + err.message);
    }
  };

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

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, estado: newStatus, status: newStatus } : l))
      );
    } catch (err: any) {
      alert('Error actualizando estado: ' + err.message);
    }
  };

  const handleAddNote = async (leadId: string) => {
    if (!noteText.trim()) return;
    try {
      await addLeadNote(leadId, noteText.trim());
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id === leadId) {
            const notes = l.notes || [];
            return { ...l, notes: [...notes, noteText.trim()], lastNote: noteText.trim() };
          }
          return l;
        })
      );
      setNoteText('');
      setSelectedLeadId(null);
    } catch (err: any) {
      alert('Error agregando nota: ' + err.message);
    }
  };

  const unattendedCount = leads.filter((l) =>
    ['nuevo', 'pendiente', 'received', 'pending'].includes((l.estado || l.status || '').toLowerCase())
  ).length;

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      {/* Visual Alert Toast for New Lead */}
      {newLeadToast && (
        <div className="fixed top-4 right-4 z-50 bg-chef-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-chef-400 animate-bounce">
          <Sparkles size={20} />
          <span className="font-semibold text-sm">{newLeadToast}</span>
          <button onClick={() => setNewLeadToast(null)} className="ml-2 hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      )}

      <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="text-chef-500" />
            Bandeja de Leads (ChefOS CRM)
            {unattendedCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-black animate-pulse">
                {unattendedCount} sin atender
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Gestión directa de solicitudes • <span className="text-chef-400">Las alertas funcionan mientras ChefOS esté abierto (Consulta cada 60s)</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Alert Mute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 border rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-dark-surface border-dark-border text-slate-200 hover:bg-dark-border/50'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
            title="Activar o silenciar tono de alerta"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
          </button>

          {/* Browser Notification Activation */}
          <button
            onClick={handleRequestNotification}
            className={`px-3 py-2 border rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              notificationPermission === 'granted'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-chef-600/20 border-chef-500/40 text-chef-300 hover:bg-chef-600/30'
            }`}
          >
            {notificationPermission === 'granted' ? <Bell size={15} /> : <BellOff size={15} />}
            {notificationPermission === 'granted' ? 'Notificaciones Activas' : 'Activar notificaciones'}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchLeadsData(false)}
            className="px-4 py-2 bg-dark-surface border border-dark-border hover:bg-dark-border/50 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </header>

      {/* Bulk Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 bg-chef-950/80 border border-chef-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-chef-200 font-medium">
            <CheckSquare size={18} className="text-chef-400" />
            <span>{selectedIds.length} lead(s) seleccionado(s)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300">Motivo:</span>
            <select
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded px-2.5 py-1 text-xs text-white"
            >
              <option value="prueba">Prueba</option>
              <option value="duplicado">Duplicado</option>
              <option value="spam">Spam</option>
              <option value="lead_viejo">Lead Viejo</option>
              <option value="otro">Otro</option>
            </select>

            <button
              onClick={handleBulkTrash}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Mover Selección a Papelera
            </button>
          </div>
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
                <th className="px-4 py-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={leads.length > 0 && selectedIds.length === leads.length}
                    onChange={handleSelectAll}
                    className="accent-chef-500 rounded cursor-pointer"
                  />
                </th>
                <th className="px-4 py-4 font-medium">Cliente</th>
                <th className="px-4 py-4 font-medium">Contacto</th>
                <th className="px-4 py-4 font-medium">Servicio & Detalles</th>
                <th className="px-4 py-4 font-medium">Origen / Atribución</th>
                <th className="px-4 py-4 font-medium">Estado</th>
                <th className="px-4 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {leads.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No hay solicitudes activas registradas aún.
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
                const isHighlighted = highlightedLeadId === lead.id;
                const isSelected = selectedIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    className={`transition-colors ${
                      isHighlighted
                        ? 'bg-chef-500/20 animate-pulse'
                        : isSelected
                        ? 'bg-chef-950/40'
                        : isUnattended
                        ? 'bg-amber-500/5'
                        : 'hover:bg-dark-border/20'
                    }`}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(lead.id)}
                        className="accent-chef-500 rounded cursor-pointer"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {name}
                        {lead.firstViewedAt && (
                          <span title={`Visto por primera vez: ${new Date(lead.firstViewedAt).toLocaleString()}`}>
                            <Eye size={13} className="text-blue-400" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Reciente'}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs">
                      {phone && <div className="text-slate-200">{phone}</div>}
                      {email && <div className="text-slate-400">{email}</div>}
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-slate-200 font-medium">
                        {lead.servicio || lead.experienceType || 'Chef Privado'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {lead.serviceDate ? `Fecha: ${lead.serviceDate}` : ''}{' '}
                        {lead.guestCount ? `• ${lead.guestCount} pax` : ''}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-400">
                      <div><span className="text-slate-500">Source:</span> {lead.source || 'direct'}</div>
                      <div><span className="text-slate-500">Medium:</span> {lead.medium || 'organic'}</div>
                    </td>

                    <td className="px-4 py-4">
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

                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Hola ${name}, me contacto de Chef 4 You respecto a tu solicitud.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium transition-colors flex items-center gap-1"
                              title="Contactar vía WhatsApp"
                            >
                              <MessageSquare size={12} /> WhatsApp
                            </a>
                          )}
                          {email && (
                            <a
                              href={`mailto:${email}?subject=Cotización%20Chef%20Privado%20Chef%204%20You`}
                              className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs font-medium transition-colors flex items-center gap-1"
                              title="Enviar Correo"
                            >
                              <Mail size={12} /> Correo
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setLeadToTrash(lead);
                              setSingleTrashReason('prueba');
                            }}
                            className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded text-xs font-medium transition-colors flex items-center gap-1"
                            title="Mover a Papelera"
                          >
                            <Trash2 size={12} /> Papelera
                          </button>
                        </div>

                        {selectedLeadId === lead.id ? (
                          <div className="mt-2 flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Escribir nota..."
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-white"
                            />
                            <button
                              onClick={() => handleAddNote(lead.id)}
                              className="px-2 py-1 bg-chef-600 text-white rounded text-xs"
                            >
                              Guardar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleLeadInteraction(lead.id)}
                            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                          >
                            <Plus size={12} /> Nota
                          </button>
                        )}
                        {lead.lastNote && (
                          <div className="text-xs text-slate-400 italic max-w-xs truncate">
                            Nota: {lead.lastNote}
                          </div>
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

      {/* Single Trash Confirmation Modal */}
      {leadToTrash && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setLeadToTrash(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="text-rose-500" size={20} />
              Mover Lead a Papelera
            </h3>

            {/* Confirmed Lead Warning Banner */}
            {(leadToTrash.estado === 'confirmado' || leadToTrash.status === 'confirmado') && (
              <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-3.5 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-200">⚠️ ADVERTENCIA DE SEGURIDAD</p>
                  <p className="mt-0.5">Este lead tiene el estado <span className="font-bold underline">CONFIRMADO</span>. Se requiere confirmación explícita para enviarlo a la papelera.</p>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-300 bg-dark-bg p-3 rounded-lg border border-dark-border space-y-1">
              <div><strong>Cliente:</strong> {leadToTrash.nombre || leadToTrash.fullName || 'Sin nombre'}</div>
              <div><strong>Correo:</strong> {leadToTrash.email || 'N/A'}</div>
              <div><strong>Servicio:</strong> {leadToTrash.servicio || leadToTrash.experienceType || 'Chef Privado'}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-slate-300 font-medium">Selecciona el motivo de descarte:</label>
              <select
                value={singleTrashReason}
                onChange={(e) => setSingleTrashReason(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-chef-500"
              >
                <option value="prueba">Prueba</option>
                <option value="duplicado">Duplicado</option>
                <option value="spam">Spam</option>
                <option value="lead_viejo">Lead Viejo</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setLeadToTrash(null)}
                className="flex-1 py-2 bg-dark-bg border border-dark-border text-slate-300 rounded-xl text-xs hover:bg-dark-border/50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSingleTrash}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} /> Confirmar Retiro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
