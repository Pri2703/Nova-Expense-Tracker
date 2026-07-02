import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Sparkles, Check, AlertTriangle, Upload, Eye, EyeOff } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, updateUser, refreshProfile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  // States
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [seedSuccess, setSeedSuccess] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      currency: user?.currency || '₹',
      password: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmitProfile = async (data: any) => {
    setProfileError(null);
    setProfileSuccess(false);
    setProfileLoading(true);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('currency', data.currency);
    if (data.password) {
      formData.append('password', data.password);
    }
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    try {
      const res = await api.put('/api/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      updateUser(res.data);
      setSelectedFile(null);
      setProfileSuccess(true);
      setValue('password', ''); // Clear password field
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Seed Demo Data trigger
  const handleSeedDemoData = async () => {
    if (
      window.confirm(
        'This will replace your current wallets, budgets, goals, and transactions with a premium set of mock data to demonstrate Nova. Do you want to proceed?'
      )
    ) {
      setSeedLoading(true);
      setSeedSuccess(false);
      try {
        await api.post('/api/auth/seed-demo');
        await refreshProfile();
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 3000);
        window.location.reload(); // Reload to refresh all routes
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to seed mock data.');
      } finally {
        setSeedLoading(false);
      }
    }
  };

  // Reset all account data trigger
  const handleWipeAccount = async () => {
    if (
      window.confirm(
        '⚠️ DANGER: This will permanently delete your account data. This action cannot be undone. Are you absolutely sure?'
      )
    ) {
      try {
        await api.delete('/api/auth/wipe-data');
        alert('All data deleted successfully.');
        window.location.reload();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to wipe account data.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Settings & Configurations
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Modify your security credentials, change preferences, or seed demo test logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Card details */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-6">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
              Personal Wealth Profile
            </h3>
            <span className="text-[10px] text-slate-400">Update your security, currency, and credentials</span>
          </div>

          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 text-xs text-brand-emerald font-semibold flex items-center gap-1.5 animate-pulse">
                <Check size={16} /> Profile credentials updated successfully!
              </div>
            )}
            {profileError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/45 text-xs text-red-700 dark:text-red-300 font-medium">
                {profileError}
              </div>
            )}

            {/* Avatar Upload */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-indigo/10 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center text-white font-display font-bold text-xl shadow-md">
                    {user?.name[0]}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">Profile Picture</span>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="avatar-upload"
                  className="px-4 py-2 rounded-xl bg-slate-100/60 dark:bg-slate-950 hover:bg-slate-200/60 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-350 border border-slate-200/50 dark:border-slate-800/60 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                >
                  <Upload size={14} /> {selectedFile ? selectedFile.name : 'Choose File'}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo"
                  {...register('name', { required: 'Name is required' })}
                />
              </div>

              {/* Currency field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Currency Symbol
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo"
                  {...register('currency')}
                >
                  <option value="₹">₹ Indian Rupee (INR)</option>
                  <option value="$">$ US Dollar (USD)</option>
                  <option value="€">€ Euro (EUR)</option>
                  <option value="£">£ British Pound (GBP)</option>
                </select>
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200/40 dark:border-slate-850/20 text-slate-450 text-xs focus:outline-none cursor-not-allowed"
                disabled
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Change Password (Leave blank to keep current)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-indigo"
                  {...register('password', {
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[10px] text-red-500 block">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold font-sans shadow-md hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {profileLoading ? 'Saving changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Developer Seeding Actions & System Preferences */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Seeding Demo card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles size={18} className="text-brand-indigo" /> Sandbox & Demo Setup
              </h3>
              <span className="text-[10px] text-slate-450 font-sans block mt-0.5">Populate widgets with professional demo logs</span>
            </div>

            {seedSuccess && (
              <div className="p-3 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 text-xs text-brand-emerald font-semibold animate-pulse">
                Demo data seeded successfully! Reloading...
              </div>
            )}

            <p className="text-[11px] text-slate-450 leading-relaxed font-sans">
              To preview charts and budgets immediately without manually typing transactions, click the button below. This wipes your current account and seeds Chase Bank Card, Cash, HDFC Card, and 12 recent categoric transaction logs.
            </p>

            <button
              onClick={handleSeedDemoData}
              disabled={seedLoading}
              className="w-full py-3 rounded-xl border border-dashed border-brand-indigo text-brand-indigo hover:bg-brand-indigo/5 text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {seedLoading ? 'Loading sandbox seed...' : 'Seed Sandbox Demo Data'}
            </button>
          </div>

          {/* Wipe Account Data Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-red-500 flex items-center gap-1.5">
                <AlertTriangle size={18} /> Danger Actions Zone
              </h3>
              <span className="text-[10px] text-slate-450 font-sans block mt-0.5">Destructive account modifications</span>
            </div>

            <p className="text-[11px] text-slate-450 leading-relaxed font-sans">
              This will permanently purge your wallets, budgets, savings goals, and transactions from the MongoDB database, leaving your profile blank.
            </p>

            <button
              onClick={handleWipeAccount}
              className="w-full py-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-650 dark:text-red-400 text-xs font-bold font-sans transition-colors border border-red-200 dark:border-red-900/50 cursor-pointer"
            >
              Wipe Account Data Ledger
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Settings;
