import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const TITLE_MAP = {
  '/admin':          'Dashboard',
  '/admin/clients':  'Clients',
  '/admin/projects': 'Projects',
  '/admin/files':    'Files',
  '/admin/status':   'Status Updates',
  '/admin/feedback': 'Feedback',
};

function getTitle(pathname) {
  if (pathname.startsWith('/admin/clients/'))  return 'Client Detail';
  if (pathname.startsWith('/admin/projects/')) return 'Project Detail';
  return TITLE_MAP[pathname] || 'Admin';
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname }              = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader title={getTitle(pathname)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
