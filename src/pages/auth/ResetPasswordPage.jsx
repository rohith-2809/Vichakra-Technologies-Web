import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      email: emailFromState
    }
  });
  const password = watch('password');

  const onSubmit = async ({ email, otp, password }) => {
    setServerError('');
    setIsLoading(true);
    try {
      await api.post(`/auth/resetpassword`, { email, otp, password });
      setIsSuccess(true);
    } catch (err) {
      setServerError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 bg-hero-gradient bg-dot-grid flex items-center justify-center px-4 py-12">
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
              <h1 className="text-xl font-bold text-white tracking-tight">Create New Password</h1>
              <p className="text-sm text-gray-400 mt-0.5">Please enter your OTP and new password</p>
            </div>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/20">
                  <CheckCircle2 size={32} className="text-teal-400" />
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Your password has been successfully reset. You can now login with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Go to login
              </button>
            </motion.div>
          ) : (
            <>
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
                      readOnly={!!emailFromState}
                      placeholder="you@example.com"
                      className={`input-field pl-9 w-full ${emailFromState ? 'opacity-70 cursor-not-allowed' : ''} ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                      {...register('email', { required: 'Email is required' })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className={`input-field pl-9 w-full font-mono text-lg tracking-widest ${errors.otp ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                      {...register('otp', { 
                        required: 'OTP is required',
                        pattern: { value: /^[0-9]{6}$/, message: 'Must be exactly 6 digits' }
                      })}
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-xs text-red-400 mt-1">{errors.otp.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`input-field pl-9 pr-10 w-full ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Must be at least 8 characters' }
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`input-field pl-9 w-full ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                      {...register('confirmPassword', { 
                        required: 'Please confirm password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 mt-4"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Resetting…
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
