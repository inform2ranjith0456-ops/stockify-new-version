import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  highlightColor = 'cyan', // cyan, emerald, amber, rose, blue
}) => {
  const colorStyles = {
    cyan: {
      border: 'hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'group-hover:shadow-glow-cyan',
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: '',
    },
    amber: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: '',
    },
    rose: {
      border: 'hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: '',
    },
    blue: {
      border: 'hover:border-blue-500/50',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'group-hover:shadow-glow-blue',
    },
  };

  const style = colorStyles[highlightColor] || colorStyles.cyan;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-slate-800 bg-navy-850 p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 ${style.border} ${style.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-white">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`rounded-xl border p-3 ${style.iconBg} transition-transform group-hover:scale-105`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold flex items-center gap-1 ${
                trendPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trendPositive ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
