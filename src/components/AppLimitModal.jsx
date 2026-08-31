import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Infinity as InfinityIcon, 
  Ban, 
  Check, 
  Layers,
  AlertCircle
} from 'lucide-react';
import { updateAppLimit } from '../services/deviceService';

export default function AppLimitModal({ isOpen, onClose, deviceId, app, onLimitSaved }) {
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [limitMinutes, setLimitMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (app) {
      if (app.limitMinutes === null || app.limitMinutes === undefined) {
        setIsUnlimited(true);
        setLimitMinutes(30);
      } else {
        setIsUnlimited(false);
        setLimitMinutes(app.limitMinutes);
      }
      setError('');
    }
  }, [app, isOpen]);

  if (!isOpen || !app) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const finalLimit = isUnlimited ? null : Math.max(0, parseInt(limitMinutes, 10) || 0);
      await updateAppLimit(deviceId, app.packageName, finalLimit);
      if (onLimitSaved) onLimitSaved(app.packageName, finalLimit);
      onClose();
    } catch (err) {
      console.error("Failed to update limit:", err);
      setError(err.message || 'Failed to save limit.');
    } finally {
      setSaving(false);
    }
  };

  const presetOptions = [
    { label: 'Block (0m)', value: 0 },
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hrs', value: 90 },
    { label: '2 hours', value: 120 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {app.icon ? (
              <img 
                src={app.icon} 
                alt={app.appName} 
                className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg text-white">{app.appName || app.packageName}</h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[220px]">{app.packageName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Usage Stats info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <span className="text-slate-400">Used today:</span>
            <span className="font-bold text-indigo-300">{app.usedMinutesToday || 0} minutes</span>
          </div>

          {/* Unlimited vs Limited Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setIsUnlimited(false)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition ${
                !isUnlimited 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Set Time Limit</span>
            </button>
            <button
              type="button"
              onClick={() => setIsUnlimited(true)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition ${
                isUnlimited 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <InfinityIcon className="w-4 h-4" />
              <span>Unlimited</span>
            </button>
          </div>

          {/* Limit Minutes Selector (only if not unlimited) */}
          {!isUnlimited && (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-semibold text-slate-300">
                Daily Allowed Minutes
              </label>
              
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="1440"
                  value={limitMinutes}
                  onChange={(e) => setLimitMinutes(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-slate-950 text-white font-mono text-lg font-bold px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-medium">
                  minutes / day
                </span>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-400">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {presetOptions.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setLimitMinutes(p.value)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                        Number(limitMinutes) === p.value
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Save Rules</span>
          </button>
        </div>
      </div>
    </div>
  );
}
