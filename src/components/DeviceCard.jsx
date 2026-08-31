import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  Clock,
  ChevronRight,
  ShieldAlert,
  Cpu
} from 'lucide-react';

export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Never';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getBatteryIcon(level) {
  const num = typeof level === 'number' ? level : 100;
  if (num <= 20) return <BatteryLow className="w-4 h-4 text-red-400" />;
  if (num <= 60) return <BatteryMedium className="w-4 h-4 text-amber-400" />;
  return <Battery className="w-4 h-4 text-emerald-400" />;
}

export default function DeviceCard({ device }) {
  const isOnline = Boolean(device.connected);
  const battery = device.batteryLevel !== undefined ? device.batteryLevel : 100;

  return (
    <Link
      to={`/device/${device.id}`}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 shadow-lg hover:shadow-indigo-500/10 transition-all duration-200"
    >
      {/* Top row: Name, online badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${isOnline ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800/60 text-slate-500 border border-slate-700/50'
              }`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 group-hover:text-indigo-300 transition line-clamp-1">
                {device.deviceName && !device.deviceName.includes('Android Device')
                  ? device.deviceName
                  : (device.brand && device.model ? `${device.brand} ${device.model}` : (device.model || device.deviceName || 'Android Device'))
                }
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-3 h-3 text-indigo-400/80" />
                <span>{device.model || 'Android Phone'}</span>
                {device.osVersion && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-500">{device.osVersion.split(' ')[0] + ' ' + (device.osVersion.split(' ')[1] || '')}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Status Dot */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isOnline
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
            }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Device metadata badges */}
        <div className="grid grid-cols-2 gap-2 my-4 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
            {getBatteryIcon(battery)}
            <span className="font-semibold">{battery}%</span>
            <span className="text-[10px] text-slate-500">Battery</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium truncate">{formatTimeAgo(device.lastSeenAt)}</span>
          </div>
        </div>
      </div>

      {/* Card Footer with action link */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs font-medium text-slate-400 group-hover:text-indigo-300 transition">
        <span>Manage Limits & Domains</span>
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
