import { useState } from 'react';

export default function CenterChip({ size = 220, onToggle, reduceMotion=false }) {
  const [showAlt, setShowAlt] = useState(false);
  return (
    <div
      onMouseEnter={() => { setShowAlt(s => !s); onToggle?.(!showAlt); }}
  className={`chip-shell chip-active flex flex-col items-center justify-center cursor-pointer no-select transition-all duration-500 text-[15px] ${reduceMotion? '' : 'animate-pulse-glow animate-float-slow'}`}
      style={{ width: size, height: size }}
    >
      {showAlt ? (
        <div className="w-full h-full flex items-center justify-center">
          {/* Placeholder for photo */}
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center text-xs font-mono tracking-wide backdrop-blur-sm border border-white/10">PHOTO</div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="font-mono text-5xl tracking-tighter">AVR</div>
          <div className="text-[11px] font-mono uppercase text-white/60">Hover to Toggle</div>
        </div>
      )}
    </div>
  );
}
