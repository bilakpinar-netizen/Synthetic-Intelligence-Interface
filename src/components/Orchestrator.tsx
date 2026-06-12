import React, { useState, useRef } from 'react';
import {
  Upload,
  Layers,
  Database,
  Cpu,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Terminal,
  Loader2,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Slider from './Slider';
import Toggle from './Toggle';
import { PipelineStep, StreamNode } from '../types';

interface OrchestratorProps {
  onAddLog: (message: string, nodeId: string, level: 'info' | 'warn' | 'error', latency?: number) => void;
}

export default function Orchestrator({ onAddLog }: OrchestratorProps) {
  // Configurable nodes across the pipeline
  const [nodes, setNodes] = useState<StreamNode[]>([
    {
      id: 'ingestion',
      step: 'ingestion',
      label: 'Data Loader Ingestion',
      description: 'Ingests text, tables, and JSON datasets.',
      isActive: true,
      isConfigurable: true,
      parameters: {
        payloadSize: { value: 128, label: 'Virtual Chunk Size', type: 'slider', min: 16, max: 1024, step: 16 },
        rateLimit: { value: 15, label: 'Throughput Cap', type: 'slider', min: 5, max: 60, step: 5 }
      }
    },
    {
      id: 'embedding',
      step: 'embedding',
      label: 'Tensor Embedder',
      description: 'Converts stream tokens to 1536-dimensional vectors.',
      isActive: true,
      isConfigurable: true,
      parameters: {
        dimensions: { value: 1536, label: 'Model Dimensions', type: 'slider', min: 512, max: 2048, step: 512 },
        batchSize: { value: 32, label: 'Mini-batch Size', type: 'slider', min: 8, max: 128, step: 8 }
      }
    },
    {
      id: 'retrieval',
      step: 'retrieval',
      label: 'RAG Retrieval Ingress',
      description: 'Finds semantic context inside vector datastores.',
      isActive: true,
      isConfigurable: true,
      parameters: {
        topK: { value: 4, label: 'Top-K Matches', type: 'slider', min: 1, max: 10, step: 1 },
        distanceThreshold: { value: 0.75, label: 'Cosine Threshold', type: 'slider', min: 0.5, max: 0.95, step: 0.05 }
      }
    },
    {
      id: 'synthesis',
      step: 'synthesis',
      label: 'Gemini Synthesis',
      description: 'Hydrates vector matches to clean actionable insight.',
      isActive: true,
      isConfigurable: true,
      parameters: {
        temperature: { value: 0.7, label: 'Synthesizer Temp', type: 'slider', min: 0.1, max: 1.0, step: 0.1 },
        safetyLock: { value: true, label: 'Drift Prevention Mode', type: 'toggle' }
      }
    }
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>('ingestion');
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [activeSimulationStep, setActiveSimulationStep] = useState<PipelineStep | null>(null);
  const [activePayloadSize, setActivePayloadSize] = useState<number>(250);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  
  // Terminal log screen state
  const [terminalLines, setTerminalLines] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Pipeline nodes aligned. Tap 'Trigger stream lifecycle' to initiate network payload flows.`
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const addTerminalLine = (line: string) => {
    setTerminalLines(prev => [...prev && prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${line}`]);
  };

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);

  // File drop helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleParseFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleParseFile(files[0]);
    }
  };

  const handleParseFile = (file: File) => {
    const sizeKb = Math.round(file.size / 1024);
    setUploadedFile({ name: file.name, size: sizeKb });
    setActivePayloadSize(sizeKb);
    
    // Dynamically update the ingestion node payload size parameter value
    setNodes(prev => prev.map(n => {
      if (n.id === 'ingestion') {
        return {
          ...n,
          parameters: {
            ...n.parameters,
            payloadSize: { ...n.parameters.payloadSize, value: Math.min(1024, Math.max(16, sizeKb)) }
          }
        };
      }
      return n;
    }));

    addTerminalLine(`DataLoader: Sourced file payload [${file.name}] - ${sizeKb}KB mapped.`);
    onAddLog(`Uploaded dataset file: "${file.name}" (${sizeKb}KB)`, 'dataloader-node', 'info');
  };

  const handleParamChange = (nodeId: string, paramKey: string, newValue: number | boolean) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          parameters: {
            ...n.parameters,
            [paramKey]: { ...n.parameters[paramKey], value: newValue }
          }
        };
      }
      return n;
    }));
    addTerminalLine(`Node [${nodeId}] modified component param: ${paramKey} = ${newValue}`);
  };

  const handleToggleNode = (nodeId: string, checked: boolean) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return { ...n, isActive: checked };
      }
      return n;
    }));
    addTerminalLine(`Node [${nodeId}] system toggle set to: ${checked ? 'ONLINE' : 'BYPASS'}`);
  };

  // Run sequential pipeline simulation with network fetches
  const runLifecycleSimulation = async () => {
    if (simulationState === 'running') return;
    
    setSimulationState('running');
    setTerminalLines([]);
    addTerminalLine(`🚀 Starting Stream vector synthesis sequence...`);
    
    const steps: PipelineStep[] = ['ingestion', 'embedding', 'retrieval', 'synthesis'];
    let failed = false;

    for (const step of steps) {
      const node = nodes.find(n => n.step === step);
      if (!node) continue;

      if (!node.isActive) {
        addTerminalLine(`Node [${node.label}] is inactive. Bypassing step.`);
        continue;
      }

      setActiveSimulationStep(step);
      addTerminalLine(`Vector packet entering [${node.label}]...`);

      try {
        // Fetch model step response from full-stack server
        const sizeParam = nodes.find(n => n.id === 'ingestion')?.parameters.payloadSize?.value || 250;
        const response = await fetch('/api/pipeline/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: step,
            payloadSize: sizeParam,
            dropRate: 0.04 // low simulated packet failure
          })
        });

        // Artificially sleep 600ms so the visual dot travels nicely!
        await new Promise(r => setTimeout(r, 650));

        if (!response.ok) {
          throw new Error(`Connection timeout at step [${step}]`);
        }

        const data = await response.json();
        addTerminalLine(`Success [${data.nodeId}] Processed size=${data.payloadSize}KB duration=${data.latencyMs}ms throughput=${data.throughputPps}pps`);
        onAddLog(`Processed step ${step} successfully (${data.latencyMs}ms)`, `api-${step}-node`, 'info', data.latencyMs);

      } catch (err: any) {
        failed = true;
        addTerminalLine(`⚠️ ERROR: Packet compilation aborted at step [${step}]. Reason: ${err.message || 'Processing drift limit exceeded.'}`);
        onAddLog(`Pipeline failure at ${step}: Connection timeout`, `api-${step}-node`, 'error');
        setSimulationState('failed');
        break;
      }
    }

    setActiveSimulationStep(null);
    if (!failed) {
      setSimulationState('completed');
      addTerminalLine(`✨ Vector packet compilation successful! Hydrated insight compiled.`);
    }
  };

  return (
    <div id="orchestrator-layout" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Visual Canvas - Center/Left Grid span */}
      <div id="orchestrator-canvas" className="lg:col-span-2 flex flex-col gap-5">
        
        {/* Ingest Payload Drag Drop Component */}
        <div
          id="dataloader-drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-panel p-5.5 rounded-lg border-dashed text-center flex flex-col items-center justify-center gap-3 cursor-pointer select-none transition-all ${
            isDragging 
              ? 'border-brand-teal bg-brand-teal/5 scale-[0.99] glow-teal' 
              : 'border-brand-primary/15 hover:border-brand-teal bg-brand-surface-low'
          } hover:bg-brand-surface-lowest`}
        >
          <input
            id="hidden-file-loader"
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".json,.txt,.csv,.md"
          />
          <div className="bg-brand-teal/10 p-3 rounded-full border border-brand-teal/20 text-brand-teal animate-bounce">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display font-semibold text-xs text-brand-text block">
              {uploadedFile ? `Asset: ${uploadedFile.name}` : "Ingest custom dataset file"}
            </span>
            <span className="font-sans text-[11px] text-brand-text-slate mt-1 block">
              {uploadedFile 
                ? `${uploadedFile.size}KB payload mapped to pipeline vector parameters.` 
                : "Drag-and-drop or select file to compute neural byte stream."}
            </span>
          </div>
        </div>

        {/* Visual pipeline connectors workspace map and visual travel dots */}
        <div id="vector-node-canvas" className="glass-panel p-7 rounded-lg bg-brand-surface-low border border-brand-primary/10 relative overflow-hidden h-[240px] flex flex-col justify-around">
          
          <div className="flex justify-between items-center select-none z-10 w-full relative">
            
            {/* Visual connecting line track underneath */}
            <div className="absolute top-1/2 left-[5%] right-[5%] h-0.5 bg-brand-surface-highest -translate-y-1/2 z-0">
              {simulationState === 'running' && (
                <div className="h-full bg-gradient-to-right from-brand-indigo to-brand-teal animate-pulse" style={{width: '100%'}} />
              )}
            </div>

            {/* Connecting steps connectors */}
            {nodes.map((node, i) => {
              const isActiveStep = activeSimulationStep === node.step;
              const isPastStep = simulationState === 'completed' || 
                (simulationState === 'running' && ['ingestion', 'embedding', 'retrieval', 'synthesis'].indexOf(node.step) < ['ingestion', 'embedding', 'retrieval', 'synthesis'].indexOf(activeSimulationStep || 'ingestion'));
              
              const isSelected = selectedNodeId === node.id;

              // Compute icon
              const StepIcon = {
                ingestion: Upload,
                embedding: Layers,
                retrieval: Database,
                synthesis: Cpu
              }[node.step];

              return (
                <React.Fragment key={node.id}>
                  {/* Step Connector Node Orb */}
                  <div className="flex flex-col items-center gap-3 z-10 relative">
                    <button
                      id={`node-orb-${node.id}`}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`h-11 w-11 rounded-full flex items-center justify-center cursor-pointer transition-all border outline-none ${
                        !node.isActive 
                          ? 'bg-brand-surface-lowest border-brand-surface-high text-brand-text-slate opacity-40'
                          : isActiveStep
                            ? 'bg-brand-teal border-brand-teal text-brand-lowest shadow-[0_0_15px_#00D2FF] scale-110'
                            : isPastStep
                              ? 'bg-brand-indigo/15 border-brand-primary text-brand-primary'
                              : isSelected
                                ? 'bg-brand-surface-container border-brand-teal text-brand-teal shadow-[0_0_8px_rgba(0,210,255,0.2)]'
                                : 'bg-brand-surface-lowest border-brand-primary/15 text-brand-text-slate hover:border-brand-primary/40'
                      }`}
                    >
                      <StepIcon className="h-4.5 w-4.5" />
                    </button>
                    {/* Node Mini Title */}
                    <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-brand-text-slate">
                      {node.id}
                    </span>
                  </div>

                  {/* Connect arrow spacer between steps */}
                  {i < nodes.length - 1 && (
                    <div className="text-brand-surface-high z-10 select-none hidden sm:block">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

          </div>

          {/* Action Trigger Row */}
          <div className="flex justify-between items-center z-10 border-t border-brand-surface-high/30 pt-4 mt-2">
            <div className="flex items-center gap-1">
              <span className="font-sans text-[11px] text-brand-text-slate uppercase tracking-wide">Status:</span>
              <span className={`font-mono text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                simulationState === 'running' 
                  ? 'text-brand-teal bg-brand-teal/10 animate-pulse' 
                  : simulationState === 'completed'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : simulationState === 'failed'
                      ? 'text-rose-400 bg-rose-500/10'
                      : 'text-brand-text-slate bg-brand-surface-highest'
              }`}>
                {simulationState}
              </span>
            </div>

            <button
              id="trigger-stream-sequence-btn"
              onClick={runLifecycleSimulation}
              disabled={simulationState === 'running'}
              className="bg-brand-teal hover:bg-[#00b2ff] text-brand-lowest px-5.5 py-1.5 rounded-md text-xs font-semibold font-sans flex items-center gap-2 select-none shadow-[0_0_12px_rgba(0,210,255,0.3)] disabled:opacity-35 disabled:pointer-events-none transition-all cursor-pointer h-9 shrink-0"
            >
              {simulationState === 'running' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Orchestrating...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Trigger stream lifecycle
                </>
              )}
            </button>
          </div>

        </div>

        {/* Real-time terminal output scroll window */}
        <div id="stream-runner-terminal" className="glass-panel p-4.5 rounded-lg bg-brand-surface-lowest border border-brand-surface-high/60 h-[178px] flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-brand-surface-high/30 pb-2 mb-2 select-none">
            <div className="flex items-center gap-2 font-mono text-[10px] text-brand-text-slate">
              <Terminal className="h-3.5 w-3.5" />
              <span>LOGSTREAM_CONSOLIDATED_NODE_OUT</span>
            </div>
            <button
              id="clear-terminal-btn"
              onClick={() => setTerminalLines([])}
              className="text-[10px] uppercase font-mono text-brand-text-slate hover:text-brand-teal flex items-center gap-1"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset logs
            </button>
          </div>

          {/* Logging stream text viewport */}
          <div className="flex-1 overflow-y-auto font-mono text-[11px] text-brand-text-slate flex flex-col gap-1 pr-1">
            {terminalLines.map((line, idx) => {
              const isError = line.includes('ERROR') || line.includes('⚠️');
              const isSuccess = line.includes('Success') || line.includes('🚀') || line.includes('✨');
              return (
                <div
                  key={idx}
                  className={isError ? 'text-rose-400' : isSuccess ? 'text-brand-teal' : 'text-brand-text-dim'}
                >
                  {line}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Node Variable Editor Panel Sidebar - Right Grid span */}
      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.div
            id="node-config-inspector"
            key={selectedNode.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-panel p-5 rounded-lg bg-brand-surface-low border border-brand-teal/20 flex flex-col justify-between h-[678px] relative overflow-hidden"
          >
            <div>
              {/* Header Title */}
              <div className="border-b border-brand-surface-high/50 pb-4 mb-5 flex justify-between items-start select-none">
                <div className="flex flex-col gap-1">
                  <span className="font-sans label-caps text-brand-teal block">Inspector</span>
                  <h3 className="font-display font-medium text-white text-base mt-1">
                    {selectedNode.label}
                  </h3>
                  <p className="text-[11px] text-brand-text-slate mt-1 font-sans">
                    {selectedNode.description}
                  </p>
                </div>
              </div>

              {/* Node System Toggle */}
              <div className="bg-brand-surface-lowest/75 border border-brand-surface-high/30 p-3.5 rounded-lg mb-6 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[11px] font-bold text-white uppercase tracking-wider">Node Status</span>
                  <span className="text-[10px] text-brand-text-slate font-sans">
                    {selectedNode.isActive ? 'Actively routing transaction streams' : 'Stream bypass enabled'}
                  </span>
                </div>
                <Toggle
                  id={`node-active-switch-${selectedNode.id}`}
                  checked={selectedNode.isActive}
                  onChange={(val) => handleToggleNode(selectedNode.id, val)}
                />
              </div>

              {/* Dynamic node parameters with active style sliders */}
              {selectedNode.isActive && (
                <div id="node-custom-params" className="flex flex-col gap-5">
                  <span className="font-sans text-[10px] font-semibold text-brand-text-slate uppercase tracking-wider border-b border-brand-surface-high/20 pb-1">
                    Node Variables
                  </span>

                  {Object.entries(selectedNode.parameters).map(([key, anyParam]) => {
                    const param = anyParam as any;
                    if (param.type === 'slider') {
                      return (
                        <div key={key}>
                          <Slider
                            id={`node-${selectedNode.id}-${key}`}
                            label={param.label}
                            min={param.min || 0}
                            max={param.max || 100}
                            step={param.step || 1}
                            value={param.value as number}
                            onChange={(val) => handleParamChange(selectedNode.id, key, val)}
                          />
                        </div>
                      );
                    } else if (param.type === 'toggle') {
                      return (
                        <div key={key}>
                          <Toggle
                            id={`node-${selectedNode.id}-${key}`}
                            label={param.label}
                            checked={param.value as boolean}
                            onChange={(val) => handleParamChange(selectedNode.id, key, val)}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-md bg-brand-surface-container/35 border border-brand-teal/10 flex gap-2.5 items-start mt-6">
              <Sparkles className="h-4.5 w-4.5 text-brand-teal shrink-0 mt-0.5" />
              <p className="text-[11px] font-sans text-brand-text-slate leading-relaxed">
                Tuning active node values recalculates vector flow speeds, latency loads, and error drift factors instantly inside live pipeline calculations.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
