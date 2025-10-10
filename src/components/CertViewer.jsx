import React, { useEffect, useRef, useState } from 'react';
import { getIcon } from '../content/portfolioContent.jsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

export default function CertViewer({ cert, onClose }) {
  const embedRef = useRef(null);
  const [visible, setVisible] = useState(false);
  // canvas and pan/zoom refs/state (must be top-level hooks)
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(()=> {
    if(cert) requestAnimationFrame(()=> setVisible(true));
    return ()=> setVisible(false);
  }, [cert]);

  useEffect(()=> {
    if(!cert) return;
    if(!cert?.embed) {
      if(embedRef.current) embedRef.current.innerHTML = '';
      return;
    }
    // Insert embed HTML
    if(embedRef.current) embedRef.current.innerHTML = cert.embed;
    // Find script tags in embed HTML and append them to head to ensure execution
    const temp = document.createElement('div');
    temp.innerHTML = cert.embed;
    const scripts = Array.from(temp.querySelectorAll('script')).map(s => s.src).filter(Boolean);
    const appended = [];
    const loadPromises = [];
  // (no hooks inside effects) ensure embed scripts are appended below
    for(const src of scripts) {
      if(document.querySelector(`script[src="${src}"]`)) continue;
      const sc = document.createElement('script');
      sc.src = src;
      sc.async = true;
      const p = new Promise((res)=> { sc.onload = res; sc.onerror = res; });
      document.head.appendChild(sc);
      appended.push(sc);
      loadPromises.push(p);
    }
    // After scripts load, try calling common initialization entry points for embed libraries
    Promise.all(loadPromises).then(()=> {
      try {
        // Credly tends to attach a global; try common names defensively
        if(window.Credly && typeof window.Credly.render === 'function') {
          window.Credly.render();
        }
        if(window.credly && typeof window.credly.render === 'function') {
          window.credly.render();
        }
        if(window.__credlyEmbed__ && typeof window.__credlyEmbed__.init === 'function') {
          window.__credlyEmbed__.init();
        }
      } catch {
        // no-op if init not available
      }
    });

    const currentEmbed = embedRef.current;
    return () => {
      for(const sc of appended) sc.remove();
      if(currentEmbed) currentEmbed.innerHTML = '';
    };
  }, [cert]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(()=> onClose?.(), 260);
  };

  // Render PDF first page to canvas and show embed below; allow zoom & pan
  useEffect(()=> {
    let canceled = false;
    const loadAndRender = async () => {
      if(!cert?.file) return;
      try {
        const loadingTask = pdfjsLib.getDocument(cert.file);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = canvasRef.current;
        if(!canvas) return;
        const context = canvas.getContext('2d');
        // choose initial scale to fit container width
        const containerWidth = Math.min(window.innerWidth * 0.7, 900);
        const desiredScale = containerWidth / viewport.width;
        const renderViewport = page.getViewport({ scale: desiredScale });
        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
        const renderContext = { canvasContext: context, viewport: renderViewport };
        await page.render(renderContext).promise;
        if(!canceled) setScale(1);
      } catch {
        // ignore render errors
      }
    };
    loadAndRender();
    return ()=> { canceled = true; };
  }, [cert]);

  // Pan handlers
  useEffect(()=> {
    const el = containerRef.current;
    if(!el) return;
    const onDown = (e) => { isPanningRef.current = true; panStartRef.current = { x: e.clientX - panOffsetRef.current.x, y: e.clientY - panOffsetRef.current.y }; el.style.cursor = 'grabbing'; };
    const onMove = (e) => {
      if(!isPanningRef.current) return;
      const x = e.clientX - panStartRef.current.x; const y = e.clientY - panStartRef.current.y;
      panOffsetRef.current = { x, y };
      el.querySelector('.pdf-canvas-wrapper').style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    };
    const onUp = () => { isPanningRef.current = false; el.style.cursor = 'default'; };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return ()=> { el.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [scale]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative z-10 w-[92%] max-w-5xl transform transition-all duration-200 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="chip-shell p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <div className="chip-title">{cert.name}</div>
            <div className="flex items-center gap-2">
              <button onClick={()=> setScale(s=> Math.min(2, +(s+0.1).toFixed(2)))} className="px-2 py-1 bg-white/10 rounded">+</button>
              <button onClick={()=> setScale(s=> Math.max(0.5, +(s-0.1).toFixed(2)))} className="px-2 py-1 bg-white/10 rounded">−</button>
              <button onClick={()=> { panOffsetRef.current = { x:0, y:0 }; const w = containerRef.current; if(w) w.querySelector('.pdf-canvas-wrapper').style.transform = `translate(0px,0px) scale(${scale})`; }} className="px-2 py-1 bg-white/10 rounded">Reset</button>
            </div>
          </div>

          <div ref={containerRef} className="relative w-full h-[70vh] bg-black/80 rounded-md overflow-hidden cursor-grab">
            <div className="pdf-canvas-wrapper absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform transition-transform" style={{ transformOrigin: 'center' }}>
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="mt-4 chip-shell p-3 rounded-md bg-white/3">
            <div className="chip-title mb-2">Verification / Badge</div>
            <div className="flex items-center gap-3 mb-2">
              {cert.icon ? <img src={cert.icon} alt="badge" className="w-12 h-12 rounded-md shadow" /> : <span className="opacity-80">{getIcon('api')}</span>}
              <div className="text-sm text-white/90">{cert.name}</div>
            </div>
            <div ref={embedRef} className="embed-area text-white" />
          </div>

        </div>
        <button onClick={handleClose} className="absolute top-3 right-3 z-20 text-[12px] px-2 py-1 rounded bg-white/10 hover:bg-white/20">Close</button>
      </div>
    </div>
  );
}
