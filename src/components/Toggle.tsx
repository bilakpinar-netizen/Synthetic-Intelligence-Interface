import React from 'react';
import { motion } from 'motion/react';

interface ToggleProps {
  id?: string;
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  description?: string;
}

export default function Toggle({
  id = 'custom-switch',
  label,
  checked,
  onChange,
  className = '',
  description
}: ToggleProps) {
  return (
    <div id={`${id}-wrapper`} className={`flex items-center justify-between gap-4 select-none ${className}`}>
      {label && (
        <div id={`${id}-labels`} className="flex flex-col gap-0.5 pointer-events-none">
          <span className="font-sans text-xs font-semibold tracking-wider text-brand-text-dim uppercase leading-none">
            {label}
          </span>
          {description && (
            <span className="font-sans text-[11px] text-brand-text-slate">
              {description}
            </span>
          )}
        </div>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full p-0.5 border-none outline-none transition-colors duration-200 ease-in-out select-none ${
          checked ? 'bg-brand-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-brand-surface-highest'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${
            checked ? 'ml-5' : 'ml-0'
          }`}
        />
      </button>
    </div>
  );
}
