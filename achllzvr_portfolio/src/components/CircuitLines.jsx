import { useMemo, useEffect, useRef, useCallback } from 'react';
import { NODE_PIN_GAP, NODE_PIN_SIZE } from './ChipNode.jsx';

// Generate uniformly spaced pins (5 per side by default) around a square-ish center chip
function generatePins(center, chipSize=200, perSide=5) {
  const half = chipSize/2;
  const gap = chipSize / (perSide + 1);
  const pins = [];
  // Left & Right sides (vary y)
  for(let i=1;i<=perSide;i++) {
    const y = center.y - half + gap*i;
    pins.push({ id:`L${i}`, x: center.x - half, y });
    pins.push({ id:`R${i}`, x: center.x + half, y });
  }
  // Top & Bottom (vary x)
  for(let i=1;i<=perSide;i++) {
    const x = center.x - half + gap*i;
    pins.push({ id:`T${i}`, x, y: center.y - half });
    pins.push({ id:`B${i}`, x, y: center.y + half });
  }
  return pins;
}


// Choose nearest pin to a node position (Euclidean distance) - stable mapping per render.
function findNearestPin(pins, pos) {
  let best = pins[0];
  let min = Infinity;
  for(const p of pins) {
    const d = (p.x - pos.x)**2 + (p.y - pos.y)**2;
    if(d < min) { min = d; best = p; }
  }
  return best;
}

export default function CircuitLines({ center, chipSize=200, nodes, detailNode, highlightedId, detaching, signal, reduceMotion=false, nodeDims={} }) {
  const pins = useMemo(()=> generatePins(center, chipSize, 5), [center, chipSize]);

  // No bus columns in simplified reference style

  // Cache map keyed by node id with {pinId, d, length} to avoid recomputing path lengths repeatedly.
  const cacheRef = useRef({});
  const pinAssignmentsRef = useRef({});

  // Ensure unique pin assignment: greedily assign nearest free pin for each node (stable ordering by id)
  const pinAssignments = useMemo(()=> {
    const free = [...pins];
    const assigned = {};
    const nodesSorted = [...nodes].sort((a,b)=> a.id.localeCompare(b.id));
    for(const n of nodesSorted) {
      let bestPin = null; let bestDist = Infinity; let bestIndex = -1;
      free.forEach((p,i)=> { const d = (p.x-n.pos.x)**2 + (p.y-n.pos.y)**2; if(d<bestDist){ bestDist=d; bestPin=p; bestIndex=i; }});
      if(bestPin) { assigned[n.id] = bestPin; free.splice(bestIndex,1); }
    }
    pinAssignmentsRef.current = assigned;
    return assigned;
  }, [nodes, pins]);

  const paths = useMemo(()=> {
    const arr = [];
    for(const n of nodes) {
      const pin = pinAssignments[n.id] || findNearestPin(pins, n.pos);
      const target = n.pos;
      const dims = nodeDims[n.id] || { width: (n.id==='projects'? 480 : 320), height: 96 };
      const halfW = dims.width / 2; const halfH = dims.height / 2;
      const dx = target.x - center.x; const dy = target.y - center.y;
      const absDx = Math.abs(dx); const absDy = Math.abs(dy);
      let side;
      if(absDx > absDy) side = dx < 0 ? 'right' : 'left'; else side = dy < 0 ? 'bottom' : 'top';
  const GAP = NODE_PIN_GAP; // consistent with ChipNode
      let anchorX = target.x; let anchorY = target.y;
      if(side === 'left') anchorX = target.x - halfW - GAP;
      if(side === 'right') anchorX = target.x + halfW + GAP;
      if(side === 'top') anchorY = target.y - halfH - GAP;
      if(side === 'bottom') anchorY = target.y + halfH + GAP;
  // Adjust anchor to pin center by adding half the pin size in the direction of travel so path ends at visual center
  const pinHalf = NODE_PIN_SIZE / 2;
  if(side === 'left') anchorX -= pinHalf; else if(side === 'right') anchorX += pinHalf;
  if(side === 'top') anchorY -= pinHalf; else if(side === 'bottom') anchorY += pinHalf;
      // anchorX/anchorY calculated above using measured dims (halfW/halfH) and GAP
      // Strategy: minimal segments. We create a stub leaving the center pin, then decide routing order:
      // If node pin is horizontally displaced more than vertical (left/right side), go horizontal first then vertical.
      // If vertically oriented (top/bottom side), go vertical first then horizontal.
      // This yields 4 segments total (M + 3 lines) unless a dog-leg is required to avoid direct overlap with chip edge.
      const stub = 14;
      let exitX = pin.x, exitY = pin.y;
      if(pin.id.startsWith('L')) exitX -= stub; else if(pin.id.startsWith('R')) exitX += stub; else if(pin.id.startsWith('T')) exitY -= stub; else if(pin.id.startsWith('B')) exitY += stub;

      // Decide routing order. Use side (relative orientation of node) not pin id, because side reflects node pin placement.
      let d;
      if(side === 'left' || side === 'right') {
        // Horizontal-first then vertical to anchorY then into anchorX if needed.
        // We ensure an intermediate elbowX to maintain clearance from chip if path would skim chip edge.
        let elbowX = anchorX;
        // Avoid a tiny horizontal run; add bias if too close creating cramped bend.
        if(Math.abs(elbowX - exitX) < 40) {
          const bias = 70;
            elbowX = exitX + (elbowX > exitX ? bias : -bias);
        }
        d = `M ${pin.x} ${pin.y} L ${exitX} ${exitY} L ${elbowX} ${exitY} L ${elbowX} ${anchorY} L ${anchorX} ${anchorY}`;
      } else {
        // Vertical-first for top/bottom facing nodes.
        let elbowY = anchorY;
        if(Math.abs(elbowY - exitY) < 40) {
          const bias = 70;
          elbowY = exitY + (elbowY > exitY ? bias : -bias);
        }
        d = `M ${pin.x} ${pin.y} L ${exitX} ${exitY} L ${exitX} ${elbowY} L ${anchorX} ${elbowY} L ${anchorX} ${anchorY}`;
      }
      const cacheKey = `${n.id}_${pin.id}_${anchorX}_${anchorY}_${side}_${halfW}_${halfH}`;
      let entry = cacheRef.current[cacheKey];
      if(!entry) {
        entry = { id: n.id, d, pinId: pin.id };
        cacheRef.current[cacheKey] = entry;
      }
      arr.push({ id: n.id, d: entry.d, state: detaching[n.id], pos: target });
    }
    if(detailNode) {
      const pin = findNearestPin(pins, detailNode.pos);
      const target = detailNode.pos;
      const stub = 14;
      let exitX = pin.x, exitY = pin.y;
      if(pin.id.startsWith('L')) exitX -= stub; else if(pin.id.startsWith('R')) exitX += stub; else if(pin.id.startsWith('T')) exitY -= stub; else if(pin.id.startsWith('B')) exitY += stub;
  const d = `M ${pin.x} ${pin.y} L ${exitX} ${exitY} L ${target.x} ${exitY} L ${target.x} ${target.y}`;
      arr.push({ id: 'detail', d, state: false, pos: target });
    }
    return arr;
  }, [nodes, detailNode, detaching, pins, pinAssignments, center.x, center.y, nodeDims]);

  const pathRefs = useRef({}); // highlight overlay
  const baseRefs = useRef({}); // base copper
  const prevDetachingRef = useRef({});
  const prevPathMapRef = useRef({}); // id -> previous d

  // Helper to (re)compute length & cache
  const getLength = (el, force=false) => {
    if(!el) return 0;
    let length = el.getAttribute('data-len');
    if(!length || force) { length = el.getTotalLength(); el.setAttribute('data-len', length); }
    return parseFloat(length);
  };

  const retract = useCallback((id) => {
    const els = [baseRefs.current[id], pathRefs.current[id]];
    els.forEach(el => {
      if(!el) return;
      const L = getLength(el, true);
      el.style.transition = 'none';
      el.style.strokeDasharray = `${L}`;
      el.style.strokeDashoffset = '0';
      requestAnimationFrame(()=> {
        if(reduceMotion) {
          el.style.strokeDasharray = 'none';
          el.style.strokeDashoffset = '0';
        } else {
          el.style.transition = 'stroke-dashoffset 440ms cubic-bezier(.3,.7,.2,1)';
          el.style.strokeDashoffset = `${L}`; // retract to pin
        }
      });
    });
  }, [reduceMotion]);

  const grow = useCallback((id) => {
    const els = [baseRefs.current[id], pathRefs.current[id]];
    els.forEach(el => {
      if(!el) return;
      const L = getLength(el, true);
      el.style.transition = 'none';
      el.style.strokeDasharray = `${L}`;
      el.style.strokeDashoffset = `${L}`;
      requestAnimationFrame(()=> {
        if(reduceMotion) {
          el.style.strokeDasharray = 'none';
          el.style.strokeDashoffset = '0';
        } else {
          el.style.transition = 'stroke-dashoffset 520ms cubic-bezier(.3,.7,.2,1)';
          el.style.strokeDashoffset = '0';
          setTimeout(()=> {
            if(!el) return;
            el.style.transition = 'none';
            el.style.strokeDasharray = 'none';
            el.style.strokeDashoffset = '0';
          }, 560);
        }
      });
    });
  }, [reduceMotion]);

  // Detect drag start/end per node id
  useEffect(()=> {
    const prev = prevDetachingRef.current || {};
    const ids = new Set([...Object.keys(prev), ...Object.keys(detaching)]);
    ids.forEach(id => {
      const was = !!prev[id];
      const is = !!detaching[id];
      if(!was && is) {
        // drag start: retract line
        retract(id);
      } else if(was && !is) {
        // drag end: grow line
        grow(id);
      }
    });
    prevDetachingRef.current = { ...detaching };
  }, [detaching, retract, grow]);

  // Animate only paths whose geometry changed (not all) on update
  useEffect(()=> {
    paths.forEach(p => {
      const prevD = prevPathMapRef.current[p.id];
      if(prevD === undefined) {
        grow(p.id);
      } else if(prevD !== p.d && !detaching[p.id]) {
        grow(p.id);
      }
      prevPathMapRef.current[p.id] = p.d;
    });
  }, [paths, grow, detaching]);

  return (
  <svg className="absolute inset-0 w-full h-full pointer-events-none will-change-transform" shapeRendering="crispEdges">
      {/* Pin visuals (more protruding) */}
      {pins.map(p => (
        <g key={p.id} className="transition-opacity">
          <circle cx={p.x} cy={p.y} r={4.2} className="theme-light:hidden" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.55)" strokeWidth={0.8} />
          <circle cx={p.x} cy={p.y} r={4.2} className="hidden theme-light:block" fill="rgba(0,0,0,0.08)" stroke="rgba(0,0,0,0.45)" strokeWidth={0.8} />
          <circle cx={p.x} cy={p.y} r={1.9} className="theme-light:hidden" fill="rgba(255,255,255,0.82)" />
          <circle cx={p.x} cy={p.y} r={1.9} className="hidden theme-light:block" fill="rgba(0,0,0,0.75)" />
        </g>
      ))}
      {paths.map(p => (
        <g key={p.id}>
          {/* Base trace (full opacity, animated length) */}
          <path
            ref={el => (baseRefs.current[p.id] = el)}
            d={p.d}
            fill="none"
            stroke={p.id===highlightedId? '#ffffff' : '#f5f5f5'}
            strokeWidth={p.id===highlightedId? 3.0 : 2.2}
            strokeLinecap="round" strokeLinejoin="round"
            className="theme-light:stroke-neutral-600 theme-light:[filter:drop-shadow(0_0_2px_rgba(0,0,0,0.35))]"
            style={{ filter:'drop-shadow(0 0 3px rgba(255,255,255,0.55)) drop-shadow(0 0 8px rgba(255,255,255,0.18))', opacity: p.id===highlightedId? 0.95 : 0.82 }}
          />
          {/* Highlight overlay */}
            <path
              ref={el => (pathRefs.current[p.id] = el)}
              d={p.d}
              fill="none"
              stroke={p.id===highlightedId? '#ffffff' : '#fafafa'}
              strokeWidth={p.id===highlightedId? 1.4 : 1.0}
              strokeLinecap="round" strokeLinejoin="round"
              className="pointer-events-none mix-blend-screen theme-light:mix-blend-normal theme-light:stroke-neutral-500"
              style={{ opacity: p.id===highlightedId? 0.9 : 0.58 }}
            />
          {signal[p.id] && (
            <path
              d={p.d}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.2}
              strokeDasharray="12 46"
              className="signal-path theme-light:stroke-neutral-600"
            />
          )}
        </g>
      ))}
    </svg>
  );
}
