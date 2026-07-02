import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password');

  const onSubmit = async (data: any) => {
    setApiError(null);
    setLoading(true);
    try {
      await signup(data.name, data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(err.message || 'Onboarding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-indigo/10 blur-[150px] dark:bg-brand-indigo/5"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-brand-emerald/10 blur-[150px] dark:bg-brand-emerald/5"></div>

      <div className="w-full max-w-md space-y-8 z-10 animate-scale-in">
        
        {/* Header / Intro */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-emerald flex items-center justify-center shadow-xl shadow-brand-indigo/20">
              <span className="font-display font-extrabold text-white text-2xl">N</span>
            </div>
          </Link>
          <div>
            <h2 className="font-display font-bold text-3xl text-slate-900 dark:text-white tracking-tight">
              Create an Account
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-sans mt-1">
              Begin managing your budgets and cash flows today
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8 rounded-3xl glass-panel border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-950/5 dark:shadow-black/30">
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* API Level Error Alert */}
            {apiError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-start gap-3 animate-pulse">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <span className="text-xs font-sans text-red-700 dark:text-red-300 font-medium">
                  {apiError}
                </span>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Priya Sharma"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-850/50 focus:border-brand-indigo focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm font-sans focus:outline-none transition-all ${
                    errors.name ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must contain at least 2 characters',
                    },
                  })}
                />
              </div>
              {errors.name && (
                <span className="text-[10px] font-sans font-medium text-red-500 block pl-1">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="priya@example.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-850/50 focus:border-brand-indigo focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm font-sans focus:outline-none transition-all ${
                    errors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Please check your email formatting',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <span className="text-[10px] font-sans font-medium text-red-500 block pl-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-850/50 focus:border-brand-indigo focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm font-sans focus:outline-none transition-all ${
                    errors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[10px] font-sans font-medium text-red-500 block pl-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-850/50 focus:border-brand-indigo focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm font-sans focus:outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (val) => val === passwordVal || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] font-sans font-medium text-red-500 block pl-1">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-emerald text-white font-sans font-bold shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/25 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? 'Registering...' : 'Register'}
              {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

        </div>

        {/* Bottom Navigation */}
        <p className="text-center font-sans text-xs text-slate-400 dark:text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-indigo hover:text-brand-indigo-light transition-colors"
          >
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};
export default Register;
