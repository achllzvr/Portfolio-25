import { useEffect, useRef, useState } from 'react';

// Throttled mouse position hook: limits React state updates with rAF, while continuously
// updating CSS variables for purely visual effects (large glow) outside React render cycle.
export function useMouseLight() {
  const frameRef = useRef(0);
  const latestRef = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 }); // updates only ~60fps or less if inactive

  useEffect(() => {
    const update = () => {
      frameRef.current = 0;
      setPos(latestRef.current); // minimal state push
    };
    const handle = (e) => {
      latestRef.current = { x: e.clientX, y: e.clientY };
      // Update CSS variables immediately for smooth visual tracking
      document.documentElement.style.setProperty('--pointer-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${e.clientY}px`);
      if (!frameRef.current) frameRef.current = requestAnimationFrame(update);
    };
    window.addEventListener('pointermove', handle, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handle);
      if(frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);
  return pos;
}
