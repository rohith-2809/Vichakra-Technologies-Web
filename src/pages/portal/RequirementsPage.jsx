import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Upload, X, Plus, Check, Lock, ChevronRight, ChevronLeft, Paintbrush, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const STEPS = ['Overview', 'Scope & Features', 'Brand & Design', 'Files'];

const STYLE_OPTIONS = [
  { value: 'minimal',      label: 'Minimal',      desc: 'Clean, lots of white space' },
  { value: 'bold',         label: 'Bold',          desc: 'Strong colors, big typography' },
  { value: 'professional', label: 'Professional',  desc: 'Corporate, trust-focused' },
  { value: 'playful',      label: 'Playful',       desc: 'Fun, energetic, creative' },
  { value: 'luxury',       label: 'Luxury',        desc: 'Premium, dark, sophisticated' },
];

const PALETTES = [
  { value: 'modern-dark',   label: 'Modern Dark',   hexes: ['#0f172a', '#334155', '#38bdf8', '#e2e8f0'] },
  { value: 'earthy',        label: 'Earthy Nature', hexes: ['#14532d', '#4ade80', '#fefce8', '#78350f'] },
  { value: 'vibrant-tech',  label: 'Vibrant Tech',  hexes: ['#4f46e5', '#ec4899', '#0ea5e9', '#f8fafc'] },
  { value: 'minimalist',    label: 'Minimalist',    hexes: ['#ffffff', '#f1f5f9', '#94a3b8', '#0f172a'] },
  { value: 'corporate',     label: 'Corporate Blue',hexes: ['#1e3a8a', '#1e40af', '#bfdbfe', '#ffffff'] },
  { value: 'neon-cyber',    label: 'Neon Cyber',    hexes: ['#09090b', '#27272a', '#22d3ee', '#d946ef'] },
  { value: 'luxury-gold',   label: 'Luxury Gold',   hexes: ['#171717', '#262626', '#d4af37', '#fef3c7'] },
  { value: 'pastel-dream',  label: 'Pastel Dream',  hexes: ['#fdf4ff', '#f3e8ff', '#c084fc', '#f472b6'] },
  { value: 'sunset-orange', label: 'Sunset Orange', hexes: ['#fff7ed', '#ffedd5', '#f97316', '#ea580c'] },
  { value: 'ocean-breeze',  label: 'Ocean Breeze',  hexes: ['#f0fdfa', '#ccfbf1', '#14b8a6', '#0d9488'] },
];

const FONTS = [
  // Modern / Clean
  { value: 'Inter', label: 'Inter', desc: 'Clean, neutral, highly legible.', family: "'Inter', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' },
  { value: 'Roboto', label: 'Roboto', desc: 'Mechanical yet open and friendly.', family: "'Roboto', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
  { value: 'Open Sans', label: 'Open Sans', desc: 'Highly legible and friendly.', family: "'Open Sans', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap' },
  { value: 'Lato', label: 'Lato', desc: 'Warm and classical proportions.', family: "'Lato', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap' },
  { value: 'Work Sans', label: 'Work Sans', desc: 'Practical and perfectly balanced.', family: "'Work Sans', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600;700&display=swap' },
  // Elegant / Editorial
  { value: 'Playfair Display', label: 'Playfair', desc: 'Elegant, editorial, high-end.', family: "'Playfair Display', serif", url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap' },
  { value: 'Merriweather', label: 'Merriweather', desc: 'Classic, readable serif.', family: "'Merriweather', serif", url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap' },
  { value: 'Lora', label: 'Lora', desc: 'Well-balanced contemporary serif.', family: "'Lora', serif", url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap' },
  { value: 'Cormorant Garamond', label: 'Cormorant', desc: 'Extremely elegant and tall.', family: "'Cormorant Garamond', serif", url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap' },
  { value: 'PT Serif', label: 'PT Serif', desc: 'Transitional serif for branding.', family: "'PT Serif', serif", url: 'https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap' },
  // Funky / Tech / Display
  { value: 'Space Grotesk', label: 'Space Grotesk', desc: 'Tech-focused, edgy, modern.', family: "'Space Grotesk', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap' },
  { value: 'Outfit', label: 'Outfit', desc: 'Friendly, geometric, contemporary.', family: "'Outfit', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap' },
  { value: 'Bungee', label: 'Bungee', desc: 'Chunky, vibrant, urban sign type.', family: "'Bungee', cursive", url: 'https://fonts.googleapis.com/css2?family=Bungee&display=swap' },
  { value: 'Righteous', label: 'Righteous', desc: 'Grid-based, highly stylized.', family: "'Righteous', cursive", url: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap' },
  { value: 'Syne', label: 'Syne', desc: 'Radical, brutalist, and funky.', family: "'Syne', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap' },
  { value: 'Bangers', label: 'Bangers', desc: 'Comic-book style, loud & proud.', family: "'Bangers', cursive", url: 'https://fonts.googleapis.com/css2?family=Bangers&display=swap' },
  // Handwritten / Creative
  { value: 'Caveat', label: 'Caveat', desc: 'Handwritten, personal.', family: "'Caveat', cursive", url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap' },
  { value: 'Pacifico', label: 'Pacifico', desc: 'Fun brush script, laid back vibe.', family: "'Pacifico', cursive", url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap' },
  { value: 'Dancing Script', label: 'Dancing Script', desc: 'Lively, bouncing script font.', family: "'Dancing Script', cursive", url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap' },
  { value: 'Shadows Into Light', label: 'Shadows Into Light', desc: 'Neat, personal handwriting.', family: "'Shadows+Into+Light', cursive", url: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap' },
];

const BRAND_VALUES = [
  { value: 'Trustworthy', desc: 'Reliable, secure, and highly professional.' },
  { value: 'Innovative', desc: 'Forward-thinking, modern, and cutting-edge.' },
  { value: 'Playful', desc: 'Fun, approachable, and full of character.' },
  { value: 'Luxurious', desc: 'Premium, exclusive, and highly sophisticated.' },
  { value: 'Minimalist', desc: 'Clean, simple, and beautifully understated.' },
  { value: 'Eco-friendly', desc: 'Sustainable, organic, and nature-conscious.' },
  { value: 'Corporate', desc: 'Structured, serious, and business-focused.' },
  { value: 'Edgy', desc: 'Rebellious, bold, and fiercely independent.' },
  { value: 'Approachable', desc: 'Friendly, warm, and highly accessible.' },
  { value: 'High-Tech', desc: 'Advanced, fast, and engineered for the future.' }
];

const DELIVERABLES = [
  { value: 'UI/UX Design', desc: 'Complete interface design and user experience flows.' },
  { value: 'Web Development', desc: 'Full-stack coding and implementation of the website.' },
  { value: 'Mobile App', desc: 'Native or cross-platform application development.' },
  { value: 'Backend API', desc: 'Custom server architecture and database systems.' },
  { value: 'E-Commerce', desc: 'Shopping cart, products, and checkout integration.' },
  { value: 'SEO Optimization', desc: 'Technical and on-page search engine optimization.' },
  { value: 'Copywriting', desc: 'Professional text content and brand messaging.' },
  { value: 'Branding/Logo', desc: 'Visual identity creation, including logo design.' },
  { value: 'CMS Integration', desc: 'Content Management System (e.g. WordPress, Sanity).' },
  { value: 'Analytics Setup', desc: 'Google Analytics, Tag Manager, and user tracking.' }
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
    projectType:      '',
    vision:           '',
    targetAudience:   '',
    competitors:      [],
    goals:            [],
    brandValues:      [],
    deliverables:     [],
    designPreferences: { style: '', colorPreference: '', typographyPreference: '', referenceWebsites: [] },
    features:         [],
    integrations:     [],
    additionalNotes:  '',
  });
  
  const [goalInput,    setGoalInput]    = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [refUrlInput,  setRefUrlInput]  = useState('');
  const [compInput,    setCompInput]    = useState('');
  const [intInput,     setIntInput]     = useState('');
  
  const [customColorHex, setCustomColorHex] = useState('#0f766e');
  const [customColorDesc, setCustomColorDesc] = useState('');
  const [customFont, setCustomFont] = useState('');
  const [brandValueNotes, setBrandValueNotes] = useState({});
  const [deliverableNotes, setDeliverableNotes] = useState({});

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pageError, setPageError] = useState('');
  // Keep fileRef input always mounted so ref stays valid across step transitions
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
          projectType:       data.requirements.projectType || '',
          vision:            data.requirements.vision || '',
          targetAudience:    data.requirements.targetAudience || '',
          competitors:       data.requirements.competitors || [],
          goals:             data.requirements.goals || [],
          brandValues:       data.requirements.brandValues || [],
          deliverables:      data.requirements.deliverables || [],
          designPreferences: data.requirements.designPreferences || { style: '', colorPreference: '', typographyPreference: '', referenceWebsites: [] },
          features:          data.requirements.features || [],
          integrations:      data.requirements.integrations || [],
          additionalNotes:   data.requirements.additionalNotes || '',
        });
        
        // Setup custom color/font inputs if they don't match a predefined palette
        if (data.requirements.designPreferences?.colorPreference) {
          const isPredefined = PALETTES.some(p => p.value === data.requirements.designPreferences.colorPreference);
          if (!isPredefined) {
            const parts = data.requirements.designPreferences.colorPreference.split(' - ');
            if (parts.length === 2 && parts[0].startsWith('#')) {
              setCustomColorHex(parts[0]);
              setCustomColorDesc(parts[1]);
            }
          }
        }
        if (data.requirements.designPreferences?.typographyPreference) {
          const isPredefined = FONTS.some(f => f.value === data.requirements.designPreferences.typographyPreference);
          if (!isPredefined && data.requirements.designPreferences.typographyPreference.startsWith('Custom: ')) {
            setCustomFont(data.requirements.designPreferences.typographyPreference.replace('Custom: ', ''));
          }
        }
        
        setUploadedFiles(data.requirements.files || []);
      } else {
        setReqs(null);
      }
    });
  }, [selectedProject]);

  const isLocked = reqs?.status === 'submitted' || reqs?.status === 'acknowledged';

  const saveDraft = async (patch = {}, formOverride = null) => {
    if (isLocked || !selectedProject) return null;
    setSaving(true);
    // Use the explicitly provided form state to avoid stale-closure bugs
    const base = formOverride || form;
    const payload = { project: selectedProject, ...base, ...patch };
    try {
      const { data } = await api.post('/portal/requirements', payload);
      setReqs(data.requirements);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return data.requirements; // Return so callers can use the id immediately
    } catch (err) {
      console.error('Draft save failed:', err?.response?.status, err?.response?.data?.error);
      return null;
    } finally { setSaving(false); }
  };

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
  };

  // List additions
  const addToList = (field, value, resetValue) => {
    if (!value.trim()) return;
    update({ [field]: [...form[field], value.trim()] });
    resetValue('');
  };
  
  const toggleArrayItem = (field, value) => {
    if (isLocked) return;
    const current = form[field];
    const newList = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    const newForm = { ...form, [field]: newList };
    update({ [field]: newList });
    // Pass newForm directly so saveDraft doesn't use stale closure state
    saveDraft({}, newForm);
  };

  const addDesignRef = () => {
    if (!refUrlInput.trim()) return;
    const websites = [...(form.designPreferences.referenceWebsites || []), refUrlInput.trim()];
    update({ designPreferences: { ...form.designPreferences, referenceWebsites: websites } });
    setRefUrlInput('');
  };

  const uploadFiles = async (files) => {
    let currentReqs = reqs;
    if (!currentReqs?._id) {
      // saveDraft returns the saved requirements directly
      currentReqs = await saveDraft();
    }
    if (!currentReqs?._id) {
      setPageError('Please complete the project vision and project type fields before uploading files.');
      return;
    }
    setPageError('');
    setUploadingFiles(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    try {
      const { data } = await api.post(
        `/portal/requirements/${currentReqs._id}/files`, formData
      );
      setUploadedFiles((prev) => [...prev, ...data.files]);
    } catch (err) {
      setPageError(err.response?.data?.error || 'Sorry for the inconvenience — file upload failed. Please try again or contact info@vichakratechnologies.com.');
    } finally { setUploadingFiles(false); }
  };

  const deleteFile = async (fileId) => {
    if (isLocked || !reqs?._id) return;
    setPageError('');
    try {
      await api.delete(`/portal/requirements/${reqs._id}/files/${fileId}`);
      setUploadedFiles(prev => prev.filter(f => f._id !== fileId));
    } catch {
      setPageError('Sorry, we couldn\'t remove that file. Please try again.');
    }
  };

  const canSubmit = 
    form.vision.trim().length >= 20 && 
    form.projectType.trim().length > 0 && 
    form.deliverables.length > 0;

  const submit = async () => {
    if (!canSubmit || isLocked || !reqs) return;
    setSubmitting(true);
    setPageError('');
    try {
      const { data } = await api.patch(`/portal/requirements/${reqs._id}`, { status: 'submitted', ...form });
      setReqs(data.requirements);
    } catch {
      setPageError('Sorry for the inconvenience — submission failed. Please try again or contact us at info@vichakratechnologies.com.');
    } finally { setSubmitting(false); }
  };

  // Step completion indicators
  const stepComplete = [
    form.vision.trim().length > 20 && form.projectType.trim().length > 0, // Overview
    form.deliverables.length > 0, // Scope & Features
    !!form.designPreferences.style, // Design
    uploadedFiles.length > 0, // Files
  ];

  // Helper to determine the preview color for fonts
  const getPreviewColor = () => {
    const selectedPalette = PALETTES.find(p => p.value === form.designPreferences.colorPreference);
    if (selectedPalette && selectedPalette.hexes[2]) {
      if (selectedPalette.value === 'minimalist') return '#0f172a'; // Exception for minimalist
      return selectedPalette.hexes[2];
    }
    // If it's a custom hex color, use that!
    if (form.designPreferences.colorPreference.startsWith('#')) {
      const extractedHex = form.designPreferences.colorPreference.split(' ')[0];
      return extractedHex;
    }
    return '#0f766e'; // Default Teal
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Load Google Fonts Globally for this component */}
      <style dangerouslySetInnerHTML={{ __html: FONTS.map(f => `@import url('${f.url}');`).join('\n') }} />

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

          {/* Error banner */}
          {pageError && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span className="flex-1">{pageError}</span>
              <button onClick={() => setPageError('')} className="shrink-0 text-red-400 hover:text-red-600 transition-colors ml-2">✕</button>
            </div>
          )}

          {/* Step progress */}
          <div className="flex justify-between items-center gap-2 relative mb-8 px-2">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-100/80 rounded-full z-0" />
            
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
                <span className={`text-[12px] whitespace-nowrap font-bold ${step === i ? 'text-teal-700' : 'text-gray-500'}`}>{label}</span>
              </button>
            ))}
          </div>

          {/* Hidden file input - MUST be outside AnimatePresence so the ref stays mounted */}
          <input ref={fileRef} type="file" multiple className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.zip,.doc,.docx,.xls,.xlsx,.mp4"
            onChange={(e) => uploadFiles(e.target.files)} />

          {/* Step panels */}
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[32px] p-6 sm:p-10 min-h-[400px] shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >

                {/* Step 0: Overview */}
                {step === 0 && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Project Type <span className="text-red-400">*</span></label>
                      <select disabled={isLocked} value={form.projectType} onChange={(e) => update({ projectType: e.target.value })} onBlur={() => saveDraft()}
                        className="w-full px-5 py-4 text-[16px] border border-gray-200/80 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all shadow-inner disabled:opacity-60">
                        <option value="">Select project type...</option>
                        <option value="Landing Page">Landing Page</option>
                        <option value="Corporate Website">Corporate Website</option>
                        <option value="E-Commerce">E-Commerce</option>
                        <option value="Web Application">Web Application</option>
                        <option value="Mobile App">Mobile App</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">
                        Describe your vision <span className="text-red-400">*</span>
                      </label>
                      <textarea rows={4} disabled={isLocked}
                        value={form.vision} onChange={(e) => update({ vision: e.target.value })}
                        onBlur={() => saveDraft()}
                        placeholder="What do you want to build? What problem does it solve?"
                        className="w-full px-5 py-4 text-[16px] border border-gray-200/80 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all resize-none shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
                      <p className="text-[13px] text-gray-400 mt-2 font-medium">{form.vision.length} chars · min 20</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Target audience</label>
                        <input disabled={isLocked} value={form.targetAudience}
                          onChange={(e) => update({ targetAudience: e.target.value })}
                          onBlur={() => saveDraft()}
                          placeholder="e.g. Small business owners, students"
                          className="w-full px-5 py-4 text-[16px] border border-gray-200/80 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all shadow-inner disabled:opacity-60" />
                      </div>
                      <div>
                        <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Goals</label>
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
                              onKeyDown={(e) => e.key === 'Enter' && addToList('goals', goalInput, setGoalInput)}
                              placeholder="Add a goal…" className="input-field flex-1 text-sm" />
                            <button onClick={() => addToList('goals', goalInput, setGoalInput)} className="px-3 py-2 bg-teal-600 text-white rounded-xl text-sm">
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Competitors</label>
                      <p className="text-[13px] text-gray-500 mb-3">List your main competitors so we can understand your market.</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {form.competitors.map((c, i) => (
                          <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {c}
                            {!isLocked && <button onClick={() => update({ competitors: form.competitors.filter((_, j) => j !== i) })}
                              className="text-gray-400 hover:text-red-400"><X size={10} /></button>}
                          </span>
                        ))}
                      </div>
                      {!isLocked && (
                        <div className="flex gap-2">
                          <input value={compInput} onChange={(e) => setCompInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addToList('competitors', compInput, setCompInput)}
                            placeholder="Add a competitor…" className="input-field flex-1 text-sm" />
                          <button onClick={() => addToList('competitors', compInput, setCompInput)} className="px-3 py-2 bg-teal-600 text-white rounded-xl text-sm">
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 1: Scope & Features */}
                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Core Deliverables <span className="text-red-400">*</span></label>
                      <p className="text-[13px] text-gray-500 mb-4">Select the key services you require for this project.</p>
                      <div className="flex flex-wrap gap-3">
                        {DELIVERABLES.map((item) => {
                          const isSelected = form.deliverables.includes(item.value);
                          return (
                            <button key={item.value} type="button" disabled={isLocked}
                              onClick={() => toggleArrayItem('deliverables', item.value)}
                              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                isSelected 
                                  ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/20' 
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50'
                              }`}
                            >
                              {item.value}
                            </button>
                          );
                        })}
                      </div>
                      {/* Dynamic Explanations + notes per deliverable */}
                      {form.deliverables.length > 0 && (
                        <div className="mt-4 bg-teal-50/60 rounded-xl p-4 border border-teal-100 space-y-3">
                          <p className="text-[13px] font-bold text-teal-800 mb-1">Selected Deliverables — add specific requirements for each:</p>
                          {form.deliverables.map(v => {
                            const detail = DELIVERABLES.find(d => d.value === v);
                            return detail ? (
                              <div key={v}>
                                <p className="text-[13px] text-gray-700 mb-1">
                                  <span className="font-semibold text-gray-900">{detail.value}:</span> {detail.desc}
                                </p>
                                {!isLocked && (
                                  <input
                                    value={deliverableNotes[v] || ''}
                                    onChange={e => setDeliverableNotes(prev => ({ ...prev, [v]: e.target.value }))}
                                    onBlur={() => saveDraft({}, { ...form, deliverableNotes })}
                                    placeholder={`Specific requirements for "${v}"…`}
                                    className="w-full px-3 py-2 text-[13px] border border-teal-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-gray-700 placeholder:text-gray-400"
                                  />
                                )}
                                {isLocked && deliverableNotes[v] && (
                                  <p className="text-[12px] text-gray-500 italic">{deliverableNotes[v]}</p>
                                )}
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Specific Features</label>
                      <p className="text-[13px] text-gray-500 mb-3">List the specific features or pages you want in your project.</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {form.features.map((f, i) => (
                          <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-sm">
                            {f}
                            {!isLocked && <button onClick={() => update({ features: form.features.filter((_, j) => j !== i) })}
                              className="text-gray-400 hover:text-red-400 ml-0.5"><X size={11} /></button>}
                          </span>
                        ))}
                      </div>
                      {!isLocked && (
                        <div className="flex gap-2">
                          <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addToList('features', featureInput, setFeatureInput)}
                            placeholder="e.g. User login, Payment gateway, Admin dashboard"
                            className="input-field flex-1 text-sm" />
                          <button onClick={() => addToList('features', featureInput, setFeatureInput)}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Third-Party Integrations</label>
                      <p className="text-[13px] text-gray-500 mb-3">Do you need to integrate with external systems (e.g., Stripe, Salesforce, Mailchimp)?</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {form.integrations.map((c, i) => (
                          <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {c}
                            {!isLocked && <button onClick={() => update({ integrations: form.integrations.filter((_, j) => j !== i) })}
                              className="text-gray-400 hover:text-red-400"><X size={10} /></button>}
                          </span>
                        ))}
                      </div>
                      {!isLocked && (
                        <div className="flex gap-2">
                          <input value={intInput} onChange={(e) => setIntInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addToList('integrations', intInput, setIntInput)}
                            placeholder="Add an integration…" className="input-field flex-1 text-sm" />
                          <button onClick={() => addToList('integrations', intInput, setIntInput)} className="px-3 py-2 bg-teal-600 text-white rounded-xl text-sm">
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Additional Notes</label>
                      <textarea rows={3} disabled={isLocked}
                        value={form.additionalNotes} onChange={(e) => update({ additionalNotes: e.target.value })}
                        onBlur={() => saveDraft()}
                        placeholder="Anything else you'd like us to know about the technical scope?"
                        className="w-full px-5 py-4 text-[16px] border border-gray-200/80 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all resize-none shadow-inner disabled:opacity-60" />
                    </div>
                  </div>
                )}

                {/* Step 2: Brand & Design */}
                {step === 2 && (
                  <div className="space-y-8">
                    
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Brand Values</label>
                      <p className="text-[13px] text-gray-500 mb-4">Select the words that best describe your brand's personality.</p>
                      <div className="flex flex-wrap gap-2.5">
                        {BRAND_VALUES.map((item) => {
                          const isSelected = form.brandValues.includes(item.value);
                          return (
                            <button key={item.value} type="button" disabled={isLocked}
                              onClick={() => toggleArrayItem('brandValues', item.value)}
                              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                isSelected 
                                  ? 'bg-gray-900 border-gray-900 text-white shadow-md' 
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              {item.value}
                            </button>
                          );
                        })}
                      </div>
                      {/* Dynamic Explanations + contextual note inputs */}
                      {form.brandValues.length > 0 && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                          <p className="text-[13px] font-bold text-gray-700 mb-1">Selected Values — add notes for each:</p>
                          {form.brandValues.map(v => {
                            const detail = BRAND_VALUES.find(b => b.value === v);
                            return detail ? (
                              <div key={v}>
                                <p className="text-[13px] text-gray-600 mb-1">
                                  <span className="font-semibold text-gray-800">{detail.value}:</span> {detail.desc}
                                </p>
                                {!isLocked && (
                                  <input
                                    value={brandValueNotes[v] || ''}
                                    onChange={e => setBrandValueNotes(prev => ({ ...prev, [v]: e.target.value }))}
                                    onBlur={() => saveDraft({}, { ...form, brandValueNotes })}
                                    placeholder={`Any specific notes about being "${v}" for your brand…`}
                                    className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-gray-700 placeholder:text-gray-400"
                                  />
                                )}
                                {isLocked && brandValueNotes[v] && (
                                  <p className="text-[12px] text-gray-500 italic">{brandValueNotes[v]}</p>
                                )}
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">
                        Design Direction <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {STYLE_OPTIONS.map((s) => (
                          <button key={s.value} disabled={isLocked}
                            onClick={() => { update({ designPreferences: { ...form.designPreferences, style: s.value } }); saveDraft(); }}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              form.designPreferences.style === s.value
                                ? 'border-teal-500 bg-teal-50 shadow-sm'
                                : 'border-gray-200 hover:border-teal-300 bg-white'
                            } disabled:opacity-60 disabled:cursor-not-allowed`}>
                            <p className="text-[15px] font-bold text-gray-800">{s.label}</p>
                            <p className="text-[12px] text-gray-500 mt-1">{s.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Color Palette Suggestion</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                        {PALETTES.map((p) => (
                          <button key={p.value} disabled={isLocked}
                            onClick={() => { 
                              setCustomColorHex('#0f766e');
                              setCustomColorDesc('');
                              update({ designPreferences: { ...form.designPreferences, colorPreference: p.value } }); 
                              saveDraft(); 
                            }}
                            className={`p-3 rounded-xl border flex flex-col gap-3 transition-all ${
                              form.designPreferences.colorPreference === p.value
                                ? 'border-teal-500 bg-teal-50 shadow-sm ring-1 ring-teal-500/20'
                                : 'border-gray-200 hover:border-teal-300 bg-white'
                            } disabled:opacity-60 disabled:cursor-not-allowed`}>
                            <p className="text-[12px] font-bold text-gray-800 text-left truncate w-full">{p.label}</p>
                            <div className="flex w-full h-6 rounded-md overflow-hidden border border-gray-200/50 shadow-inner">
                              {p.hexes.map(hex => (
                                <div key={hex} className="flex-1 h-full" style={{ backgroundColor: hex }} />
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-5 border border-gray-200/80 rounded-2xl bg-white/50 shadow-inner">
                        <label className="block text-[14px] font-bold text-gray-800 mb-2">Or Use the Color Wheel:</label>
                        <div className="flex gap-4 items-center">
                          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm cursor-pointer shrink-0">
                            <input type="color" disabled={isLocked}
                              value={customColorHex}
                              onChange={(e) => {
                                setCustomColorHex(e.target.value);
                                update({ designPreferences: { ...form.designPreferences, colorPreference: `${e.target.value} - ${customColorDesc}` } });
                              }}
                              onBlur={() => saveDraft()}
                              className="absolute -top-4 -left-4 w-24 h-24 cursor-pointer border-0 p-0"
                            />
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <Paintbrush size={20} className="text-white mix-blend-difference" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <input disabled={isLocked}
                              value={customColorDesc}
                              onChange={(e) => {
                                setCustomColorDesc(e.target.value);
                                update({ designPreferences: { ...form.designPreferences, colorPreference: `${customColorHex} - ${e.target.value}` } });
                              }}
                              onBlur={() => saveDraft()}
                              placeholder="Describe this color (e.g. Primary button color)"
                              className="w-full px-4 py-2 text-[14px] border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60" 
                            />
                            <p className="text-[12px] text-gray-500 mt-1 font-mono uppercase font-semibold">{customColorHex}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Typography / Font Preference</label>
                      <p className="text-[13px] text-gray-500 mb-3">Select a font style that matches your brand's personality.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {FONTS.map((font) => (
                          <button key={font.value} disabled={isLocked}
                            onClick={() => { 
                              setCustomFont('');
                              update({ designPreferences: { ...form.designPreferences, typographyPreference: font.value } }); 
                              saveDraft(); 
                            }}
                            className={`p-5 rounded-xl border flex flex-col gap-2 transition-all text-left overflow-hidden ${
                              form.designPreferences.typographyPreference === font.value
                                ? 'border-teal-500 bg-teal-50/50 shadow-sm ring-1 ring-teal-500/20'
                                : 'border-gray-200 hover:border-teal-300 bg-white'
                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-[14px] font-bold text-gray-800">{font.label}</p>
                              {form.designPreferences.typographyPreference === font.value && (
                                <span className="w-2 h-2 rounded-full bg-teal-500" />
                              )}
                            </div>
                            <p className="text-[12px] text-gray-500 mb-2">{font.desc}</p>
                            
                            {/* Font Preview Area */}
                            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm w-full mt-auto transition-colors duration-300" 
                                 style={{ 
                                   fontFamily: font.family, 
                                   color: form.designPreferences.typographyPreference === font.value ? getPreviewColor() : '#1f2937'
                                 }}>
                              <p className="text-xl font-bold mb-1" style={{ fontWeight: 700 }}>Ag</p>
                              <p className="text-[14px]" style={{ fontWeight: 600 }}>The quick brown fox</p>
                              <p className="text-[12px] mt-1 opacity-80" style={{ fontWeight: 400 }}>jumps over the lazy dog.</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 p-5 border border-gray-200/80 rounded-2xl bg-white/50 shadow-inner">
                        <label className="block text-[14px] font-bold text-gray-800 mb-2">Have a custom font in mind?</label>
                        <input disabled={isLocked}
                          value={customFont}
                          onChange={(e) => {
                            setCustomFont(e.target.value);
                            update({ designPreferences: { ...form.designPreferences, typographyPreference: `Custom: ${e.target.value}` } });
                          }}
                          onBlur={() => saveDraft()}
                          placeholder='e.g. "Helvetica Neue", "Adobe Caslon"'
                          className="w-full px-4 py-3 text-[14px] border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 tracking-wide mb-3">Reference websites</label>
                      <p className="text-[13px] text-gray-500 mb-3">Share links to websites whose design or functionality you admire.</p>
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
                            onKeyDown={(e) => e.key === 'Enter' && addDesignRef()}
                            placeholder="https://example.com" className="input-field flex-1 text-sm" />
                          <button onClick={addDesignRef} className="px-3 py-2 bg-teal-600 text-white rounded-xl text-sm">
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Files */}
                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-[15px] font-bold text-gray-900 tracking-wide mb-2">Upload Files</p>
                    <p className="text-[14px] text-gray-500 mb-4">Upload brand assets (logos, fonts), reference images, wireframes, or documents.</p>
                    {!isLocked && (
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-teal-400 rounded-[24px] p-16 text-center cursor-pointer transition-colors bg-white/50 hover:bg-teal-50/50"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                           <Upload size={28} className="text-teal-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{uploadingFiles ? 'Uploading…' : 'Drop files here or click to browse'}</p>
                        <p className="text-[14px] text-gray-500 mt-2">Max 50MB per file · jpg, png, pdf, zip, docx, pptx, etc.</p>
                      </div>
                    )}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2 mt-6">
                        {uploadedFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm text-sm group transition-all">
                            <span className="flex-1 font-medium text-gray-800 truncate">{f.originalName || f.filename}</span>
                            <span className="text-[12px] font-bold text-gray-400 shrink-0">
                              {f.size ? `${(f.size / 1024).toFixed(0)} KB` : ''}
                            </span>
                            {!isLocked && (
                              <button onClick={() => deleteFile(f._id)} 
                                className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 p-1.5 rounded-md opacity-0 group-hover:opacity-100"
                                title="Remove file"
                              >
                                <X size={16} />
                              </button>
                            )}
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
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1.5 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <ChevronLeft size={16} /> Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Save indicator */}
              {!isLocked && (
                <span className="text-[13px] font-bold text-gray-400">
                  {saving ? 'Saving…' : saved ? '✓ Draft saved' : ''}
                </span>
              )}

              {step === STEPS.length - 1 && !isLocked && !canSubmit && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl p-4 mr-4 flex flex-col items-end gap-2 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-red-600 mb-1">
                    <span className="text-[11px] font-black uppercase tracking-widest">Action Required</span>
                    <AlertCircle size={14} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {form.projectType.trim().length === 0 && (
                      <button onClick={() => setStep(0)} className="group flex items-center gap-2 text-[13px] text-gray-500 hover:text-red-600 transition-colors">
                        <span>Select project type</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 group-hover:scale-125 transition-transform" />
                      </button>
                    )}
                    {form.vision.trim().length < 20 && (
                      <button onClick={() => setStep(0)} className="group flex items-center gap-2 text-[13px] text-gray-500 hover:text-red-600 transition-colors">
                        <span>Describe your vision (min 20 chars)</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 group-hover:scale-125 transition-transform" />
                      </button>
                    )}
                    {form.deliverables.length === 0 && (
                      <button onClick={() => setStep(1)} className="group flex items-center gap-2 text-[13px] text-gray-500 hover:text-red-600 transition-colors">
                        <span>Select core deliverables</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 group-hover:scale-125 transition-transform" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {step < STEPS.length - 1 ? (
                <button onClick={() => { saveDraft(); setStep((s) => s + 1); }}
                  className="flex items-center gap-1.5 px-8 py-4 bg-gray-900 hover:bg-black text-white text-[15px] font-bold rounded-2xl transition-all hover:-translate-y-0.5 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)]">
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
