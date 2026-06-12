import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Layers,
  Cpu,
  History,
  Terminal,
  Activity,
  Network,
  Clock,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { LogEntry, PipelineStep } from './types';
import DashboardHome from './components/DashboardHome';
import Orchestrator from './components/Orchestrator';
import Playground from './components/Playground';
import LogsTable from './components/LogsTable';
import StatusIndicator from './components/StatusIndicator';
import SettingsWorkspace from './components/SettingsWorkspace';
import LoginGate from './components/LoginGate';

export default function App() {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'orchestrator' | 'playground' | 'logs' | 'settings'>('telemetry');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('synthetic_logged_in') === 'true');
  const [operator, setOperator] = useState(() => localStorage.getItem('synthetic_operator_name') || 'Elena Volkov');
  const [apiKeys, setApiKeys] = useState(() => {
    const cached = localStorage.getItem('synthetic_api_keys');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        // Fallback
      }
    }
    return { gemini: '', openai: '', claude: '' };
  });

  const [simulationSpeed, setSimulationSpeed] = useState(4);
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Generate initial static records so the logs table looks professional on load
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const arr: LogEntry[] = [];
    const baseTime = Date.now();
    
    const steps = ['ingestion', 'embedding', 'retrieval', 'synthesis', 'system'] as const;
    const actions = [
      { step: 'ingestion', msg: 'Data packet received, calculating vector payload stream indices', level: 'info' },
      { step: 'embedding', msg: 'Generated 1536-dim mathematical text embeddings', level: 'info' },
      { step: 'retrieval', msg: 'Semantic similarity match successful in vector index index_01', level: 'info' },
      { step: 'synthesis', msg: 'Prompt synthesis query compiled with temperature=0.7', level: 'info' },
      { step: 'system', msg: 'Completed automated garbage clearance on index cache tables', level: 'info' },
      { step: 'retrieval', msg: 'Distance match threshold near-miss warning (distance=0.74)', level: 'warn' },
      { step: 'synthesis', msg: 'Completed core model prompt routing', level: 'info' }
    ];

    for (let i = 25; i >= 1; i--) {
      const idx = Math.floor(Math.random() * actions.length);
      const acts = actions[idx];
      const payloadSize = acts.step === 'ingestion' || acts.step === 'embedding' ? Math.floor(Math.random() * 400) + 50 : undefined;
      const latencyMs = acts.step !== 'system' ? Math.floor(Math.random() * 60) + 12 : undefined;
      
      arr.push({
        id: `log-seed-${i}`,
        timestamp: new Date(baseTime - i * 45000).toLocaleTimeString(),
        nodeId: `node-${acts.step === 'system' ? 'sys' : acts.step.substring(0, 3)}-${Math.floor(Math.random() * 800) + 100}`,
        step: acts.step as PipelineStep | 'system',
        level: acts.level as 'info' | 'warn' | 'error',
        message: acts.msg,
        payloadSize,
        latencyMs
      });
    }
    return arr;
  });

  // Clock Update Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // System continuous state injection loop when stream is active
  useEffect(() => {
    if (!streamEnabled) return;

    const interval = setInterval(() => {
      const steps = ['ingestion', 'embedding', 'retrieval', 'synthesis', 'system'] as const;
      const stepIdx = Math.floor(Math.random() * steps.length);
      const chosenStep = steps[stepIdx];

      let msg = "";
      let level: 'info' | 'warn' | 'error' = 'info';
      let payloadSize = undefined;
      let latencyMs = undefined;

      // Choose message dynamically
      switch (chosenStep) {
        case 'ingestion':
          msg = `Sourced stream token segment package: size=${Math.floor(Math.random() * 300) + 20}KB`;
          payloadSize = Math.floor(Math.random() * 300) + 50;
          latencyMs = Math.floor(Math.random() * 20) + 5;
          break;
        case 'embedding':
          msg = `Tensor engine vectorized token array batch [size=32]`;
          latencyMs = Math.floor(Math.random() * 45) + 10;
          break;
        case 'retrieval':
          if (Math.random() > 0.85) {
            msg = `RAG retrieval Cosine similarity threshold near drift limit (score=0.72)`;
            level = 'warn';
          } else {
            msg = `Vector retriever fetched top-k match keys safely`;
          }
          latencyMs = Math.floor(Math.random() * 30) + 8;
          break;
        case 'synthesis':
          msg = `Gemini synthesis generation compiled with responseMime=text/plain`;
          latencyMs = Math.floor(Math.random() * 120) + 50;
          break;
        case 'system':
          msg = `Synchronized logical pipeline clusters. System load average ok (12%)`;
          break;
      }

      addLogEntry(msg, `feed-${chosenStep.substring(0,3)}-${Math.floor(Math.random()*100)}`, level, chosenStep, payloadSize, latencyMs);
    }, 4500 - simulationSpeed * 300); // speed controls interval rate

    return () => clearInterval(interval);
  }, [streamEnabled, simulationSpeed]);

  const addLogEntry = (
    message: string,
    nodeId: string,
    level: 'info' | 'warn' | 'error' = 'info',
    step: any = 'system',
    payloadSize?: number,
    latencyMs?: number
  ) => {
    const newLogItem: LogEntry = {
      id: `live-log-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      nodeId,
      step,
      level,
      message,
      payloadSize,
      latencyMs
    };
    setLogs((prev) => [...prev, newLogItem]);
  };

  // Safe wrapper passed to components
  const handleAddLogFromWorker = (
    message: string,
    nodeId: string,
    level: 'info' | 'warn' | 'error',
    latency?: number
  ) => {
    // Map node ID prefixes to pipeline categories
    let mappedStep: any = 'system';
    if (nodeId.includes('ingest') || nodeId.includes('dataloader')) mappedStep = 'ingestion';
    else if (nodeId.includes('emb') || nodeId.includes('tensor')) mappedStep = 'embedding';
    else if (nodeId.includes('retrieval') || nodeId.includes('rag')) mappedStep = 'retrieval';
    else if (nodeId.includes('gemini') || nodeId.includes('synthesis')) mappedStep = 'synthesis';
    
    addLogEntry(message, nodeId, level, mappedStep, undefined, latency);
  };

  if (!isLoggedIn) {
    return (
      <LoginGate
        onLogin={(operatorName, role) => {
          setIsLoggedIn(true);
          localStorage.setItem('synthetic_logged_in', 'true');
          localStorage.setItem('synthetic_operator_name', operatorName);
          setOperator(operatorName);
          addLogEntry(`Operator session authorized: [${operatorName} (${role})]`, 'security-vault', 'info', 'system', undefined, undefined);
        }}
      />
    );
  }

  return (
    <div id="ai-applet-shell" className="min-h-screen bg-brand-bg text-brand-text flex overflow-hidden relative">
      
      {/* Mesh Gradient Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/15 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-pink-500/8 blur-[100px]"></div>
      </div>
      
      {/* 280px command side panel - Desktop layout */}
      <aside
        id="cluster-side-navigation"
        className={`fixed top-0 bottom-0 left-0 z-40 w-[280px] bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between p-6 transition-transform duration-300 xl:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        } z-[100]`}
      >
        <div className="flex flex-col gap-8">
          
          {/* Logo Brand Header */}
          <div id="side-brand-header" className="flex items-center justify-between border-b border-brand-surface-high/30 pb-4 select-none">
            <div className="flex items-center gap-3">
              <div className="h-8.5 w-8.5 rounded-md bg-brand-primary-container flex items-center justify-center text-white border border-brand-primary/20 shadow-[0_4px_15px_rgba(88,86,214,0.4)] animate-pulse">
                <Network className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col gap-0.5 pointer-events-none">
                <span className="font-display font-bold text-sm tracking-tight text-white leading-none">
                  SYNTHETIC INT.
                </span>
                <span className="font-mono text-[9px] text-brand-teal uppercase tracking-widest font-semibold mt-0.5 leading-none">
                  Telemetry Engine
                </span>
              </div>
            </div>

            {/* Mobile Sidebar Shut btn */}
            <button
              id="sidebar-close-mobile-btn"
              onClick={() => setSidebarOpen(false)}
              className="xl:hidden text-brand-text-slate hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Links Section with label-caps section header */}
          <div id="side-menu-block" className="flex flex-col gap-4">
            <span className="font-sans label-caps text-brand-text-slate block mb-1">Workspaces</span>
            <nav id="side-navigation" className="flex flex-col gap-1.5 select-none">
              
              {/* Telemetry home button */}
              <button
                id="tab-btn-telemetry"
                onClick={() => { setActiveTab('telemetry'); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold cursor-pointer border-none outline-none transition-all leading-none ${
                  activeTab === 'telemetry'
                    ? 'bg-brand-primary text-brand-lowest shadow-[0_4px_12px_rgba(194,193,255,0.25)] font-bold'
                    : 'text-brand-text-dim hover:text-white hover:bg-brand-surface-high/50'
                }`}
              >
                <Gauge className="h-4.5 w-4.5 shrink-0" />
                Cluster Telemetry
              </button>

              {/* Data Orchestrator tab */}
              <button
                id="tab-btn-orchestrator"
                onClick={() => { setActiveTab('orchestrator'); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold cursor-pointer border-none outline-none transition-all leading-none ${
                  activeTab === 'orchestrator'
                    ? 'bg-brand-primary text-brand-lowest shadow-[0_4px_12px_rgba(194,193,255,0.25)] font-bold'
                    : 'text-brand-text-dim hover:text-white hover:bg-brand-surface-high/50'
                }`}
              >
                <Layers className="h-4.5 w-4.5 shrink-0" />
                Pipeline Orchestrator
              </button>

              {/* Inference Sandbox playground */}
              <button
                id="tab-btn-playground"
                onClick={() => { setActiveTab('playground'); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold cursor-pointer border-none outline-none transition-all leading-none ${
                  activeTab === 'playground'
                    ? 'bg-brand-primary text-brand-lowest shadow-[0_4px_12px_rgba(194,193,255,0.25)] font-bold'
                    : 'text-brand-text-dim hover:text-white hover:bg-brand-surface-high/50'
                }`}
              >
                <Cpu className="h-4.5 w-4.5 shrink-0" />
                Neural Playground
              </button>

              {/* Transaction trace logs spreadsheet */}
              <button
                id="tab-btn-logs"
                onClick={() => { setActiveTab('logs'); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold cursor-pointer border-none outline-none transition-all leading-none ${
                  activeTab === 'logs'
                    ? 'bg-brand-primary text-brand-lowest shadow-[0_4px_12px_rgba(194,193,255,0.25)] font-bold'
                    : 'text-brand-text-dim hover:text-white hover:bg-brand-surface-high/50'
                }`}
              >
                <History className="h-4.5 w-4.5 shrink-0" />
                Trace Log Database
              </button>

              {/* Credentials & Settings */}
              <button
                id="tab-btn-settings"
                onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold cursor-pointer border-none outline-none transition-all leading-none ${
                  activeTab === 'settings'
                    ? 'bg-brand-primary text-brand-lowest shadow-[0_4px_12px_rgba(194,193,255,0.25)] font-bold'
                    : 'text-brand-text-dim hover:text-white hover:bg-brand-surface-high/50'
                }`}
              >
                <Settings className="h-4.5 w-4.5 shrink-0" />
                API Keyring & Settings
              </button>

            </nav>
          </div>

        </div>

        {/* System parameters feedback indicators in footer of the sidebar */}
        <div id="side-footer-info" className="flex flex-col gap-4 border-t border-brand-surface-high/30 pt-5 text-xs select-none pointer-events-none">
          <div className="flex justify-between items-center text-[10px] text-brand-text-slate font-mono uppercase tracking-wider font-semibold">
            <span>Cluster Heartbeat</span>
            <span className="text-brand-teal">active</span>
          </div>

          <div className="flex flex-col gap-2.5 p-3 rounded bg-brand-surface-lowest border border-brand-surface-high/30">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-brand-text-slate">System Latency:</span>
              <span className="text-white font-tnum font-bold">34ms</span>
            </div>
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-brand-text-slate">Total traces cataloged:</span>
              <span className="text-brand-primary font-tnum font-bold">{logs.length}</span>
            </div>
          </div>
        </div>

      </aside>

      {/* Main viewport Container area */}
      <div id="cluster-main-viewport" className="flex-1 flex flex-col min-h-screen xl:ml-[280px] overflow-hidden">
        
        {/* Global sticky layout Navigation Header */}
        <header id="cluster-top-nav" className="sticky top-0 z-30 h-16 border-b border-brand-surface-high/50 glass-panel px-6 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-4">
            
            {/* Mobile Hamburger Drawer Opener */}
            <button
              id="sidebar-trigger-mobile-btn"
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-surface-low border border-brand-surface-high/50 text-brand-text hover:text-white cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex flex-col pointer-events-none">
              <span className="font-display font-medium text-xs text-brand-text-slate uppercase tracking-wide">Workspace</span>
              <span className="font-display font-extrabold text-white text-sm capitalize">
                {activeTab === 'telemetry' 
                  ? 'Cluster Telemetry Analytics' 
                  : activeTab === 'orchestrator' 
                  ? 'Pipeline Orchestrator' 
                  : activeTab === 'playground' 
                  ? 'Neural Parameter Playground' 
                  : activeTab === 'logs'
                  ? 'Database Event Logs'
                  : 'API Keyring & Operator Settings'}
              </span>
            </div>
          </div>

          {/* Model Core details and live UTC time indicator */}
          <div className="flex items-center gap-5">
            
            {/* Active Model Indicator Chip */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-brand-surface-low border border-brand-surface-high/50 rounded-full">
              <Cpu className="h-3.5 w-3.5 text-brand-teal" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-brand-text-dim leading-none">
                Core: gemini-3.5-flash
              </span>
            </div>

            {/* Current local clock container */}
            <div id="global-realtime-clock" className="flex items-center gap-2 text-brand-text-slate border-l border-brand-surface-high/50 pl-5">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-xs font-semibold text-white font-tnum">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

          </div>
        </header>

        {/* Dynamic page container view switch */}
        <main id="app-workspace-content" className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'telemetry' && (
            <DashboardHome
              simulationSpeed={simulationSpeed}
              setSimulationSpeed={setSimulationSpeed}
              streamEnabled={streamEnabled}
              setStreamEnabled={setStreamEnabled}
            />
          )}

          {activeTab === 'orchestrator' && (
            <Orchestrator onAddLog={handleAddLogFromWorker} />
          )}

          {activeTab === 'playground' && (
            <Playground onAddLog={handleAddLogFromWorker} />
          )}

          {activeTab === 'logs' && (
            <LogsTable logs={logs} onAddLog={handleAddLogFromWorker} />
          )}

          {activeTab === 'settings' && (
            <SettingsWorkspace
              onAddLog={handleAddLogFromWorker}
              apiKeys={apiKeys}
              setApiKeys={setApiKeys}
              onLogout={() => {
                setIsLoggedIn(false);
                localStorage.removeItem('synthetic_logged_in');
                addLogEntry(`Operator session terminated: [${operator}]`, 'security-vault', 'warn', 'system', undefined, undefined);
              }}
            />
          )}
        </main>

      </div>

    </div>
  );
}
