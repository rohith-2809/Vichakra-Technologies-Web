import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Download, Send, Plus, Trash2, FileText, Loader2, CheckCircle2, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDocument } from '../../utils/pdfGenerator';
import axios from 'axios';
import api from '../../api/axios';

const INITIAL_SCOPE = "Project scope covers only the services listed above. Any changes or additional requests will be treated as a change order and quoted separately.";
const INITIAL_RESP = "Client is responsible for providing all necessary text content, brand assets, and timely feedback/approvals required for project completion.";
const INITIAL_TERMS = "A 50% advance payment is required to commence work. The remaining balance is due upon project completion or as per agreed-upon milestones.";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendStage, setSendStage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const { register, control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      type: 'INVOICE',
      invoiceNo: '',
      date: new Date().toISOString().split('T')[0],
      clientName: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      items: [
        { description: '', qty: 1, price: 0 }
      ],
      scopeOfWork: INITIAL_SCOPE,
      clientResponsibilities: INITIAL_RESP,
      paymentTerms: INITIAL_TERMS,
      subject: 'Vichakra Technologies - Your Document',
      messageText: `We hope you are doing well.

Please find attached the requested document for your kind review. Should you require any further information, clarification, or additional documentation, please feel free to contact us at your convenience.

Thank you for your time and consideration. We sincerely appreciate your association with Vichakra Technologies and remain committed to providing you with the highest level of service.

Yours sincerely,
Vichakra Technologies`,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const handlePreview = async (data) => {
    setIsGenerating(true);
    try {
      const doc = await generateDocument(data);
      window.open(doc.output('bloburl'), '_blank');
    } catch (e) {
      console.error(e);
      setErrorMsg('Error generating preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async (data) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSending(true);
    setSendProgress(0);
    setSendStage('Gathering data...');
    setErrorMsg(null);

    abortControllerRef.current = new AbortController();
    
    const progressInterval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 92) return prev;
        const inc = Math.random() * 12;
        return Math.min(prev + inc, 92);
      });
    }, 500);

    try {
      const doc = await generateDocument(data);
      setSendStage('Generating secure PDF...');
      setSendProgress(45);
      
      const base64Data = doc.output('datauristring');
      setSendStage('Dispatching encrypted email...');
      setSendProgress(75);
      
      await api.post('/admin/document/send', {
        pdfBase64: base64Data,
        email: data.email,
        clientName: data.clientName,
        companyName: data.companyName,
        type: data.type,
        subject: data.subject,
        messageText: data.messageText
      }, {
        signal: abortControllerRef.current.signal
      });

      clearInterval(progressInterval);
      setSendProgress(100);
      setSendStage('Success! Document Sent');
      
      setTimeout(() => {
        setIsSending(false);
        setShowSuccess(true);
      }, 600);
    } catch (e) {
      clearInterval(progressInterval);
      if (e.name === 'CanceledError' || e.name === 'AbortError' || axios.isCancel(e)) {
        console.log('Send operation aborted');
        setIsSending(false);
      } else {
        console.error(e);
        setErrorMsg('Failed to send document. Make sure backend credentials are valid.');
        setIsSending(false);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      <AnimatePresence>
        {isSending && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white rounded-2xl p-6 border-2 border-teal-500/20 shadow-xl relative overflow-hidden bg-gradient-to-br from-white to-teal-50/30">
              <div className="absolute top-0 right-0 p-2">
                <Loader2 size={24} className="text-teal-600 animate-spin opacity-20" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Loader2 size={18} className="text-teal-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{sendStage}</h3>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                          Transferring
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-teal-600">
                          {Math.round(sendProgress)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${sendProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0">
                  <button 
                    type="button"
                    onClick={() => abortControllerRef.current?.abort()}
                    className="px-6 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-all flex items-center gap-2 group shadow-sm"
                  >
                    <X size={16} className="group-hover:rotate-90 transition-transform" />
                    Cancel Sending
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center border border-gray-100 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-6"
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CheckCircle2 size={48} className="text-teal-600" />
              </motion.div>
            </motion.div>
            
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Document Sent Successfully
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 mb-8"
            >
              A copy has been sent securely to the client's inbox.
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setShowSuccess(false)}
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} /> 
              Generate Another
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
          <FileText className="text-teal-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Documents</h1>
          <p className="text-gray-500">Generate and send Invoices, Proformas, and Quotations</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg flex items-center text-sm font-medium bg-red-50 text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <form className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Doc Type</label>
              <select {...register('type')} className="w-full border rounded-lg p-2 text-sm bg-gray-50 font-medium">
                <option value="INVOICE">INVOICE</option>
                <option value="PROFORMA INVOICE">PROFORMA INVOICE</option>
                <option value="QUOTATION">QUOTATION</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Doc No.</label>
              <input {...register('invoiceNo')} placeholder="e.g. INV-001" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
            </div>
            <div className="col-span-2 md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
              <input type="date" {...register('date')} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Client Name</label>
              <input {...register('clientName')} placeholder="Full Name" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name</label>
              <input {...register('companyName')} placeholder="Organization Name" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Client Email</label>
              <input type="email" {...register('email')} placeholder="email@example.com" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Client Phone</label>
              <input {...register('phone')} placeholder="+91 00000 00000" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Client Address</label>
              <input {...register('address')} placeholder="Full Shipping/Billing Address" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
            </div>
          </div>

          <div>
              <motion.button 
                type="button" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => append({ description: '', qty: 1, price: 0 })}
                className="text-xs font-medium text-teal-600 bg-teal-50 px-3 py-1.5 rounded hover:bg-teal-100 flex items-center gap-1 transition-colors"
              >
                <Plus size={14}/> Add Item
              </motion.button>
            </div>
            
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {fields.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-2 items-center"
                  >
                    <input 
                      {...register(`items.${index}.description`)} 
                      placeholder="Description" 
                      className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" 
                    />
                    <input 
                      type="number" 
                      {...register(`items.${index}.qty`)} 
                      placeholder="Qty" 
                      className="w-20 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" 
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input 
                        type="number" 
                        {...register(`items.${index}.price`)} 
                        placeholder="Price" 
                        className="w-32 border rounded-lg p-2 pl-7 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" 
                      />
                    </div>
                    <motion.button 
                      type="button" 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => remove(index)} 
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Scope of Work</label>
              <textarea {...register('scopeOfWork')} placeholder="Define the boundaries of your service..." className="w-full border rounded-lg p-2 text-sm h-16" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Client Responsibilities</label>
              <textarea {...register('clientResponsibilities')} placeholder="What do you need from the client?" className="w-full border rounded-lg p-2 text-sm h-16" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Terms</label>
              <textarea {...register('paymentTerms')} placeholder="Advance, Milestones, Net days..." className="w-full border rounded-lg p-2 text-sm h-16" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Email Dispatch Configuration</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email Subject</label>
              <input {...register('subject')} placeholder="e.g. Invoice from Vichakra Technologies" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email HTML Body</label>
              <textarea {...register('messageText')} placeholder="Type your personalized message here..." className="w-full border rounded-lg p-2 text-sm h-24" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <motion.button 
              type="button" 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit(handlePreview)}
              disabled={isGenerating || showSuccess || isSending}
              className="px-6 py-2.5 rounded-lg bg-white border shadow-sm text-gray-700 font-semibold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Preview PDF
            </motion.button>

            <motion.button 
              type="button" 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit(handleSend)}
              disabled={isSending || showSuccess}
              className="px-6 py-2.5 rounded-lg bg-[#0d9488] text-white shadow-md shadow-teal-500/20 font-semibold text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors ml-auto disabled:opacity-50"
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send Securely to Client
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
