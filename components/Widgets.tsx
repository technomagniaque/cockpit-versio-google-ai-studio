import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  action?: React.ReactNode;
}

export const DashboardCard: React.FC<CardProps> = ({ title, children, icon: Icon, className = '', action }) => {
  return (
    <div className={`bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg p-4 flex flex-col shadow-lg ${className}`}>
      <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-2">
        <div className="flex items-center gap-2 text-cyan-400">
          {Icon && <Icon size={18} />}
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 min-h-0 relative">
        {children}
      </div>
    </div>
  );
};

interface MetricValueProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export const MetricValue: React.FC<MetricValueProps> = ({ label, value, unit, color = 'text-white' }) => (
  <div className="flex flex-col">
    <span className="text-slate-400 text-xs font-mono uppercase">{label}</span>
    <span className={`text-2xl font-bold font-mono ${color}`}>
      {value}<span className="text-sm text-slate-500 ml-1">{unit}</span>
    </span>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-500 text-white focus:ring-cyan-500 shadow-[0_0_10px_rgba(8,145,178,0.3)]",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500 border border-slate-600",
    danger: "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`} {...props}>
      {children}
    </button>
  );
};
