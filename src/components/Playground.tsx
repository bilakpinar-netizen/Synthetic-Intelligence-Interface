import React, { useState } from 'react';
import {
  Send,
  Cpu,
  Terminal,
  HelpCircle,
  Clock,
  Sparkles,
  Zap,
  Info,
  RefreshCw
} from 'lucide-react';
import Slider from './Slider';
import Toggle from './Toggle';
import SegmentedControl from './SegmentedControl';
import { ChatTurn } from '../types';

interface PlaygroundProps {
  onAddLog: (message: string, nodeId: string, level: 'info' | 'warn' | 'error', latency?: number) => void;
}

export default function Playground({ onAddLog }: PlaygroundProps) {
  const [prompt, setPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const [safetyFiltering, setSafetyFiltering] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('codegen');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatTurn[]>([
    {
      id: "initial-turn-1",
      role: 'model',
      parts: [{ text: "Synthetic agent initialized. Ready to ingestion-filter or classify stream logs. Select a custom code preset or compile direct prompt vectors in the cockpit panel below." }],
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      modelName: "gemini-3.5-flash"
    }
  ]);

  // Model selection presets
  const presets = [
    { value: 'codegen', label: 'Vector Gen Code' },
    { value: 'classifier', label: 'Anomaly Classifier' },
    { value: 'synth', label: 'Log Synthesizer' }
  ];

  const presetPrompts: { [key: string]: string } = {
    codegen: "Create a fast TypeScript parser for telemetry data from 984 token/s networks, including drift thresholds.",
    classifier: "Review transaction ID tx-84a2f and explain why its 42ms step latency could trigger a drop exception.",
    synth: "Synthesize 3 realistic pipeline events simulating a high load (85%) retrieve stage delay."
  };

  const handleApplyPreset = (value: string) => {
    setSelectedPreset(value);
    setPrompt(presetPrompts[value] || '');
    onAddLog(`Preset system instruction selected: [${value}]`, 'playground-node', 'info');
  };

  const executeInference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userInferenceText = prompt;
    setPrompt('');
    setIsLoading(true);

    const userTurnId = `user-${Math.random().toString(36).substring(2, 9)}`;
    const modelTurnId = `model-${Math.random().toString(36).substring(2, 9)}`;
    const currentTimestamp = new Date().toLocaleTimeString();

    // Append user input instantly
    const userTurn: ChatTurn = {
      id: userTurnId,
      role: 'user',
      parts: [{ text: userInferenceText }],
      timestamp: currentTimestamp
    };

    setConversations((prev) => [...prev, userTurn]);

    const start = Date.now();
    onAddLog(`Dispatched pipeline prompt: "${userInferenceText.substring(0, 35)}..."`, 'gemini-inference', 'info');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userInferenceText,
          model: "gemini-3.5-flash",
          systemInstruction: `You are a high performance synthetic data streaming support bot. Keep answers precise, deeply technical, and aligned to data architectures. Prompt parameters were: Temperature ${temperature}, TopP ${topP}, Safety Filtering ${safetyFiltering ? 'Locked' : 'Off'}`,
          temperature,
          topP
        })
      });

      const elapsed = Date.now() - start;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Synthesis exception");
      }

      const data = await response.json();
      
      const modelTurn: ChatTurn = {
        id: modelTurnId,
        role: 'model',
        parts: [{ text: data.text }],
        timestamp: new Date().toLocaleTimeString(),
        modelName: "gemini-3.5-flash",
        latencyMs: elapsed,
        tokenCount: {
          promptTokens: data.usageMetadata?.promptTokenCount || Math.floor(userInferenceText.length / 4),
          candidatesTokens: data.usageMetadata?.candidatesTokenCount || Math.floor(data.text.length / 4),
          totalTokens: data.usageMetadata?.totalTokenCount || 0
        }
      };

      setConversations((prev) => [...prev, modelTurn]);
      onAddLog(`Completed live inference: latency=${elapsed}ms`, 'gemini-inference', 'info', elapsed);

    } catch (err: any) {
      console.warn("Falling back to client-side synthetic simulation path because:", err.message);
      
      // Let's create a simulated response so that the user can test the app beautifully if they haven't configured the key
      const elapsed = Date.now() - start;
      
      const isMissingKey = err.message.includes("GEMINI_API_KEY") || err.message.includes("not configured");
      
      // Simulate typing speed
      setTimeout(() => {
        let simulatedText = "";
        if (selectedPreset === 'codegen') {
          simulatedText = `// Simulated Telemetry Code Gen [Key Standby Mode]\nexport function parseTelemetry(stream: string): { tokens: number; latency: number } {\n  const parts = stream.split('|');\n  return {\n    tokens: parseInt(parts[1]) || 0,\n    latency: parseFloat(parts[2]) || 0.0\n  };\n}`;
        } else if (selectedPreset === 'classifier') {
          simulatedText = `Review Log for tx-84a2f: \nAnomaly score is 0.72. The 42ms processing block creates queues because incoming rates exceed 900 Token/s. Highly recommend scaling the retrieve thread pool.`;
        } else {
          simulatedText = `Virtual Log Series (Load at 85%):\n1. [11:41:23] [DataLoader] Ingest packet size 1.05KB - success\n2. [11:41:24] [RAG] Retrieval latency spiked: 42.8ms - warning\n3. [11:41:25] [Gemini] Synthesis compilation succeeded - success`;
        }

        const modelTurn: ChatTurn = {
          id: modelTurnId,
          role: 'model',
          parts: [{ text: `${isMissingKey ? "⚠️ [MODEL IN STANDBY - MOCK SIMULATION ACTIVE]\nTo restore live responses, configure your Gemini credentials in the secrets area.\n\n" : ""}${simulatedText}` }],
          timestamp: new Date().toLocaleTimeString(),
          modelName: "gemini-3.5-flash (Simulated)",
          latencyMs: elapsed,
          tokenCount: {
            promptTokens: Math.floor(userInferenceText.length / 4) + 12,
            candidatesTokens: Math.floor(simulatedText.length / 4) + 20,
            totalTokens: Math.floor((userInferenceText.length + simulatedText.length) / 4) + 32
          }
        };

        setConversations((prev) => [...prev, modelTurn]);
        onAddLog(`Substituted placeholder mock response: latency=${elapsed}ms`, 'playground-placeholder', 'warn', elapsed);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="neural-sandbox-area" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Parameters Panel - Left sidebar */}
      <div id="sandbox-params" className="glass-panel p-5 rounded-lg bg-brand-surface-low border border-brand-primary/10 flex flex-col justify-between">
        <div className="flex flex-col gap-5">
          <div className="border-b border-brand-surface-high/50 pb-4">
            <span className="font-sans label-caps text-brand-text-slate block">Configuration</span>
            <h3 className="font-display font-bold text-white text-base mt-1 flex items-center gap-2">
              Neural Parameters
            </h3>
          </div>

          {/* Model selection segmented controller */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="font-sans text-[11px] font-semibold text-brand-text-slate uppercase tracking-wider">
              Active Presets
            </span>
            <SegmentedControl
              id="model-presets-segment"
              options={presets}
              selected={selectedPreset}
              onChange={handleApplyPreset}
            />
          </div>

          {/* Sliders styled exactly to spec */}
          <div className="mt-2 text-xs">
            <Slider
              id="temp-slider"
              label="Temperature (Creativity)"
              min={0.0}
              max={2.0}
              step={0.1}
              value={temperature}
              onChange={setTemperature}
            />
            <p className="text-[10px] text-brand-text-slate mt-1 font-sans leading-relaxed">
              Higher values increase stochastic variation, useful for creative text synthetic pipelines.
            </p>
          </div>

          <div className="mt-2 text-xs">
            <Slider
              id="top-p-slider"
              label="Top-P (Nucleus Sampling)"
              min={0.1}
              max={1.0}
              step={0.05}
              value={topP}
              onChange={setTopP}
            />
            <p className="text-[10px] text-brand-text-slate mt-1 font-sans leading-relaxed">
              Restricts generation spectrum to the top percentage cumulative probability distribution.
            </p>
          </div>

          {/* Toggles styled strictly to spec */}
          <div className="border-t border-brand-surface-high/30 pt-4 flex flex-col gap-4">
            <Toggle
              id="toggle-safety"
              label="Safety Filters"
              description="Analyze response content"
              checked={safetyFiltering}
              onChange={setSafetyFiltering}
            />
          </div>
        </div>

        <div className="mt-6 p-3 rounded-md bg-brand-surface-lowest border border-brand-surface-high/20 flex gap-2.5 items-start">
          <Info className="h-4.5 w-4.5 text-brand-teal shrink-0 mt-0.5" />
          <p className="text-[10px] font-sans text-brand-text-slate leading-relaxed">
            These variables are packaged with the prompt payload as system headers during live Express API calls.
          </p>
        </div>
      </div>

      {/* Model Sandbox Output Stream Content - Right / Center */}
      <div id="sandbox-chat" className="lg:col-span-2 glass-panel p-5 rounded-lg bg-brand-surface-low border border-brand-primary/10 flex flex-col justify-between h-[520px]">
        
        {/* Terminal Header */}
        <div className="flex justify-between items-center border-b border-brand-surface-high/50 pb-4 h-10 select-none">
          <div className="flex items-center gap-2">
            <Terminal className="h-4.5 w-4.5 text-brand-teal" />
            <span className="font-mono text-xs font-semibold text-white tracking-wider uppercase">
              Model Ingress Terminal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-brand-teal bg-brand-teal/15 py-1 px-2.5 rounded-full border border-brand-teal/20 animate-pulse">
              34.6 FPS online
            </span>
          </div>
        </div>

        {/* Scrollable messages container */}
        <div id="sandbox-logs-stream" className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-1">
          {conversations.map((item) => {
            const isModel = item.role === 'model';
            return (
              <div
                id={`chat-turn-${item.id}`}
                key={item.id}
                className={`flex gap-3 max-w-[85%] ${isModel ? 'self-start' : 'self-end flex-row-reverse'}`}
              >
                {/* Micro avatar */}
                <div className={`h-7 w-7 rounded-md shrink-0 flex items-center justify-center border ${
                  isModel ? 'bg-brand-indigo/15 border-brand-primary/20 text-brand-primary' : 'bg-brand-teal/15 border-brand-teal/20 text-brand-teal'
                }`}>
                  {isModel ? <Cpu className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                </div>

                {/* Content body with inset feel */}
                <div className="flex flex-col gap-1">
                  <div className={`p-3 rounded-lg text-xs leading-relaxed font-sans ${
                    isModel 
                      ? 'bg-brand-surface-lowest text-brand-text border border-brand-surface-high/50 font-mono whitespace-pre-wrap' 
                      : 'bg-brand-surface-high text-brand-teal border border-brand-teal/10 font-sans'
                  }`}>
                    {item.parts[0].text}
                  </div>
                  
                  {/* Metadata line */}
                  <div className={`flex items-center gap-3 text-[9px] text-brand-text-slate font-mono ${
                    isModel ? 'justify-start' : 'justify-end'
                  }`}>
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {item.timestamp}
                    </span>
                    {isModel && item.latencyMs && (
                      <span className="text-brand-teal">
                        Latency: {item.latencyMs}ms
                      </span>
                    )}
                    {isModel && item.tokenCount && (
                      <span className="text-brand-primary">
                        {item.tokenCount.totalTokens || item.tokenCount.promptTokens} tokens
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div id="sandbox-loading-bubble" className="flex gap-3 max-w-[80%] self-start">
              <div className="h-7 w-7 rounded-md shrink-0 bg-brand-indigo/15 border border-brand-primary/20 text-brand-primary flex items-center justify-center animate-spin">
                <RefreshCw className="h-3.5 w-3.5" />
              </div>
              <div className="p-3 rounded-lg bg-brand-surface-lowest border border-brand-surface-high/50 text-xs text-brand-text-slate font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce [animation-delay:0.4s]" />
                Ingesting stream ... compiling model safety constraints
              </div>
            </div>
          )}
        </div>

        {/* Action input panel */}
        <form onSubmit={executeInference} id="sandbox-input-form" className="flex gap-3 border-t border-brand-surface-high/50 pt-4 h-16 shrink-0">
          <input
            id="sandbox-prompt-input"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Query synthetic telemetry anomalies or compile prompt code vectors..."
            disabled={isLoading}
            className="flex-1 bg-inset-input rounded-md px-4 py-2 font-sans text-xs focus:bg-inset-input"
          />
          <button
            id="sandbox-send-btn"
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-brand-primary-container hover:bg-brand-indigo text-white px-5 rounded-md text-xs font-semibold font-sans flex items-center gap-2 border border-brand-primary/10 select-none shadow-[0_2px_12px_rgba(88,86,214,0.3)] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer h-10 self-center"
          >
            <Send className="h-3.5 w-3.5" />
            Process
          </button>
        </form>

      </div>

    </div>
  );
}
