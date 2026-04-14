import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FolderKanban, Paperclip,
  Bell, MessageSquare, ChevronLeft, ChevronRight,
  Zap, FileText
} from 'lucide-react';

const SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/admin/clients',  icon: Users,           label: 'Clients' },
      { to: '/admin/projects', icon: FolderKanban,    label: 'Projects' },
      { to: '/admin/documents',icon: FileText,        label: 'Documents' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/files',    icon: Paperclip,       label: 'Files' },
      { to: '/admin/status',   icon: Bell,            label: 'Status Updates' },
    ],
  },
  {
    label: 'Support',
    items: [
      { to: '/admin/support',  icon: MessageSquare,   label: 'Support Tickets' },
      { to: '/admin/feedback', icon: MessageSquare,   label: 'Feedback' },
    ],
  },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`relative h-screen bg-[#0B1120] border-r border-gray-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[60px]' : 'w-56'
      }`}
    >
      {/* Brand */}
      <div className={`flex items-center gap-3 px-3 py-4 border-b border-gray-800/80 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
          <Zap size={14} className="text-[#0B1120] fill-current" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold text-white leading-tight whitespace-nowrap">Vichakra</p>
              <p className="text-[10px] text-gray-500 leading-tight whitespace-nowrap">Admin Panel</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4 scrollbar-hide">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 mb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-widest"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5 px-2">
              {section.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-[linear-gradient(to_right,rgba(20,184,166,0.1),transparent)] border border-teal-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] text-teal-300 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-r before:bg-gradient-to-b before:from-teal-400 before:to-teal-600'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={16}
                        className={`shrink-0 transition-colors ${isActive ? 'text-teal-400' : 'text-gray-500 group-hover:text-gray-300'}`}
                      />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="whitespace-nowrap overflow-hidden"
                          >
                            {label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-gray-800/80">
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-800/70 transition-all text-xs font-medium ${
            collapsed ? '' : 'pl-3 justify-start'
          }`}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={14} /> : (
            <>
              <ChevronLeft size={14} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
