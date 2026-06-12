import React from 'react';
import { motion } from 'motion/react';

interface SegmentedControlProps {
  id?: string;
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SegmentedControl({
  id = 'segmented-control',
  options,
  selected,
  onChange,
  className = ''
}: SegmentedControlProps) {
  const currentIdx = options.findIndex((opt) => opt.value === selected);

  return (
    <div
      id={id}
      className={`relative flex rounded-md bg-brand-surface-lowest p-1 border border-brand-surface-high/50 ${className}`}
    >
      {options.map((option, index) => {
        const isSelected = option.value === selected;
        return (
          <button
            id={`segment-btn-${option.value}`}
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex-1 z-10 py-1.5 px-3 rounded text-center transition-colors font-sans text-xs font-semibold leading-none select-none outline-none ${
              isSelected ? 'text-brand-lowest' : 'text-brand-text-dim hover:text-brand-text'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={`pill-bg-${id}`}
                className="absolute inset-0 bg-brand-primary rounded z-[-1] shadow-[0_2px_10px_rgba(194,193,255,0.4)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
