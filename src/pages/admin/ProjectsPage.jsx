import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, FolderKanban } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import StatusBadge from '../../components/admin/StatusBadge';

const STATUSES = ['draft', 'active', 'in-review', 'delivered', 'closed'];

const STATUS_TAB_STYLE = {
  '': 'text-gray-700 border-gray-300',
  draft: 'text-gray-600 border-gray-300',
  active: 'text-teal-700 border-teal-500',
  'in-review': 'text-blue-700 border-blue-500',
  delivered: 'text-violet-700 border-violet-500',
  closed: 'text-gray-500 border-gray-400',
};

export default function ProjectsPage() {
  const [projects,     setProjects]     = useState([]);
  const [clients,      setClients]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [creating,     setCreating]     = useState(false);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchParams] = useSearchParams();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const clientFilter = searchParams.get('client') || '';
    Promise.all([
      api.get(`/admin/projects${clientFilter ? `?client=${clientFilter}` : ''}`),
      api.get('/admin/clients'),
    ]).then(([proj, cli]) => {
      setProjects(proj.data.projects);
      setClients(cli.data.clients);
    }).finally(() => setLoading(false));
  }, [searchParams]);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.title.toLowerCase().includes(q) || (p.client?.name || '').toLowerCase().includes(q);
    const matchStatus = statusFilter ? p.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const onCreate = async (data) => {
    setCreating(true); setError('');
    try {
      const res = await api.post('/admin/projects', data);
      setProjects((prev) => [res.data.project, ...prev]);
      reset(); setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally { setCreating(false); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200/80 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all shadow-inner"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5"
        >
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-xl p-1 w-fit shadow-sm">
        {[{ value: '', label: 'All' }, ...STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ') }))].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              statusFilter === value
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-[24px] p-6 animate-pulse space-y-4">
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-50 rounded" />
              <div className="h-1.5 w-full bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <FolderKanban size={28} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No projects found</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-xs text-teal-600 hover:text-teal-500 font-medium">
            Create your first project →
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => {
            const done  = p.milestones?.filter((m) => m.completed).length || 0;
            const total = p.milestones?.length || 0;
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <Link
                  to={`/admin/projects/${p._id}`}
                  className="block bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Glare effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
                        {p.title}
                      </h3>
                      {p.client && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{p.client.name} · {p.client.company}</p>
                      )}
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  {p.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                  )}

                  {total > 0 ? (
                    <div className="mt-auto">
                      <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                        <span>Progress</span>
                        <span className="font-medium">{done}/{total} · {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-300 mt-2">No milestones yet</p>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create project modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[550px] bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] z-50 overflow-y-auto border-l border-gray-100"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-8 py-6 z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">New Project</h2>
                  <p className="text-sm text-gray-500 mt-1">Setup the workspace securely</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                  <X size={18} />
                </button>
              </div>
              <div className="p-8">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                    <X size={13} className="shrink-0" /> {error}
                  </div>
                )}
                <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Project Title *</label>
                    <input
                      className={`w-full px-4 py-3 text-[15px] border rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
                      placeholder="e.g. Website Redesign"
                      {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Client *</label>
                    <select
                      className={`w-full px-4 py-3 text-[15px] border rounded-xl bg-gray-50/50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${errors.client ? 'border-red-300' : 'border-gray-200'}`}
                      {...register('client', { required: 'Select a client' })}
                    >
                      <option value="">Select client…</option>
                      {clients.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.company}</option>)}
                    </select>
                    {errors.client && <p className="text-[11px] text-red-500 mt-1">{errors.client.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Description</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 text-[15px] border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                      placeholder="Brief project description…"
                      {...register('description')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Start Date</label>
                      <input type="date" className="w-full px-4 py-3 text-[15px] border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" {...register('startDate')} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">End Date</label>
                      <input type="date" className="w-full px-4 py-3 text-[15px] border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" {...register('endDate')} />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-10 mt-10 border-t border-gray-100">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-3.5 border-2 border-gray-200/80 rounded-xl text-[15px] font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={creating}
                      className="flex-[2] py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:bg-teal-300 text-white rounded-xl text-[15px] font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all">
                      {creating ? 'Creating Project…' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
