import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  subscribeDevice, 
  subscribeApps, 
  subscribeBlockedDomains, 
  deleteBlockedDomain, 
  deleteDevice,
  updateAppLimit
} from '../services/deviceService';
import { formatTimeAgo, getBatteryIcon } from '../components/DeviceCard';
import AppLimitModal from '../components/AppLimitModal';
import AddDomainModal from '../components/AddDomainModal';
import SecurityPinManager from '../components/SecurityPinManager';
import { 
  Smartphone, 
  Layers, 
  Globe, 
  Info, 
  Key,
  ArrowLeft, 
  Clock, 
  Battery, 
  Wifi, 
  WifiOff, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Infinity as InfinityIcon,
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Cpu, 
  Calendar,
  Check,
  Ban
} from 'lucide-react';

export default function DeviceDetailPage() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [apps, setApps] = useState([]);
  const [blockedDomains, setBlockedDomains] = useState([]);
  const [activeTab, setActiveTab] = useState('apps'); // 'apps' | 'domains' | 'security' | 'info'
  const [loading, setLoading] = useState(true);

  // App limits search & editing modal
  const [appSearch, setAppSearch] = useState('');
  const [selectedAppForLimit, setSelectedAppForLimit] = useState(null);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Blocked domain modal
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);

  // Delete device confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!deviceId) return;

    const unsubDevice = subscribeDevice(deviceId, (d) => {
      setDevice(d);
      setLoading(false);
    });

    const unsubApps = subscribeApps(deviceId, (appList) => {
      setApps(appList);
    });

    const unsubDomains = subscribeBlockedDomains(deviceId, (domainList) => {
      setBlockedDomains(domainList);
    });

    return () => {
      unsubDevice();
      unsubApps();
      unsubDomains();
    };
  }, [deviceId]);

  const handleDeleteDevice = async () => {
    try {
      setDeleting(true);
      await deleteDevice(deviceId);
      navigate('/');
    } catch (err) {
      console.error("Failed to delete device:", err);
      alert("Failed to unpair device: " + err.message);
      setDeleting(false);
    }
  };

  const handleQuickClearLimit = async (packageName) => {
    try {
      await updateAppLimit(deviceId, packageName, null);
    } catch (err) {
      console.error("Failed to clear limit:", err);
    }
  };

  const handleDeleteDomain = async (domainId) => {
    try {
      await deleteBlockedDomain(deviceId, domainId);
    } catch (err) {
      console.error("Failed to delete domain:", err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Loading Device Details...</p>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <Smartphone className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Device Not Found</h2>
        <p className="text-sm text-slate-400">This device may have been unpaired or deleted.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const isOnline = Boolean(device.connected);
  const battery = device.batteryLevel !== undefined ? device.batteryLevel : 100;
  
  const filteredApps = apps.filter(a => 
    (a.appName || '').toLowerCase().includes(appSearch.toLowerCase()) ||
    (a.packageName || '').toLowerCase().includes(appSearch.toLowerCase())
  );

  const limitedAppsCount = apps.filter(a => a.limitMinutes !== null && a.limitMinutes !== undefined).length;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Devices</span>
        </Link>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Unpair Device</span>
        </button>
      </div>

      {/* Device Header Banner */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${
              isOnline ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}>
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {device.deviceName || 'Android Device'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                  isOnline 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  {isOnline ? 'Connected' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <span>{device.model || 'Unknown Model'}</span>
                <span>•</span>
                <span>{device.osVersion || 'Android'}</span>
              </p>
            </div>
          </div>

          {/* Quick stats pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 text-xs">
              {getBatteryIcon(battery)}
              <span className="font-bold text-white">{battery}%</span>
              <span className="text-slate-500 text-[11px]">Battery</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 text-xs">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-white">{formatTimeAgo(device.lastSeenAt)}</span>
              <span className="text-slate-500 text-[11px]">Last Seen</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="font-bold text-white">{blockedDomains.length}</span>
              <span className="text-slate-500 text-[11px]">Blocked Sites</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 ${
              activeTab === 'apps'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Installed Apps & Limits ({apps.length})</span>
            {limitedAppsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'apps' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-indigo-400'
              }`}>
                {limitedAppsCount} limited
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('domains')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 ${
              activeTab === 'domains'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Website Blocking ({blockedDomains.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>Anti-Uninstall & Security PIN</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 ${
              activeTab === 'info'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Device Info & Logs</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: APPS TAB */}
      {activeTab === 'apps' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">App Time Limits</h2>
              <p className="text-xs text-slate-400">
                Set daily time allowance for each application. App overlay blocker activates when limits are reached.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search apps..."
                className="pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {apps.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800 p-6 space-y-2">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Apps Synced Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Once the child device finishes pairing and grants Usage Access permissions, all installed applications will appear here automatically.
              </p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No apps match "{appSearch}"
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Application</th>
                      <th className="px-4 py-3">Used Today</th>
                      <th className="px-4 py-3">Daily Limit</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredApps.map((app) => {
                      const hasLimit = app.limitMinutes !== null && app.limitMinutes !== undefined;
                      const isBlocked = hasLimit && app.limitMinutes === 0;
                      const isExceeded = hasLimit && (app.usedMinutesToday || 0) >= app.limitMinutes && !isBlocked;

                      return (
                        <tr key={app.packageName} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {app.icon ? (
                                <img
                                  src={app.icon}
                                  alt={app.appName}
                                  className="w-9 h-9 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                  <Layers className="w-4 h-4" />
                                </div>
                              )}
                              <div className="max-w-[200px] sm:max-w-xs">
                                <div className="font-bold text-slate-200 truncate">
                                  {app.appName || app.packageName}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono truncate">
                                  {app.packageName}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">
                                {app.usedMinutesToday || 0}m
                              </span>
                              {hasLimit && (
                                <span className="text-[10px] text-slate-500">
                                  / {app.limitMinutes}m
                                </span>
                              )}
                            </div>
                            {/* Progress bar */}
                            {hasLimit && app.limitMinutes > 0 && (
                              <div className="w-24 h-1.5 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800">
                                <div 
                                  className={`h-full rounded-full ${
                                    isExceeded ? 'bg-red-500' : (app.usedMinutesToday / app.limitMinutes > 0.8) ? 'bg-amber-500' : 'bg-indigo-500'
                                  }`}
                                  style={{ width: `${Math.min(100, ((app.usedMinutesToday || 0) / app.limitMinutes) * 100)}%` }}
                                />
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            {isBlocked ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                                <Ban className="w-3 h-3" />
                                Blocked
                              </span>
                            ) : hasLimit ? (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                isExceeded 
                                  ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {app.limitMinutes} min/day
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60">
                                <InfinityIcon className="w-3 h-3" />
                                Unlimited
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedAppForLimit(app);
                                  setIsLimitModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold rounded-lg border border-indigo-500/30 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{hasLimit ? 'Edit' : 'Set Limit'}</span>
                              </button>

                              {hasLimit && (
                                <button
                                  onClick={() => handleQuickClearLimit(app.packageName)}
                                  className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition"
                                  title="Clear limit (Make Unlimited)"
                                >
                                  <InfinityIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: DOMAIN BLOCKING TAB */}
      {activeTab === 'domains' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Blocked Websites & Domains</h2>
              <p className="text-xs text-slate-400">
                Child device VPN / accessibility filter drops connections to these domains across all browsers.
              </p>
            </div>

            <button
              onClick={() => setIsAddDomainOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Block Website</span>
            </button>
          </div>

          {blockedDomains.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800 p-6 space-y-3">
              <Globe className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Websites Blocked</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add domains like <span className="font-mono text-slate-300">instagram.com</span> or <span className="font-mono text-slate-300">tiktok.com</span> to immediately prevent browsing on the child device.
              </p>
              <button
                onClick={() => setIsAddDomainOpen(true)}
                className="px-4 py-2 bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-bold rounded-xl hover:bg-red-600/30 transition"
              >
                + Add First Blocked Domain
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {blockedDomains.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-red-500/20 shadow-md group hover:border-red-500/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs text-slate-200 group-hover:text-red-300 transition">
                        {item.domain}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Blocked {formatTimeAgo(item.blockedAt)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteDomain(item.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Unblock this website"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: ANTI-UNINSTALL & SECURITY PIN TAB */}
      {activeTab === 'security' && (
        <SecurityPinManager device={device} deviceId={deviceId} />
      )}

      {/* SECTION 4: DEVICE INFO & HARDWARE TAB */}
      {activeTab === 'info' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device Hardware Spec */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Hardware & System
              </h3>
              <div className="space-y-2 text-xs divide-y divide-slate-800">
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Device Name</span>
                  <span className="font-semibold text-white">{device.deviceName || 'Android'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Device Model</span>
                  <span className="font-mono text-white">{device.model || 'Unknown'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Operating System</span>
                  <span className="text-white">{device.osVersion || 'Android'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Battery Status</span>
                  <span className="font-bold text-emerald-400">{battery}%</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Device ID</span>
                  <span className="font-mono text-[11px] text-slate-500 truncate max-w-[180px]">{device.id}</span>
                </div>
              </div>
            </div>

            {/* Connection & Pairing History */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Connectivity & Activity
              </h3>
              <div className="space-y-2 text-xs divide-y divide-slate-800">
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Heartbeat State</span>
                  <span className={`font-semibold ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isOnline ? 'Active (Heartbeat OK)' : 'Offline / Inactive'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Last Synced</span>
                  <span className="text-white">{formatTimeAgo(device.lastSeenAt)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Paired Date</span>
                  <span className="text-white">{formatTimeAgo(device.pairedAt)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Enforcement Engine</span>
                  <span className="text-indigo-400 font-semibold">UsageStats + VpnService</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log Placeholder / Timeline */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Recent Security Events
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div className="flex-1">
                  <span className="text-slate-300 font-medium">Heartbeat synchronization verified</span>
                </div>
                <span className="text-[10px] text-slate-500">{formatTimeAgo(device.lastSeenAt)}</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <div className="flex-1">
                  <span className="text-slate-300 font-medium">Installed applications scan & limits policy applied</span>
                </div>
                <span className="text-[10px] text-slate-500">Live</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Limit Modal */}
      <AppLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => {
          setIsLimitModalOpen(false);
          setSelectedAppForLimit(null);
        }}
        deviceId={deviceId}
        app={selectedAppForLimit}
      />

      {/* Add Domain Modal */}
      <AddDomainModal
        isOpen={isAddDomainOpen}
        onClose={() => setIsAddDomainOpen(false)}
        deviceId={deviceId}
      />

      {/* Unpair Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Unpair Device?</h3>
            <p className="text-xs text-slate-400">
              This will remove <span className="text-white font-semibold">{device.deviceName}</span> from your account. The mobile app will be disconnected and will require re-pairing.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDevice}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition"
              >
                {deleting ? 'Unpairing...' : 'Yes, Unpair'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
