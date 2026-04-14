import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export default function NotFoundPage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const home = user?.role === 'admin' ? '/admin'
             : user?.role === 'client' ? '/portal'
             : '/';

  return (
    <div className="min-h-screen bg-gray-950 bg-hero-gradient bg-dot-grid flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <p className="text-8xl font-extrabold gradient-text mb-4">404</p>
        <h1 className="text-xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-gray-400 text-sm mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white rounded-xl text-sm font-medium transition-colors">
            Go back
          </button>
          <Link to={home}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition-colors">
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
