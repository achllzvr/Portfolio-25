import { useRef, useState, useEffect, useLayoutEffect, memo } from 'react';

// Export shared pin geometry so line routing can align exactly
export const NODE_PIN_GAP = 16; // space between node outer box and pin center
export const NODE_PIN_SIZE = 8; // square size (CSS width/height)
import { getIcon, skills as skillObjects } from '../content/portfolioContent.jsx';

function ChipNodeInner({ node, revealed, onToggle, highlighted, onItemClick, style, onDrag, reduceMotion=false, onMeasure, onOpenCert }) {
  // Long press drag logic (robust against re-renders)
  const pressTimerRef = useRef(null);
  const isPressingRef = useRef(false);
  const draggingRef = useRef(false);
  const originRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const PRESS_DELAY = 500; // reduced from 1500ms to 500ms
  const MOVE_CANCEL_THRESHOLD = 6; // px before long-press cancels

  const clearTimers = () => { if(pressTimerRef.current) { clearTimeout(pressTimerRef.current); pressTimerRef.current = null; } };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    isPressingRef.current = true;
    draggingRef.current = false;
    originRef.current = { x: node.pos.x, y: node.pos.y };
    lastPosRef.current = { ...originRef.current };
    const startX = e.clientX; const startY = e.clientY;
    pressTimerRef.current = window.setTimeout(() => {
      if(!isPressingRef.current) return;
      draggingRef.current = true;
      setIsDragging(true);
      onDrag(node.id, originRef.current.x, originRef.current.y, true); // start (detach)
    }, PRESS_DELAY);

    const move = (ev) => {
      const dxRaw = ev.clientX - startX; const dyRaw = ev.clientY - startY;
      if(!draggingRef.current && Math.hypot(dxRaw, dyRaw) > MOVE_CANCEL_THRESHOLD) {
        clearTimers();
        isPressingRef.current = false;
        // early move cancels click toggle; do nothing more
        return;
      }
      if(!draggingRef.current) return;
      const x = originRef.current.x + dxRaw;
      const y = originRef.current.y + dyRaw;
      lastPosRef.current = { x, y };
      onDrag(node.id, x, y, true); // live move
    };

    const upOrCancel = () => {
      clearTimers();
      if(draggingRef.current) {
        // finalize at lastPosRef instead of stale node.pos
        onDrag(node.id, lastPosRef.current.x, lastPosRef.current.y, false, true);
      } else if(isPressingRef.current) {
        // treat as click if press ended before long-press activation and not canceled by move
        onToggle(node.id);
      }
      draggingRef.current = false;
      isPressingRef.current = false;
      setIsDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', upOrCancel);
      window.removeEventListener('pointerleave', upOrCancel);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', upOrCancel);
    window.addEventListener('pointerleave', upOrCancel);
  };

  // Local mount state to allow collapse animation before unmount
  const [showDetail, setShowDetail] = useState(revealed);
  useEffect(()=> {
    if(revealed) {
      setShowDetail(true);
    } else {
      // delay unmount for animation (match CSS duration ~500ms)
      const t = setTimeout(()=> setShowDetail(false), 520);
      return ()=> clearTimeout(t);
    }
  }, [revealed]);

  // measure for dynamic pin placement
  const rootRef = useRef(null);
  useLayoutEffect(()=> {
    if(rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
  onMeasure?.(node.id, rect);
    }
  }, [revealed, node.id, onMeasure]);
  useEffect(()=> {
    const handler = () => {
      if(rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect();
  onMeasure?.(node.id, rect);
      }
    };
    window.addEventListener('resize', handler);
    return ()=> window.removeEventListener('resize', handler);
  }, [node.id, onMeasure]);

  // pin visuals removed; pin geometry constants retained for routing logic elsewhere

 const expandUp = node.id === 'about' || node.id === 'skills' || node.id === 'certs';
 const styledDetail = ['about','skills','certs','experience','links','projects'].includes(node.id);

 return (
    <div
      ref={rootRef}
      className={`chip-shell absolute ${node.id==='projects' && revealed ? 'w-[30rem]' : 'w-80'} transition-all duration-300 ease-out-soft ${highlighted ? 'chip-active scale-[1.04]' : 'hover:shadow-glow'} ${revealed ? 'backdrop-blur-lg bg-white/10' : 'bg-white/5'} cursor-pointer select-none text-[14px]`}
      style={style}
      onPointerDown={handlePointerDown}
    >
      <div className={`${(isDragging || reduceMotion) ? '' : 'animate-float-medium'} flex flex-col p-5 gap-4`}>
        <div className="flex items-center justify-between">
          <div className="chip-title text-[14px] tracking-wide">{node.label}</div>
        {/* lock button removed per request */}
      </div>
      {showDetail && (
        expandUp ? (
          <div
            className={`detail-anim ${revealed ? 'detail-open' : 'detail-closed'} detail-up ${styledDetail? 'chip-shell':''} text-[14px] font-mono leading-relaxed overflow-auto pr-1 space-y-2 scroll-thin`}
            aria-hidden={!revealed}
          >
            {node.type === 'list' && node.content.map((c,i) => <div key={i}>{'> '}{c}</div>)}
            {node.type === 'tags' && (
              <div className="flex flex-wrap gap-1">{skillObjects.map(s => <span key={s.name} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/25 text-[11px]"><span className="opacity-80">{getIcon(s.icon)}</span>{s.name}</span>)}</div>
            )}
            {node.type === 'links' && node.content.map(l => (
              <a key={l.id || l.label} href={l.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/80 hover:text-white underline underline-offset-4">
                <span className="text-[13px] opacity-80">{getIcon(l.icon)}</span>{l.label || l.text}
              </a>
            ))}
            {node.type === 'certs' && node.content.map(c => (
              <div key={c.name} className="flex items-center gap-2 text-white/80">
                {c.icon ? <img src={c.icon} alt="badge" className="w-5 h-5 rounded-sm" /> : <span className="text-[11px] opacity-70">{getIcon('api')}</span>}
                {c.file ? (
                  <button onClick={(e)=>{ e.stopPropagation(); onOpenCert?.(c); }} className="hover:text-white underline decoration-dotted underline-offset-4 text-left">{c.name}</button>
                ) : (
                  c.link ? <a href={c.link} target="_blank" rel="noreferrer" className="hover:text-white underline decoration-dotted underline-offset-4">{c.name}</a> : c.name
                )}
              </div>
            ))}
            {node.type === 'projects' && (
              <div className="grid md:grid-cols-2 gap-3">
                {node.content.map(p => (
                  <div key={p.id} onClick={(e)=>{ e.stopPropagation(); onItemClick?.(node,p); }} className="group border border-white/10 rounded-md p-3 hover:border-white/60 hover:bg-white/10 transition relative">
                    <div className="font-mono text-[13px] flex justify-between"><span>{p.title}</span><span className="text-white/40">{p.stack[0]}</span></div>
                    <div className="text-[12px] text-white/60 line-clamp-2">{p.blurb}</div>
                    <div className="hidden group-hover:block absolute -top-3 -right-2 text-[9px] bg-white text-black px-1 rounded shadow">Details</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          ) : (
            <div
              className={`detail-anim ${revealed ? 'detail-open' : 'detail-closed'} ${styledDetail? 'detail-down chip-shell':''} text-[14px] font-mono leading-relaxed overflow-auto pr-1 space-y-2 scroll-thin`}
              aria-hidden={!revealed}
            >
            {node.type === 'list' && node.content.map((c,i) => <div key={i}>{'> '}{c}</div>)}
            {node.type === 'tags' && (
              <div className="flex flex-wrap gap-1">{skillObjects.map(s => <span key={s.name} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/25 text-[11px]"><span className="opacity-80">{getIcon(s.icon)}</span>{s.name}</span>)}</div>
            )}
            {node.type === 'links' && node.content.map(l => (
              <a key={l.id || l.label} href={l.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/80 hover:text-white underline underline-offset-4">
                <span className="text-[13px] opacity-80">{getIcon(l.icon)}</span>{l.label || l.text}
              </a>
            ))}
            {node.type === 'certs' && node.content.map(c => (
              <div key={c.name} className="flex items-center gap-2 text-white/80">
                <span className="text-[11px] opacity-70">{getIcon('api')}</span>
                {c.link ? <a href={c.link} target="_blank" rel="noreferrer" className="hover:text-white underline decoration-dotted underline-offset-4">{c.name}</a> : c.name}
              </div>
            ))}
            {node.type === 'projects' && (
              <div className="grid md:grid-cols-2 gap-3">
                {node.content.map(p => (
                  <div key={p.id} onClick={(e)=>{ e.stopPropagation(); onItemClick?.(node,p); }} className="group border border-white/10 rounded-md p-3 hover:border-white/60 hover:bg-white/10 transition relative">
                    <div className="font-mono text-[13px] flex justify-between"><span>{p.title}</span><span className="text-white/40">{p.stack[0]}</span></div>
                    <div className="text-[12px] text-white/60 line-clamp-2">{p.blurb}</div>
                    <div className="hidden group-hover:block absolute -top-3 -right-2 text-[9px] bg-white text-black px-1 rounded shadow">Details</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}
      {/* pin visual removed per request */}
      </div>
    </div>
  );
}

const areEqual = (prev, next) => {
  // Only re-render if these change; ignore style object identity by comparing relevant numeric positions
  const prevPos = prev.node.pos; const nextPos = next.node.pos;
  return prev.revealed === next.revealed &&
    // locked removed
    prev.highlighted === next.highlighted &&
    prev.node.id === next.node.id &&
    prevPos.x === nextPos.x && prevPos.y === nextPos.y &&
    prev.node.label === next.node.label &&
    prev.node.type === next.node.type &&
    prev.node.content === next.node.content; // content arrays assumed stable reference
};

const ChipNode = memo(ChipNodeInner, areEqual);

export default ChipNode;
