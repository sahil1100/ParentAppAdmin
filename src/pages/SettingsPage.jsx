import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Copy, 
  Check, 
  KeyRound, 
  Smartphone, 
  Layers, 
  Globe, 
  HelpCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { adminProfile, currentUser } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (adminProfile?.uniqueCode) {
      await navigator.clipboard.writeText(adminProfile.uniqueCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Account & System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your administrator profile and review system pairing guides
        </p>
      </div>

      {/* Admin Profile Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-400" />
          Admin Pairing Credentials
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Admin Account
            </span>
            <div className="text-sm font-semibold text-white truncate">
              {currentUser?.email}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              UID: {currentUser?.uid}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                Active Pairing Code
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-2xl font-black text-indigo-300 tracking-widest">
              {adminProfile?.uniqueCode || '------'}
            </div>
            <div className="text-[11px] text-slate-400">
              Provide this code when setting up the Mobile App on child devices.
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture & Guides */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          How Protection & Enforcement Work
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-400">
              <Layers className="w-4 h-4" />
              <span>App Time Limit Engine</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Uses Android's native <code className="text-indigo-300 font-mono">UsageStatsManager</code> to track the foreground application and count usage minutes. Once a limit is reached, a system alert window overlay (<code className="text-indigo-300 font-mono">SYSTEM_ALERT_WINDOW</code>) intercepts the app and returns the child to the home screen.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <Globe className="w-4 h-4" />
              <span>Website / Domain Blocker</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Uses a local Android <code className="text-indigo-300 font-mono">VpnService</code> (DNS filtering) and browser <code className="text-indigo-300 font-mono">AccessibilityService</code> to drop DNS queries or close tabs navigating to blocked domains across all web browsers without requiring root access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
