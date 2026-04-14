import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium tracking-wide">Restoring session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Redirect to correct portal based on actual role
    return <Navigate to={user.role === 'admin' ? '/admin' : '/portal'} replace />;
  }

  return children;
}
