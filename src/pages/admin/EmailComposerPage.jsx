import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Users, CheckCircle2, AlertCircle, X, Sparkles, Eye, Wand2, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const FOOTER = `
  <div style="background:#0f172a;padding:32px 40px;text-align:center">
    <p style="margin:0 0 4px;color:#fff;font-size:15px;font-weight:700;letter-spacing:0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">Vichakra Technologies</p>
    <p style="margin:0 0 16px;color:#64748b;font-size:12px;letter-spacing:0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">Crafting Digital Excellence</p>
    <div style="width:40px;height:2px;background:linear-gradient(90deg,#0f766e,#14b8a6);margin:0 auto 16px"></div>
    <p style="margin:0 0 6px;color:#475569;font-size:11px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">© 2026 Vichakra Technologies. All rights reserved.</p>
    <p style="margin:0 0 4px;font-size:11px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">
      <a href="https://www.vichakratechnologies.com" style="color:#14b8a6;text-decoration:none">www.vichakratechnologies.com</a>
    </p>
    <p style="margin:0;font-size:11px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">
      <a href="mailto:info@vichakratechnologies.com" style="color:#0f766e;text-decoration:none">info@vichakratechnologies.com</a>
    </p>
  </div>
`;

const HEADER = `
  <div style="background:linear-gradient(135deg,#0f172a 0%,#134e4a 100%);padding:36px 40px 28px;text-align:center">
    <div style="display:inline-block;background:rgba(15,118,110,0.25);border:1px solid rgba(20,184,166,0.3);border-radius:10px;padding:8px 20px;margin-bottom:16px">
      <p style="margin:0;color:#5eead4;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Vichakra Technologies</p>
    </div>
    <div style="width:48px;height:3px;background:linear-gradient(90deg,#0f766e,#14b8a6);margin:0 auto"></div>
  </div>
`;

const EMAIL_TEMPLATES = [
  {
    id: 'welcome',
    label: 'Welcome Onboarding',
    subject: 'Welcome to Vichakra Technologies — Your Portal is Ready',
    html: `<div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.12)">
  ${HEADER}
  <div style="padding:48px 40px 40px">
    <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#0f766e;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Welcome Aboard</p>
    <h1 style="margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#0f172a;font-size:28px;font-weight:800;line-height:1.25">We're thrilled to have you with us.</h1>
    <p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#475569;font-size:15px;line-height:1.8">Your account is active and your dedicated portal is ready. Our team is standing by to bring your vision to life — all we need is your project brief.</p>
    <p style="margin:0 0 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#475569;font-size:15px;line-height:1.8">Head into your portal, complete the requirements questionnaire, and we'll get the wheels turning immediately.</p>

    <div style="background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:32px;border:1px solid #e2e8f0">
      <p style="margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#0f172a;font-size:13px;font-weight:700;letter-spacing:0.5px">WHAT HAPPENS NEXT</p>
      <div style="display:flex;align-items:flex-start;margin-bottom:10px">
        <span style="display:inline-block;width:22px;height:22px;background:#0f766e;border-radius:50%;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:22px;margin-right:12px;flex-shrink:0;font-family:sans-serif">1</span>
        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#475569;font-size:14px;line-height:1.6">Log into your portal and fill the project requirements form</p>
      </div>
      <div style="display:flex;align-items:flex-start;margin-bottom:10px">
        <span style="display:inline-block;width:22px;height:22px;background:#0f766e;border-radius:50%;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:22px;margin-right:12px;flex-shrink:0;font-family:sans-serif">2</span>
        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#475569;font-size:14px;line-height:1.6">Our team reviews and schedules a kickoff discussion</p>
      </div>
      <div style="display:flex;align-items:flex-start">
        <span style="display:inline-block;width:22px;height:22px;background:#0f766e;border-radius:50%;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:22px;margin-right:12px;flex-shrink:0;font-family:sans-serif">3</span>
        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#475569;font-size:14px;line-height:1.6">We start building — you track progress in real time</p>
      </div>
    </div>

    <div style="text-align:center;margin-bottom:32px">
      <a href="https://www.vichakratechnologies.com/login" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0d9488);color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;font-weight:700;font-size:15px;padding:16px 40px;border-radius:10px;letter-spacing:0.3px">Access Your Portal →</a>
    </div>

    <div style="border-top:1px solid #f1f5f9;padding-top:24px">
      <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#94a3b8;font-size:13px;line-height:1.7">Questions? Simply reply to this email — a real person will respond within a few hours.</p>
    </div>
  </div>
  ${FOOTER}
</div>`,
  },
  {
    id: 'project-update',
    label: 'Project Status Update',
    subject: 'Project Update — Here\'s Where Things Stand',
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.12)">
  ${HEADER}
  <div style="padding:48px 40px 40px">
    <p style="margin:0 0 8px;color:#0f766e;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Project Update</p>
    <h1 style="margin:0 0 8px;color:#0f172a;font-size:26px;font-weight:800;line-height:1.25">Here's where things stand.</h1>
    <p style="margin:0 0 32px;color:#94a3b8;font-size:14px">We wanted to keep you in the loop with the latest progress.</p>

    <div style="border-left:3px solid #0f766e;padding:20px 24px;background:#f8fafc;border-radius:0 12px 12px 0;margin-bottom:24px">
      <p style="margin:0 0 6px;color:#0f172a;font-size:13px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase">This Week's Progress</p>
      <p style="margin:0;color:#475569;font-size:15px;line-height:1.8">{{UPDATE_CONTENT}}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:32px">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px">
        <p style="margin:0 0 4px;color:#15803d;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Status</p>
        <p style="margin:0;color:#14532d;font-size:14px;font-weight:600">On Track ✓</p>
      </div>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px">
        <p style="margin:0 0 4px;color:#c2410c;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Next Milestone</p>
        <p style="margin:0;color:#7c2d12;font-size:14px;font-weight:600">{{NEXT_MILESTONE}}</p>
      </div>
    </div>

    <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.8">You can view the full breakdown, share feedback, and track every detail in your portal.</p>

    <div style="text-align:center;margin-bottom:32px">
      <a href="https://www.vichakratechnologies.com/login" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:10px;letter-spacing:0.3px">View Full Update →</a>
    </div>

    <div style="border-top:1px solid #f1f5f9;padding-top:20px">
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.7">As always, reply to this email if you have any questions or feedback.</p>
    </div>
  </div>
  ${FOOTER}
</div>`,
  },
  {
    id: 'milestone',
    label: 'Milestone Completed',
    subject: 'Milestone Reached — Big Progress on Your Project',
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.12)">
  <div style="background:linear-gradient(135deg,#0f172a 0%,#134e4a 100%);padding:48px 40px;text-align:center">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:rgba(20,184,166,0.2);border:2px solid rgba(20,184,166,0.4);border-radius:50%;margin-bottom:20px">
      <span style="font-size:28px">🏆</span>
    </div>
    <div style="display:inline-block;background:rgba(15,118,110,0.25);border:1px solid rgba(20,184,166,0.3);border-radius:8px;padding:6px 16px;margin-bottom:16px">
      <p style="margin:0;color:#5eead4;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Milestone Achieved</p>
    </div>
    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;line-height:1.3">{{MILESTONE_NAME}}<br/>is complete.</h1>
  </div>
  <div style="padding:48px 40px 40px">
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.8">This is a significant step forward. Your project is progressing exactly as planned, and the team has done exceptional work to reach this point.</p>
    <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.8">{{MILESTONE_DETAILS}}</p>

    <div style="background:linear-gradient(135deg,#f0fdf4,#f0fdfa);border:1px solid #a7f3d0;border-radius:12px;padding:24px;margin-bottom:32px;text-align:center">
      <p style="margin:0 0 8px;color:#0f172a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Overall Progress</p>
      <div style="background:#e2e8f0;border-radius:100px;height:8px;margin:0 auto 10px;max-width:320px">
        <div style="background:linear-gradient(90deg,#0f766e,#14b8a6);height:8px;border-radius:100px;width:{{PROGRESS_PERCENT}}%"></div>
      </div>
      <p style="margin:0;color:#0f766e;font-size:22px;font-weight:800">{{PROGRESS_PERCENT}}% Complete</p>
    </div>

    <div style="text-align:center;margin-bottom:32px">
      <a href="https://www.vichakratechnologies.com/login" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0d9488);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:10px;letter-spacing:0.3px">See Full Progress →</a>
    </div>

    <div style="border-top:1px solid #f1f5f9;padding-top:20px">
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.7">We're excited about what's ahead. Thank you for being a great partner.</p>
    </div>
  </div>
  ${FOOTER}
</div>`,
  },
  {
    id: 'invoice',
    label: 'Invoice / Payment',
    subject: 'Invoice #{{INVOICE_NO}} from Vichakra Technologies',
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.12)">
  ${HEADER}
  <div style="padding:48px 40px 40px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;flex-wrap:wrap;gap:16px">
      <div>
        <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase">Invoice</p>
        <p style="margin:0;color:#0f172a;font-size:26px;font-weight:800">#{{INVOICE_NO}}</p>
      </div>
      <div style="text-align:right">
        <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase">Amount Due</p>
        <p style="margin:0;color:#0f766e;font-size:26px;font-weight:800">{{INVOICE_AMOUNT}}</p>
      </div>
    </div>

    <div style="background:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:32px;border:1px solid #e2e8f0">
      <div style="display:flex;justify-content:space-between;padding:14px 20px;background:#0f172a">
        <span style="color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase">Description</span>
        <span style="color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase">Amount</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e2e8f0">
        <span style="color:#475569;font-size:14px">{{INVOICE_DESCRIPTION}}</span>
        <span style="color:#475569;font-size:14px;font-weight:600">{{INVOICE_AMOUNT}}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:16px 20px;background:#f0fdfa">
        <span style="color:#0f172a;font-size:14px;font-weight:700">Total</span>
        <span style="color:#0f766e;font-size:16px;font-weight:800">{{INVOICE_AMOUNT}}</span>
      </div>
    </div>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin-bottom:32px">
      <p style="margin:0;color:#c2410c;font-size:13px;font-weight:600">⏰ Payment due by <strong>{{DUE_DATE}}</strong></p>
    </div>

    <div style="text-align:center;margin-bottom:32px">
      <a href="{{PAYMENT_URL}}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0d9488);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 48px;border-radius:10px;letter-spacing:0.3px">Pay Now →</a>
    </div>

    <div style="border-top:1px solid #f1f5f9;padding-top:20px">
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.7">Questions about this invoice? Reply to this email and we'll sort it out right away.</p>
    </div>
  </div>
  ${FOOTER}
</div>`,
  },
  {
    id: 'blank',
    label: 'Custom / Blank',
    subject: '',
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.12)">
  ${HEADER}
  <div style="padding:48px 40px 40px">
    <p style="margin:0 0 8px;color:#0f766e;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Your Label Here</p>
    <h1 style="margin:0 0 20px;color:#0f172a;font-size:26px;font-weight:800;line-height:1.25">Your headline goes here.</h1>
    <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.8">Write your message content here. Keep it clear, concise, and focused on one key action.</p>
    <div style="text-align:center;margin-bottom:32px">
      <a href="#" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0d9488);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:10px;letter-spacing:0.3px">Call to Action →</a>
    </div>
    <div style="border-top:1px solid #f1f5f9;padding-top:20px">
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.7">Reply to this email if you have any questions — we're always here.</p>
    </div>
  </div>
  ${FOOTER}
</div>`,
  },
];

// Detect {{PLACEHOLDER}} tokens from HTML, excluding already-real URLs
const detectPlaceholders = (html) => {
  const matches = [...html.matchAll(/\{\{([^}]+)\}\}/g)];
  return [...new Set(matches.map(m => m[1]))];
};

export default function EmailComposerPage() {
  const [clients,      setClients]      = useState([]);
  const [selected,     setSelected]     = useState([]);
  const [subject,      setSubject]      = useState('');
  const [htmlBody,     setHtmlBody]     = useState(EMAIL_TEMPLATES[0].html);
  const [sending,      setSending]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [preview,      setPreview]      = useState(false);
  const [template,     setTemplate]     = useState(EMAIL_TEMPLATES[0].id);
  const [clientOpen,   setClientOpen]   = useState(false);
  const [aiPrompt,     setAiPrompt]     = useState('');
  const [generating,   setGenerating]   = useState(false);
  const [aiError,      setAiError]      = useState('');
  const [fillValues,   setFillValues]   = useState({});

  // Compute which placeholders still exist in the current body
  const openPlaceholders = detectPlaceholders(htmlBody);

  // Replace placeholders live as values change
  const applyFill = (key, value) => {
    setFillValues(prev => {
      const next = { ...prev, [key]: value };
      // Apply all current values to the raw template html
      let updated = htmlBody;
      Object.entries(next).forEach(([k, v]) => {
        if (v.trim()) updated = updated.replaceAll(`{{${k}}}`, v);
      });
      setHtmlBody(updated);
      return next;
    });
  };

  useEffect(() => {
    api.get('/admin/email/clients').then(({ data }) => setClients(data.clients));
  }, []);

  const applyTemplate = (tpl) => {
    setTemplate(tpl.id);
    setSubject(tpl.subject);
    setHtmlBody(tpl.html);
    setFillValues({});
  };

  const toggleClient = (email) => {
    setSelected(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const selectAll = () => setSelected(clients.map(c => c.email));
  const clearAll  = () => setSelected([]);

  const send = async () => {
    if (!selected.length || !subject.trim() || !htmlBody.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const { data } = await api.post('/admin/email/send', {
        to: selected,
        subject: subject.trim(),
        htmlBody,
      });
      setResult({ success: true, message: data.message });
      setSelected([]);
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.error || 'Send failed' });
    } finally { setSending(false); }
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    setAiError('');
    try {
      const { data } = await api.post('/admin/email/generate', { prompt: aiPrompt.trim() });
      setHtmlBody(data.html);
      setTemplate('blank');
      setAiPrompt('');
    } catch (err) {
      setAiError(err.response?.data?.error || 'Generation failed. Try again.');
    } finally { setGenerating(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-teal-50 rounded-2xl">
          <Mail size={22} className="text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Email Composer</h1>
          <p className="text-sm text-gray-500 mt-0.5">Send branded HTML emails directly to your clients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Recipients */}
        <div className="lg:col-span-1 space-y-4">
          {/* Template picker + AI */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
            <p className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5"><Sparkles size={13} className="text-teal-500" /> Email Templates</p>
            <div className="space-y-1.5">
              {EMAIL_TEMPLATES.map(tpl => (
                <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    template === tpl.id ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}>
                  {tpl.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[12px] font-bold text-gray-500 flex items-center gap-1.5 mb-2">
                <Wand2 size={11} className="text-violet-400" /> Generate with AI
              </p>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && e.metaKey && !generating && generateWithAI()}
                placeholder="Describe the email… e.g. Project milestone completed, congratulate client"
                rows={3}
                className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 focus:bg-white transition-all resize-none"
              />
              <button
                onClick={generateWithAI}
                disabled={!aiPrompt.trim() || generating}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-100 disabled:text-gray-400 text-white text-[12px] font-semibold rounded-xl transition-all">
                {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {generating ? 'Generating…' : 'Generate Email'}
              </button>
              {aiError && <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} /> {aiError}</p>}
            </div>
          </div>

          {/* Client selector */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5"><Users size={13} className="text-teal-500" /> Recipients</p>
              <div className="flex gap-2 text-[11px]">
                <button onClick={selectAll} className="text-teal-600 hover:underline font-semibold">All</button>
                <button onClick={clearAll} className="text-gray-400 hover:underline">Clear</button>
              </div>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {clients.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-4">No clients found.</p>
              ) : (
                clients.map(c => (
                  <label key={c.email} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" className="accent-teal-600 w-3.5 h-3.5"
                      checked={selected.includes(c.email)}
                      onChange={() => toggleClient(c.email)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{c.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{c.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
            {selected.length > 0 && (
              <p className="text-[11px] text-teal-600 font-bold mt-2 px-1">{selected.length} recipient{selected.length > 1 ? 's' : ''} selected</p>
            )}
          </div>
        </div>

        {/* Right — Composer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Result banner */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                {result.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {result.message}
                <button onClick={() => setResult(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subject */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">Subject Line</label>
              <input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Your project update from Vichakra"
                className="w-full px-4 py-3 text-[14px] border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:bg-white transition-all" />
            </div>

            {/* Placeholder fill-in */}
            {openPlaceholders.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <p className="text-[12px] font-bold text-amber-700 flex items-center gap-1.5">
                  ⚠ Fill in the placeholders before sending
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {openPlaceholders.map(key => (
                    <div key={key}>
                      <label className="block text-[11px] font-semibold text-amber-600 mb-1 uppercase tracking-wide">{key.replace(/_/g, ' ')}</label>
                      <input
                        type="text"
                        placeholder={`Enter ${key.toLowerCase().replace(/_/g, ' ')}…`}
                        value={fillValues[key] || ''}
                        onChange={e => applyFill(key, e.target.value)}
                        className="w-full px-3 py-2 text-[13px] border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HTML body editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-bold text-gray-700">HTML Email Body</label>
                <button onClick={() => setPreview(p => !p)}
                  className="flex items-center gap-1 text-[12px] text-teal-600 hover:text-teal-700 font-semibold">
                  <Eye size={13} /> {preview ? 'Edit' : 'Preview'}
                </button>
              </div>
              
              {preview ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 text-[11px] font-semibold text-gray-500 border-b border-gray-200">Email Preview</div>
                  <iframe
                    srcDoc={htmlBody}
                    className="w-full bg-white"
                    style={{ height: '420px', border: 'none' }}
                    title="email-preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              ) : (
                <textarea
                  value={htmlBody}
                  onChange={e => setHtmlBody(e.target.value)}
                  rows={18}
                  spellCheck={false}
                  className="w-full px-4 py-3 text-[12px] font-mono border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:bg-white transition-all resize-y text-gray-700"
                  placeholder="Paste or write your HTML email here..."
                />
              )}
            </div>

            {/* Send */}
            <div className="flex items-center gap-3 pt-1">
              <button onClick={send}
                disabled={!selected.length || !subject.trim() || !htmlBody.trim() || sending || openPlaceholders.length > 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:-translate-y-0.5">
                <Send size={15} /> {sending ? 'Sending…' : `Send to ${selected.length || 0} client${selected.length !== 1 ? 's' : ''}`}
              </button>
              {openPlaceholders.length > 0 ? (
                <p className="text-[12px] text-amber-600 font-medium">Fill all placeholders above first.</p>
              ) : (!selected.length || !subject.trim()) ? (
                <p className="text-[12px] text-gray-400">Select recipients and add a subject to send.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
