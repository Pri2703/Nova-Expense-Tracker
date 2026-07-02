import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Sun, Moon, Menu, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface TopbarProps {
  setIsMobileOpen: (open: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ setIsMobileOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: '🎉 Welcome to Nova! Set up your first budget to start.', read: false, time: 'Just now' },
    { id: 2, text: '💡 Tip: Link multiple wallets to track bank vs cash balances.', read: false, time: '2 hours ago' },
  ]);

  // Handle document theme application
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('transactions')) return 'Transaction History';
    if (path.includes('budgets')) return 'Budgets & Planning';
    if (path.includes('goals')) return 'Savings Milestones';
    if (path.includes('wallets')) return 'Wallets & Accounts';
    if (path.includes('analytics')) return 'Analytics Reports';
    if (path.includes('settings')) return 'Profile Settings';
    return 'Nova';
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/30">
      
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg md:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-slate-900 dark:text-slate-100">
            {getPageTitle()}
          </h1>
          <p className="hidden md:block text-xs text-slate-400 dark:text-slate-500">
            Hello, {user?.name || 'Guest'} • Welcome back to Nova
          </p>
        </div>
      </div>

      {/* Action utilities & Profile */}
      <div className="flex items-center gap-3">
        
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/30 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/30 transition-colors relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-50 dark:ring-slate-950 animate-ping"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              {/* Overlay Backdrop to click off */}
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              
              <div className="absolute right-0 mt-3 w-80 z-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-sans text-brand-indigo hover:text-brand-indigo-light flex items-center gap-1"
                    >
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 transition-colors ${notif.read ? 'opacity-70' : 'bg-brand-indigo/5 dark:bg-brand-indigo/10'}`}
                      >
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                          {notif.text}
                        </p>
                        <span className="block mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                          {notif.time}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800/60 mx-1"></div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-indigo/20 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center text-white font-display font-bold text-sm shadow-md ring-2 ring-brand-indigo/10">
                {user ? getInitials(user.name) : 'U'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-emerald rounded-full border-2 border-slate-50 dark:border-slate-950"></div>
          </div>
          <div className="hidden lg:block text-left">
            <span className="block font-sans font-semibold text-xs text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
              {user?.name}
            </span>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">
              {user?.email}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
