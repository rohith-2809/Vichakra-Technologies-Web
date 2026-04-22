import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, X, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import StatusBadge from '../../components/admin/StatusBadge';

const CATEGORY_LABELS = {
  guidance:         'Post-project Guidance',
  bug:              'Bug Report',
  'change-request': 'Change Request',
  general:          'General Enquiry',
};

const STATUS_CONFIG = {
  open:          { icon: Clock,         cls: 'text-blue-500',   bg: 'bg-blue-50' },
  'in-progress': { icon: AlertCircle,   cls: 'text-amber-500',  bg: 'bg-amber-50' },
  resolved:      { icon: CheckCircle2,  cls: 'text-emerald-500',bg: 'bg-emerald-50' },
};

function TicketCard({ ticket }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-teal-200 transition-all"
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={`p-1.5 rounded-lg ${cfg.bg} shrink-0 mt-0.5`}>
          <Icon size={13} className={cfg.cls} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{ticket.subject}</p>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={ticket.status} />
              {expanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {CATEGORY_LABELS[ticket.category] || ticket.category}
            {ticket.project && <> · {ticket.project.title}</>}
            <> · {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</>
          </p>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-gray-50/50"
          >
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
              <p className="text-[14px] text-gray-700 leading-relaxed bg-white p-4 rounded-xl shadow-sm border border-gray-100">{ticket.message}</p>

              {ticket.adminResponse && (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-5 shadow-sm relaitve overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Zap size={60} />
                  </div>
                  <div className="flex flex-col gap-1 mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md">
                         <Zap size={12} className="text-white" />
                       </div>
                       <p className="text-[13px] font-bold text-teal-800 tracking-wide uppercase">Vichakra Support</p>
                    </div>
                  </div>
                  <p className="text-[14px] text-teal-900 leading-relaxed relative z-10 mt-2 bg-white/40 p-3 rounded-lg border border-teal-100/50 block">{ticket.adminResponse}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SupportPage() {
  const [tickets,  setTickets]  = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { category: 'general' },
  });

  useEffect(() => {
    Promise.all([api.get('/portal/support'), api.get('/portal/projects')])
      .then(([t, p]) => { setTickets(t.data.tickets); setProjects(p.data.projects); })
      .finally(() => setLoading(false));
  }, []);

  const onCreate = async (data) => {
    setCreating(true); setError('');
    try {
      const res = await api.post('/portal/support', { ...data, project: data.project || undefined });
      setTickets((prev) => [res.data.ticket, ...prev]);
      reset({ category: 'general' });
      setShowForm(false);
    } catch {
      setError('Sorry for the inconvenience — your request couldn\'t be submitted. Please try again or email us directly at info@vichakratechnologies.com.');
    } finally { setCreating(false); }
  };

  const open     = tickets.filter((t) => t.status === 'open').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Support Desk</h1>
          <p className="text-[15px] font-medium text-gray-500 mt-1">Get help, report an issue, or request guidance at any time.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ${
            showForm
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-teal-600 text-white hover:bg-teal-500'
          }`}
        >
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Request</>}
        </button>
      </div>

      {/* Stats row */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: tickets.length, cls: 'text-gray-900' },
            { label: 'Open',  value: open,           cls: 'text-blue-600' },
            { label: 'Resolved', value: resolved,    cls: 'text-emerald-600' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm rounded-[24px] p-6 text-center hover:-translate-y-1 transition-transform">
              <p className={`text-4xl font-black tabular-nums tracking-tight ${cls}`}>{value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* New ticket form drawer */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] z-50 overflow-y-auto border-l border-gray-100"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-8 py-6 z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">New Request</h2>
                  <p className="text-sm text-gray-500 mt-1">We're here to help.</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                  <X size={18} />
                </button>
              </div>

              <div className="p-8">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                    <X size={13} className="shrink-0" /> {error}
                  </div>
                )}
                <form onSubmit={handleSubmit(onCreate)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Category</label>
                      <select
                        className="w-full px-4 py-3 text-[15px] border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        {...register('category')}
                      >
                        {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    {projects.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          Project <span className="text-gray-400 font-normal normal-case">(optional)</span>
                        </label>
                        <select
                          className="w-full px-4 py-3 text-[15px] border border-gray-200 rounded-xl bg-gray-50/50 text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                          {...register('project')}
                        >
                          <option value="">Global / Not specific</option>
                          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Subject *</label>
                    <input
                      className={`w-full px-4 py-3 text-[15px] border rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${errors.subject ? 'border-red-300' : 'border-gray-200'}`}
                      placeholder="Brief description of your issue"
                      {...register('subject', { required: 'Subject is required' })}
                    />
                    {errors.subject && <p className="text-[11px] text-red-500 mt-1">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Message *</label>
                    <textarea
                      rows={5}
                      className={`w-full px-4 py-3 text-[15px] border rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none ${errors.message ? 'border-red-300' : 'border-gray-200'}`}
                      placeholder="Describe your issue in detail…"
                      {...register('message', { required: 'Message is required' })}
                    />
                    {errors.message && <p className="text-[11px] text-red-500 mt-1">{errors.message.message}</p>}
                  </div>

                  <div className="flex gap-4 pt-10 mt-10 border-t border-gray-100">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 py-3.5 border-2 border-gray-200/80 rounded-xl text-[15px] font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={creating}
                      className="flex-[2] py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:bg-teal-300 text-white rounded-xl text-[15px] font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all">
                      {creating ? 'Submitting…' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tickets list */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white border border-gray-100 rounded-xl" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={20} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-700">No support requests yet</p>
          <p className="text-xs text-gray-400 mt-1">Create your first request using the button above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => <TicketCard key={t._id} ticket={t} />)}
        </div>
      )}
    </div>
  );
}
