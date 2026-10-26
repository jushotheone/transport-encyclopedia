// Illustrated backdrop for each division, used when a vehicle has no photo yet.
const scenes = {
  air: (
    <>
      <defs><linearGradient id="sky-air" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d6fb8" /><stop offset="1" stopColor="#8fd3f4" /></linearGradient></defs>
      <rect width="200" height="140" fill="url(#sky-air)" />
      {[[30, 30, 1], [120, 20, 1.3], [150, 70, 0.8]].map(([x, y, s]) => <g key={x} fill="#fff" opacity="0.9" transform={`translate(${x} ${y}) scale(${s})`}><ellipse cx="0" cy="0" rx="22" ry="8" /><ellipse cx="14" cy="-5" rx="14" ry="8" /><ellipse cx="-12" cy="-4" rx="12" ry="7" /></g>)}
      <path d="M0 110 Q50 90 100 105 T200 100 V140 H0Z" fill="#2f7d4f" opacity="0.8" />
    </>
  ),
  road: (
    <>
      <defs><linearGradient id="sky-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f59e0b" /><stop offset="1" stopColor="#fde68a" /></linearGradient></defs>
      <rect width="200" height="140" fill="url(#sky-road)" />
      <circle cx="150" cy="40" r="18" fill="#fff7d6" opacity="0.9" />
      <path d="M0 80 L200 80 V140 H0Z" fill="#32383D" />
      <path d="M0 110 H200" stroke="#fff" strokeWidth="3" strokeDasharray="14 12" />
      <path d="M0 80 H200" stroke="#555" strokeWidth="2" />
    </>
  ),
  rail: (
    <>
      <defs><linearGradient id="sky-rail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d64045" /><stop offset="1" stopColor="#fbb48a" /></linearGradient></defs>
      <rect width="200" height="140" fill="url(#sky-rail)" />
      <path d="M0 85 L60 70 L120 82 L200 66 V140 H0Z" fill="#3b4650" opacity="0.7" />
      <path d="M80 140 L96 80 M120 140 L104 80" stroke="#cbd5e1" strokeWidth="3" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${86 - i * 6} ${135 - i * 12} H${114 + i * 6}`} stroke="#8b5a2b" strokeWidth="3" />)}
    </>
  ),
  water: (
    <>
      <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="0.45" stopColor="#0891b2" /><stop offset="1" stopColor="#12344A" /></linearGradient></defs>
      <rect width="200" height="140" fill="url(#sea)" />
      {[70, 95, 120].map((y, i) => <path key={y} d={`M-10 ${y} q15 -9 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0`} fill="none" stroke="#fff" strokeOpacity={0.5 - i * 0.12} strokeWidth="3" />)}
    </>
  ),
  space: (
    <>
      <rect width="200" height="140" fill="#0b0f3a" />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 53) % 200} cy={(i * 37) % 140} r={i % 5 === 0 ? 1.6 : 0.8} fill="#fff" opacity="0.8" />)}
      <circle cx="150" cy="95" r="34" fill="#4246A3" /><circle cx="140" cy="85" r="34" fill="#0b0f3a" opacity="0.35" />
      <ellipse cx="150" cy="95" rx="52" ry="9" fill="none" stroke="#c7d2fe" strokeWidth="2" opacity="0.7" />
    </>
  ),
  pipeline: (
    <>
      <rect width="200" height="140" fill="#14532d" />
      <rect y="86" width="200" height="54" fill="#7c4a2d" />
      <rect y="60" width="200" height="18" fill="#B66A3C" /><rect y="64" width="200" height="4" fill="#fff" opacity="0.35" />
      {[30, 100, 170].map((x) => <rect key={x} x={x} y="56" width="8" height="26" fill="#475569" />)}
      <path d="M0 100 H200 M0 118 H200" stroke="#24875D" strokeWidth="8" opacity="0.8" />
    </>
  ),
  cable: (
    <>
      <defs><linearGradient id="sky-cable" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E97828" /><stop offset="1" stopColor="#fcd9b6" /></linearGradient></defs>
      <rect width="200" height="140" fill="url(#sky-cable)" />
      <path d="M0 140 L55 60 L90 105 L135 40 L200 140Z" fill="#eef2f7" /><path d="M135 40 L158 70 L142 66 L128 74Z" fill="#fff" />
      <path d="M10 30 L190 12" stroke="#334155" strokeWidth="2" />
    </>
  ),
  future: (
    <>
      <rect width="200" height="140" fill="#1a1147" />
      <path d="M0 140 L100 70 L200 140" stroke="#00BBD4" strokeWidth="1" fill="none" opacity="0.6" />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M0 ${140 - i * 12} H200`} stroke="#7057D9" strokeWidth="1" opacity="0.7" />)}
      {[20, 55, 130, 165].map((x, i) => <rect key={x} x={x} y={50 - (i % 2) * 14} width="16" height={50 + (i % 2) * 14} fill="#00BBD4" opacity="0.5" />)}
    </>
  ),
}

export default function SceneArt({ slug, className = '' }) {
  return (
    <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      {scenes[slug] || <rect width="200" height="140" fill="#102A43" />}
    </svg>
  )
}
