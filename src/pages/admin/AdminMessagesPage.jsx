import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Users, ChevronRight, X } from 'lucide-react';
import api from '../../api/axios';

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return `Yesterday`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function AdminMessagesPage() {
  const [threads,         setThreads]         = useState([]);
  const [selectedThread,  setSelectedThread]  = useState(null);
  const [messages,        setMessages]        = useState([]);
  const [content,         setContent]         = useState('');
  const [sending,         setSending]         = useState(false);
  const [loading,         setLoading]         = useState(true);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  // Load thread list
  useEffect(() => {
    const load = () => api.get('/admin/messages').then(({ data }) => {
      setThreads(data.threads);
      setLoading(false);
    });
    load();
    pollRef.current = setInterval(load, 8000);
    return () => clearInterval(pollRef.current);
  }, []);

  // Load messages for selected thread
  useEffect(() => {
    if (!selectedThread) return;
    const fetch = async () => {
      const { data } = await api.get(`/admin/messages/${selectedThread._id}`);
      setMessages(data.messages);
      // Mark as read locally
      setThreads(prev => prev.map(t =>
        t.project._id === selectedThread._id ? { ...t, unreadCount: 0 } : t
      ));
    };
    fetch();
    const poll = setInterval(fetch, 5000);
    return () => clearInterval(poll);
  }, [selectedThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!content.trim() || !selectedThread || sending) return;
    setSending(true);
    try {
      const { data } = await api.post('/admin/messages', {
        projectId: selectedThread._id,
        content: content.trim(),
      });
      setMessages(prev => [...prev, data.message]);
      setContent('');
      setThreads(prev => prev.map(t =>
        t.project._id === selectedThread._id
          ? { ...t, lastMessage: data.message }
          : t
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send');
    } finally { setSending(false); }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Thread sidebar */}
      <div className={`w-72 border-r border-gray-100 flex flex-col shrink-0 ${selectedThread ? 'hidden lg:flex' : 'flex'}`}>
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users size={16} className="text-teal-600" /> Client Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-gray-400 text-center">Loading threads…</div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">No messages yet.</div>
          ) : (
            threads.map(({ project, lastMessage, unreadCount }) => (
              <button key={project._id} onClick={() => setSelectedThread(project)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                  selectedThread?._id === project._id ? 'bg-teal-50/60' : ''
                }`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                  {project.client?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-gray-800 truncate">{project.client?.name || 'Client'}</p>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-teal-500 text-white rounded-full px-1.5 py-0.5 font-bold shrink-0 ml-1">{unreadCount}</span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-500 truncate">{project.title}</p>
                  {lastMessage && (
                    <p className="text-[12px] text-gray-400 truncate mt-0.5">{lastMessage.content}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat panel */}
      {!selectedThread ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <MessageSquare size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm">Select a conversation to start replying</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
            <button onClick={() => setSelectedThread(null)} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
              <X size={16} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-[11px] font-bold">
              {selectedThread.client?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{selectedThread.title}</p>
              <p className="text-[12px] text-gray-500">{selectedThread.client?.name} · {selectedThread.client?.email}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No messages in this thread yet.</div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <motion.div key={msg._id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        isAdmin ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white' : 'bg-gradient-to-br from-teal-500 to-teal-700 text-white'
                      }`}>
                        {msg.sender?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className={`flex flex-col max-w-[70%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          isAdmin
                            ? 'bg-gray-900 text-white rounded-tr-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1 px-1">{formatTime(msg.createdAt)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-3 items-end">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(); }}
                rows={1}
                placeholder="Reply as Vichakra… (Ctrl+Enter to send)"
                className="flex-1 resize-none px-4 py-3 text-sm border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:bg-white transition-all placeholder:text-gray-400 max-h-[120px] overflow-y-auto"
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              />
              <button onClick={send} disabled={!content.trim() || sending}
                className="w-11 h-11 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl flex items-center justify-center transition-all shrink-0">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
