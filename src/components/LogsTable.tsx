import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  AlertCircle,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { LogEntry } from '../types';

interface LogsTableProps {
  logs: LogEntry[];
  onAddLog: (message: string, nodeId: string, level: 'info' | 'warn' | 'error', latency?: number) => void;
}

export default function LogsTable({ logs, onAddLog }: LogsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [stepFilter, setStepFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 11;

  // Filter lists based on states
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.nodeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesStep = stepFilter === 'all' || log.step === stepFilter;
    return matchesSearch && matchesLevel && matchesStep;
  }).reverse(); // Latest logs first

  // Handle pagination calculation bounds
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage((p) => p - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const downloadDataset = () => {
    const jsonString = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthetic_intelligence_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onAddLog("Exported persistent metric timeline JSON dataset", 'system-exporter', 'info');
  };

  return (
    <div id="logs-workspace-layout" className="flex flex-col gap-5">
      
      {/* Filtering & Actions bar */}
      <div id="logs-filters-container" className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-lg bg-brand-surface-low border border-brand-primary/10">
        
        {/* Search input inset feel */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-brand-text-slate">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="logs-search-query"
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search network packets or Trace ID..."
            className="w-full bg-inset-input rounded-md pl-9 pr-3 py-1.5 font-sans text-xs focus:bg-inset-input"
          />
        </div>

        {/* Dynamic drop categories */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          
          {/* Level Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-sans text-[11px] text-brand-text-slate uppercase tracking-wider font-semibold">Classification:</span>
            <select
              id="logs-level-filter"
              value={levelFilter}
              onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}
              className="bg-brand-surface-lowest border border-brand-surface-high/60 pr-8 pl-3 py-1 text-xs rounded text-white font-sans focus:outline-none focus:border-brand-teal"
            >
              <option value="all">All levels</option>
              <option value="info">Info</option>
              <option value="warn">Warnings</option>
              <option value="error">Errors</option>
            </select>
          </div>

          {/* Node Step filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-sans text-[11px] text-brand-text-slate uppercase tracking-wider font-semibold">Node Code:</span>
            <select
              id="logs-step-filter"
              value={stepFilter}
              onChange={(e) => { setStepFilter(e.target.value); setCurrentPage(1); }}
              className="bg-brand-surface-lowest border border-brand-surface-high/60 pr-8 pl-3 py-1 text-xs rounded text-white font-sans focus:outline-none focus:border-brand-teal"
            >
              <option value="all">All steps</option>
              <option value="ingestion">dataloader</option>
              <option value="embedding">tensor-embedder</option>
              <option value="retrieval">vector-retriever</option>
              <option value="synthesis">gemini-synthesis</option>
              <option value="system">cluster-system</option>
            </select>
          </div>

          {/* Download JSON Log dataset action button */}
          <button
            id="logs-export-btn"
            onClick={downloadDataset}
            className="bg-brand-surface-highest hover:bg-brand-surface-bright text-brand-secondary border border-brand-secondary/20 px-4 py-1.5 rounded text-xs font-semibold font-sans flex items-center gap-1.5 select-none transition-all cursor-pointer h-8 ml-auto"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Main Dense Table Box */}
      <div id="logs-table-card" className="glass-panel rounded-lg bg-brand-surface-low border border-brand-primary/10 overflow-hidden flex flex-col justify-between h-[456px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs select-none">
            <thead>
              <tr className="bg-brand-surface-lowest border-b border-brand-surface-high/60 text-[10px] text-brand-text-slate uppercase font-semibold tracking-wider">
                <th className="py-3 px-4.5">Timestamp</th>
                <th className="py-3 px-4.5">Trace Node</th>
                <th className="py-3 px-4.5">Method Step</th>
                <th className="py-3 px-4.5">Level Priority</th>
                <th className="py-3 px-4.5 w-[45%]">Message Payload</th>
                <th className="py-3 px-4.5 text-right">Size</th>
                <th className="py-3 px-4.5 text-right">Delay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-surface-high/30 font-sans text-brand-text-dim">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => {
                  
                  // Priority labels mapping
                  const levelLabel = {
                    info: 'text-brand-teal bg-brand-teal/5 border-brand-teal/20',
                    warn: 'text-amber-400 bg-amber-400/5 border-amber-400/20',
                    error: 'text-rose-400 bg-rose-400/5 border-rose-400/20'
                  }[log.level];

                  // Step tag mapping
                  const stepLabel = {
                    ingestion: 'dataloader',
                    embedding: 'tensor-emb',
                    retrieval: 'vector-rag',
                    synthesis: 'gemini-syn',
                    system: 'sys-health'
                  }[log.step] || log.step;

                  return (
                    <tr
                      id={`log-row-${log.id}`}
                      key={log.id}
                      className="hover:bg-brand-surface-container/20 transition-colors"
                    >
                      {/* Timestamp tabular font */}
                      <td className="py-2.5 px-4.5 font-mono text-brand-text-slate text-[11px] font-tnum">
                        {log.timestamp}
                      </td>
                      
                      {/* Trace Node identifier */}
                      <td className="py-2.5 px-4.5 font-mono text-[11px] text-white">
                        {log.nodeId}
                      </td>

                      {/* Method step badge */}
                      <td className="py-2.5 px-4.5">
                        <span className="px-2 py-0.5 rounded-sm bg-brand-surface-highest border border-brand-surface-high/50 text-[10px] font-mono text-brand-text-dim">
                          {stepLabel}
                        </span>
                      </td>

                      {/* Glowing level bullet priority tag */}
                      <td className="py-2.5 px-4.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide uppercase ${levelLabel}`}>
                          ● {log.level}
                        </span>
                      </td>

                      {/* Message payload snippet */}
                      <td className="py-2.5 px-4.5 truncate max-w-xs font-mono text-[11px]">
                        {log.message}
                      </td>

                      {/* Payload size */}
                      <td className="py-2.5 px-4.5 text-right font-mono text-[11px] font-tnum text-brand-text-slate">
                        {log.payloadSize ? `${log.payloadSize}KB` : '—'}
                      </td>

                      {/* Latency process duration */}
                      <td className="py-2.5 px-4.5 text-right font-mono text-[11px] font-tnum text-brand-teal">
                        {log.latencyMs ? `${log.latencyMs}ms` : '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-brand-text-slate">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="h-8 w-8 text-brand-teal opacity-40 animate-pulse" />
                      <span>Data stream matches are currently empty. Check filters.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dense footer pagination controllers */}
        <div className="flex justify-between items-center border-t border-brand-surface-high/40 p-3 bg-brand-surface-lowest">
          <div className="flex items-center gap-1 font-sans text-[11px] text-brand-text-slate">
            <span>Displaying logs:</span>
            <span className="font-mono text-xs font-semibold text-white font-tnum">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>
            <span>-</span>
            <span className="font-mono text-xs font-semibold text-white font-tnum">
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
            </span>
            <span>of</span>
            <span className="font-mono text-xs font-semibold text-white font-tnum">
              {filteredLogs.length}
            </span>
          </div>

          <div className="flex items-center gap-3 select-none">
            <button
              id="pagination-prev-btn"
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1}
              className="p-1 px-3 rounded bg-brand-surface-container border border-brand-surface-high/60 cursor-pointer disabled:opacity-30 disabled:pointer-events-none hover:border-brand-teal/40 transition-all text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-xs text-brand-text-slate font-tnum">
              Page {currentPage} of {totalPages}
            </span>
            <button
              id="pagination-next-btn"
              onClick={() => handlePageChange('next')}
              disabled={currentPage === totalPages}
              className="p-1 px-3 rounded bg-brand-surface-container border border-brand-surface-high/60 cursor-pointer disabled:opacity-30 disabled:pointer-events-none hover:border-brand-teal/40 transition-all text-xs"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
