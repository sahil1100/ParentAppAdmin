import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Plus, 
  ShieldAlert, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { addBlockedDomain } from '../services/deviceService';

export default function AddDomainModal({ isOpen, onClose, deviceId, onDomainAdded }) {
  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const popularBlocked = [
    'tiktok.com',
    'instagram.com',
    'omegle.com',
    'discord.com',
    'twitch.tv',
    'roblox.com',
    'reddit.com',
    'snapchat.com'
  ];

  const handleAdd = async (e) => {
    e?.preventDefault();
    if (!domainInput.trim()) {
      setError('Please enter a domain');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await addBlockedDomain(deviceId, domainInput);
      setDomainInput('');
      if (onDomainAdded) onDomainAdded();
      onClose();
    } catch (err) {
      console.error("Failed to block domain:", err);
      setError(err.message || 'Failed to block domain');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (domain) => {
    try {
      setLoading(true);
      setError('');
      await addBlockedDomain(deviceId, domain);
      if (onDomainAdded) onDomainAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Block Website</h3>
              <p className="text-xs text-slate-400">Prevent access on child's device</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleAdd} className="py-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Website Domain
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-500 text-sm font-mono">
                https://
              </span>
              <input
                type="text"
                autoFocus
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="instagram.com or badsite.org"
                className="w-full bg-slate-950 text-white font-mono text-sm pl-20 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-slate-600"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Subdomains and URLs are automatically normalized (e.g. <span className="font-mono text-slate-400">www.tiktok.com/tag</span> → <span className="font-mono text-slate-300">tiktok.com</span>)
            </p>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Commonly Blocked Platforms:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {popularBlocked.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => handleQuickAdd(domain)}
                  disabled={loading}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-950 text-slate-300 hover:text-red-400 hover:border-red-500/40 border border-slate-800 rounded-lg transition"
                >
                  + {domain}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/25 transition"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
              <span>Block Domain</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
