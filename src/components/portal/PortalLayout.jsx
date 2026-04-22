import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, MessageSquare, Star,
  LogOut, Menu, X, Zap, MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ChatBot from './ChatBot';
import api from '../../api/axios';

const NAV = [
  { to: '/portal',              icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/portal/requirements', icon: ClipboardList,   label: 'Requirements' },
  { to: '/portal/messages',     icon: MessageCircle,   label: 'Messages',    badge: true },
  { to: '/portal/support',      icon: MessageSquare,   label: 'Support' },
  { to: '/portal/feedback',     icon: Star,            label: 'Feedback' },
];

function NavItems({ onClose, unreadMessages }) {
  return (
    <div className="space-y-0.5">
      {NAV.map(({ to, icon: Icon, label, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClose}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-gradient-to-r from-teal-50 to-transparent text-teal-700 shadow-sm shadow-teal-500/5 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-r-md before:bg-gradient-to-b before:from-teal-400 before:to-teal-600'
                : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={16} className={`shrink-0 ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {label}
              {badge && unreadMessages > 0 && (
                <span className="ml-auto text-[10px] bg-teal-500 text-white rounded-full px-1.5 py-0.5 font-bold">
                  {unreadMessages}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Poll for unread message count
  useEffect(() => {
    const fetchUnread = () =>
      api.get('/portal/messages/unread').then(({ data }) => setUnreadMessages(data.count)).catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 h-screen sticky top-0 bg-white/70 backdrop-blur-2xl border-r border-gray-200/60 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Vichakra</p>
            <p className="text-[10px] text-gray-400 font-medium">Client Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 pt-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-3">Navigation</p>
          <NavItems unreadMessages={unreadMessages} />
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gray-50">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate leading-tight">{user?.company || user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -230 }} animate={{ x: 0 }} exit={{ x: -230 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 h-full w-56 bg-white/95 backdrop-blur-2xl border-r border-gray-200/60 z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                    <Zap size={12} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Client Portal</p>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
                  <X size={16} />
                </button>
              </div>
              <nav className="flex-1 p-3 pt-4">
                <NavItems onClose={() => setMobileOpen(false)} unreadMessages={unreadMessages} />
              </nav>
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Zap size={10} className="text-white" />
            </div>
            <p className="text-sm font-bold text-gray-900">Vichakra</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-[10px] font-bold">
            {initials}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-4xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Chatbot */}
      <ChatBot />
    </div>
  );
}
