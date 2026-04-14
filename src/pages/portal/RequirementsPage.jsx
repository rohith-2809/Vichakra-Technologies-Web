import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Upload, X, Plus, Check, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../../api/axios';

const STEPS = ['Vision', 'Design', 'Features', 'Files'];

const STYLE_OPTIONS = [
  { value: 'minimal',      label: 'Minimal',      desc: 'Clean, lots of white space' },
  { value: 'bold',         label: 'Bold',          desc: 'Strong colors, big typography' },
  { value: 'professional', label: 'Professional',  desc: 'Corporate, trust-focused' },
  { value: 'playful',      label: 'Playful',       desc: 'Fun, energetic, creative' },
  { value: 'luxury',       label: 'Luxury',        desc: 'Premium, dark, sophisticated' },
];

export default function RequirementsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [reqs,    setReqs]    = useState(null);
  const [step,    setStep]    = useState(0);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [form, setForm] = useState({
    vision:           '',
    targetAudience:   '',
    goals:            [],
    designPreferences: { style: '', colorPreference: '', referenceWebsites: [] },
    features:         [],
    additionalNotes:  '',
  });
  const [goalInput,    setGoalInput]    = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [refUrlInput,  setRefUrlInput]  = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileRef = useRef();

  // Load projects
  useEffect(() => {
    api.get('/portal/projects').then(({ data }) => {
      setProjects(data.projects);
      if (data.projects.length === 1) setSelectedProject(data.projects[0]._id);
    });
  }, []);

  // Load existing requirements when project selected
  useEffect(() => {
    if (!selectedProject) return;
    api.get(`/portal/requirements/${selectedProject}`).then(({ data }) => {
      if (data.requirements) {
        setReqs(data.requirements);
        setForm({
          vision:            data.requirements.vision || '',
          targetAudience:    data.requirements.targetAudience || '',
          goals:             data.requirements.goals || [],
          designPreferences: data.requirements.designPreferences || { style: '', colorPreference: '', referenceWebsites: [] },
          features:          data.requirements.features || [],
          additionalNotes:   data.requirements.additionalNotes || '',
        });
        setUploadedFiles(data.requirements.files || []);
      } else {
        setReqs(null);
      }
    });
  }, [selectedProject]);

  const isLocked = reqs?.status === 'submitted' || reqs?.status === 'acknowledged';

  const saveDraft = async (patch = {}) => {
    if (isLocked || !selectedProject) return;
    setSaving(true);
    const payload = { project: selectedProject, ...form, ...patch };
    try {
      const { data } = await api.post('/portal/requirements', payload);
      setReqs(data.requirements);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silently ignore draft save errors */ }
    finally { setSaving(false); }
  };

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
  };

  const addGoal = () => {
    if (!goalInput.trim()) return;
    update({ goals: [...form.goals, goalInput.trim()] });
    setGoalInput('');
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    update({ features: [...form.features, featureInput.trim()] });
    setFeatureInput('');
  };

  const addRefUrl = () => {
    if (!refUrlInput.trim()) return;
    const websites = [...(form.designPreferences.referenceWebsites || []), refUrlInput.trim()];
    update({ designPreferences: { ...form.designPreferences, referenceWebsites: websites } });
    setRefUrlInput('');
  };

  const uploadFiles = async (files) => {
    if (!reqs?._id) {
      // Save draft first to get requirements ID
      await saveDraft();
    }
    if (!reqs?._id) return;
    setUploadingFiles(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    try {
      const { data } = await api.post(
        `/portal/requirements/${reqs._id}/files`, formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUploadedFiles((prev) => [...prev, ...data.files]);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally { setUploadingFiles(false); }
  };

  const canSubmit = form.vision.trim().length > 20;

  const submit = async () => {
    if (!canSubmit || isLocked || !reqs) return;
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/portal/requirements/${reqs._id}`, { status: 'submitted', ...form });
      setReqs(data.requirements);
    } catch (err) {
      alert(err.response?.data?.error || 'Submit failed');
    } finally { setSubmitting(false); }
  };

  // Step completion indicators
  const stepComplete = [
    form.vision.trim().length > 20,
    !!form.designPreferences.style,
    form.features.length > 0,
    uploadedFiles.length > 0,
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
          <div className="p-3 bg-teal-50 rounded-2xl">
             <ClipboardList size={24} className="text-teal-600" />
          </div>
          Project Requirements
        </h1>
        <p className="text-[16px] text-gray-500 mt-4 leading-relaxed">
          Tell us your vision. The more detail you share, the better we can craft the perfect solution for you.
        </p>
      </div>

      {/* Project selector */}
      {projects.length > 1 && (
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
          className="input-field w-full text-sm">
          <option value="">Select project…</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      )}

      {!selectedProject ? (
        <div className="text-sm text-gray-400 text-center py-12 premium-card bg-white">
          {projects.length === 0 ? 'No projects assigned yet.' : 'Select a project above.'}
        </div>
      ) : (
        <>
          {/* Locked banner */}
          {isLocked && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <Lock size={14} />
              Requirements submitted. Contact support to request changes.
              <span className="ml-auto text-xs font-medium capitalize">{reqs.status}</span>
            </div>
          )}

          {/* Step progress */}
          <div className="flex justify-between items-center gap-2 relative mb-8">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-100/80 rounded-full z-0" />
            
            {STEPS.map((label, i) => (
              <button key={i} onClick={() => setStep(i)} disabled={isLocked && false}
                className={`relative z-10 flex flex-col items-center gap-2 transition-all group w-24 ${
                  step === i ? 'opacity-100' :
                  stepComplete[i] ? 'opacity-100 cursor-pointer hover:-translate-y-1' :
                  'opacity-60 cursor-not-allowed'
                }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${
                  step === i ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-teal-500/25 scale-110' :
                  stepComplete[i] ? 'bg-teal-50 text-teal-600 border-2 border-teal-200' :
                  'bg-white border-2 border-gray-100 text-gray-400'
                }`}>
                  {stepComplete[i] && step !== i ? <Check size={16} /> : (i + 1)}
                </div>
                <span className={`text-[13px] font-bold ${step === i ? 'text-teal-700' : 'text-gray-500'}`}>{label}</span>
              </button>
            ))}
          </div>

          {/* Step panels */}
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[32px] p-10 min-h-[400px] shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >

                {/* Step 0: Vision */}
                {step === 0 && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">
                        Describe your vision <span className="text-red-400">*</span>
                      </label>
                      <textarea rows={5} disabled={isLocked}
                        value={form.vision} onChange={(e) => update({ vision: e.target.value })}
                        onBlur={() => saveDraft()}
                        placeholder="What do you want to build? Who is it for? What problem does it solve?"
                        className="w-full px-5 py-4 text-[16px] border border-gray-200/80 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all resize-none shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
                      <p className="text-[13px] text-gray-400 mt-2 font-medium">{form.vision.length} chars · min 20</p>
                    </div>
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Target audience</label>
                      <input disabled={isLocked} value={form.targetAudience}
                        onChange={(e) => update({ targetAudience: e.target.value })}
                        onBlur={() => saveDraft()}
                        placeholder="e.g. Small business owners, students 18-25, healthcare professionals"
                        className="w-full px-5 py-4 text-[16px] border border-gray-200/80 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all shadow-inner disabled:opacity-60" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Goals</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {form.goals.map((g, i) => (
                          <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-xs">
                            {g}
                            {!isLocked && <button onClick={() => update({ goals: form.goals.filter((_, j) => j !== i) })}
                              className="text-teal-400 hover:text-red-400"><X size={10} /></button>}
                          </span>
                        ))}
                      </div>
                      {!isLocked && (
                        <div className="flex gap-2">
                          <input value={goalInput} onChange={(e) => setGoalInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                            placeholder="Add a goal…" className="input-field flex-1 text-sm" />
                          <button onClick={addGoal} className="px-3 py-2 bg-teal-600 text-white rounded-xl text-sm">
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Additional notes</label>
                      <textarea rows={3} disabled={isLocked}
                        value={form.additionalNotes} onChange={(e) => update({ additionalNotes: e.target.value })}
                        onBlur={() => saveDraft()}
                        placeholder="Anything else you'd like us to know?"
                        className="w-full px-5 py-4 text-[16px] border border-gray-200/80 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all resize-none shadow-inner disabled:opacity-60" />
                    </div>
                  </div>
                )}

                {/* Step 1: Design */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Design style <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {STYLE_OPTIONS.map((s) => (
                          <button key={s.value} disabled={isLocked}
                            onClick={() => { update({ designPreferences: { ...form.designPreferences, style: s.value } }); saveDraft(); }}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              form.designPreferences.style === s.value
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-gray-200 hover:border-teal-300'
                            } disabled:opacity-60 disabled:cursor-not-allowed`}>
                            <p className="text-sm font-medium text-gray-800">{s.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Color preference</label>
                      <input disabled={isLocked}
                        value={form.designPreferences.colorPreference || ''}
                        onChange={(e) => update({ designPreferences: { ...form.designPreferences, colorPreference: e.target.value } })}
                        onBlur={() => saveDraft()}
                        placeholder="e.g. Navy and gold, earthy tones, monochrome"
                        className="w-full px-5 py-4 text-[16px] border border-gray-200/80 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all shadow-inner disabled:opacity-60" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Reference websites</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(form.designPreferences.referenceWebsites || []).map((url, i) => (
                          <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {url}
                            {!isLocked && <button onClick={() => {
                              const websites = form.designPreferences.referenceWebsites.filter((_, j) => j !== i);
                              update({ designPreferences: { ...form.designPreferences, referenceWebsites: websites } });
                            }} className="text-gray-400 hover:text-red-400"><X size={10} /></button>}
                          </span>
                        ))}
                      </div>
                      {!isLocked && (
                        <div className="flex gap-2">
                          <input value={refUrlInput} onChange={(e) => setRefUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addRefUrl()}
                            placeholder="https://example.com" className="input-field flex-1 text-sm" />
                          <button onClick={addRefUrl} className="px-3 py-2 bg-teal-600 text-white rounded-xl text-sm">
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Features */}
                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">List the specific features or pages you want in your project.</p>
                    <div className="flex flex-wrap gap-2">
                      {form.features.map((f, i) => (
                        <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-sm">
                          {f}
                          {!isLocked && <button onClick={() => update({ features: form.features.filter((_, j) => j !== i) })}
                            className="text-teal-400 hover:text-red-400 ml-0.5"><X size={11} /></button>}
                        </span>
                      ))}
                      {form.features.length === 0 && (
                        <p className="text-sm text-gray-400">No features added yet.</p>
                      )}
                    </div>
                    {!isLocked && (
                      <div className="flex gap-2">
                        <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { addFeature(); } }}
                          placeholder="e.g. User login, Payment gateway, Admin dashboard"
                          className="input-field flex-1 text-sm" />
                        <button onClick={addFeature}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Files */}
                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Upload brand assets, reference images, wireframes, or any other files.</p>
                    {!isLocked && (
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-teal-400 rounded-[24px] p-16 text-center cursor-pointer transition-colors bg-white/50 hover:bg-teal-50/50"
                      >
                        <input ref={fileRef} type="file" multiple className="hidden"
                          onChange={(e) => uploadFiles(e.target.files)} />
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                           <Upload size={28} className="text-teal-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{uploadingFiles ? 'Uploading…' : 'Drop files here or click to browse'}</p>
                        <p className="text-[14px] text-gray-500 mt-2">Max 10MB per file · jpg, png, pdf, zip</p>
                      </div>
                    )}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadedFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg text-sm">
                            <span className="flex-1 text-gray-700 truncate">{f.originalName || f.filename}</span>
                            <span className="text-xs text-gray-400 shrink-0">
                              {f.size ? `${(f.size / 1024).toFixed(0)} KB` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={14} /> Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Save indicator */}
              {!isLocked && (
                <span className="text-xs text-gray-400">
                  {saving ? 'Saving…' : saved ? '✓ Draft saved' : ''}
                </span>
              )}

              {step < STEPS.length - 1 ? (
                <button onClick={() => { saveDraft(); setStep((s) => s + 1); }}
                  className="flex items-center gap-1.5 px-8 py-4 bg-gray-900 hover:bg-black text-white text-[15px] font-bold rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg">
                  Next Step <ChevronRight size={18} />
                </button>
              ) : !isLocked && (
                <button onClick={submit} disabled={!canSubmit || submitting}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-[15px] font-bold rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-teal-500/25">
                  <Check size={18} /> {submitting ? 'Submitting…' : 'Complete Requirements'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
