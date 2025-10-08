import { useMemo, useState, useEffect, useCallback } from 'react';
import GuideIsland from './components/GuideIsland.jsx';
import CenterChip from './components/CenterChip.jsx';
import ChipNode from './components/ChipNode.jsx';
import CircuitLines from './components/CircuitLines.jsx';
import DetailModal from './components/DetailModal.jsx';
import { baseNodes } from './data/nodes.js';
import { useMouseLight } from './hooks/useMouseLight.js';

export default function App() {
  const [revealed, setRevealed] = useState({});
  const [locked, setLocked] = useState({});
  const [detail, setDetail] = useState(null); // {node, project}
  const [detaching, setDetaching] = useState({}); // nodeId -> true while dragging
  const [signal, setSignal] = useState({}); // nodeId -> true shortly after reattach
  const mouse = useMouseLight();

  const center = useMemo(()=> ({ x: window.innerWidth/2, y: window.innerHeight/2 }), []);
  const SCALE = 0.85; // global layout scale factor (reduced by additional 10%)

  // Spread out with varied radius & elliptical squash; deterministic per node.
  // Explicit Cartesian layout instead of polar to guarantee identical startup.
  // Offsets are from center (chip center). Adjust numbers to fine tune.
  const layoutSpec = [
    { id: 'about', dx: 0, dy: -340, route: 'vertical-first' },
    { id: 'skills', dx: 360, dy: -60, route: 'horizontal-first' },
    { id: 'projects', dx: 420, dy: 80, route: 'horizontal-first' },
    { id: 'links', dx: 0, dy: 360, route: 'vertical-first' },
    { id: 'certs', dx: -420, dy: -40, route: 'horizontal-first' },
    { id: 'experience', dx: -340, dy: 240, route: 'horizontal-first' },
  ];

  // Convert spec to absolute positions
  function specToPos(spec) {
    return { x: center.x + spec.dx * SCALE, y: center.y + spec.dy * SCALE };
  }

  const [nodePositions, setNodePositions] = useState(()=> {
    const byId = Object.fromEntries(baseNodes.map(n => [n.id, n]));
    return layoutSpec.map(spec => ({ ...byId[spec.id], pos: specToPos(spec) }));
  });

  // one-time key bump to refresh lines after first paint
  // eslint-disable-next-line no-unused-vars
  const [refreshToken, setRefreshToken] = useState(0);
  useEffect(()=> {
    // Force one reflow / line refresh only if we did not load from cache (refreshToken stays 0 until this fires)
    const t = requestAnimationFrame(()=> setRefreshToken(r => r === 0 ? 1 : r));
    return ()=> cancelAnimationFrame(t);
  }, []);
  const nodesWithPos = nodePositions; // alias for existing variable names below

  const toggleNode = (id) => {
    setRevealed(r => ({ ...r, [id]: !r[id] }));
  };
  // Toggle all nodes (expand if any collapsed; collapse if all expanded)
  const toggleAllNodes = useCallback(() => {
    setRevealed(prev => {
      const allIds = baseNodes.map(n=> n.id);
      const allOpen = allIds.every(id => prev[id]);
      if(allOpen) {
        // collapse all
        return {};
      }
      // open all
      const next = {};
      for(const id of allIds) next[id] = true;
      return next;
    });
  }, []);
  const toggleLock = (id) => {
    setLocked(l => ({ ...l, [id]: !l[id] }));
  };
  const dragNode = (id, x, y, dragging=false, drop=false) => {
    if(dragging) setDetaching(d => ({ ...d, [id]: true }));
    if(drop) {
      setDetaching(d => ({ ...d, [id]: false }));
      setSignal(s => ({ ...s, [id]: true }));
      setTimeout(()=> setSignal(s => ({ ...s, [id]: false })), 1200);
    }
  setNodePositions(prev => prev.map(n => n.id === id ? { ...n, pos: { x, y } } : n));
    if(drop) {
      // enforce spacing after final drop
      setNodePositions(prev => enforceSpacing(prev, id));
    }
  };

  const MIN_DIST = 35; // minimum center-to-center clearance
  const enforceSpacing = useCallback((nodesList, targetId) => {
    const moved = nodesList.find(n=> n.id === targetId);
    if(!moved) return nodesList;
    let { x, y } = moved.pos;
    let adjusted = false;
    const maxIters = 40;
    const radial = (px, py) => {
      const dx = px - center.x; const dy = py - center.y; const len = Math.hypot(dx, dy) || 1; return { dx: dx/len, dy: dy/len };
    };
    for(let iter=0; iter<maxIters; iter++) {
      let overlap = false;
      for(const n of nodesList) {
        if(n.id === targetId) continue;
        const dx = x - n.pos.x; const dy = y - n.pos.y; const dist = Math.hypot(dx, dy);
        if(dist < MIN_DIST) {
          // push moved node outward along its radial vector from center
            const { dx:rx, dy:ry } = radial(x, y);
            const push = (MIN_DIST - dist) + 2; // small buffer
            x += rx * push; y += ry * push;
            adjusted = true; overlap = true; break;
        }
      }
      if(!overlap) break;
    }
    if(!adjusted) return nodesList;
    return nodesList.map(n => n.id === targetId ? { ...n, pos: { x, y } } : n);
  }, [center.x, center.y]);

  // Re-run spacing when a node expands (revealed state toggled) to avoid overlap due to size change
  useEffect(()=> {
    // heuristically adjust last toggled node if any become revealed
    const lastRevealed = Object.entries(revealed).filter(entry => entry[1]).map(entry => entry[0]).slice(-1)[0];
    if(lastRevealed) {
      setNodePositions(prev => enforceSpacing(prev, lastRevealed));
    }
  }, [revealed, enforceSpacing]);

  const [nearest, setNearest] = useState(null);
  // Only recompute nearest when mouse state (throttled) updates; early exit if nearest unchanged
  useEffect(()=> {
    let closestId = null;
    let min = Infinity;
    for(const n of nodesWithPos) {
      const d = (mouse.x - n.pos.x) ** 2 + (mouse.y - n.pos.y) ** 2; // squared distance cheaper
      if(d < min) { min = d; closestId = n.id; }
    }
    setNearest(prev => prev === closestId ? prev : closestId);
  }, [mouse, nodesWithPos]);

  const detailNode = useMemo(()=> {
    if(!detail) return null;
    const from = nodesWithPos.find(n=> n.id === detail.node.id);
    return { from, pos: { x: from.pos.x + 240, y: from.pos.y + 40 } };
  }, [detail, nodesWithPos]);

  // Theme & motion preferences
  const [theme, setTheme] = useState(()=> localStorage.getItem('theme') || 'dark');
  const [reduceMotion, setReduceMotion] = useState(()=> localStorage.getItem('reduceMotion') === 'true');
  useEffect(()=> { localStorage.setItem('theme', theme); }, [theme]);
  useEffect(()=> { localStorage.setItem('reduceMotion', String(reduceMotion)); }, [reduceMotion]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleMotion = () => setReduceMotion(m => !m);

  return (
  <div className={`relative w-full h-full font-sans overflow-hidden transition-theme ${theme==='light' ? 'theme-light' : 'theme-dark'} ${reduceMotion? 'motion-reduce' : ''}` }>
  {/* Cross-fade stacked backgrounds (dark & light both rendered) */}
  <div className="absolute inset-0">
    {/* Dark stack */}
    <div className={`absolute inset-0 transition-opacity duration-[750ms] ease-[cubic-bezier(.4,0,.2,1)] ${theme==='dark' ? 'opacity-100' : 'opacity-0'}`} aria-hidden={theme!=='dark'}>
      <div className="absolute inset-0 bg-[#0b0d10]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#12161b] via-transparent to-[#0a0c0e] opacity-80" />
      <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 35%, rgba(0,0,0,0) 55%)'}} />
      <div className="absolute inset-0 opacity-[0.10] mix-blend-screen bg-[linear-gradient(#23282e_1px,transparent_1px),linear-gradient(90deg,#23282e_1px,transparent_1px)] bg-[size:16px_16px]" />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-screen bg-[linear-gradient(#1a1f25_1px,transparent_1px),linear-gradient(90deg,#1a1f25_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 85%)'}} />
      <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.75) 100%)'}} />
    </div>
    {/* Light (inverted) stack */}
    <div className={`absolute inset-0 transition-opacity duration-[750ms] ease-[cubic-bezier(.4,0,.2,1)] ${theme==='light' ? 'opacity-100' : 'opacity-0'}`} aria-hidden={theme!=='light'}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#e1e3e6] via-[#e7e9ec] to-[#dfe2e5]" />
      <div className="absolute inset-0 opacity-80" style={{background:'radial-gradient(circle at 50% 42%, rgba(0,0,0,0.11) 0%, rgba(0,0,0,0.00) 58%)'}} />
      <div className="absolute inset-0 opacity-[0.22] bg-[linear-gradient(#9ea3a9_1px,transparent_1px),linear-gradient(90deg,#9ea3a9_1px,transparent_1px)] bg-[size:16px_16px]" />
      <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(#8a9096_1px,transparent_1px),linear-gradient(90deg,#8a9096_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.28) 92%)'}} />
    </div>
  </div>

  {/* Circuit Lines (always visible; individual path animates during its own detach) */}
  <CircuitLines center={center} nodes={nodesWithPos} detailNode={detailNode} highlightedId={nearest} detaching={detaching} signal={signal} reduceMotion={reduceMotion} />

      {/* Nodes */}
      {nodesWithPos.map(n => (
        <ChipNode
          key={n.id}
          node={n}
          revealed={!!revealed[n.id]}
          locked={!!locked[n.id]}
          highlighted={nearest===n.id}
          onToggle={toggleNode}
          onLockToggle={toggleLock}
          onItemClick={(node, project)=> setDetail({ node, project })}
          onDrag={dragNode}
          reduceMotion={reduceMotion}
          style={{ left: n.pos.x - (128 * SCALE), top: n.pos.y - (48 * SCALE) }}
        />
      ))}

      {/* Center chip */}
      <div className="absolute" style={{ left: center.x - (100 * SCALE), top: center.y - (100 * SCALE) }}>
        <CenterChip size={200 * SCALE} reduceMotion={reduceMotion} onToggleAll={toggleAllNodes} allOpen={baseNodes.every(n=> revealed[n.id])} />
      </div>

      {/* Detail Modal */}
      {detail && (
        <DetailModal
          node={detail.node}
          project={detail.project}
          position={detailNode.pos}
          onClose={()=> setDetail(null)}
        />
      )}

      {/* Mouse light overlay (CSS variables updated outside React for smoother perf) */}
      <div className="pointer-events-none fixed inset-0 glow-overlay" />
      <GuideIsland
        theme={theme}
        reduceMotion={reduceMotion}
        onToggleTheme={toggleTheme}
        onToggleMotion={toggleMotion}
      />
    </div>
  );
}

