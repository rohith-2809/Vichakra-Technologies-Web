import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FolderKanban, Ticket, Paperclip, ArrowRight, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/admin/StatusBadge';

const STATS = [
  {
    key: 'totalClients',
    label: 'Total Clients',
    icon: Users,
    color: 'text-teal-600',
    bg: 'bg-teal-50/80',
    border: 'border-teal-100',
    link: '/admin/clients',
  },
  {
    key: 'activeProjects',
    label: 'Active Projects',
    icon: FolderKanban,
    color: 'text-blue-600',
    bg: 'bg-blue-50/80',
    border: 'border-blue-100',
    link: '/admin/projects?status=active',
  },
  {
    key: 'openTickets',
    label: 'Open Tickets',
    icon: Ticket,
    color: 'text-amber-600',
    bg: 'bg-amber-50/80',
    border: 'border-amber-100',
    link: '/admin/feedback',
  },
  {
    key: 'totalFiles',
    label: 'Files Stored',
    icon: Paperclip,
    color: 'text-violet-600',
    bg: 'bg-violet-50/80',
    border: 'border-violet-100',
    link: '/admin/files',
  },
];

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Col: Stat Cards */}
        <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {STATS.map(({ key, label, icon: Icon, color, bg, border, link }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                to={link}
                className={`block bg-white/80 backdrop-blur-xl border ${border} rounded-[24px] p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`${bg} ${color} p-2.5 rounded-xl`}>
                    <Icon size={18} />
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums">
                    {loading ? (
                      <span className="inline-block w-10 h-8 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      stats?.[key] ?? '—'
                    )}
                  </p>
                  <p className="text-[13px] font-semibold text-gray-400 mt-1 uppercase tracking-wide">{label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right Col: Hero & Recent */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-2 flex flex-col gap-5"
        >
          {/* Welcome Banner */}
          <div className="bg-gradient-to-br from-[#0B1120] to-gray-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden h-fit">
            <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none rotate-12">
              <TrendingUp size={180} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Admin Overview</h2>
              <p className="text-gray-400 text-[15px] max-w-md">
                You have {loading ? '...' : (stats?.activeProjects || 0)} active projects in progress. Keep track of all your client deliverables right here.
              </p>
            </div>
          </div>

          {/* Recent Projects Panel */}
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[32px] overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <FolderKanban size={18} className="text-teal-600" />
                </div>
                <h2 className="text-[17px] font-bold text-gray-800">Recent Projects</h2>
              </div>
              <Link
                to="/admin/projects"
                className="text-sm font-semibold text-teal-600 hover:text-teal-500 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-full transition-colors"
              >
                View all
              </Link>
            </div>

            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="divide-y divide-gray-50/80">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex px-8 py-5 items-center gap-4 animate-pulse">
                      <div className="h-10 w-10 bg-gray-100 rounded-xl" />
                      <div className="space-y-2 flex-1"><div className="h-3 w-1/4 bg-gray-100 rounded" /><div className="h-2 w-1/3 bg-gray-50 rounded" /></div>
                      <div className="h-6 w-20 bg-gray-100 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : stats?.recentProjects?.length > 0 ? (
                <div className="divide-y divide-gray-50/80">
                  {stats.recentProjects.map((p) => (
                    <Link
                      key={p._id}
                      to={`/admin/projects/${p._id}`}
                      className="flex items-center justify-between px-8 py-5 hover:bg-gray-50/80 transition-all group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
                          <FolderKanban size={18} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{p.title}</p>
                          {p.client && (
                            <p className="text-[13px] text-gray-500 truncate mt-0.5">{p.client.name} · {p.client.company}</p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 ml-4 group-hover:scale-105 transition-transform">
                        <StatusBadge status={p.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <FolderKanban size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-[15px] font-medium text-gray-500">No active projects</p>
                  <Link to="/admin/projects" className="mt-2 inline-block text-sm text-teal-600 hover:text-teal-500 font-semibold">
                    Create your first project →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
