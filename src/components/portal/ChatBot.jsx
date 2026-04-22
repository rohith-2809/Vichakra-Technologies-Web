import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, RotateCcw, CheckCircle2, ChevronRight } from 'lucide-react';

// The scripted conversation tree
const BOT_QUESTIONS = [
  {
    id: 'projectType',
    text: "Hi! I'm the Vichakra assistant 👋 Let's get your project started. What kind of project are you looking to build?",
    options: ['Landing Page', 'Corporate Website', 'E-Commerce Store', 'Web Application', 'Mobile App', 'Something Else'],
    field: 'projectType',
    freeText: false,
  },
  {
    id: 'brandPersonality',
    text: "Great choice! How would you describe your brand's personality?",
    options: ['Professional & Corporate', 'Bold & Creative', 'Minimal & Clean', 'Playful & Fun', 'Luxury & Premium', 'Eco & Earthy'],
    field: 'brandStyle',
    freeText: false,
  },
  {
    id: 'audience',
    text: "Who is your primary target audience? Describe them briefly.",
    field: 'targetAudience',
    freeText: true,
    placeholder: 'e.g. Small business owners aged 30–50 looking for...',
  },
  {
    id: 'competitors',
    text: "Do you have any competitors or websites whose design you admire? Share one or two links or names.",
    field: 'competitors',
    freeText: true,
    placeholder: 'e.g. apple.com, notion.so',
  },
  {
    id: 'features',
    text: "What are the 3 most important features your project absolutely must have?",
    field: 'features',
    freeText: true,
    placeholder: 'e.g. User login, Payment gateway, Mobile-friendly design',
  },
  {
    id: 'vision',
    text: "In your own words, describe the overall vision for this project. What problem does it solve?",
    field: 'vision',
    freeText: true,
    placeholder: 'Tell us your vision...',
  },
  {
    id: 'additionalNotes',
    text: "Almost done! Any final thoughts, special requirements, or anything else you'd like your project manager to know?",
    field: 'additionalNotes',
    freeText: true,
    placeholder: 'Any other notes...',
  },
];

export default function ChatBot({ onAutoFill }) {
  const [isOpen,    setIsOpen]    = useState(false);
  const [qIndex,    setQIndex]    = useState(0);
  const [chat,      setChat]      = useState([]);
  const [answers,   setAnswers]   = useState({});
  const [input,     setInput]     = useState('');
  const [done,      setDone]      = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const bottomRef = useRef(null);

  // Initialize with first bot message
  useEffect(() => {
    if (isOpen && chat.length === 0) {
      setChat([{ from: 'bot', text: BOT_QUESTIONS[0].text }]);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const currentQ = BOT_QUESTIONS[qIndex];

  const recordAnswer = (answer) => {
    const newAnswers = { ...answers, [currentQ.field]: answer };
    setAnswers(newAnswers);

    const userMsg = { from: 'user', text: answer };
    const next = qIndex + 1;

    if (next >= BOT_QUESTIONS.length) {
      // All done
      setChat(prev => [...prev, userMsg, { from: 'bot', text: "Thanks! 🎉 I've gathered all the info. Here's a quick summary of what I collected. Shall I auto-fill your Requirements form with this?" }]);
      setDone(true);
    } else {
      setChat(prev => [...prev, userMsg, { from: 'bot', text: BOT_QUESTIONS[next].text }]);
      setQIndex(next);
    }
    setInput('');
  };

  const handleOptionClick = (option) => recordAnswer(option);

  const handleSend = () => {
    if (!input.trim()) return;
    recordAnswer(input.trim());
  };

  const handleAutoFill = () => {
    if (onAutoFill) {
      onAutoFill(answers);
    }
    setChat(prev => [...prev, { from: 'bot', text: "✅ Done! I've pre-filled your Requirements form. Head over to the Requirements tab to review and submit. Good luck!" }]);
  };

  const reset = () => {
    setChat([{ from: 'bot', text: BOT_QUESTIONS[0].text }]);
    setQIndex(0);
    setAnswers({});
    setInput('');
    setDone(false);
  };

  // Summary card
  const SummaryCard = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 my-2 text-[12px] space-y-1.5">
      {Object.entries(answers).map(([key, val]) => (
        <div key={key} className="flex gap-2">
          <span className="text-gray-500 font-semibold capitalize shrink-0">{key.replace(/([A-Z])/g, ' $1')}:</span>
          <span className="text-gray-800 truncate">{val}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Floating trigger */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {!isOpen && hasUnread && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-2.5 text-sm font-semibold text-gray-800 max-w-[200px] text-right"
          >
            👋 Need help filling out the form?
            <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45" />
          </motion.div>
        )}

        <button
          onClick={() => { setIsOpen(o => !o); setHasUnread(false); }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <AnimatePresence mode="wait">
            <motion.div key={isOpen ? 'x' : 'bot'}
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }} animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }} transition={{ duration: 0.2 }}>
              {isOpen ? <X size={22} /> : <Bot size={22} />}
            </motion.div>
          </AnimatePresence>
          {hasUnread && !isOpen && (
            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] bg-white/90 backdrop-blur-xl rounded-[24px] border border-gray-200 shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '520px' }}
          >
            {/* Bot header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-gradient-to-r from-teal-600 to-teal-700">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Vichakra Assistant</p>
                <p className="text-[11px] text-teal-200">I'll help you fill the requirements form</p>
              </div>
              <button onClick={reset} className="text-teal-200 hover:text-white transition-colors p-1" title="Restart">
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chat.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`flex gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.from === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shrink-0">
                      <Bot size={13} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.from === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    {/* Show summary after last answer */}
                    {done && i === chat.length - 1 && msg.from === 'bot' && <SummaryCard />}
                  </div>
                </motion.div>
              ))}

              {/* Option pills */}
              {!done && currentQ && !currentQ.freeText && chat[chat.length - 1]?.from === 'bot' && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentQ.options?.map(opt => (
                    <button key={opt} onClick={() => handleOptionClick(opt)}
                      className="px-3 py-1.5 text-[12px] font-medium bg-white border border-teal-300 text-teal-700 rounded-full hover:bg-teal-50 hover:border-teal-500 transition-all flex items-center gap-1">
                      {opt} <ChevronRight size={10} />
                    </button>
                  ))}
                </div>
              )}

              {/* Auto-fill button */}
              {done && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  onClick={handleAutoFill}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-[13px] font-bold rounded-xl hover:from-teal-500 hover:to-teal-400 transition-all shadow-md shadow-teal-500/20"
                >
                  <CheckCircle2 size={15} /> Yes, auto-fill my Requirements form!
                </motion.button>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input — only show for free-text questions */}
            {!done && currentQ?.freeText && (
              <div className="px-3 pb-3 border-t border-gray-100 pt-3 bg-white/80">
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={currentQ.placeholder || 'Type your answer…'}
                    className="flex-1 px-3 py-2 text-[13px] border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                  />
                  <button onClick={handleSend} disabled={!input.trim()}
                    className="w-9 h-9 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
