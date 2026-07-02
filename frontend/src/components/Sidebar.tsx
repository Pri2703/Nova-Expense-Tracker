import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Wallet,
  PiggyBank,
  PieChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Savings Goals', path: '/goals', icon: PiggyBank },
    { name: 'Wallets', path: '/wallets', icon: Wallet },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarClasses = `
    fixed md:sticky top-0 left-0 h-screen z-40
    glass-panel border-r border-slate-200/50 dark:border-slate-800/30
    flex flex-col transition-all duration-300 ease-in-out
    ${isOpen ? 'w-64' : 'w-20'}
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header / Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/30">
          <div className="flex items-center gap-3">
            {/* Logo Mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-emerald flex items-center justify-center shadow-lg shadow-brand-indigo/20">
              <span className="font-display font-extrabold text-white text-lg">N</span>
            </div>
            
            {/* Logo Text */}
            {isOpen && (
              <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-indigo to-brand-emerald bg-clip-text text-transparent">
                Nova
              </span>
            )}
          </div>

          {/* Close Mobile Menu Button */}
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl
                font-sans font-medium text-sm transition-all duration-200
                group relative
                ${isActive
                  ? 'bg-gradient-to-r from-brand-indigo/10 to-brand-purple/10 text-brand-indigo dark:text-brand-indigo-light border-l-4 border-brand-indigo'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                }
              `}
            >
              <item.icon size={20} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
              
              {isOpen ? (
                <span className="truncate">{item.name}</span>
              ) : (
                /* Tooltip when collapsed */
                <span className="absolute left-16 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Toggle & Logout */}
        <div className="p-4 border-t border-slate-200/40 dark:border-slate-800/30 space-y-2">
          {/* Collapse toggle (Desktop only) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex items-center justify-center w-full py-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          {/* Logout Action Button */}
          <button
            onClick={logout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-sans font-medium text-sm transition-colors group relative"
          >
            <LogOut size={20} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            {isOpen ? (
              <span>Logout</span>
            ) : (
              <span className="absolute left-16 bg-red-600 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
