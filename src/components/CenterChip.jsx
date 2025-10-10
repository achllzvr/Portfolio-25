import { useState } from 'react';
import profileImg from '../assets/me.jpeg';
import logoTransparent from '../assets/transparenticon.png';

export default function CenterChip({ size = 220, reduceMotion=false, onToggleAll, allOpen }) {
  const [showAlt, setShowAlt] = useState(false);
  const handleClick = () => onToggleAll?.();
  return (
    <button
  type="button"
      aria-pressed={allOpen}
      onClick={handleClick}
  // toggle which is in front each time the user hovers in
  onMouseEnter={() => { setShowAlt(s => !s); }}
  onMouseLeave={() => { /* keep state until next enter */ }}
  className={`relative chip-shell chip-active flex items-center justify-center cursor-pointer no-select transition-transform duration-500 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${reduceMotion? '' : 'animate-pulse-glow animate-float-slow'} ${allOpen? 'center-chip-scaled' : ''}`}
      style={{ width: size, height: size, transformOrigin: 'center center' }}
      title={allOpen? 'Collapse all panels' : 'Expand all panels'}
    
      >
      {/* Full-bleed profile image with padding */}
      <span
        className={`absolute inset-0 rounded-xl overflow-hidden pointer-events-none p-2 transform ${showAlt ? 'opacity-100 scale-105' : 'opacity-95 scale-100'}`}
        style={{
          transition: 'opacity 400ms cubic-bezier(.33,.79,.24,1), transform 400ms cubic-bezier(.33,.79,.24,1)'
        }}
      >
        <img src={profileImg} alt="Profile" className="w-full h-full object-cover rounded-lg" style={{transition: 'inherit'}} />
        {/* Darker overlay when logo is front (showAlt === false) to improve contrast */}
        <span
          className={`absolute inset-0 mix-blend-multiply ${showAlt ? '' : ''}`}
          aria-hidden
          style={{
            transition: 'background-color 400ms cubic-bezier(.33,.79,.24,1), opacity 400ms cubic-bezier(.33,.79,.24,1)',
            backgroundColor: showAlt ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.40)'
          }}
        />
      </span>
      {/* Foreground content (logo or text) */}
      <div className="relative z-10 flex items-center justify-center">
        <img
          src={logoTransparent}
          alt="Logo"
          className={`w-20 h-20 object-contain transform ${showAlt ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
          style={{transition: 'opacity 400ms cubic-bezier(.33,.79,.24,1), transform 400ms cubic-bezier(.33,.79,.24,1)'}}
        />
      </div>
    </button>
  );
}
