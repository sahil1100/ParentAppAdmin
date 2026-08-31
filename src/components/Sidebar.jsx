import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Smartphone, 
  Settings, 
  ShieldCheck, 
  HelpCircle,
  Radio,
  Clock
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, deviceCount = 0, onlineCount = 0 }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/devices', label: 'All Devices', icon: Smartphone, badge: deviceCount },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-16 sm:top-20 bottom-0 left-0 z-40 w-64 bg-slate-950/95 lg:bg-slate-950/50 backdrop-blur-xl border-r border-slate-800/80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between p-4`}
      >
        <div className="space-y-6">
          {/* Navigation Links */}
          <div className="space-y-1.5">
            <span className="px-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Management
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Real-time Status Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Live Status</span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-medium text-emerald-400">Sync Active</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                <div className="text-lg font-bold text-white">{deviceCount}</div>
                <div className="text-[10px] text-slate-400">Total Devices</div>
              </div>
              <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                <div className="text-lg font-bold text-emerald-400">{onlineCount}</div>
                <div className="text-[10px] text-slate-400">Online Now</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>ScreenGuard Core v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
