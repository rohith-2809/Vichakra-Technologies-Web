import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Globe, FolderKanban, X, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const TYPE_CONFIG = {
  info:    { icon: Info,         cls: 'text-blue-500',    dot: 'bg-blue-500',    bar: 'bg-blue-500', label: 'Info' },
  success: { icon: CheckCircle2, cls: 'text-emerald-500', dot: 'bg-emerald-500', bar: 'bg-emerald-500', label: 'Success' },
  warning: { icon: AlertTriangle,cls: 'text-amber-500',   dot: 'bg-amber-500',   bar: 'bg-amber-500', label: 'Warning' },
};

export default function StatusUpdatesPage() {
  const [updates,  setUpdates]  = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [posting,  setPosting]  = useState(false);
  const [error,    setError]    = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'info' },
  });
  const selectedType = watch('type');

  useEffect(() => {
    Promise.all([api.get('/admin/status-updates'), api.get('/admin/projects')])
      .then(([u, p]) => { setUpdates(u.data.updates); setProjects(p.data.projects); })
      .finally(() => setLoading(false));
  }, []);

  const onPost = async (data) => {
    setPosting(true); setError('');
    try {
      const payload = { ...data, project: data.project || undefined };
      const res = await api.post('/admin/status-updates', payload);
      setUpdates((prev) => [res.data.update, ...prev]);
      reset({ type: 'info' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post update');
    } finally { setPosting(false); }
  };

  const deleteUpdate = async (id) => {
    if (!window.confirm('Delete this update?')) return;
    await api.delete(`/admin/status-updates/${id}`);
    setUpdates((prev) => prev.filter((u) => u._id !== id));
  };

  const TypeIcon = TYPE_CONFIG[selectedType]?.icon || Info;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Compose (Left Col, Sticky) */}
      <div className="lg:col-span-5 space-y-6 sticky top-24">
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
          <Plus size={14} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-800">Post Status Update</h2>
        </div>
        <div className="p-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              <X size={13} className="shrink-0" /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onPost)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Title *</label>
                <input
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
                  placeholder="e.g. Design phase complete"
                  {...register('title', { required: 'Title required' })}
                />
                {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Type</label>
                <div className="flex gap-2">
                  {Object.entries(TYPE_CONFIG).map(([value, { label, dot }]) => (
                    <label key={value} className="flex-1 cursor-pointer">
                      <input type="radio" value={value} className="sr-only" {...register('type')} />
                      <div className={`flex items-center gap-1.5 px-2.5 py-2.5 text-xs font-semibold border rounded-lg transition-all justify-center ${
                        selectedType === value
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedType === value ? 'bg-white' : dot}`} />
                        {label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Message *</label>
              <textarea
                rows={3}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none ${errors.message ? 'border-red-300' : 'border-gray-200'}`}
                placeholder="Write the update message…"
                {...register('message', { required: 'Message required' })}
              />
              {errors.message && <p className="text-[11px] text-red-500 mt-1">{errors.message.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Target <span className="text-gray-400 font-normal normal-case">(leave blank to broadcast to all clients)</span>
              </label>
              <select
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                {...register('project')}
              >
                <option value="">Global — all clients</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => reset({ type: 'info' })}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={posting}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-300 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={14} />
                {posting ? 'Posting…' : 'Post Update'}
              </button>
            </div>
          </form>
        </div>
      </div>

      </div>

      {/* Timeline feed (Right Col) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-sm font-bold text-gray-800">Timeline Feed</h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{updates.length} Updates</span>
        </div>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/60 backdrop-blur-md border border-gray-100 rounded-[24px]" />)}
          </div>
        ) : updates.length === 0 ? (
          <div className="py-16 text-center bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm">
            <Globe size={22} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No updates posted yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-100" />
            <div className="space-y-3">
              <AnimatePresence>
                {updates.map((u) => {
                  const cfg = TYPE_CONFIG[u.type] || TYPE_CONFIG.info;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={u._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="flex gap-4"
                    >
                      {/* Timeline dot */}
                      <div className={`w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center shrink-0 z-10 ${cfg.cls}`}>
                        <Icon size={12} />
                      </div>
                      {/* Card */}
                      <div className="flex-1 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] p-5 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-900">{u.title}</p>
                              {u.project
                                ? <span className="flex items-center gap-1 text-[11px] text-teal-600 font-medium"><FolderKanban size={10} /> {u.project.title}</span>
                                : <span className="flex items-center gap-1 text-[11px] text-gray-400"><Globe size={10} /> Global</span>
                              }
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{u.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              {u.createdBy?.name && <> · {u.createdBy.name}</>}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteUpdate(u._id)}
                            className="shrink-0 p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
