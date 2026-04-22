import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { login }     = useAuth();
  const navigate      = useNavigate();
  const location      = useLocation();
  const from          = location.state?.from?.pathname;

  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState('');
  const [isLoading,    setIsLoading]    = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      // Redirect: honour intended destination, else role-based default
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/portal', { replace: true });
      }
    } catch (err) {
      setServerError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 bg-hero-gradient bg-dot-grid flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="glass bg-gray-900/80 border border-gray-800 rounded-2xl p-8 shadow-premium">
          {/* Brand header */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-2xl overflow-hidden border border-teal-500/30 bg-gray-900 shadow-[0_0_40px_rgba(20,184,166,0.15)] flex items-center justify-center"
            >
              <img src="/logo.svg" alt="Vichakra" className="w-10 h-10 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            </motion.div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-white tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">Welcome Back</h1>
              <p className="text-sm text-gray-400 mt-1">Sign in to the Vichakra Portal</p>
            </div>
          </div>

          {/* Error banner */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6"
            >
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{serverError}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`input-field pl-9 w-full ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern:  { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors focus:outline-none focus:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input-field pl-9 pr-10 w-full transition-all focus:shadow-[0_0_0_2px_rgba(20,184,166,0.1)] ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-teal-800 disabled:to-teal-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(20,184,166,0.5)]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating…
                </>
              ) : (
                'Secure Sign In'
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <div className="mt-6 p-4 rounded-xl bg-gray-800/30 border border-gray-700/30 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <span className="text-teal-400 font-medium block sm:inline mt-1 sm:mt-0">
                Contact your Vichakra project manager.
              </span>
            </p>
          </div>
        </div>

        {/* Back to site */}
        <div className="text-center mt-4">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-teal-400 transition-colors"
          >
            ← Back to vichakratechnologies.com
          </a>
        </div>
      </motion.div>
    </div>
  );
}
