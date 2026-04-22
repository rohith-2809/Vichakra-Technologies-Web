import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, ChevronDown } from 'lucide-react';
import api from '../../api/axios';

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return `Yesterday ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessagesPage() {
  const [projects,        setProjects]        = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [messages,        setMessages]        = useState([]);
  const [content,         setContent]         = useState('');
  const [sending,         setSending]         = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [sendError,       setSendError]       = useState('');
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  // Load projects on mount
  useEffect(() => {
    api.get('/portal/projects').then(({ data }) => {
      setProjects(data.projects);
      if (data.projects.length === 1) setSelectedProject(data.projects[0]._id);
    });
  }, []);

  // Load + poll messages when project selected
  useEffect(() => {
    if (!selectedProject) return;
    const fetchMessages = async () => {
      if (!loading) setLoading(true);
      try {
        const { data } = await api.get(`/portal/messages/${selectedProject}`);
        setMessages(data.messages);
      } catch (_) {}
      setLoading(false);
    };

    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [selectedProject]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!content.trim() || !selectedProject || sending) return;
    setSending(true);
    setSendError('');
    try {
      const { data } = await api.post('/portal/messages', {
        projectId: selectedProject,
        content: content.trim(),
      });
      setMessages(prev => [...prev, data.message]);
      setContent('');
    } catch {
      setSendError('Sorry, your message couldn\'t be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendMessage();
  };

  const selectedProjectName = projects.find(p => p._id === selectedProject)?.title || '';

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 rounded-xl"><MessageSquare size={20} className="text-teal-600" /></div>
            Messages
          </h1>
          <p className="text-sm text-gray-500 mt-1">Chat directly with your Vichakra project manager.</p>
        </div>
        {projects.length > 1 && (
          <div className="relative">
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm font-medium bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-gray-700">
              <option value="">Select project…</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {!selectedProject ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm bg-white/80 rounded-[28px] border border-gray-200/50">
          {projects.length === 0 ? 'No projects assigned yet.' : 'Select a project to view messages.'}
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[28px] overflow-hidden shadow-sm">
          {/* Project banner */}
          <div className="px-5 py-3 border-b border-gray-100 bg-white/60">
            <p className="text-sm font-semibold text-gray-800">{selectedProjectName}</p>
            <p className="text-[12px] text-teal-600 font-medium">Vichakra Technologies</p>
          </div>

          {/* Messages thread */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                  <MessageSquare size={28} className="text-teal-400" />
                </div>
                <p className="font-semibold text-gray-700">No messages yet</p>
                <p className="text-sm text-gray-500 max-w-xs">Send your first message to start a conversation with your project manager.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isClient = msg.senderRole === 'client';
                  return (
                    <motion.div key={msg._id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isClient ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        isClient ? 'bg-gradient-to-br from-teal-500 to-teal-700 text-white' : 'bg-gradient-to-br from-gray-700 to-gray-900 text-white'
                      }`}>
                        {msg.sender?.name?.charAt(0).toUpperCase() || '?'}
                      </div>

                      <div className={`flex flex-col max-w-[72%] ${isClient ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          isClient
                            ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-tr-sm'
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
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
          <div className="p-4 border-t border-gray-100 bg-white/60">
            {sendError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl text-xs mb-3">
                <span className="shrink-0">⚠</span> {sendError}
              </div>
            )}
            <div className="flex items-end gap-3">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type a message… (Ctrl+Enter to send)"
                className="flex-1 resize-none px-4 py-3 text-sm border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all placeholder:text-gray-400 min-h-[46px] max-h-[140px] overflow-y-auto"
                style={{ height: 'auto' }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'; }}
              />
              <button onClick={sendMessage} disabled={!content.trim() || sending}
                className="w-11 h-11 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl flex items-center justify-center transition-all shrink-0 shadow-sm shadow-teal-500/20">
                <Send size={16} />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 text-center">Ctrl+Enter to send · Your team typically replies within a few hours</p>
          </div>
        </div>
      )}
    </div>
  );
}
