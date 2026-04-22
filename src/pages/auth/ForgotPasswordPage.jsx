import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setServerError('');
    setIsLoading(true);
    try {
      await api.post('/auth/forgotpassword', { email });
      // Redirect directly to the reset password page, passing the email in state
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
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
        <div className="glass bg-gray-900/80 border border-gray-800 rounded-2xl p-8 shadow-premium">
          {/* Brand header */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-teal-600 shadow-brand-md">
              <img src="/logo.svg" alt="Vichakra" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white tracking-tight">Reset Password</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Enter your email to receive a 6-digit OTP
              </p>
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
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending OTP…
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </motion.button>
              </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-400 transition-colors"
          >
            <ArrowLeft size={16} /> Back to login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
