import React from 'react';

interface SliderProps {
  id?: string;
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
}

export default function Slider({
  id = 'custom-slider',
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = '',
  className = ''
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  // Track styling using a dynamic linear gradient
  const trackStyle = {
    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%, rgba(255, 255, 255, 0.1) 100%)`
  };

  return (
    <div id={`${id}-wrapper`} className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div id={`${id}-header`} className="flex justify-between items-center text-xs font-semibold select-none leading-none">
          <span className="text-brand-text-dim text-[11px] uppercase tracking-wider font-sans">{label}</span>
          <span className="text-brand-primary font-mono text-[13px] font-tnum">
            {value}
            <span className="text-[10px] text-brand-text-slate ml-0.5">{unit}</span>
          </span>
        </div>
      )}
      <div id={`${id}-container`} className="relative flex items-center h-5">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={trackStyle}
          className="w-full h-[6px] rounded-lg cursor-pointer outline-none transition-all appearance-none
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(59,130,246,0.8)] [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-120
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(59,130,246,0.8)] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-120 hover:opacity-95"
        />
      </div>
    </div>
  );
}
