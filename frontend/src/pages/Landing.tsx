import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, TrendingUp, Zap, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-hidden relative">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-indigo/10 blur-[120px] dark:bg-brand-indigo/5"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 blur-[120px] dark:bg-brand-emerald/5"></div>

      {/* Landing Top Nav */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-emerald flex items-center justify-center shadow-lg shadow-brand-indigo/20">
            <span className="font-display font-extrabold text-white text-xl">N</span>
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-brand-indigo to-brand-emerald bg-clip-text text-transparent">
            Nova
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2.5 rounded-xl font-sans font-semibold text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-lg shadow-brand-indigo/20 hover:opacity-90 active:scale-95 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 z-10 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Hero Left Text */}
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-indigo/5 dark:bg-brand-indigo/10 border border-brand-indigo/10 dark:border-brand-indigo/20">
            <Sparkles size={14} className="text-brand-indigo dark:text-brand-indigo-light animate-pulse" />
            <span className="text-xs font-semibold text-brand-indigo dark:text-brand-indigo-light tracking-wide uppercase">
              Smart Personal Wealth Tracker
            </span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Take Control of <br />
            <span className="bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-emerald bg-clip-text text-transparent">
              Every Single Rupee.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed">
            Nova is a premium personal finance command center. Seamlessly monitor transactions, establish monthly budgets, fund savings goals, and manage multiple accounts through an intuitive visual experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-emerald text-white font-sans font-bold shadow-xl shadow-brand-indigo/20 hover:shadow-brand-indigo/30 transition-all flex items-center justify-center gap-2 group"
            >
              Start Your Journey <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-sans font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center justify-center"
            >
              Access Dashboard
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center lg:justify-start gap-8 border-t border-slate-200/50 dark:border-slate-800/40 max-w-md">
            <div>
              <span className="block font-display font-bold text-2xl text-slate-950 dark:text-white">100%</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Secure JWT Encryption</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <span className="block font-display font-bold text-2xl text-slate-950 dark:text-white">Live</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Categorical Insights</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <span className="block font-display font-bold text-2xl text-slate-950 dark:text-white">Cloud</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Receipt Image Vault</span>
            </div>
          </div>
        </div>

        {/* Hero Right Visual Presentation Card */}
        <div className="lg:col-span-6 flex justify-center items-center relative">
          
          {/* Animated Glow Halo */}
          <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-brand-indigo to-brand-emerald rounded-full opacity-20 dark:opacity-10 blur-[60px] animate-pulse"></div>

          {/* Floating UI Elements */}
          <div className="relative w-full max-w-md p-6 glass-panel rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 space-y-6 transform hover:rotate-1 hover:scale-[1.02] transition-transform duration-500">
            
            {/* Account Card Mock */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-emerald/10 rounded-full blur-xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">Active Wallet</span>
                  <h4 className="font-display font-bold text-lg text-slate-100">Chase Platinum</h4>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-display font-extrabold text-sm">₹</div>
              </div>
              <div className="pt-2">
                <span className="text-xs text-slate-400">Available Balance</span>
                <div className="font-display font-bold text-3xl tracking-tight text-white">₹84,923.40</div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 font-mono">
                <span>•••• 9842</span>
                <span className="px-2 py-0.5 rounded bg-brand-emerald/20 text-brand-emerald font-sans font-semibold">Active</span>
              </div>
            </div>

            {/* Budget Meter Mock */}
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">🍔 Dining & Food Budget</span>
                <span className="text-slate-400">₹8,420 / ₹10,000</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-brand-emerald rounded-full w-[84%]"></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Spent: 84%</span>
                <span className="text-brand-emerald font-semibold">Under control</span>
              </div>
            </div>

            {/* Recent Transaction Item Mock */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400">Recent Spending</span>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-indigo/10 text-brand-indigo flex items-center justify-center font-display font-bold text-sm">
                    S
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Spotify Premium</h5>
                    <span className="text-[10px] text-slate-400">Entertainment • Today</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-500">-₹179.00</span>
                  <span className="block text-[9px] text-slate-400">Chase Wallet</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-900/50 z-10 relative">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-900 dark:text-white">
            Designed for Modern Finance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nova integrates all the tools you need to govern your monthly financial flows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/30 hover:border-brand-indigo/30 transition-all hover:translate-y-[-4px] duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Insightful Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track category distributions, income vs. expense timelines, and analyze metrics through beautiful charts.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/30 hover:border-brand-indigo/30 transition-all hover:translate-y-[-4px] duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Multi-Wallet Control</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Define multiple wallets representing physical cash, bank accounts, investments, or credit cards.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/30 hover:border-brand-indigo/30 transition-all hover:translate-y-[-4px] duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Secure Encrypted Vault</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All logins, registrations, and token cycles use secure JWT access/refresh structures and bcrypt cryptography.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/30 hover:border-brand-indigo/30 transition-all hover:translate-y-[-4px] duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Receipt Vaults</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload PDF or image invoice files directly to your transactions, storing them safely in Cloudinary/local fallback storage.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-200/40 dark:border-slate-900/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
        <span>© 2026 Nova Finance Platform. Take Control of Every Rupee.</span>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1">
            ⌘ GitHub Project
          </a>
        </div>
      </footer>

    </div>
  );
};
export default Landing;
