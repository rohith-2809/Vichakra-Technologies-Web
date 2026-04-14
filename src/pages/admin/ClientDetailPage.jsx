import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FolderKanban } from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/admin/StatusBadge';

export default function ClientDetailPage() {
  const { id } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/clients/${id}`)
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-gray-400 text-sm animate-pulse">Loading…</div>;
  if (!data)   return <div className="p-8 text-red-400 text-sm">Client not found.</div>;

  const { client, projects } = data;

  return (
    <div className="space-y-5 max-w-3xl">
      <Link to="/admin/clients" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-teal-600 transition-colors w-fit">
        <ArrowLeft size={15} /> Back to Clients
      </Link>

      {/* Info card */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm p-7">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {client.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{client.name}</h2>
            <p className="text-sm text-gray-500">{client.email}</p>
            {client.company && <p className="text-sm text-gray-500 mt-0.5">{client.company} · {client.industry || ''}</p>}
            {client.phone   && <p className="text-sm text-gray-400 mt-0.5">{client.phone}</p>}
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${client.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {client.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
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
      </div>

      {/* Projects */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm overflow-hidden mt-6">
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
