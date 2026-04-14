import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, UserX, UserCheck, ChevronRight, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

function Avatar({ name, size = 'sm' }) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = [
    'bg-teal-100 text-teal-700',
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

export default function ClientsPage() {
  const [clients,   setClients]   = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [error,     setError]     = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    api.get('/admin/clients')
      .then(({ data }) => { setClients(data.clients); setFiltered(data.clients); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      clients.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q)
      )
    );
  }, [search, clients]);

  const onCreateClient = async (data) => {
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/admin/clients', data);
      setClients((prev) => [res.data.client, ...prev]);
      reset();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create client');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (client) => {
    if (client.isActive) {
      if (!window.confirm(`Deactivate ${client.name}? They won't be able to log in.`)) return;
      try {
        await api.delete(`/admin/clients/${client._id}`);
        setClients((prev) => prev.map((c) => c._id === client._id ? { ...c, isActive: false } : c));
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to deactivate');
      }
    } else {
      await api.put(`/admin/clients/${client._id}`, { isActive: true });
      setClients((prev) => prev.map((c) => c._id === client._id ? { ...c, isActive: true } : c));
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200/80 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all shadow-inner"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block font-medium">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5"
          >
            <Plus size={15} /> Add Client
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] overflow-hidden shadow-sm mt-6">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-gray-100 rounded" />
                  <div className="h-3 w-48 bg-gray-50 rounded" />
                </div>
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-500">No clients found</p>
            {search && <p className="text-xs text-gray-400 mt-1">Try a different search term</p>}
          </div>
        ) : (
          <>
            <div className="grid gap-3 p-4 sm:p-5">
              {filtered.map((c) => (
                <div key={c._id} className="group relative flex items-center justify-between gap-4 p-4 rounded-[18px] bg-white border border-gray-100 hover:border-teal-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar name={c.name} size="md" />
                    <div className="min-w-0">
                      <Link
                        to={`/admin/clients/${c._id}`}
                        className="text-[15px] font-bold text-gray-900 group-hover:text-teal-600 transition-colors truncate block"
                      >
                        {c.name}
                      </Link>
                      <p className="text-[13px] text-gray-500 mt-0.5 flex items-center gap-2 truncate">
                        <span>{c.email}</span>
                        {c.company && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="font-medium text-gray-700">{c.company}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                      c.isActive
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : 'bg-gray-100 text-gray-500 ring-gray-200'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    <div className="hidden sm:block text-right">
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Joined</p>
                      <p className="text-[13px] text-gray-700 font-medium mt-0.5 tabular-nums">
                        {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                      <button
                        onClick={() => toggleActive(c)}
                        title={c.isActive ? 'Deactivate' : 'Reactivate'}
                        className={`p-2 rounded-xl transition-all ${
                          c.isActive
                            ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {c.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                      <Link
                        to={`/admin/clients/${c._id}`}
                        className="p-2 rounded-xl text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                      >
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create client modal */}
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
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] z-50 overflow-y-auto border-l border-gray-100"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-8 py-6 z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
                  <p className="text-sm text-gray-500 mt-1">Create an account for a new client portal user.</p>
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

                <form onSubmit={handleSubmit(onCreateClient)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 text-[15px] border rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                        placeholder="Arjun Mehta"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email *</label>
                      <input
                        type="email"
                        className={`w-full px-4 py-3 text-[15px] border rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                        placeholder="arjun@company.com"
                        {...register('email', { required: 'Email is required' })}
                      />
                      {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Temporary Password *</label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 text-[15px] border rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
                        placeholder="Min. 8 characters"
                        {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
                      />
                      {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>}
                      <p className="text-[11px] text-amber-600 mt-1">Share this with the client — they should change it on first login.</p>
                    </div>
                    <div className="col-span-2 mt-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Company</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 text-[15px] border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        placeholder="Acme Corp"
                        {...register('company')}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Phone</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 text-[15px] border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        placeholder="+91 98765…"
                        {...register('phone')}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10 mt-10 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3.5 border-2 border-gray-200/80 rounded-xl text-[15px] font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-[2] py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-teal-300 disabled:to-teal-300 text-white rounded-xl text-[15px] font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all"
                    >
                      {creating ? 'Creating Account…' : 'Create Client Account'}
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
