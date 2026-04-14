import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, BarChart3, ClipboardEdit, LifeBuoy, Sparkles, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

const STEPS = [
  {
    icon: Hand,
    title: 'Welcome to your Portal',
    body: 'This is your dedicated space to track your project with Vichakra Technologies. Everything you need is right here.',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50/50',
  },
  {
    icon: BarChart3,
    title: 'Track your Project',
    body: 'See live progress on your project milestones, status updates from our team, and links to demos as they become available.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50/50',
  },
  {
    icon: ClipboardEdit,
    title: 'Submit your Requirements',
    body: 'Tell us your vision — upload reference images, describe your goals, and specify the features you need. This helps us build exactly what you imagined.',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50/50',
  },
  {
    icon: LifeBuoy,
    title: 'Support & Guidance',
    body: 'Have a question or need help even after the project is delivered? Open a support ticket anytime. We\'re always here.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50/50',
  },
  {
    icon: Sparkles,
    title: 'You\'re all set!',
    body: 'Start by checking your project dashboard or submitting your requirements. Let\'s build something great together.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50/50',
  },
];

export default function OnboardingTutorial({ onComplete }) {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const finish = async () => {
    try { 
      await api.patch('/portal/onboarding-complete'); 
      updateUser({ isFirstLogin: false });
    } catch { /* fail silently */ }
    setDone(true);
    setTimeout(onComplete, 400);
  };

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0 }}
            exit={{ opacity: 0, scale: 0.95,   y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl border border-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative"
          >
            {/* Top glowing ambient effect */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-teal-50/80 to-transparent pointer-events-none" />

            {/* Progress bar */}
            <div className="h-[3px] bg-gray-100/50 w-full relative z-10">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-400 to-teal-600 shadow-[0_0_10px_rgba(20,184,166,0.6)]"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="p-8 pb-7 relative z-10">
              <div className="relative min-h-[180px] flex flex-col items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(8px)' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center absolute inset-x-0 top-0 flex flex-col items-center"
                  >
                    <div className={`w-16 h-16 rounded-2xl ${STEPS[step].bg} flex items-center justify-center mb-5 mx-auto ring-1 ring-black/5 shadow-sm`}>
                      {(() => {
                        const Icon = STEPS[step].icon;
                        return (
                          <div className={`bg-gradient-to-br ${STEPS[step].color} bg-clip-text text-transparent`}>
                            <Icon size={32} strokeWidth={1.5} className="text-current drop-shadow-sm" />
                          </div>
                        );
                      })()}
                    </div>
                    <h2 className="text-[22px] font-bold text-gray-900 mb-2.5 tracking-tight">{STEPS[step].title}</h2>
                    <p className="text-gray-500 text-[15px] leading-relaxed mx-auto max-w-[90%]">{STEPS[step].body}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Step dots */}
              <div className="flex justify-center gap-2 mt-8 mb-8">
                {STEPS.map((_, i) => (
                  <button key={i} onClick={() => setStep(i)}
                    className={`rounded-full transition-all duration-500 ${
                      i === step 
                        ? 'w-6 h-1.5 bg-gradient-to-r from-teal-500 to-teal-400 shadow-[0_2px_8px_rgba(20,184,166,0.5)]' 
                        : i < step 
                          ? 'w-1.5 h-1.5 bg-teal-200' 
                          : 'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300'
                    }`} />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {step === STEPS.length - 1 ? (
                  <motion.button
                    onClick={finish}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-teal-500/25 transition-all"
                  >
                    <CheckCircle2 size={18} /> Get Started
                  </motion.button>
                ) : (
                  <>
                    <button onClick={finish}
                      className="px-5 py-3.5 text-sm font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                      Skip
                    </button>
                    <motion.button
                      onClick={() => setStep((s) => s + 1)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-gray-900/20 transition-all"
                    >
                      Next <ArrowRight size={16} />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
