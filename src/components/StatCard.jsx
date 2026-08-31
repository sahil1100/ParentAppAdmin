import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-600/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-600/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.indigo}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
