import React from 'react';

interface StatusIndicatorProps {
  status: 'active' | 'warning' | 'idle';
  label?: string;
  className?: string;
}

export default function StatusIndicator({ status, label, className = '' }: StatusIndicatorProps) {
  const dotColor = {
    active: 'bg-brand-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]',
    warning: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    idle: 'bg-brand-text-slate opacity-40'
  }[status];

  const ringColor = {
    active: 'border-brand-primary',
    warning: 'border-amber-400',
    idle: 'border-transparent'
  }[status];

  return (
    <div id="status-indicator-container" className={`flex items-center gap-2.5 ${className}`}>
      <div id={`status-dot-${status}`} className="relative flex h-3.5 w-3.5 items-center justify-center">
        {status !== 'idle' && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full border opacity-50 ${ringColor}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
      </div>
      {label && (
        <span id="status-indicator-label" className="font-sans text-[11px] font-semibold tracking-wider text-brand-text-dim uppercase leading-none">
          {label}
        </span>
      )}
    </div>
  );
}
