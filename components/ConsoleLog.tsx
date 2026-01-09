import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface ConsoleLogProps {
  logs: LogEntry[];
}

const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      case 'success': return <CheckCircle className="w-3 h-3 text-green-500" />;
      default: return <Info className="w-3 h-3 text-blue-500" />;
    }
  };

  const getColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      case 'success': return 'text-green-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="h-full bg-slate-950/50 rounded border border-slate-800 font-mono text-xs p-2 overflow-y-auto" ref={scrollRef}>
      {logs.length === 0 && <div className="text-slate-600 italic p-2">System initialized. Awaiting events...</div>}
      {logs.map((log) => (
        <div key={log.id} className="flex gap-2 items-start py-1 border-b border-slate-800/50 last:border-0 animate-fade-in">
          <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
          <span className="shrink-0 mt-0.5">{getIcon(log.level)}</span>
          <span className="text-cyan-600 shrink-0 font-bold select-none">{log.source}:</span>
          <span className={`${getColor(log.level)} break-all`}>{log.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ConsoleLog;
