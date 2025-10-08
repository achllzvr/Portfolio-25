import { useState } from 'react';
import profileImg from '../assets/me.jpeg';

export default function CenterChip({ size = 220, reduceMotion=false, onToggleAll, allOpen }) {
  const [showAlt, setShowAlt] = useState(false);
  const handleClick = () => {
    onToggleAll?.();
  };
  return (
    <button
      type="button"
      aria-pressed={allOpen}
      onClick={handleClick}
      onMouseEnter={() => { setShowAlt(s => !s); }}
      className={`chip-shell chip-active flex flex-col items-center justify-center cursor-pointer no-select transition-transform duration-500 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${reduceMotion? '' : 'animate-pulse-glow animate-float-slow'} ${allOpen? 'center-chip-scaled' : ''}`}
      style={{ width: size, height: size, transformOrigin: 'center center' }}
      title={allOpen? 'Collapse all panels' : 'Expand all panels'}
    >
      {showAlt ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-28 h-28 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center text-[11px] font-mono tracking-wide backdrop-blur-sm border border-white/10">
            <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="font-mono text-4xl tracking-tight">AVR</div>
          <div className="text-[11px] font-mono uppercase text-white/70">
            {allOpen ? 'Collapse All' : 'Expand All'}
          </div>
        </div>
      )}
    </button>
  );
}
