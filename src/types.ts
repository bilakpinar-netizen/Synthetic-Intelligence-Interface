export type PipelineStep = 'ingestion' | 'embedding' | 'retrieval' | 'synthesis';

export interface MetricState {
  label: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
  history: number[];
  pingStatus: 'active' | 'warning' | 'idle';
}

export interface StreamNode {
  id: string;
  step: PipelineStep;
  label: string;
  description: string;
  isActive: boolean;
  isConfigurable: boolean;
  parameters: {
    [key: string]: {
      value: number | boolean | string;
      label: string;
      type: 'slider' | 'toggle' | 'select';
      min?: number;
      max?: number;
      step?: number;
    }
  };
}

export interface ProcessingPacket {
  id: string;
  label: string;
  sizeKb: number;
  progress: number; // 0 to 100
  currentStep: PipelineStep | 'completed' | 'failed';
  error?: string;
  durationMs: number;
  timestamp: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  step: PipelineStep | 'system';
  level: 'info' | 'warn' | 'error';
  message: string;
  payloadSize?: number;
  latencyMs?: number;
}

export interface ChatTurn {
  id: string;
  role: 'user' | 'model' | 'system_error';
  parts: { text: string }[];
  timestamp: string;
  modelName?: string;
  latencyMs?: number;
  tokenCount?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
}
