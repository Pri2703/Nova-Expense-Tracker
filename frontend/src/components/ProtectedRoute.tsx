import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          {/* Pulsing glow background */}
          <div className="absolute w-24 h-24 bg-brand-emerald/20 blur-xl rounded-full animate-pulse"></div>
          <div className="absolute w-20 h-20 bg-brand-indigo/20 blur-lg rounded-full animate-pulse delay-75"></div>
          
          {/* Spinning rings */}
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-brand-emerald animate-spin"></div>
          <div className="absolute w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800 border-b-brand-indigo animate-spin animate-reverse duration-1000"></div>
        </div>
        <h2 className="mt-6 text-xl font-display font-semibold text-slate-700 dark:text-slate-200 tracking-wide animate-pulse">
          Entering Nova...
        </h2>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500 font-sans">
          Securing your financial space
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
