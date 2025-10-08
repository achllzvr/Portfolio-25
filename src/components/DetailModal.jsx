export default function DetailModal({project, position, onClose }) {
  if(!project) return null;
  return (
    <div className="chip-shell absolute w-96 p-4 flex flex-col gap-2 backdrop-blur-xl bg-white/10" style={{ left: position.x - 192, top: position.y - 150 }}>
      <div className="flex justify-between items-center">
        <div className="chip-title">{project.title}</div>
        <button onClick={onClose} className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 font-mono">Close</button>
      </div>
      <div className="text-xs font-mono text-white/70 leading-relaxed">
        <p>{project.blurb} – Detailed description placeholder. Add full case study content here.</p>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {project.stack.map(s => <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-accent/10 text-accent/90 border border-accent/30">{s}</span>)}
      </div>
    </div>
  );
}
