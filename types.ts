export interface SystemMetric {
  timestamp: string;
  cpuLoad: number;
  memoryUsage: number;
  networkLatency: number;
  temperature: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source: string;
}

export interface AiAnalysisResult {
  status: 'optimal' | 'warning' | 'critical';
  summary: string;
  recommendation: string;
}

export enum NetworkStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  RECONNECTING = 'RECONNECTING'
}
