import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  RefreshCw, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Lock, 
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { updateDeviceSecurityPin, toggleTamperProtection, generateRandomSecurityPin } from '../services/deviceService';

export default function SecurityPinManager({ device, deviceId }) {
  const [showPin, setShowPin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customPin, setCustomPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const currentPin = device?.securityPin || '123456';
  const isTamperActive = device?.tamperProtectionEnabled !== false; // Default true

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegeneratePin = async () => {
    try {
      setSaving(true);
      const newPin = generateRandomSecurityPin();
      await updateDeviceSecurityPin(deviceId, newPin);
      setStatusMsg({ type: 'success', text: `New PIN ${newPin} generated and synced to device!` });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('Failed to regenerate PIN:', err);
      setStatusMsg({ type: 'error', text: 'Failed to update PIN: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustomPin = async (e) => {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(customPin)) {
      setStatusMsg({ type: 'error', text: 'PIN must be between 4 and 8 digits (e.g. 6-digit PIN).' });
      return;
    }

    try {
      setSaving(true);
      await updateDeviceSecurityPin(deviceId, customPin);
      setIsEditingCustom(false);
      setCustomPin('');
      setStatusMsg({ type: 'success', text: 'Custom Security PIN saved and synced to child device!' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save custom PIN:', err);
      setStatusMsg({ type: 'error', text: 'Failed to update PIN: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTamper = async () => {
    try {
      setSaving(true);
      await toggleTamperProtection(deviceId, !isTamperActive);
      setStatusMsg({ 
        type: 'success', 
        text: !isTamperActive ? 'Anti-Uninstall Shield Activated!' : 'Anti-Uninstall Shield Paused.' 
      });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('Failed to toggle tamper protection:', err);
      setStatusMsg({ type: 'error', text: 'Failed to update setting: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Anti-Uninstall & App Deletion Protection</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Require a unique Admin Security Code whenever someone attempts to delete the app, clear data, or disable parental filters on this device.
          </p>
        </div>

        {/* Protection Toggle Switch */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shrink-0">
          <span className="text-xs font-semibold text-slate-300">
            {isTamperActive ? 'Protection Active' : 'Protection Disabled'}
          </span>
          <button
            onClick={handleToggleTamper}
            disabled={saving}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              isTamperActive ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              isTamperActive ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' 
            : 'bg-red-500/10 border border-red-500/20 text-red-300'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Security PIN Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PIN Display & Actions Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Unique Device Security PIN</h3>
                <p className="text-[11px] text-slate-400">Unique access code assigned to {device?.deviceName || 'this device'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPin(!showPin)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
                title={showPin ? 'Hide PIN' : 'Reveal PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy PIN'}</span>
              </button>
            </div>
          </div>

          {/* Large Digit Display */}
          <div className="py-6 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap max-w-full">
              {(showPin ? currentPin : '••••••').split('').map((char, idx) => (
                <div 
                  key={idx}
                  className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-950/90 border border-indigo-500/30 flex items-center justify-center text-xl sm:text-2xl font-black text-indigo-300 shadow-inner shadow-indigo-950/50"
                >
                  {char}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 text-center max-w-md px-2">
              Enter this code directly on the child device whenever prompted by the <strong>ScreenGuard Lock Screen</strong> to allow maintenance or legitimate uninstallation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleRegeneratePin}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
              <span>Generate New Random PIN</span>
            </button>

            {!isEditingCustom ? (
              <button
                onClick={() => setIsEditingCustom(true)}
                className="text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Set Custom PIN →
              </button>
            ) : (
              <form onSubmit={handleSaveCustomPin} className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={8}
                  value={customPin}
                  onChange={(e) => setCustomPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-8 digits"
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 w-32"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditingCustom(false); setCustomPin(''); }}
                  className="text-xs text-slate-400 hover:text-white px-1"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Protection Information & Safeguards Checklist */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Active Safeguards</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Device Administrator</strong>
                <span className="text-slate-400">Natively disables standard Android uninstall button in Launcher & Play Store.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">App Info Interception</strong>
                <span className="text-slate-400">Blocks child from accessing Android Settings to Clear Data or Force Stop.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">5-Minute Maintenance Mode</strong>
                <span className="text-slate-400">Entering the PIN grants temporary access for legitimate parent adjustments.</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-2 text-[11px] text-indigo-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>If the child forgets or guesses the code incorrectly 3 times, the device automatically exits back to the Home screen.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
