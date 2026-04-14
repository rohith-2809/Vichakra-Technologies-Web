import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminHeader({ title }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'A';

  return (
    <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-5 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="relative flex items-center gap-3">
        {/* User button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-gray-400 leading-tight">Administrator</p>
          </div>
          <ChevronDown size={12} className={`text-gray-400 transition-transform hidden sm:block ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 top-full mt-3 w-56 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.1)] z-50 overflow-hidden text-left"
              >
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
