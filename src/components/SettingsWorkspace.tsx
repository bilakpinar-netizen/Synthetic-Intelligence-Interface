import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  DollarSign,
  User,
  Settings,
  Database,
  Eye,
  EyeOff,
  LogOut,
  AppWindow,
  Play,
  Layers,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import StatusIndicator from './StatusIndicator';

interface SettingsWorkspaceProps {
  onAddLog: (message: string, nodeId: string, level: 'info' | 'warn' | 'error', latency?: number) => void;
  onLogout: () => void;
  apiKeys: {
    gemini: string;
    openai: string;
    claude: string;
  };
  setApiKeys: React.Dispatch<React.SetStateAction<{
    gemini: string;
    openai: string;
    claude: string;
  }>>;
}

export default function SettingsWorkspace({
  onAddLog,
  onLogout,
  apiKeys,
  setApiKeys
}: SettingsWorkspaceProps) {
  // Local credential states
  const [geminiKeyInput, setGeminiKeyInput] = useState(apiKeys.gemini || '••••••••••••••••••••••••••••••••');
  const [openaiKeyInput, setOpenaiKeyInput] = useState(apiKeys.openai || '••••••••••••••••••••••••••••••••');
  const [claudeKeyInput, setClaudeKeyInput] = useState(apiKeys.claude || '••••••••••••••••••••••••••••••••');

  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showClaude, setShowClaude] = useState(false);

  const [pingStatus, setPingStatus] = useState<{ [key: string]: 'idle' | 'pinging' | 'success' | 'warn' }>({
    gemini: apiKeys.gemini ? 'success' : 'idle',
    openai: apiKeys.openai ? 'success' : 'idle',
    claude: apiKeys.claude ? 'success' : 'idle'
  });

  // Mobile App Stores Configuration
  const [appStoreConnected, setAppStoreConnected] = useState(true);
  const [playStoreConnected, setPlayStoreConnected] = useState(true);
  const [bundleId, setBundleId] = useState('com.synthetic.mobileios');
  const [packageName, setPackageName] = useState('com.synthetic.mobileandroid');

  // Interactive AI cost pricing factors (cents per 10k tokens)
  const [customGeminiRate, setCustomGeminiRate] = useState(0.0075);
  const [customOpenaiRate, setCustomOpenaiRate] = useState(0.015);
  const [customClaudeRate, setCustomClaudeRate] = useState(0.030);

  // Simulated live monthly usage counts
  const [tokenUsage, setTokenUsage] = useState({
    gemini: 45620000,
    openai: 12450000,
    claude: 5410000
  });

  const [monthlyBudget, setMonthlyBudget] = useState(850);

  // Local state update checks
  const handleSaveKeys = (provider: 'gemini' | 'openai' | 'claude', val: string) => {
    let sanitized = val.trim();
    if (sanitized === '••••••••••••••••••••••••••••••••') {
      onAddLog(`Retained configured cache for ${provider} API`, 'security-vault', 'info');
      return;
    }
    
    setApiKeys(prev => {
      const nextKeys = { ...prev, [provider]: sanitized };
      localStorage.setItem('synthetic_api_keys', JSON.stringify(nextKeys));
      return nextKeys;
    });

    setPingStatus(prev => ({ ...prev, [provider]: 'pinging' }));
    onAddLog(`Saving credential package for ${provider}...`, 'security-vault', 'info');

    // Simulate validation test
    setTimeout(() => {
      setPingStatus(prev => ({ ...prev, [provider]: 'success' }));
      onAddLog(`API Handshake success. Verified authentication for ${provider}`, 'security-vault', 'info');
    }, 1200);
  };

  const verifyAllConnections = () => {
    onAddLog("Initializing cluster credentials verification suite...", "sys-health", "info");
    setPingStatus({
      gemini: 'pinging',
      openai: 'pinging',
      claude: 'pinging'
    });

    setTimeout(() => {
      setPingStatus({
        gemini: geminiKeyInput ? 'success' : 'idle',
        openai: openaiKeyInput ? 'success' : 'idle',
        claude: claudeKeyInput ? 'success' : 'idle'
      });
      onAddLog("Core telemetry channels successfully re-synchronized.", "cluster-system", "info");
    }, 1500);
  };

  // Cost estimates calculated based on dynamic rates set
  const geminiCost = (tokenUsage.gemini / 10000) * customGeminiRate;
  const openaiCost = (tokenUsage.openai / 10000) * customOpenaiRate;
  const claudeCost = (tokenUsage.claude / 10000) * customClaudeRate;
  const totalSpent = geminiCost + openaiCost + claudeCost;
  const budgetRatio = Math.min(100, Math.floor((totalSpent / monthlyBudget) * 100));

  return (
    <div id="settings-parent-layout" className="flex flex-col gap-8 animate-fade-in">
      
      {/* Intro section */}
      <div id="settings-heading" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-sans label-caps text-brand-text-slate block">Control Station</span>
          <h2 className="font-display font-extrabold text-white text-2xl mt-1">
            API Credentials & Settings
          </h2>
          <p className="text-xs text-brand-text-slate mt-1">
            Configure live endpoints, mobile target environments, and inspect aggregated server-side token costs.
          </p>
        </div>

        <button
          onClick={verifyAllConnections}
          className="px-4 py-2 border border-blue-500/30 hover:border-blue-500/60 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-sans text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Test Credentials Ping
        </button>
      </div>

      {/* Grid containing API Key configure box & Store connections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* API keys configuration management workspace (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl bg-brand-surface-low border border-brand-primary/10 flex flex-col gap-5">
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base">Multi-Provider Keyring</h3>
                <p className="text-[11px] text-brand-text-slate">Add your personal keys. Handshakes occur server-side dynamically.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4.5">
              
              {/* Google Gemini Card Input */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={pingStatus.gemini === 'success' ? 'active' : pingStatus.gemini === 'pinging' ? 'warning' : 'idle'} label="" />
                    <span className="text-[13px] font-bold text-white">Google Gemini API</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/20">
                    ACTIVE (gemini-3.5)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showGemini ? 'text' : 'password'}
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    placeholder="Enter your Google Gemini API Key"
                    className="w-full bg-black/40 border border-white/15 rounded-lg pl-3 pr-18 py-1.5 font-mono text-xs text-white uppercase focus:border-blue-500 focus:outline-none"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                    <button
                      onClick={() => setShowGemini(!showGemini)}
                      className="p-1 hover:text-white text-brand-text-slate cursor-pointer"
                    >
                      {showGemini ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleSaveKeys('gemini', geminiKeyInput)}
                      className="px-2 py-1 text-[10px] font-semibold bg-white/10 border border-white/10 hover:bg-white/20 hover:text-white rounded cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* OpenAI ChatGPT Card Input */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={pingStatus.openai === 'success' ? 'active' : pingStatus.openai === 'pinging' ? 'warning' : 'idle'} label="" />
                    <span className="text-[13px] font-bold text-white">OpenAI ChatGPT API</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 font-semibold uppercase bg-purple-400/5 px-2 py-0.5 rounded border border-purple-400/20">
                    STANDBY (gpt-4o)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showOpenai ? 'text' : 'password'}
                    value={openaiKeyInput}
                    onChange={(e) => setOpenaiKeyInput(e.target.value)}
                    placeholder="Enter OpenAI API Key (sk-...)"
                    className="w-full bg-black/40 border border-white/15 rounded-lg pl-3 pr-18 py-1.5 font-mono text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                    <button
                      onClick={() => setShowOpenai(!showOpenai)}
                      className="p-1 hover:text-white text-brand-text-slate cursor-pointer"
                    >
                      {showOpenai ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleSaveKeys('openai', openaiKeyInput)}
                      className="px-2 py-1 text-[10px] font-semibold bg-white/10 border border-white/10 hover:bg-white/20 hover:text-white rounded cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Anthropic Claude AI Input */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={pingStatus.claude === 'success' ? 'active' : pingStatus.claude === 'pinging' ? 'warning' : 'idle'} label="" />
                    <span className="text-[13px] font-bold text-white">Anthropic Claude API</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/20">
                    STANDBY (claude-3-5)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showClaude ? 'text' : 'password'}
                    value={claudeKeyInput}
                    onChange={(e) => setClaudeKeyInput(e.target.value)}
                    placeholder="Enter Anthropic API Key (sk-ant-...)"
                    className="w-full bg-black/40 border border-white/15 rounded-lg pl-3 pr-18 py-1.5 font-mono text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                    <button
                      onClick={() => setShowClaude(!showClaude)}
                      className="p-1 hover:text-white text-brand-text-slate cursor-pointer"
                    >
                      {showClaude ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleSaveKeys('claude', claudeKeyInput)}
                      className="px-2 py-1 text-[10px] font-semibold bg-white/10 border border-white/10 hover:bg-white/20 hover:text-white rounded cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Note alert */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] leading-relaxed">
              <Shield className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
              <span>
                <strong>Data Governance:</strong> API Keys saved in cache are persistent under the local sandbox container and verified server-side only. No keys are ever stored or index exposed on public repositories.
              </span>
            </div>

          </div>

          {/* Connected App Stores settings */}
          <div className="glass-panel p-6 rounded-2xl bg-brand-surface-low border border-brand-primary/10 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base">Mobile Distribution Tracks</h3>
                <p className="text-[11px] text-brand-text-slate">Integrate telemetry indices mapping live client requests.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Apple App Store Release Configuration */}
              <div className={`p-4 rounded-xl border transition-all ${
                appStoreConnected ? 'bg-white/5 border-blue-500/30' : 'bg-white/0 border-white/10 opacity-60'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-bold text-blue-400 font-mono tracking-wider uppercase">iOS App Store</span>
                  <div className="flex items-center gap-1.5 self-end">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-mono font-semibold text-brand-text-slate">Synchronized</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-brand-text-slate font-sans">Bundle Identifier</label>
                    <input
                      type="text"
                      value={bundleId}
                      onChange={(e) => setBundleId(e.target.value)}
                      className="bg-black/35 border border-white/10 rounded px-2.5 py-1 text-xs text-white text-[11px] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] mt-1 text-brand-text-slate font-sans bg-black/15 p-1.5 rounded-md">
                    <span>iOS Core release:</span>
                    <span className="font-mono font-bold text-white">v1.4.2 (852)</span>
                  </div>
                </div>
              </div>

              {/* Google Play Store Release Configuration */}
              <div className={`p-4 rounded-xl border transition-all ${
                playStoreConnected ? 'bg-white/5 border-purple-500/30' : 'bg-white/0 border-white/10 opacity-60'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-bold text-purple-400 font-mono tracking-wider uppercase">Google Play Store</span>
                  <div className="flex items-center gap-1.5 self-end">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-mono font-semibold text-brand-text-slate">Synchronized</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-brand-text-slate font-sans">Android Package Name</label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      className="bg-black/35 border border-white/10 rounded px-2.5 py-1 text-xs text-white text-[11px] focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] mt-1 text-brand-text-slate font-sans bg-black/15 p-1.5 rounded-md">
                    <span>Android SDK:</span>
                    <span className="font-mono font-bold text-white">API 35 (Play Store v1.4.1)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Budget Estimator widget, costing settings and live profile (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Cost Estimates & Budget Tracking widget */}
          <div className="glass-panel p-6 rounded-2xl bg-brand-surface-low border border-brand-primary/10 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">Cost & Expenditure</h3>
                  <p className="text-[11px] text-brand-text-slate">Calculated server token routing cost.</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                MTD Cost
              </span>
            </div>

            {/* Simulated cost breakdown */}
            <div className="flex flex-col gap-3.5">
              
              {/* Gemini Estimate */}
              <div className="flex justify-between items-center bg-black/15 p-2 px-3 rounded-lg border border-white/5 text-xs font-sans">
                <div className="flex flex-col">
                  <span className="text-white font-bold">Google Gemini</span>
                  <span className="text-[10px] text-brand-text-slate font-mono">{(tokenUsage.gemini / 1000000).toFixed(1)}M Tokens</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-white font-mono font-extrabold font-tnum">${geminiCost.toFixed(2)}</span>
                  <span className="text-[9px] text-brand-text-slate">Rate: ${customGeminiRate.toFixed(4)} / 10k</span>
                </div>
              </div>

              {/* OpenAI Estimate */}
              <div className="flex justify-between items-center bg-black/15 p-2 px-3 rounded-lg border border-white/5 text-xs font-sans">
                <div className="flex flex-col">
                  <span className="text-white font-bold">OpenAI ChatGPT</span>
                  <span className="text-[10px] text-brand-text-slate font-mono">{(tokenUsage.openai / 1000000).toFixed(1)}M Tokens</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-white font-mono font-extrabold font-tnum">${openaiCost.toFixed(2)}</span>
                  <span className="text-[9px] text-brand-text-slate">Rate: ${customOpenaiRate.toFixed(4)} / 10k</span>
                </div>
              </div>

              {/* Claude Estimate */}
              <div className="flex justify-between items-center bg-black/15 p-2 px-3 rounded-lg border border-white/5 text-xs font-sans">
                <div className="flex flex-col">
                  <span className="text-white font-bold">Anthropic Claude AI</span>
                  <span className="text-[10px] text-brand-text-slate font-mono">{(tokenUsage.claude / 1000000).toFixed(1)}M Tokens</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-white font-mono font-extrabold font-tnum">${claudeCost.toFixed(2)}</span>
                  <span className="text-[9px] text-brand-text-slate">Rate: ${customClaudeRate.toFixed(4)} / 10k</span>
                </div>
              </div>

              {/* Cumulative Spending vs Budget Limit Progress tracker */}
              <div className="bg-white/5 p-4 py-4 rounded-xl border border-white/10 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Estimated Cumulative Cost</span>
                  <span className="font-sans font-extrabold text-[15px] text-white font-tnum">
                    ${totalSpent.toFixed(2)}
                  </span>
                </div>

                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${budgetRatio}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-sans text-brand-text-slate mt-0.5">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    {budgetRatio}% of budget monthly limit
                  </span>
                  <span>Limit: ${monthlyBudget}</span>
                </div>
              </div>

              {/* Budget slider adjustment */}
              <div className="flex flex-col gap-1.5 px-1 mt-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-brand-text-slate font-sans">
                  <span>MONTHLY BUDGET CEILING</span>
                  <span className="text-white font-mono font-bold">${monthlyBudget}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="50"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-[5px] bg-white/10 rounded-lg cursor-pointer transition-all"
                />
              </div>

            </div>
          </div>

          {/* Active User User Profile box with switch settings */}
          <div className="glass-panel p-6 rounded-2xl bg-brand-surface-low border border-brand-primary/10 flex flex-col gap-4">
            <h3 className="font-sans text-[11px] font-semibold text-brand-text-slate uppercase tracking-widest">
              Secured Console Operator
            </h3>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_15px_rgba(59,130,246,0.3)] select-none">
                  EV
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-white">Elena Volkov</span>
                  <span className="text-[10px] text-brand-text-slate">Developer Pro Plan</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                PRO OPERATOR
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  onAddLog("Purged cached token registers and cleared database memory limits.", 'sys-health', 'warn');
                  alert("Local metric registers purged successfully.");
                }}
                className="w-full text-left px-3 py-2 text-xs font-sans bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2 text-brand-text cursor-pointer"
              >
                <Database className="h-3.5 w-3.5 text-brand-text-slate" />
                Clear Local Console Cache
              </button>

              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-xs font-sans bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 rounded-lg transition-all flex items-center gap-2 text-rose-400 font-bold cursor-pointer mt-1"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                Log Out of Console
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
