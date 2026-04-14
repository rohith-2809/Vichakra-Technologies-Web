import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, ExternalLink, X, Save } from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/admin/StatusBadge';

const STATUSES = ['draft', 'active', 'in-review', 'delivered', 'closed'];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project,  setProject]  = useState(null);
  const [reqs,     setReqs]     = useState(null);
  const [tab,      setTab]      = useState('overview');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [newMilestone, setNewMilestone] = useState('');
  const [newDemo,  setNewDemo]  = useState({ label: '', url: '' });

  useEffect(() => {
    Promise.all([
      api.get(`/admin/projects/${id}`),
      api.get(`/admin/projects/${id}/requirements`),
    ]).then(([projRes, reqsRes]) => {
      setProject(projRes.data.project);
      setReqs(reqsRes.data.requirements);
    }).finally(() => setLoading(false));
  }, [id]);

  const save = async (patch) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/projects/${id}`, patch);
      setProject(data.project);
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const changeStatus = (status) => save({ status });

  const toggleMilestone = (idx) => {
    const milestones = project.milestones.map((m, i) =>
      i === idx ? { ...m, completed: !m.completed } : m
    );
    save({ milestones });
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    const milestones = [...project.milestones, { title: newMilestone.trim(), completed: false }];
    save({ milestones });
    setNewMilestone('');
  };

  const removeMilestone = (idx) => {
    const milestones = project.milestones.filter((_, i) => i !== idx);
    save({ milestones });
  };

  const addDemoLink = () => {
    if (!newDemo.label.trim() || !newDemo.url.trim()) return;
    const demoLinks = [...project.demoLinks, newDemo];
    save({ demoLinks });
    setNewDemo({ label: '', url: '' });
  };

  const removeDemoLink = (idx) => {
    const demoLinks = project.demoLinks.filter((_, i) => i !== idx);
    save({ demoLinks });
  };

  const acknowledgeReqs = async () => {
    await api.patch(`/portal/requirements/${reqs._id}`, { status: 'acknowledged' });
    setReqs((r) => ({ ...r, status: 'acknowledged' }));
  };

  if (loading) return <div className="p-8 text-gray-400 text-sm animate-pulse">Loading project…</div>;
  if (!project) return <div className="p-8 text-red-400 text-sm">Project not found.</div>;

  const done  = project.milestones.filter((m) => m.completed).length;
  const total = project.milestones.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-5 max-w-4xl">
      <Link to="/admin/projects" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-teal-600 w-fit">
        <ArrowLeft size={15} /> Back to Projects
      </Link>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm p-7">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{project.title}</h1>
            {project.client && (
              <Link to={`/admin/clients/${project.client._id}`} className="text-sm text-teal-600 hover:underline mt-0.5 inline-block">
                {project.client.name} · {project.client.company}
              </Link>
            )}
            {project.description && <p className="text-sm text-gray-500 mt-2">{project.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-gray-400 flex items-center gap-1"><Save size={12} /> Saving…</span>}
            <select value={project.status} onChange={(e) => changeStatus(e.target.value)}
              className="input-field text-sm py-1.5 pr-8 font-medium">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Milestone progress</span>
              <span className="font-medium text-gray-600">{done}/{total} · {pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-xl p-1 w-fit shadow-sm">
        {['overview', 'milestones', 'demo links', 'requirements', 'notes'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t}
            {t === 'requirements' && reqs?.status === 'submitted' && (
              <span className="ml-1.5 inline-flex w-2 h-2 bg-amber-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm p-7">

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid sm:grid-cols-2 gap-5 text-sm">
            {[
              { label: 'Status',     value: <StatusBadge status={project.status} /> },
              { label: 'Client',     value: project.client?.name },
              { label: 'Start Date', value: project.startDate ? new Date(project.startDate).toLocaleDateString() : '—' },
              { label: 'End Date',   value: project.endDate   ? new Date(project.endDate).toLocaleDateString()   : '—' },
              { label: 'Milestones',  value: `${done} / ${total} complete` },
              { label: 'Demo Links', value: `${project.demoLinks.length} published` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-gray-800 font-medium">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Milestones */}
        {tab === 'milestones' && (
          <div className="space-y-3">
            {project.milestones.length === 0 && (
              <p className="text-sm text-gray-400">No milestones yet.</p>
            )}
            {project.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <button onClick={() => toggleMilestone(i)} className="shrink-0 text-gray-400 hover:text-teal-500 transition-colors">
                  {m.completed ? <CheckCircle2 size={18} className="text-teal-500" /> : <Circle size={18} />}
                </button>
                <span className={`flex-1 text-sm ${m.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{m.title}</span>
                <button onClick={() => removeMilestone(i)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <input value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
                placeholder="Add milestone…" className="input-field flex-1 text-sm" />
              <button onClick={addMilestone}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Demo links */}
        {tab === 'demo links' && (
          <div className="space-y-3">
            {project.demoLinks.length === 0 && (
              <p className="text-sm text-gray-400">No demo links yet.</p>
            )}
            {project.demoLinks.map((d, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{d.label}</p>
                  <a href={d.url} target="_blank" rel="noreferrer"
                    className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                    {d.url} <ExternalLink size={10} />
                  </a>
                </div>
                <button onClick={() => removeDemoLink(i)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <input value={newDemo.label} onChange={(e) => setNewDemo((d) => ({ ...d, label: e.target.value }))}
                placeholder="Label (e.g. Staging)" className="input-field text-sm w-36" />
              <input value={newDemo.url} onChange={(e) => setNewDemo((d) => ({ ...d, url: e.target.value }))}
                placeholder="https://…" className="input-field text-sm flex-1" />
              <button onClick={addDemoLink}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Requirements */}
        {tab === 'requirements' && (
          <div className="space-y-4 text-sm">
            {!reqs ? (
              <p className="text-gray-400">Client hasn't submitted requirements yet.</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <StatusBadge status={reqs.status} />
                  {reqs.status === 'submitted' && (
                    <button onClick={acknowledgeReqs}
                      className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                      Mark Acknowledged
                    </button>
                  )}
                </div>
                {[
                  { label: 'Vision',           value: reqs.vision },
                  { label: 'Target Audience',  value: reqs.targetAudience },
                  { label: 'Additional Notes', value: reqs.additionalNotes },
                ].map(({ label, value }) => value && (
                  <div key={label}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{value}</p>
                  </div>
                ))}
                {reqs.goals?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Goals</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {reqs.goals.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                )}
                {reqs.features?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Requested Features</p>
                    <div className="flex flex-wrap gap-2">
                      {reqs.features.map((f, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {reqs.designPreferences?.style && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Design Style</p>
                    <p className="text-gray-700">{reqs.designPreferences.style}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Notes */}
        {tab === 'notes' && (
          <NotesEditor project={project} onSave={save} />
        )}
      </div>
    </div>
  );
}

function NotesEditor({ project, onSave }) {
  const [notes,   setNotes]   = useState(project.notes || '');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ notes });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">Internal notes — not visible to client.</p>
      <textarea rows={10} value={notes} onChange={(e) => setNotes(e.target.value)}
        className="input-field w-full text-sm resize-none font-mono" placeholder="Write internal notes…" />
      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
        <Save size={14} />
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Notes'}
      </button>
    </div>
  );
}
