import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { ThemeToggle } from './ThemeToggle';
import { Sparkles, Upload, User as UserIcon, LogOut, LayoutDashboard, BookOpen, Menu, X, Home } from 'lucide-react';

interface NavbarProps {
  activeTab: 'landing' | 'dashboard' | 'upload' | 'history' | 'studykit';
  setActiveTab: (tab: 'landing' | 'dashboard' | 'upload' | 'history' | 'studykit') => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenUpload }) => {
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <nav className="relative z-30 flex items-center justify-between px-6 lg:px-12 py-4 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 transition-colors duration-300">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-500 rounded-xl flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-600 dark:from-white dark:via-slate-200 dark:to-indigo-300">
              PrepPilot AI
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-indigo-600 dark:text-indigo-400/80 -mt-1">
              Exam Study Assistant
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-full backdrop-blur-md text-sm font-medium text-slate-700 dark:text-slate-300">
          <button 
            onClick={() => setActiveTab('landing')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeTab === 'landing' 
                ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'history' 
                ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            My Notes
          </button>
        </div>

        {/* Right CTA / Theme toggle / Auth controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          <button
            onClick={onOpenUpload}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full hover:from-indigo-500 hover:to-blue-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 transition-all"
                aria-label="User account menu"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                  {user.displayName?.charAt(0).toUpperCase() || 'S'}
                </div>
                <span className="hidden lg:block text-xs font-medium text-slate-700 dark:text-slate-200 pr-2">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.displayName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg flex items-center gap-2 my-1"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />
                    Student Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('history');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg flex items-center gap-2 my-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    Saved Study Kits
                  </button>
                  <div className="border-t border-slate-200 dark:border-white/10 my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden sticky top-[73px] z-20 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-white/10 backdrop-blur-xl p-4 space-y-3 animate-in slide-in-from-top-2">
          <button
            onClick={() => {
              setActiveTab('landing');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors ${
              activeTab === 'landing'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>

          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            My Saved Notes
          </button>

          <button
            onClick={() => {
              onOpenUpload();
              setMobileMenuOpen(false);
            }}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Upload className="w-4 h-4" />
            Upload PDF Lecture
          </button>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

