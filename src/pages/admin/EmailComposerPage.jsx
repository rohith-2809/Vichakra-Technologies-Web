import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Users, ChevronDown, CheckCircle2, AlertCircle, X, Sparkles, Eye } from 'lucide-react';
import api from '../../api/axios';

const EMAIL_TEMPLATES = [
  {
    id: 'welcome',
    label: 'Welcome Onboarding',
    subject: 'Welcome to Vichakra Technologies!',
    html: `<div style="font-family:'Inter',Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px;border-radius:12px">
  <div style="text-align:center;margin-bottom:24px">
    <h2 style="color:#0f766e;margin:0;font-size:22px">Vichakra Technologies</h2>
    <p style="color:#94a3b8;font-size:13px;margin:4px 0 0">Your Digital Partner</p>
  </div>
  <div style="background:#fff;padding:40px;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05)">
    <h1 style="color:#0f172a;font-size:26px;font-weight:700;margin-top:0">Welcome aboard! 🎉</h1>
    <p style="color:#475569;font-size:16px;line-height:1.7">We are absolutely thrilled to partner with you. Your account is now active and ready to go.</p>
    <p style="color:#475569;font-size:16px;line-height:1.7">Head over to your portal to complete your project requirements questionnaire so our team can get started crafting your vision.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="{{PORTAL_URL}}" style="background:#0f766e;color:#fff;text-decoration:none;font-weight:600;padding:14px 32px;border-radius:8px;font-size:15px;display:inline-block">Access Your Portal</a>
    </div>
    <p style="color:#64748b;font-size:14px;border-top:1px solid #f1f5f9;padding-top:16px;margin-bottom:0">If you have any questions, simply reply to this email — we're here to help.</p>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px">&copy; 2025 Vichakra Technologies. All rights reserved.</p>
</div>`,
  },
  {
    id: 'project-update',
    label: 'Project Status Update',
    subject: 'Your Project Update from Vichakra',
    html: `<div style="font-family:'Inter',Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px;border-radius:12px">
  <div style="background:#fff;padding:40px;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05)">
    <h1 style="color:#0f172a;font-size:22px;font-weight:700;margin-top:0">🚀 Project Update</h1>
    <p style="color:#475569;font-size:16px;line-height:1.7">Here is a quick update on the progress of your project:</p>
    <div style="background:#f0fdfa;border-left:4px solid #0f766e;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0">
      <p style="margin:0;color:#134e4a;font-size:15px;font-weight:600">This week's progress:</p>
      <p style="margin:8px 0 0;color:#475569;font-size:14px">{{UPDATE_CONTENT}}</p>
    </div>
    <p style="color:#475569;font-size:15px;line-height:1.7">Log in to your portal to see the full details and leave feedback.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="{{PORTAL_URL}}" style="background:#0f172a;color:#fff;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:8px;font-size:14px;display:inline-block">View in Portal</a>
    </div>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px">&copy; 2025 Vichakra Technologies</p>
</div>`,
  },
  {
    id: 'invoice',
    label: 'Invoice / Payment Reminder',
    subject: 'Invoice from Vichakra Technologies',
    html: `<div style="font-family:'Inter',Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px;border-radius:12px">
  <div style="background:#fff;padding:40px;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05)">
    <h1 style="color:#0f172a;font-size:22px;font-weight:700;margin-top:0">Invoice #{{INVOICE_NO}}</h1>
    <p style="color:#475569;font-size:15px">Dear Client, please find your invoice details below.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <tr style="background:#f8fafc"><td style="padding:10px;font-weight:600;color:#374151">Description</td><td style="padding:10px;text-align:right;font-weight:600;color:#374151">Amount</td></tr>
      <tr><td style="padding:10px;border-top:1px solid #f1f5f9;color:#475569">{{INVOICE_DESCRIPTION}}</td><td style="padding:10px;border-top:1px solid #f1f5f9;text-align:right;color:#475569">{{INVOICE_AMOUNT}}</td></tr>
      <tr style="background:#f0fdfa"><td style="padding:10px;font-weight:700;color:#0f172a">Total</td><td style="padding:10px;text-align:right;font-weight:700;color:#0f766e">{{INVOICE_AMOUNT}}</td></tr>
    </table>
    <div style="text-align:center;margin:28px 0">
      <a href="{{PAYMENT_URL}}" style="background:#0f766e;color:#fff;text-decoration:none;font-weight:600;padding:14px 32px;border-radius:8px;font-size:15px;display:inline-block">Pay Now</a>
    </div>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px">&copy; 2025 Vichakra Technologies</p>
</div>`,
  },
  {
    id: 'blank',
    label: 'Custom / Blank',
    subject: '',
    html: `<div style="font-family:'Inter',Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px;border-radius:12px">
  <div style="background:#fff;padding:40px;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05)">
    <h1 style="color:#0f172a;font-size:22px;font-weight:700;margin-top:0">Your message here</h1>
    <p style="color:#475569;font-size:16px;line-height:1.7">Write your email content here...</p>
  </div>
</div>`,
  },
];

export default function EmailComposerPage() {
  const [clients,     setClients]     = useState([]);
  const [selected,    setSelected]    = useState([]);
  const [subject,     setSubject]     = useState('');
  const [htmlBody,    setHtmlBody]    = useState(EMAIL_TEMPLATES[0].html);
  const [sending,     setSending]     = useState(false);
  const [result,      setResult]      = useState(null); // { success, message }
  const [preview,     setPreview]     = useState(false);
  const [template,    setTemplate]    = useState(EMAIL_TEMPLATES[0].id);
  const [clientOpen,  setClientOpen]  = useState(false);

  useEffect(() => {
    api.get('/admin/email/clients').then(({ data }) => setClients(data.clients));
  }, []);

  const applyTemplate = (tpl) => {
    setTemplate(tpl.id);
    setSubject(tpl.subject);
    setHtmlBody(tpl.html);
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
          {/* Template picker */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[13px] font-bold text-gray-700 mb-3 flex items-center gap-1.5"><Sparkles size={13} className="text-teal-500" /> Email Templates</p>
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
                disabled={!selected.length || !subject.trim() || !htmlBody.trim() || sending}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:-translate-y-0.5">
                <Send size={15} /> {sending ? 'Sending…' : `Send to ${selected.length || 0} client${selected.length !== 1 ? 's' : ''}`}
              </button>
              {(!selected.length || !subject.trim()) && (
                <p className="text-[12px] text-gray-400">Select recipients and add a subject to send.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
