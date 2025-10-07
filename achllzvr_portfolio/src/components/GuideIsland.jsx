import { useState, useRef, useEffect } from 'react';

export default function GuideIsland({ reduceMotion, onToggleMotion }) {
  const [open, setOpen] = useState(false);
  const hoverRef = useRef(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(()=> {
    const handler = (e) => {
      if(!containerRef.current) return;
      if(!containerRef.current.contains(e.target)) {
        if(!hoverRef.current) setOpen(false);
      }
    };
    window.addEventListener('pointerdown', handler);
    return ()=> window.removeEventListener('pointerdown', handler);
  }, []);

  const toggle = () => setOpen(o=> !o);

  return (
    <div ref={containerRef} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      {/* Anchor wrapper so expanded panel can position below */}
      <div className="relative flex flex-col items-center">
        <button
          aria-label="Guide"
          aria-expanded={open}
          onClick={toggle}
          onMouseEnter={()=> { hoverRef.current = true; setOpen(true); }}
          onMouseLeave={()=> { hoverRef.current = false; if(!reduceMotion) setTimeout(()=> { if(!hoverRef.current) setOpen(false); }, 350); }}
          className={`group relative font-mono text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 transition-colors w-9 h-9 flex items-center justify-center`}
          style={{ WebkitTapHighlightColor:'transparent' }}
        >
          <span className={`absolute inset-0 rounded-full overflow-hidden ${open? 'scale-90 opacity-40' : 'scale-100 opacity-100'} transition-all duration-300 ease-[cubic-bezier(.4,.8,.2,1)] bg-white/12 border border-white/25 backdrop-blur-md shadow-lg`}/>
          {!open && (
            <span className={`relative z-10 text-white/80 theme-light:text-neutral-700 ${reduceMotion? '' : 'animate-guide-spin'} select-none`}>?</span>
          )}
        </button>
        {/* Expanded Panel below */}
        <div
          onMouseEnter={()=> { hoverRef.current = true; setOpen(true); }}
          onMouseLeave={()=> { hoverRef.current = false; if(!reduceMotion) setTimeout(()=> { if(!hoverRef.current) setOpen(false); }, 350); }}
          className={`mt-2 origin-top w-[min(92vw,560px)] rounded-2xl backdrop-blur-md border shadow-xl flex flex-col gap-4 text-white/85 bg-white/12 border-white/20 p-0 overflow-hidden
            ${open? 'opacity-100 translate-y-0 scale-100 max-h-[520px]' : 'opacity-0 -translate-y-1 scale-95 pointer-events-none max-h-0'}
            transition-all ${reduceMotion? 'duration-0' : 'duration-400'} ease-[cubic-bezier(.33,.79,.24,1.04)] shadow-[0_8px_28px_-10px_rgba(0,0,0,0.55)]`}
          style={{ transitionProperty:'opacity,transform,max-height,box-shadow' }}
        >
          <div className={`flex items-start justify-between px-5 pt-4 ${open? 'animate-[fadeSlide_.55s_ease_forwards]' : ''}`}> 
            <div className="flex flex-col gap-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] rounded bg-white/15 border border-white/25 tracking-wide">GUIDE</span>
                <span className="text-[11px] opacity-60 hidden md:inline">Interact & Explore</span>
              </div>
              <p className="text-[11px] leading-snug opacity-70 hidden lg:block max-w-[420px]">Drag after a short press to reposition nodes. Switch theme or motion preference anytime. Hover the center chip to flip.</p>
            </div>
              <div className="flex items-center gap-2">
              <button type="button" onClick={(e)=> { e.stopPropagation(); onToggleMotion(); }} className={`px-2 py-1 rounded-md border text-[11px] transition ${reduceMotion? 'bg-white/25' : 'bg-white/10'} border-white/25 hover:border-white/50`}>{reduceMotion? 'Motion Off' : 'Motion On'}</button>
              <button type="button" onClick={(e)=> { e.stopPropagation(); setOpen(false); }} className="px-2 py-1 rounded-md border text-[11px] transition bg-white/5 border-white/25 hover:border-white/50" aria-label="Close guide">×</button>
            </div>
          </div>
          <div className={`grid grid-cols-2 gap-4 px-5 pb-5 text-[11px] leading-relaxed overflow-y-auto ${open? 'animate-[fadeStagger_.6s_.05s_ease_forwards]' : ''}`}> 
            <ul className="space-y-1 list-disc list-inside marker:text-white/40">
              <li>Hover center chip to toggle</li>
              <li>Click nodes to expand</li>
              <li>Long-press then drag</li>
              <li>Release: line regrows</li>
            </ul>
            <ul className="space-y-1 list-disc list-inside marker:text-white/40">
              <li>Nearest node highlights</li>
              <li>Projects have details</li>
              <li>Links / Certs show icons</li>
              <li>Use toggles anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
