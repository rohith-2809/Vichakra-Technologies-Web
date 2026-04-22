import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Circle, ExternalLink, Bell,
  Info, CheckCheck, AlertTriangle, MessageSquare,
  ClipboardList, Rocket, ArrowRight, Calendar,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import OnboardingTutorial from '../../components/portal/OnboardingTutorial';
import StatusBadge from '../../components/admin/StatusBadge';

const UPDATE_CONFIG = {
  info:    { icon: Info,          cls: 'text-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-100' },
  success: { icon: CheckCheck,    cls: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  warning: { icon: AlertTriangle, cls: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-100' },
};

export default function PortalDashboardPage() {
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [projects, setProjects] = useState([]);
  const [updates,  setUpdates]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showTutorial, setShowTutorial] = useState(user?.isFirstLogin === true);

  useEffect(() => {
    Promise.all([
      api.get('/portal/projects'),
      api.get('/portal/status-updates'),
    ]).then(([proj, upd]) => {
      const projs = proj.data.projects;
      const needsReqs = projs.some(p => p.requirementsStatus !== 'submitted');
      if (needsReqs && projs.length > 0) {
        navigate('/portal/requirements', { replace: true });
        return;
      }
      setProjects(projs);
      setUpdates(upd.data.updates);
    }).catch(() => {
      setLoadError('Sorry for the inconvenience — we couldn\'t load your dashboard. Please refresh the page or contact us at info@vichakratechnologies.com.');
    }).finally(() => setLoading(false));
  }, [navigate]);

  return (
    <>
      {showTutorial && <OnboardingTutorial onComplete={() => setShowTutorial(false)} />}

      <div className="space-y-8">
        {loadError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{loadError}</span>
          </div>
        )}
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent drop-shadow-sm">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">{user?.company || "Here's an overview of your projects"}</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-52 bg-white border border-gray-200 rounded-2xl" />
            <div className="h-36 bg-white border border-gray-200 rounded-2xl" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
            {/* Left Column: Projects (Hero focus) */}
            <div className="lg:col-span-8 space-y-6">
              {projects.map((p, i) => (
                <ProjectCard key={p._id} project={p} delay={i * 0.08} />
              ))}
            </div>

            {/* Right Column: Updates & Actions */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
              >
                <QuickMessage />
              </motion.div>

              {/* Recent updates */}
              {updates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.35 }}
                  className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-[32px] overflow-hidden shadow-sm"
                >
                  <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
                    <div className="p-2 bg-teal-50 rounded-xl">
                      <Bell size={16} className="text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-bold text-gray-900">Recent Updates</h2>
                      <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-0.5">Project Feed</p>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50/80">
                    {updates.slice(0, 5).map((u) => {
                      const cfg = UPDATE_CONFIG[u.type] || UPDATE_CONFIG.info;
                      const Icon = cfg.icon;
                      return (
                        <div key={u._id} className="flex items-start gap-4 px-6 py-5 group hover:bg-gray-50/50 transition-colors">
                          <div className={`p-2 rounded-xl border ${cfg.border} ${cfg.bg} shrink-0 group-hover:scale-105 transition-transform`}>
                            <Icon size={14} className={cfg.cls} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-bold text-gray-900 leading-tight">{u.title}</p>
                            <p className="text-[13px] text-gray-600 mt-1 line-clamp-2">{u.message}</p>
                            <p className="text-[11px] font-medium text-gray-400 mt-2 flex items-center gap-1.5">
                              {u.project?.title && <span className="text-teal-600">{u.project.title}</span>}
                              {u.project?.title && <span className="w-1 h-1 rounded-full bg-gray-300" />}
                              <span>{new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ProjectCard({ project, delay }) {
  const done  = project.milestones?.filter((m) => m.completed).length || 0;
  const total = project.milestones?.length || 0;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  const statusGradient = {
    active:      'from-teal-500 to-teal-600',
    draft:       'from-gray-400 to-gray-500',
    'in-review': 'from-blue-500 to-blue-600',
    delivered:   'from-violet-500 to-violet-600',
    closed:      'from-gray-500 to-gray-600',
  };
  const gradient = statusGradient[project.status] || 'from-gray-400 to-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, type: 'spring', damping: 24, stiffness: 200 }}
      className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-[24px] overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
    >
        {/* Header strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{project.title}</h2>
            {project.description && (
              <p className="text-[15px] text-gray-500 mt-1.5 leading-relaxed bg-white/50">{project.description}</p>
            )}
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* Dates */}
        {(project.startDate || project.endDate) && (
          <div className="flex flex-wrap items-center gap-4 mb-8 bg-gray-50/50 border border-gray-100 rounded-xl p-3 w-fit">
            {project.startDate && (
              <div className="flex items-center gap-2 text-[13px] font-medium text-gray-600">
                <Calendar size={14} className="text-teal-500" />
                Started {new Date(project.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </div>
            )}
            {project.startDate && project.endDate && <div className="w-1 h-1 rounded-full bg-gray-300" />}
            {project.endDate && (
              <div className="flex items-center gap-2 text-[13px] font-medium text-gray-600">
                <Calendar size={14} className="text-teal-500" />
                Due {new Date(project.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>
        )}

        {/* Progress block */}
        {total > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                <p className="text-[15px] font-bold text-gray-900 mt-0.5">{done} of {total} milestones complete</p>
              </div>
              <span className="text-2xl font-black text-teal-600">{pct}%</span>
            </div>
            <div className="h-3 bg-gray-100 shadow-inner rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
              />
            </div>

            {/* Milestone list grid */}
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {project.milestones.map((m, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${m.completed ? 'bg-gray-50/50 border-gray-100' : 'bg-white border-gray-200 shadow-sm'}`}>
                  {m.completed
                    ? <CheckCircle2 size={18} className="text-teal-500 shrink-0" />
                    : <Circle size={18} className="text-gray-300 shrink-0" />
                  }
                  <span className={`text-[14px] font-bold ${m.completed ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-800'}`}>
                    {m.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo links */}
        {project.demoLinks?.length > 0 && (
          <div className="pt-6 border-t border-gray-100/80">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Project Assets</p>
            <div className="flex flex-wrap gap-3">
              {project.demoLinks.map((d, i) => (
                <a
                  key={i}
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 text-[13px] font-bold text-teal-700 bg-teal-50/50 border border-teal-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 px-4 py-2.5 rounded-xl transition-all"
                >
                  {d.label || 'View Demo'}
                  <ExternalLink size={14} className="text-teal-500 group-hover:text-teal-700 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-[24px] p-12 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200/50 flex items-center justify-center mx-auto mb-5 shadow-[0_4px_20px_rgba(20,184,166,0.15)]">
        <Rocket size={24} className="text-teal-600 drop-shadow-sm" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Your project is being set up</h2>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-7 leading-relaxed">
        Our team is configuring your workspace. In the meantime, submit your project requirements so we can get started.
      </p>
      <Link
        to="/portal/requirements"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 text-sm font-semibold px-6 py-3 rounded-xl transition-all"
      >
        <ClipboardList size={16} />
        Submit Requirements
        <ArrowRight size={14} />
      </Link>
    </motion.div>
  );
}

function QuickMessage() {
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);
  const [msg,     setMsg]     = useState('');
  const [error,   setError]   = useState('');

  const send = async () => {
    if (!msg.trim()) return;
    setSending(true);
    setError('');
    try {
      await api.post('/portal/support', {
        subject:  'Quick message from portal',
        message:  msg,
        category: 'general',
      });
      setSent(true);
      setMsg('');
    } catch {
      setError('Sorry, your message couldn\'t be sent. Please try again or email us at info@vichakratechnologies.com.');
    } finally { setSending(false); }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-teal-50 rounded-xl">
          <MessageSquare size={16} className="text-teal-600" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-gray-900">Reach out to us</p>
          <p className="text-[12px] text-gray-500 uppercase tracking-widest mt-0.5">We respond swiftly</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl text-xs mb-3">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {sent ? (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-sm font-medium">
          <CheckCheck size={15} />
          Message received! We'll respond shortly.
        </div>
      ) : (
        <div className="flex gap-3">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={2}
            placeholder="Quick question or message…"
            className="flex-1 px-4 py-3 text-sm border border-gray-200/80 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all resize-none shadow-inner"
          />
          <button
            onClick={send}
            disabled={sending || !msg.trim()}
            className="px-5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:shadow-none text-white text-sm font-semibold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all shrink-0"
          >
            {sending ? '…' : 'Send'}
          </button>
        </div>
      )}
    </div>
  );
}
