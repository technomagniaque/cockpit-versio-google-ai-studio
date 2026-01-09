import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Wifi, WifiOff, Cpu, Database, Command, RefreshCw, Zap, ShieldAlert, Bot } from 'lucide-react';
import { SystemMetric, LogEntry, NetworkStatus, AiAnalysisResult } from './types';
import { DashboardCard, MetricValue, Button } from './components/Widgets';
import ChartWidget from './components/ChartWidget';
import ConsoleLog from './components/ConsoleLog';
import { analyzeSystemMetrics } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(NetworkStatus.ONLINE);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastCacheTime, setLastCacheTime] = useState<string | null>(null);

  // --- Helpers ---
  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info', source: string = 'SYS') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      message,
      source
    };
    setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50
  }, []);

  // --- Effects ---

  // 1. Simulate Network Monitoring
  useEffect(() => {
    const handleOnline = () => {
      if (!simulatedOffline) {
        setNetworkStatus(NetworkStatus.ONLINE);
        addLog('Connection restored. Resuming telemetry stream.', 'success', 'NET');
      }
    };
    const handleOffline = () => {
      setNetworkStatus(NetworkStatus.OFFLINE);
      addLog('Carrier signal lost. Switching to local cache.', 'warning', 'NET');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) handleOffline();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [simulatedOffline, addLog]);

  // 2. Simulate System Telemetry Generation
  useEffect(() => {
    const interval = setInterval(() => {
      // If we are "offline", we stop receiving "live" data updates, or we simulate data staleness.
      // For this app, let's keep generating data locally but visually indicate it might be cached/stale if offline
      // actually, a true offline app wouldn't get new server data.
      
      if (networkStatus === NetworkStatus.OFFLINE) {
        return; 
      }

      setMetrics(prev => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Simulate random fluctuation
        const last = prev[prev.length - 1] || { cpuLoad: 30, memoryUsage: 40, temperature: 45 };
        const newCpu = Math.min(100, Math.max(0, last.cpuLoad + (Math.random() * 20 - 10)));
        const newMem = Math.min(100, Math.max(0, last.memoryUsage + (Math.random() * 10 - 5)));
        const newTemp = Math.min(100, Math.max(20, last.temperature + (Math.random() * 5 - 2)));
        const latency = Math.floor(Math.random() * 50) + 10;

        const newMetric: SystemMetric = {
          timestamp: timeStr,
          cpuLoad: Math.round(newCpu),
          memoryUsage: Math.round(newMem),
          temperature: Math.round(newTemp),
          networkLatency: latency
        };

        const newMetrics = [...prev, newMetric];
        if (newMetrics.length > 20) newMetrics.shift(); // Keep last 20 points
        
        setLastCacheTime(now.toLocaleTimeString());
        return newMetrics;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [networkStatus]);

  // --- Handlers ---

  const toggleSimulatedOffline = () => {
    setSimulatedOffline(prev => {
      const nextState = !prev;
      if (nextState) {
        setNetworkStatus(NetworkStatus.OFFLINE);
        addLog('Simulation: Network Interface Disabled manually.', 'warning', 'SIM');
      } else {
        if (navigator.onLine) {
          setNetworkStatus(NetworkStatus.ONLINE);
          addLog('Simulation: Network Interface Enabled.', 'success', 'SIM');
        } else {
          addLog('Simulation disabled, but physical link is still down.', 'error', 'NET');
        }
      }
      return nextState;
    });
  };

  const handleRefreshCache = () => {
    if (networkStatus === NetworkStatus.OFFLINE) {
      addLog('Cache refresh sequence aborted. No uplink detected.', 'error', 'CACHE');
      // Adding a slight delay to the visual feedback to make it feel like a failed attempt
      setTimeout(() => {
        alert("SYSTEM ALERT: Cache Refresh Failed\n\nUnable to synchronize data while the cockpit is offline.\n\nTroubleshooting:\n- Check physical network connection.\n- Verify uplink status.\n- Retry synchronization once connectivity is restored.");
      }, 100);
      return;
    }

    addLog('Cache refreshed successfully from main uplink.', 'success', 'CACHE');
    setLastCacheTime(new Date().toLocaleTimeString());
  };

  const handleAiAnalysis = async () => {
    if (networkStatus === NetworkStatus.OFFLINE) {
      addLog('Cannot contact AI Core: Uplink offline.', 'error', 'AI');
      return;
    }

    if (metrics.length === 0) {
      addLog('Insufficient telemetry data for analysis.', 'warning', 'AI');
      return;
    }

    setIsAnalyzing(true);
    addLog('Transmitting telemetry to Gemini AI Core...', 'info', 'AI');

    try {
      const result = await analyzeSystemMetrics(metrics);
      setAiResult(result);
      
      // Log the result status
      const level = result.status === 'critical' ? 'error' : result.status === 'warning' ? 'warning' : 'success';
      addLog(`Analysis Complete: ${result.summary}`, level, 'AI');
      
    } catch (err) {
      addLog('AI Analysis protocol failed.', 'error', 'AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Render ---

  const currentMetric = metrics[metrics.length - 1] || { cpuLoad: 0, memoryUsage: 0, temperature: 0, networkLatency: 0 };
  const isOffline = networkStatus === NetworkStatus.OFFLINE;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 lg:p-6 overflow-hidden flex flex-col font-sans relative selection:bg-cyan-500/30">
      
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.9),rgba(15,23,42,0.9)),url('https://picsum.photos/1920/1080')] bg-cover bg-center pointer-events-none opacity-20 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMzAsIDQxLCA1OSwgMC4zKSIvPjwvc3ZnPg==')] z-0 pointer-events-none"></div>

      {/* Top Bar */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-700/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-900/50 border border-cyan-500 rounded flex items-center justify-center">
            <Activity className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase font-mono">Cockpit <span className="text-cyan-500">PRO</span></h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest">ORBITAL STATION MONITORING</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Offline Simulation Toggle */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
             <span className="text-xs uppercase text-slate-400 font-mono">Simulate Outage</span>
             <button 
              onClick={toggleSimulatedOffline}
              className={`w-10 h-5 rounded-full relative transition-colors ${simulatedOffline ? 'bg-red-900' : 'bg-slate-600'}`}
             >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${simulatedOffline ? 'left-6 bg-red-400' : 'left-1'}`}></div>
             </button>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded font-mono font-bold border ${isOffline ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-green-900/20 border-green-500/50 text-green-400'}`}>
            {isOffline ? <WifiOff size={18} /> : <Wifi size={18} />}
            <span>{isOffline ? 'OFFLINE' : 'SYSTEM ONLINE'}</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4 min-h-0">
        
        {/* Metric Cards (Top Row) */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardCard title="CPU Load" icon={Cpu} className="bg-slate-800/40">
            <MetricValue label="Core Utilization" value={currentMetric.cpuLoad} unit="%" color="text-cyan-400" />
            <div className="mt-2 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${currentMetric.cpuLoad}%` }}></div>
            </div>
          </DashboardCard>

          <DashboardCard title="Memory" icon={Database} className="bg-slate-800/40">
             <MetricValue label="RAM Usage" value={currentMetric.memoryUsage} unit="%" color="text-violet-400" />
             <div className="mt-2 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
               <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${currentMetric.memoryUsage}%` }}></div>
            </div>
          </DashboardCard>
          
           <DashboardCard title="Thermal" icon={Zap} className="bg-slate-800/40">
             <MetricValue label="Core Temp" value={currentMetric.temperature} unit="°C" color={currentMetric.temperature > 80 ? "text-red-400" : "text-amber-400"} />
              <div className="mt-2 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${currentMetric.temperature}%` }}></div>
            </div>
          </DashboardCard>

          <DashboardCard title="Cache Status" icon={RefreshCw} className="bg-slate-800/40">
             <div className="flex flex-col justify-between h-full">
               <div>
                  <div className="text-xs text-slate-400 uppercase font-mono mb-1">Last Update</div>
                  <div className={`text-lg font-mono font-bold ${isOffline ? 'text-red-400' : 'text-green-400'}`}>
                    {lastCacheTime || '--:--:--'}
                  </div>
                  {isOffline && <div className="text-[10px] text-red-500 mt-1 font-mono">CONNECTION SEVERED</div>}
               </div>
               <button 
                onClick={handleRefreshCache}
                className="mt-2 text-xs flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 py-1 px-2 rounded transition-colors active:scale-95"
               >
                 <RefreshCw size={12} className={isOffline ? "" : "animate-[spin_3s_linear_infinite]"} />
                 FORCE REFRESH
               </button>
             </div>
          </DashboardCard>
        </div>

        {/* AI Side Panel (Right Column, spans 2 rows) */}
        <div className="lg:col-span-1 lg:row-span-2 flex flex-col h-full gap-4">
           <DashboardCard title="AI Copilot" icon={Bot} className="flex-1 flex flex-col">
              <div className="flex-1 bg-slate-900/50 rounded border border-slate-800 p-4 mb-4 relative overflow-hidden">
                {!aiResult && !isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                     <Bot size={48} />
                     <span className="text-xs font-mono uppercase">System Standing By</span>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/80 z-20 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    <span className="text-cyan-400 font-mono text-xs animate-pulse">PROCESSING TELEMETRY...</span>
                  </div>
                )}

                {aiResult && !isAnalyzing && (
                  <div className="space-y-4 animate-fade-in">
                    <div className={`p-2 rounded border font-mono text-center uppercase text-sm font-bold
                      ${aiResult.status === 'optimal' ? 'bg-green-900/30 border-green-600 text-green-400' : 
                        aiResult.status === 'warning' ? 'bg-amber-900/30 border-amber-600 text-amber-400' : 
                        'bg-red-900/30 border-red-600 text-red-400'}`}>
                       STATUS: {aiResult.status}
                    </div>
                    <div>
                      <h4 className="text-xs text-slate-400 uppercase font-mono mb-1">Analysis</h4>
                      <p className="text-sm text-slate-200 leading-relaxed">{aiResult.summary}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-slate-400 uppercase font-mono mb-1">Directive</h4>
                      <p className="text-sm text-cyan-300 font-medium">{aiResult.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleAiAnalysis} 
                disabled={isAnalyzing || isOffline}
                variant={isOffline ? 'secondary' : 'primary'}
                className="w-full flex items-center justify-center gap-2"
              >
                {isOffline ? <WifiOff size={16}/> : <Bot size={16}/>}
                {isOffline ? 'UPLINK REQUIRED' : 'RUN DIAGNOSTICS'}
              </Button>
           </DashboardCard>

           <DashboardCard title="Alerts" icon={ShieldAlert} className="h-1/3">
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                 NO CRITICAL ALERTS
              </div>
           </DashboardCard>
        </div>

        {/* Chart Area (Bottom Row, Left) */}
        <div className="lg:col-span-3 lg:row-span-1 min-h-[300px] flex flex-col gap-4">
          <DashboardCard title="Telemetry History" icon={Activity} className="flex-1">
             <div className="absolute inset-0 top-12 bottom-4 left-4 right-4">
               {isOffline && (
                  <div className="absolute top-2 right-2 z-10 bg-red-900/80 text-red-200 text-[10px] px-2 py-1 rounded font-mono border border-red-500/50 backdrop-blur">
                    LIVE FEED PAUSED // CACHED VIEW
                  </div>
               )}
               <ChartWidget data={metrics} />
             </div>
          </DashboardCard>
        </div>

      </main>

      {/* Footer Console (Bottom) */}
      <footer className="mt-4 relative z-10 h-48">
        <DashboardCard title="System Console" icon={Command} className="h-full bg-black/40">
           <ConsoleLog logs={logs} />
        </DashboardCard>
      </footer>

    </div>
  );
};

export default App;