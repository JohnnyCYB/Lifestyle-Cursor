/* eslint-disable react-refresh/only-export-components -- shared SVG art utilities */
/** Shared fantasy-realism SVG primitives for companion art */

export const g = (uid, name) => `url(#${uid}-${name})`

export function Defs({ uid, theme }) {
  const p = (n) => `${uid}-${n}`
  const palettes = {
    dragon: {
      base: ['#ff8c42', '#dc2626', '#7f1d1d'],
      hi: ['#ffd89b', '#ffab5c'],
      accent: '#fbbf24',
      fx: '#ff6b00',
      rim: '#ffedd5',
    },
    monkey: {
      base: ['#d4a574', '#92400e', '#3d2314'],
      hi: ['#fde68a', '#c2854e'],
      accent: '#facc15',
      fx: '#f59e0b',
      rim: '#fff7ed',
    },
    wolf: {
      base: ['#5b9bd5', '#1e3a8a', '#020617'],
      hi: ['#bae6fd', '#38bdf8'],
      accent: '#22d3ee',
      fx: '#06b6d4',
      rim: '#e0f2fe',
    },
    titan: {
      base: ['#a8b4c4', '#4b5563', '#111827'],
      hi: ['#e2e8f0', '#94a3b8'],
      accent: '#bef264',
      fx: '#84cc16',
      rim: '#f8fafc',
    },
    phoenix: {
      base: ['#fb923c', '#c2410c', '#431407'],
      hi: ['#fef08a', '#fdba74'],
      accent: '#fde047',
      fx: '#ef4444',
      rim: '#fff7ed',
    },
  }
  const c = palettes[theme] ?? palettes.dragon

  return (
    <defs>
      <linearGradient id={p('body')} x1="28%" y1="0%" x2="72%" y2="100%">
        <stop offset="0%" stopColor={c.base[0]} />
        <stop offset="45%" stopColor={c.base[1]} />
        <stop offset="100%" stopColor={c.base[2]} />
      </linearGradient>
      <linearGradient id={p('highlight')} x1="30%" y1="0%" x2="70%" y2="55%">
        <stop offset="0%" stopColor={c.hi[0]} stopOpacity="0.85" />
        <stop offset="100%" stopColor={c.hi[1]} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={p('shadow')} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#000000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id={p('metal')} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="35%" stopColor="#94a3b8" />
        <stop offset="70%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id={p('accent')} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={c.accent} />
        <stop offset="100%" stopColor={c.fx} />
      </linearGradient>
      <radialGradient id={p('fire')} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff7ed" />
        <stop offset="25%" stopColor="#fbbf24" />
        <stop offset="55%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={p('core')} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor={c.accent} />
        <stop offset="100%" stopColor={c.fx} stopOpacity="0.2" />
      </radialGradient>
      <radialGradient id={p('aura')} cx="50%" cy="55%" r="48%">
        <stop offset="0%" stopColor={c.fx} stopOpacity="0.35" />
        <stop offset="100%" stopColor={c.fx} stopOpacity="0" />
      </radialGradient>
      <filter id={p('soft')} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter id={p('glow')} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={p('drop')} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.45" />
      </filter>
    </defs>
  )
}

export function GroundShadow({ w = 140, y = 278 }) {
  return <ellipse className="ground-shadow" cx="200" cy={y} rx={w} ry={14} fill="rgba(0,0,0,0.42)" />
}

export function RealEyes({ uid, y, spread = 50, glow = false, fierce = false }) {
  const lx = 200 - spread
  const rx = 200 + spread
  const eyeGlow = glow ? `url(#${uid}-glow)` : undefined
  return (
    <g className="eyes" filter={eyeGlow}>
      {fierce && (
        <path className="brow" d={`M${lx - 28} ${y - 22} L${lx + 4} ${y - 34} M${rx - 4} ${y - 34} L${rx + 28} ${y - 22}`} />
      )}
      <path className="eye-socket" d={`M${lx - 20} ${y + 6} Q${lx} ${y - 16} ${lx + 20} ${y + 6} Z M${rx - 20} ${y + 6} Q${rx} ${y - 16} ${rx + 20} ${y + 6} Z`} />
      <ellipse className="eye-iris" cx={lx} cy={y} rx="11" ry="13" />
      <ellipse className="eye-iris" cx={rx} cy={y} rx="11" ry="13" />
      <ellipse className="eye-pupil" cx={lx} cy={y + 2} rx="5" ry="7" />
      <ellipse className="eye-pupil" cx={rx} cy={y + 2} rx="5" ry="7" />
      <circle className="eye-shine" cx={lx - 4} cy={y - 4} r="3" />
      <circle className="eye-shine" cx={rx - 4} cy={y - 4} r="3" />
      {glow && (
        <>
          <ellipse className="eye-glow-ring" cx={lx} cy={y} rx="16" ry="18" />
          <ellipse className="eye-glow-ring" cx={rx} cy={y} rx="16" ry="18" />
        </>
      )}
    </g>
  )
}

export function BodyShell({ uid, d, className = 'body', metal = false }) {
  const fill = metal ? g(uid, 'metal') : g(uid, 'body')
  return (
    <g className={`body-shell ${className}`} filter={`url(#${uid}-drop)`}>
      <path className="body-shadow" d={d} fill="rgba(0,0,0,0.35)" transform="translate(5 8)" />
      <path className="body-base" d={d} fill={fill} />
      <path className="body-highlight" d={d} fill={g(uid, 'highlight')} />
    </g>
  )
}

export function FireEmbers({ uid, points, scale = 1 }) {
  return (
    <g className="embers" filter={`url(#${uid}-glow)`}>
      {points.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r * scale} fill={g(uid, 'fire')} opacity={0.7 + (i % 3) * 0.1} />
      ))}
    </g>
  )
}

export function FlameTongue({ uid, d, opacity = 0.95 }) {
  return <path className="flame" d={d} fill={g(uid, 'fire')} opacity={opacity} filter={`url(#${uid}-glow)`} />
}

export function ScaleLines({ lines }) {
  return (
    <g className="scale-lines" opacity="0.35">
      {lines.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  )
}

export function RimLight({ d }) {
  return <path className="rim-light" d={d} />
}

export function Claws({ x, y, flip = false, size = 1 }) {
  return (
    <g className="claws" transform={`translate(${x} ${y}) scale(${flip ? -size : size} ${size})`}>
      <path d="M0 0 L-10 26 L4 16 L-6 38 L14 20 L6 32 L18 8 Z" />
    </g>
  )
}

export function AuraRing({ uid, rx = 160, ry = 90, cy = 195 }) {
  return <ellipse className="fx-aura" cx="200" cy={cy} rx={rx} ry={ry} fill={g(uid, 'aura')} filter={`url(#${uid}-soft)`} />
}
