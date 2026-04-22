import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Pencil, Trash2, X, Check, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/admin/StatusBadge';

export default function ClientDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm]         = useState({});

  useEffect(() => {
    api.get(`/admin/clients/${id}`)
      .then(({ data }) => {
        setData(data);
        setForm({
          name:     data.client.name     || '',
          email:    data.client.email    || '',
          company:  data.client.company  || '',
          phone:    data.client.phone    || '',
          industry: data.client.industry || '',
          isActive: data.client.isActive,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const startEdit = () => { setError(''); setEditing(true); };
  const cancelEdit = () => {
    setEditing(false);
    setForm({
      name:     data.client.name     || '',
      email:    data.client.email    || '',
      company:  data.client.company  || '',
      phone:    data.client.phone    || '',
      industry: data.client.industry || '',
      isActive: data.client.isActive,
    });
  };

  const saveEdit = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const { data: updated } = await api.put(`/admin/clients/${id}`, {
        name:     form.name.trim(),
        company:  form.company.trim(),
        phone:    form.phone.trim(),
        industry: form.industry.trim(),
        isActive: form.isActive,
      });
      setData(prev => ({ ...prev, client: updated.client }));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const permanentDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/clients/${id}/permanent`);
      navigate('/admin/clients');
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
      setConfirmDelete(false);
    } finally { setDeleting(false); }
  };

  if (loading) return <div className="p-8 text-gray-400 text-sm animate-pulse">Loading…</div>;
  if (!data)   return <div className="p-8 text-red-400 text-sm">Client not found.</div>;

  const { client, projects } = data;

  return (
    <div className="space-y-5 max-w-3xl">
      <Link to="/admin/clients" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-teal-600 transition-colors w-fit">
        <ArrowLeft size={15} /> Back to Clients
      </Link>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle size={14} /> {error}
          <button onClick={() => setError('')} className="ml-auto opacity-60 hover:opacity-100"><X size={13} /></button>
        </div>
      )}

      {/* Info card */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm p-7">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {client.name[0].toUpperCase()}
          </div>

          {editing ? (
            <div className="flex-1 min-w-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Company</label>
                  <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Industry</label>
                  <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="accent-teal-600 w-4 h-4" />
                  Active account
                </label>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveEdit} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-200 text-white text-sm font-semibold rounded-xl transition-colors">
                  <Check size={14} /> {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-colors">
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900">{client.name}</h2>
              <p className="text-sm text-gray-500">{client.email}</p>
              {client.company  && <p className="text-sm text-gray-500 mt-0.5">{client.company}{client.industry ? ` · ${client.industry}` : ''}</p>}
              {client.phone    && <p className="text-sm text-gray-400 mt-0.5">{client.phone}</p>}
            </div>
          )}

          {!editing && (
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${client.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {client.isActive ? 'Active' : 'Inactive'}
              </span>
              <button onClick={startEdit}
                className="p-2 rounded-xl text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors" title="Edit client">
                <Pencil size={15} />
              </button>
              <button onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete client">
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>

        {!editing && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Member since</p>
              <p className="text-gray-700 font-medium">{new Date(client.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">First login tutorial</p>
              <p className="text-gray-700 font-medium">{client.isFirstLogin ? 'Not completed' : 'Completed'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-xl"><Trash2 size={18} className="text-red-600" /></div>
              <h3 className="text-base font-bold text-gray-900">Permanently delete client?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete <strong>{client.name}</strong> and all their projects, files, messages, and tickets. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={permanentDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-200 text-white text-sm font-bold rounded-xl transition-colors">
                {deleting ? 'Deleting…' : 'Yes, delete permanently'}
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Projects</h3>
          <Link to={`/admin/projects?client=${client._id}`} className="text-xs text-teal-600 hover:text-teal-500 font-medium">
            View all →
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No projects assigned yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {projects.map((p) => (
              <Link key={p._id} to={`/admin/projects/${p._id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FolderKanban size={15} className="text-teal-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
