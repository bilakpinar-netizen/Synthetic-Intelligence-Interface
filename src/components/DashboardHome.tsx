import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Zap,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  DollarSign,
  TrendingUp,
  AppWindow
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import Sparkline from './Sparkline';
import StatusIndicator from './StatusIndicator';
import Slider from './Slider';
import Toggle from './Toggle';

interface DashboardHomeProps {
  simulationSpeed: number;
  setSimulationSpeed: (val: number) => void;
  streamEnabled: boolean;
  setStreamEnabled: (val: boolean) => void;
}

export default function DashboardHome({
  simulationSpeed,
  setSimulationSpeed,
  streamEnabled,
  setStreamEnabled
}: DashboardHomeProps) {
  // Key stats telemetry values with historical states for Sparkline
  const [throughput, setThroughput] = useState({
    curr: 942.5,
    history: [920, 935, 930, 928, 942, 940, 938, 945, 941, 942.5]
  });
  const [contextUtil, setContextUtil] = useState({
    curr: 42.8,
    history: [40.2, 40.5, 41.2, 41.0, 42.1, 42.0, 42.5, 42.9, 42.2, 42.8]
  });
  const [avgLatency, setAvgLatency] = useState({
    curr: 34.6,
    history: [38.2, 37.1, 36.5, 35.8, 35.0, 34.2, 34.8, 34.1, 35.2, 34.6]
  });
  const [inferenceDrift, setInferenceDrift] = useState({
    curr: 99.84,
    history: [99.82, 99.83, 99.81, 99.84, 99.85, 99.84, 99.83, 99.83, 99.84, 99.84]
  });

  // Flow charts data stream
  const [chartData, setChartData] = useState<any[]>([]);

  // Simulation step status items
  const [liveNodes, setLiveNodes] = useState([
    { name: 'DataLoader Alpha', status: 'active', speed: '34.2 MB/s', load: 12 },
    { name: 'Embedding TensorEngine', status: 'active', speed: '1240 Vec/s', load: 38 },
    { name: 'RAG VectorRetriever', status: 'active', speed: '4.8 ms search', load: 24 },
    { name: 'Synthesis Gemini 3.5', status: 'active', speed: '942 Token/s', load: 74 }
  ]);

  // Generate initial chart history
  useEffect(() => {
    const records = [];
    for (let i = 24; i >= 0; i--) {
      records.push({
        time: `${i}s ago`,
        throughput: Math.floor(900 + Math.random() * 80 + (streamEnabled ? simulationSpeed * 10 : 0)),
        ingestRate: Math.floor(25 + Math.random() * 15 + (streamEnabled ? simulationSpeed * 0.5 : 0)),
        latency: Math.floor(30 + Math.random() * 10 - (simulationSpeed > 5 ? 3 : 0)),
        safetyScore: Math.floor(98 + (Math.random() > 0.9 ? -1 : 0))
      });
    }
    setChartData(records);
  }, []);

  // Sync state loop when streaming is enabled
  useEffect(() => {
    if (!streamEnabled) return;

    const interval = setInterval(() => {
      // Calculate jitter based on simulationSpeed multiplier
      const scale = simulationSpeed / 5; // mid point is 1

      setThroughput((prev) => {
        const nextVal = Number((930 + Math.random() * 30 + simulationSpeed * 8).toFixed(1));
        const updatedHistory = [...prev.history.slice(1), nextVal];
        return { curr: nextVal, history: updatedHistory };
      });

      setContextUtil((prev) => {
        const nextVal = Number(Math.min(98, Math.max(10, prev.curr + (Math.random() - 0.45) * 1.5)).toFixed(1));
        const updatedHistory = [...prev.history.slice(1), nextVal];
        return { curr: nextVal, history: updatedHistory };
      });

      setAvgLatency((prev) => {
        // Higher simulation speed yields slightly lower latency or stable high ingestion
        const nextVal = Number((32 + Math.random() * 5 + (10 - simulationSpeed) * 0.5).toFixed(1));
        const updatedHistory = [...prev.history.slice(1), nextVal];
        return { curr: nextVal, history: updatedHistory };
      });

      setInferenceDrift((prev) => {
        const nextVal = Number((99.8 + Math.random() * 0.08).toFixed(2));
        const updatedHistory = [...prev.history.slice(1), nextVal];
        return { curr: nextVal, history: updatedHistory };
      });

      // Update analytics series data
      setChartData((prev) => {
        const newRecord = {
          time: 'Now',
          throughput: Math.floor(900 + Math.random() * 80 + simulationSpeed * 10),
          ingestRate: Math.floor(25 + Math.random() * 15 + simulationSpeed * 0.5),
          latency: Math.floor(32 + Math.random() * 5),
          safetyScore: 99
        };
        const shifted = prev.slice(1).map((item, idx) => ({
          ...item,
          time: `${prev.length - 1 - idx}s ago`
        }));
        return [...shifted, newRecord];
      });

      // Update nodes load dynamically
      setLiveNodes((prev) =>
        prev.map((node, i) => {
          let jitter = Math.floor((Math.random() - 0.5) * 8);
          if (i === 3) {
            // Synthesis load is correlated with speed
            return {
              ...node,
              load: Math.min(95, Math.max(30, Math.floor(55 + simulationSpeed * 3 + jitter)))
            };
          }
          return {
            ...node,
            load: Math.min(90, Math.max(8, node.load + jitter))
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [streamEnabled, simulationSpeed]);

  return (
    <div id="dashboard-home-space" className="flex flex-col gap-6">
      
      {/* Simulation Command Center - Glass HUD */}
      <div id="cmd-center-hud" className="glass-panel p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6 glow-teal">
        <div id="cmd-intro" className="flex items-center gap-4">
          <div className="bg-brand-surface-high p-3 rounded-lg border border-brand-teal/20">
            <Activity className="h-6 w-6 text-brand-teal animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-medium text-lg leading-tight text-white flex items-center gap-2">
              Model Stream Telemetry
              <StatusIndicator status={streamEnabled ? 'active' : 'idle'} label={streamEnabled ? "Streaming" : "Standby"} />
            </h2>
            <p className="text-xs text-brand-text-slate mt-1 font-sans">
              Monitoring persistent analytical throughput of real-time multi-series vectors.
            </p>
          </div>
        </div>

        {/* HUD Interactive controls */}
        <div id="cmd-controls" className="flex flex-wrap items-center gap-6 self-start md:self-auto">
          {/* Simulation Active Toggler */}
          <Toggle
            id="stream-state-toggle"
            label="Vector Stream"
            description={streamEnabled ? "Dynamic continuous ticks" : "Simulation frozen"}
            checked={streamEnabled}
            onChange={setStreamEnabled}
            className="border-r border-brand-surface-highest/50 pr-6 shrink-0"
          />

          {/* Model throughput pacing slider multiplier */}
          <div className="w-52 shrink-0">
            <Slider
              id="model-velocity-slider"
              label="Pipeline Velocity"
              unit="x"
              min={1}
              max={10}
              step={1}
              value={simulationSpeed}
              onChange={setSimulationSpeed}
            />
          </div>
        </div>
      </div>

      {/* Structured Metric Grid */}
      <div id="telem-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Core Throughput Cards */}
        <div id="metric-card-throughput" className="glass-panel p-4.5 rounded-lg border-brand-primary/10 relative overflow-hidden bg-brand-surface-low border">
          <div className="flex justify-between items-start pointer-events-none mb-1">
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[11px] font-semibold text-brand-text-slate uppercase tracking-wider">Neural Throughput</span>
              <span className="font-display font-extrabold text-[22px] text-white font-tnum mt-1 flex items-baseline gap-1">
                {throughput.curr}
                <span className="text-xs text-brand-text-dim font-normal font-sans tracking-wide">Tokens/s</span>
              </span>
            </div>
            <div className="bg-brand-indigo/10 p-2 rounded-md border border-brand-primary/10 text-brand-primary">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 mb-1 font-mono text-[11px] select-none">
            <span className="text-brand-teal flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +4.8%
            </span>
            <span className="text-brand-text-slate font-sans">vs prior interval</span>
          </div>
          
          <div className="mt-4 border-t border-brand-surface-highest/20 pt-3">
            <Sparkline data={throughput.history} color="#c2c1ff" />
          </div>
        </div>

        {/* Context Window Ratio Card */}
        <div id="metric-card-context" className="glass-panel p-4.5 rounded-lg border-brand-primary/10 relative overflow-hidden bg-brand-surface-low border">
          <div className="flex justify-between items-start pointer-events-none mb-1">
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[11px] font-semibold text-brand-text-slate uppercase tracking-wider">Context Window</span>
              <span className="font-display font-extrabold text-[22px] text-white font-tnum mt-1 flex items-baseline gap-1">
                {contextUtil.curr}
                <span className="text-xs text-brand-text-dim font-normal font-sans tracking-wide">%</span>
              </span>
            </div>
            <div className="bg-brand-teal/10 p-2 rounded-md border border-brand-teal/10 text-brand-teal">
              <Gauge className="h-4 w-4" />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 mb-1 font-mono text-[11px] select-none">
            <span className="text-brand-teal flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +1.2%
            </span>
            <span className="text-brand-text-slate font-sans">utilization growth</span>
          </div>

          <div className="mt-4 border-t border-brand-surface-highest/20 pt-3">
            <Sparkline data={contextUtil.history} color="#00D2FF" />
          </div>
        </div>

        {/* Synthesizer Processing Delay Card */}
        <div id="metric-card-latency" className="glass-panel p-4.5 rounded-lg relative overflow-hidden bg-brand-surface-low border border-brand-primary/10">
          <div className="flex justify-between items-start pointer-events-none mb-1">
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[11px] font-semibold text-brand-text-slate uppercase tracking-wider">Inference Latency</span>
              <span className="font-display font-extrabold text-[22px] text-white font-tnum mt-1 flex items-baseline gap-1">
                {avgLatency.curr}
                <span className="text-xs text-brand-text-dim font-normal font-sans tracking-wide">ms</span>
              </span>
            </div>
            <div className="bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20 text-emerald-400">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 mb-1 font-mono text-[11px] select-none">
            <span className="text-emerald-400 flex items-center gap-0.5">
              <ArrowDownRight className="h-3.5 w-3.5" />
              -2.43%
            </span>
            <span className="text-brand-text-slate font-sans">processing speedup</span>
          </div>

          <div className="mt-4 border-t border-brand-surface-highest/20 pt-3">
            <Sparkline data={avgLatency.history} color="#10B981" />
          </div>
        </div>

        {/* Model Accuracy Compliance Drift */}
        <div id="metric-card-drift" className="glass-panel p-4.5 rounded-lg relative overflow-hidden bg-brand-surface-low border border-brand-primary/10">
          <div className="flex justify-between items-start pointer-events-none mb-1">
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[11px] font-semibold text-brand-text-slate uppercase tracking-wider">Compliance Score</span>
              <span className="font-display font-extrabold text-[22px] text-white font-tnum mt-1 flex items-baseline gap-1">
                {inferenceDrift.curr}
                <span className="text-xs text-brand-text-dim font-normal font-sans tracking-wide">%</span>
              </span>
            </div>
            <div className="bg-brand-primary/15 p-2 rounded-md border border-brand-primary/20 text-brand-primary">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 mb-1 font-mono text-[11px] select-none">
            <span className="text-blue-400 flex items-center gap-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-teal" />
              Drift-Free
            </span>
            <span className="text-brand-text-slate font-sans">safety threshold strict</span>
          </div>

          <div className="mt-4 border-t border-brand-surface-highest/20 pt-3">
            <Sparkline data={inferenceDrift.history} color="#a5e7ff" />
          </div>
        </div>

      </div>

      {/* Mobile Apps & AI Cost Management Deck */}
      <div id="mobile-cost-management-deck" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Apple App Store Card */}
        <div id="dashboard-appstore-card" className="glass-panel p-5 rounded-lg border border-white/10 bg-brand-surface-low relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-wider">Mobile Release Track</span>
              <h3 className="font-display font-extrabold text-white text-base mt-0.5">iOS App Store App</h3>
            </div>
            <div className="bg-blue-500/10 p-2 border border-blue-500/25 rounded-md text-blue-400">
              <Smartphone className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-5">
            <div className="flex justify-between items-baseline border-b border-white/5 pb-2 text-xs">
              <span className="text-brand-text-slate">Bundle ID</span>
              <span className="font-mono font-medium text-white">com.synthetic.mobileios</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-white/5 pb-2 text-xs">
              <span className="text-brand-text-slate">Connected Sessions</span>
              <span className="font-mono font-extrabold text-white font-tnum">14,240 <span className="text-[10px] text-emerald-400 font-bold font-sans">Active</span></span>
            </div>
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-brand-text-slate">Distribution Phase</span>
              <span className="font-sans font-bold text-brand-primary">v1.4.2 Production</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-brand-text-slate">
            <span>Core Telemetry: Live Feed</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
              Sync: 100%
            </span>
          </div>
        </div>

        {/* Google Play Store Card */}
        <div id="dashboard-playstore-card" className="glass-panel p-5 rounded-lg border border-white/10 bg-brand-surface-low relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-wider">Mobile Release Track</span>
              <h3 className="font-display font-extrabold text-white text-base mt-0.5">Google Play Store</h3>
            </div>
            <div className="bg-purple-500/10 p-2 border border-purple-500/25 rounded-md text-purple-400">
              <AppWindow className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-5">
            <div className="flex justify-between items-baseline border-b border-white/5 pb-2 text-xs">
              <span className="text-brand-text-slate">Package Name</span>
              <span className="font-mono font-medium text-white">com.synthetic.mobileandroid</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-white/5 pb-2 text-xs">
              <span className="text-brand-text-slate">Connected Sessions</span>
              <span className="font-mono font-extrabold text-white font-tnum">12,810 <span className="text-[10px] text-emerald-400 font-bold font-sans">Active</span></span>
            </div>
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-brand-text-slate">Distribution Phase</span>
              <span className="font-sans font-bold text-brand-secondary border-b border-transparent">v1.4.1 Beta Rollout</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-brand-text-slate">
            <span>Direct Ingress routing</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
              Sync: 100%
            </span>
          </div>
        </div>

        {/* Dynamic Estimated AI Expenditures Card */}
        <div id="dashboard-aipricing-card" className="glass-panel p-5 rounded-lg border border-white/10 bg-brand-surface-low relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Expenses Index</span>
              <h3 className="font-display font-extrabold text-white text-base mt-0.5">Estimated Cost of AI</h3>
            </div>
            <div className="bg-emerald-500/10 p-2 border border-emerald-500/25 rounded-md text-emerald-400">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-brand-text-slate">Monthly Expenditures</span>
              <div className="text-right">
                <span className="font-mono font-extrabold text-lg text-white font-tnum">$213.60</span>
                <span className="text-[10px] text-brand-text-slate ml-1">/ $850 limit</span>
              </div>
            </div>

            {/* Micro progress bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }} />
            </div>

            {/* Model Breakdown Spark */}
            <div className="flex gap-2 text-[9px] mt-1 text-brand-text-slate font-mono uppercase font-semibold">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                Gem: $112.50
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                GPT: $74.20
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Claude: $26.90
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-brand-text-slate">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              Within optimal envelope
            </span>
            <span className="cursor-pointer text-blue-400 hover:underline">Config limits</span>
          </div>
        </div>

      </div>

      {/* Detailed Multi-Series Charts section */}
      <div id="charts-layout-row" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Continuous Stream Analytics Area (LineChart) */}
        <div id="telemetry-chart-container" className="lg:col-span-2 glass-panel p-5 rounded-lg bg-brand-surface-low border border-brand-primary/10 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="font-sans label-caps text-brand-text-slate block">Trend Waveform</span>
              <h3 className="font-display font-bold text-white text-base mt-0.5">Stream Velocity Allocation</h3>
            </div>
            <div className="flex items-center gap-3 text-xs select-none">
              <div className="flex items-center gap-1.5 font-sans font-medium text-brand-primary">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-indigo inline-block border border-brand-primary/20" />
                Throughput (Tk/s)
              </div>
              <div className="flex items-center gap-1.5 font-sans font-medium text-brand-teal">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-teal inline-block" />
                Ingestion Size (Kb/s)
              </div>
            </div>
          </div>
          
          {/* Recharts container with full height styling */}
          <div id="recharts-wrapper-through" className="h-[260px] w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIngest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.12)" opacity={0.3} vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" opacity={0.5} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" opacity={0.5} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 10, 20, 0.9)',
                    backdropFilter: 'blur(16px)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#f1f5f9',
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
                <Area type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorThroughput)" />
                <Area type="monotone" dataKey="ingestRate" stroke="#c084fc" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngest)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Node Step Latencies allocating resources */}
        <div id="nodes-telemetry" className="glass-panel p-5 rounded-lg bg-brand-surface-low border border-brand-primary/10 flex flex-col justify-between">
          <div className="mb-6">
            <span className="font-sans label-caps text-brand-text-slate block">Compute Units</span>
            <h3 className="font-display font-bold text-white text-base mt-0.5">Ingress Pipeline Pipeline nodes</h3>
          </div>

          <div id="pipeline-nodes-list" className="flex flex-col gap-4">
            {liveNodes.map((node, index) => {
              // Custom active load bar matching
              const loadColor = node.load > 70 ? 'bg-brand-primary' : 'bg-brand-teal';
              return (
                <div key={index} id={`compute-node-${index}`} className="flex flex-col gap-1.5 p-3 rounded-lg bg-brand-surface-lowest border border-brand-surface-high/30">
                  <div className="flex justify-between items-center text-xs select-none">
                    <span className="font-sans font-semibold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-teal inline-block animate-pulse" />
                      {node.name}
                    </span>
                    <span className="font-mono text-brand-text-slate font-tnum text-[11px]">{node.speed}</span>
                  </div>

                  {/* Node capacity meter bar */}
                  <div className="mt-1">
                    <div className="flex justify-between items-baseline text-[10px] mb-1 font-mono text-brand-text-slate">
                      <span>Orchestrated capacity</span>
                      <span className="font-tnum font-bold text-white">{node.load}%</span>
                    </div>
                    <div className="w-full h-[5px] bg-brand-surface-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${loadColor}`}
                        style={{ width: `${node.load}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
