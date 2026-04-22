import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname;

  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState('');
  const [isLoading,    setIsLoading]    = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/portal', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (err.response?.status === 401 || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('credentials')) {
        setServerError('Incorrect email or password. Please check your credentials and try again.');
      } else if (!err.response) {
        setServerError('Unable to connect. Please check your internet connection and try again.');
      } else {
        setServerError('Sorry for the inconvenience — something went wrong on our end. Please try again in a moment.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #134e4a 60%, #0f766e 100%)' }}>
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-10"
          style={{ background: 'radial-gradient(ellipse at bottom, #14b8a6, transparent)' }} />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white"
              style={{ background: 'rgba(20,184,166,0.3)', border: '1px solid rgba(20,184,166,0.4)' }}>V</div>
            <span className="text-white font-bold text-sm tracking-wide">Vichakra Technologies</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Your project,<br />your portal.
          </h2>
          <p className="text-teal-200/70 text-base leading-relaxed max-w-xs">
            Track progress, share feedback, and stay in sync with your team — all in one place.
          </p>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div className="w-8 h-0.5 mb-4" style={{ background: 'linear-gradient(90deg,#14b8a6,transparent)' }} />
          <p className="text-white/50 text-xs leading-relaxed">
            Crafting Digital Excellence since 2024<br />
            <a href="https://www.vichakratechnologies.com" className="text-teal-400/70 hover:text-teal-300 transition-colors">
              www.vichakratechnologies.com
            </a>
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
              style={{ background: 'linear-gradient(135deg,#0f766e,#14b8a6)' }}>V</div>
            <span className="font-bold text-gray-900 text-sm">Vichakra Technologies</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sign in</h1>
            <p className="text-gray-500 text-sm mt-1.5">Welcome back to your client portal.</p>
          </div>

          {/* Error banner */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6"
            >
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 leading-relaxed">{serverError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                      : 'border-gray-200 focus:ring-teal-500/20 focus:border-teal-400'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern:  { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                  })}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <button type="button" onClick={() => navigate('/forgot-password')}
                  className="text-xs font-medium text-teal-600 hover:text-teal-500 transition-colors focus:outline-none">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 text-sm border rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                      : 'border-gray-200 focus:ring-teal-500/20 focus:border-teal-400'
                  }`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white rounded-xl transition-all mt-1 disabled:cursor-not-allowed"
              style={{
                background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #0f766e, #0d9488)',
                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(15,118,110,0.3)',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign In'}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <span className="text-teal-600 font-medium">Contact your Vichakra project manager.</span>
            </p>
            <a href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-teal-600 transition-colors">
              <ArrowLeft size={12} /> Back to vichakratechnologies.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
