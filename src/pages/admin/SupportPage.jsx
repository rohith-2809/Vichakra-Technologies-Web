import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Clock, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Send, Zap, Search, X
} from 'lucide-react';
import api from '../../api/axios';

const CATEGORY_LABELS = {
  guidance:         'Post-project Guidance',
  bug:              'Bug Report',
  'change-request': 'Change Request',
  general:          'General Enquiry',
};

const STATUS_CONFIG = {
  open:          { icon: Clock,        cls: 'text-blue-500',    bg: 'bg-blue-50',    label: 'Open' },
  'in-progress': { icon: AlertCircle,  cls: 'text-amber-500',   bg: 'bg-amber-50',   label: 'In Progress' },
  resolved:      { icon: CheckCircle2, cls: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Resolved' },
};

function TicketCard({ ticket, onRespond }) {
  const [expanded, setExpanded]   = useState(false);
  const [response, setResponse]   = useState(ticket.adminResponse || '');
  const [status,   setStatus]     = useState(ticket.status);
  const [saving,   setSaving]     = useState(false);
  const [saved,    setSaved]      = useState(false);

  const cfg  = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = cfg.icon;

  const handleSave = async () => {
    if (!response.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/admin/support/${ticket._id}`, {
        adminResponse: response,
        status: status === 'open' ? 'in-progress' : status,
      });
      setSaved(true);
      setStatus(data.ticket.status);
      onRespond(data.ticket);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save response');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/admin/support/${ticket._id}`, { status: 'resolved' });
      setStatus('resolved');
      onRespond(data.ticket);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[20px] shadow-sm overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all"
    >
      {/* Header row */}
      <div
        className="flex items-start gap-3 p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={`p-2 rounded-xl ${cfg.bg} shrink-0 mt-0.5`}>
          <Icon size={14} className={cfg.cls} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{ticket.subject}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                <span className="font-medium text-gray-600">{ticket.client?.name}</span>
                {ticket.client?.company && <> · {ticket.client.company}</>}
                {ticket.project && (
                  <> · <span className="text-teal-600">{ticket.project.title}</span></>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>{cfg.label}</span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </span>
              {expanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[ticket.category] || ticket.category}
            </span>
            {ticket.client?.email && (
              <a
                href={`mailto:${ticket.client.email}`}
                className="text-[11px] text-teal-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {ticket.client.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4 bg-gray-50/30">
              {/* Client message */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Client Message</p>
                <p className="text-[14px] text-gray-700 leading-relaxed bg-white p-4 rounded-xl shadow-sm border border-gray-100 whitespace-pre-wrap">
                  {ticket.message}
                </p>
              </div>

              {/* Admin response area */}
              {status !== 'resolved' ? (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Your Response</p>
                  <textarea
                    rows={4}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write a response to the client…"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                  />
                  <div className="flex items-center justify-between mt-3 gap-3">
                    <button
                      onClick={handleClose}
                      disabled={saving}
                      className="px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Mark Resolved (no reply)
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !response.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-teal-300 disabled:to-teal-300 text-white text-sm font-semibold rounded-xl shadow-md shadow-teal-500/20 transition-all"
                    >
                      <Send size={13} />
                      {saving ? 'Saving…' : saved ? '✓ Sent!' : 'Send & Mark In-Progress'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Existing resolved response */
                ticket.adminResponse && (
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md">
                        <Zap size={12} className="text-white" />
                      </div>
                      <p className="text-[12px] font-bold text-teal-800 uppercase tracking-wide">Vichakra Support Response</p>
                    </div>
                    <p className="text-[14px] text-teal-900 leading-relaxed">{ticket.adminResponse}</p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminSupportPage() {
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('');

  useEffect(() => {
    api.get('/admin/support')
      .then(({ data }) => setTickets(data.tickets))
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = (updated) => {
    setTickets((prev) => prev.map((t) => t._id === updated._id ? updated : t));
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      t.subject.toLowerCase().includes(q) ||
      t.client?.name.toLowerCase().includes(q) ||
      t.client?.company?.toLowerCase().includes(q);
    const matchFilter = !filter || t.status === filter;
    return matchSearch && matchFilter;
  });

  const open       = tickets.filter((t) => t.status === 'open').length;
  const inProgress = tickets.filter((t) => t.status === 'in-progress').length;
  const resolved   = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open',        value: open,       cls: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
          { label: 'In Progress', value: inProgress, cls: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
          { label: 'Resolved',    value: resolved,   cls: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map(({ label, value, cls, bg, border }) => (
          <div key={label} className={`bg-white/80 backdrop-blur-xl border ${border} rounded-[20px] p-5 shadow-sm flex items-center gap-4`}>
            <div className={`${bg} p-3 rounded-xl`}>
              <MessageSquare size={18} className={cls} />
            </div>
            <div>
              <p className={`text-3xl font-bold tabular-nums ${cls}`}>{loading ? '—' : value}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets…"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200/80 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-xl p-1 w-fit shadow-sm">
          {[
            { value: '',             label: 'All' },
            { value: 'open',         label: 'Open' },
            { value: 'in-progress',  label: 'In Progress' },
            { value: 'resolved',     label: 'Resolved' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === value ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white/60 backdrop-blur-md border border-gray-100 rounded-[20px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={20} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-700">No support tickets{filter ? ` with status "${filter}"` : ''}</p>
          <p className="text-xs text-gray-400 mt-1">Client tickets will appear here when submitted.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((t) => (
              <TicketCard key={t._id} ticket={t} onRespond={handleRespond} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
