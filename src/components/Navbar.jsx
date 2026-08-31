import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Copy, 
  Check, 
  LogOut, 
  Menu, 
  X, 
  Smartphone, 
  LayoutDashboard, 
  Settings,
  Sparkles
} from 'lucide-react';

export default function Navbar({ onToggleMobileMenu, isMobileMenuOpen }) {
  const { adminProfile, currentUser, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopyCode = async () => {
    if (adminProfile?.uniqueCode) {
      await navigator.clipboard.writeText(adminProfile.uniqueCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-slate-800 transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                  ScreenGuard
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-indigo-400 -mt-1">
                  Control Center
                </span>
              </div>
            </Link>
          </div>

          {/* Center / Pairing Code Badge */}
          {adminProfile?.uniqueCode && (
            <div className="flex items-center">
              <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 shadow-inner">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1 justify-end">
                    <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                    Admin Pairing Code
                  </span>
                  <span className="text-xs text-slate-400">Enter this code on child device</span>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg border border-indigo-400/20">
                  <span className="font-['JetBrains_Mono',monospace] font-bold text-base sm:text-lg text-indigo-300 tracking-wider">
                    {adminProfile.uniqueCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition relative"
                    title="Copy pairing code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {copied && (
                  <span className="text-xs font-semibold text-emerald-400 animate-fade-in hidden md:inline">
                    Copied!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-medium text-slate-300 truncate max-w-[150px]">
                {currentUser?.email}
              </span>
              <span className="text-[11px] text-slate-500">Administrator</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-red-500/10 hover:border-red-500/30 border border-slate-800 rounded-xl transition group"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition" />
              <span className="hidden sm:inline group-hover:text-red-300">Sign Out</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
