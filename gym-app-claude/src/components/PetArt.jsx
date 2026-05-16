import { useId } from 'react'

export default function PetArt({ id, stageIndex, mood = 'idle' }) {
  const stage = Math.max(0, Math.min(3, stageIndex))
  const uid = useId().replace(/:/g, '')
  if (id === 'monkey') return <MonkeyArt stage={stage} mood={mood} uid={uid} />
  if (id === 'wolf') return <WolfArt stage={stage} mood={mood} uid={uid} />
  if (id === 'titan') return <TitanArt stage={stage} mood={mood} uid={uid} />
  if (id === 'phoenix') return <PhoenixArt stage={stage} mood={mood} uid={uid} />
  return <DragonArt stage={stage} mood={mood} uid={uid} />
}

function Defs({ uid }) {
  const p = (name) => `${uid}-${name}`
  return (
    <defs>
      <radialGradient id={p('fire')} cx="42%" cy="32%" r="74%">
        <stop offset="0%" stopColor="#ffc46b" />
        <stop offset="48%" stopColor="#ef4a36" />
        <stop offset="100%" stopColor="#64141b" />
      </radialGradient>
      <radialGradient id={p('fur')} cx="42%" cy="32%" r="74%">
        <stop offset="0%" stopColor="#ffd48a" />
        <stop offset="50%" stopColor="#a8662c" />
        <stop offset="100%" stopColor="#3b2415" />
      </radialGradient>
      <radialGradient id={p('cyber')} cx="42%" cy="32%" r="74%">
        <stop offset="0%" stopColor="#8be9ff" />
        <stop offset="45%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#111827" />
      </radialGradient>
      <radialGradient id={p('stone')} cx="42%" cy="32%" r="76%">
        <stop offset="0%" stopColor="#d9f99d" />
        <stop offset="45%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#1e293b" />
      </radialGradient>
      <radialGradient id={p('phoenix')} cx="42%" cy="32%" r="76%">
        <stop offset="0%" stopColor="#fff3a4" />
        <stop offset="44%" stopColor="#fb7185" />
        <stop offset="100%" stopColor="#7c2d12" />
      </radialGradient>
      <linearGradient id={p('belly')} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#fff0a8" />
        <stop offset="100%" stopColor="#d8942f" />
      </linearGradient>
      <linearGradient id={p('horn')} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#fff7cc" />
        <stop offset="100%" stopColor="#b9782d" />
      </linearGradient>
      <linearGradient id={p('armor')} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <filter id={p('glow')} x="-35%" y="-35%" width="170%" height="170%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

function Eyes({ glow = false, y = 100, fierce = false }) {
  const eyeClass = glow ? 'eye glowing' : 'eye'
  return (
    <>
      <circle className={eyeClass} cx="148" cy={y} r="7" />
      <circle className={eyeClass} cx="214" cy={y - 2} r="7" />
      <path
        className="brow"
        d={
          fierce
            ? `M132 ${y - 14}c20-12 36-12 50 2M200 ${y - 15}c18-11 34-11 50 3`
            : `M135 ${y - 12}c17-10 31-10 43 1M202 ${y - 13}c16-9 31-9 45 2`
        }
      />
    </>
  )
}

function Claws({ x, y }) {
  return (
    <g className="claws">
      <path d={`M${x} ${y}l-8 14 6-2-4 16`} />
      <path d={`M${x + 14} ${y}l-2 16 8-12-6 14`} />
      <path d={`M${x + 28} ${y}l6 14-8-2 4 16`} />
    </g>
  )
}

function DragonArt({ stage, mood, uid }) {
  const p = (n) => `url(#${uid}-${n})`
  const fierce = mood === 'power' || mood === 'celebrate' || stage >= 2

  if (stage === 0) {
    return (
      <svg className="monster-svg dragon-svg stage-0" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura fire" cx="190" cy="200" rx="72" ry="48" />
        <path className="tail fire-fill" d="M118 210c-38 18-52-8-28-28 18-14 38-2 46 14" />
        <ellipse className="body fire-fill" cx="188" cy="198" rx="48" ry="40" />
        <ellipse className="belly" cx="188" cy="204" rx="22" ry="24" style={{ fill: p('belly') }} />
        <g className="head-group">
          <ellipse className="head fire-fill" cx="188" cy="138" rx="52" ry="46" />
          <path className="snout fire-fill" d="M138 148c28-10 58-8 72 12-18 16-48 20-72 4-10-6-8-14 0-16Z" />
          <path className="horn small" d="M162 108 150 72l22 28ZM214 106 228 70l-20 32Z" style={{ fill: p('horn') }} />
          <Eyes y={132} fierce={fierce} />
          <path className="teeth" d="M168 158l6 10 8-9 8 10 8-9" />
        </g>
        <path className="wing-nub fire-fill" d="M152 168c-18-22-42-28-52-14-6 16 14 28 52 22Z" opacity="0.7" />
        <path className="wing-nub fire-fill" d="M224 168c18-22 42-28 52-14 6 16-14 28-52 22Z" opacity="0.7" />
      </svg>
    )
  }

  if (stage === 1) {
    return (
      <svg className="monster-svg dragon-svg stage-1" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura fire" cx="190" cy="188" rx="98" ry="68" />
        <g className="wings">
          <path className="wing fire" d="M138 148C88 98 62 78 48 98c-8 32 28 48 78 58Z" />
          <path className="wing fire" d="M242 148c50-50 76-70 90-50 8 32-28 48-78 58Z" />
        </g>
        <path className="tail fire-fill" d="M108 208c-52 24-68-20-32-42 28-18 52 4 62 28" />
        <ellipse className="body fire-fill" cx="188" cy="186" rx="62" ry="50" />
        <ellipse className="belly" cx="188" cy="192" rx="28" ry="32" style={{ fill: p('belly') }} />
        <path className="neck fire-fill" d="M158 148c4-28 24-42 48-40 28 6 36 28 28 54Z" />
        <path className="head fire-fill" d="M124 88c34-28 88-30 118-6 24 4 40 20 38 42-12 28-42 38-78 36-46 4-76-16-78-48 2-14 14-22 32-24Z" />
        <path className="horn" d="M148 78 128 42l34 30ZM228 76 250 38l-38 34Z" style={{ fill: p('horn') }} />
        <Eyes y={108} fierce />
        <path className="limb fire-fill" d="M142 210c-18 12-20 32-6 42h32c4-16-2-28-16-36Z" />
        <path className="limb fire-fill" d="M234 210c18 12 20 32 6 42h-32c-4-16 2-28 16-36Z" />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="monster-svg dragon-svg stage-2" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura fire" cx="190" cy="182" rx="118" ry="78" />
        <g className="wings">
          <path className="wing fire" d="M128 132C58 58 24 38 14 72c-6 44 38 68 104 78Z" />
          <path className="wing fire" d="M252 132c70-74 104-94 114-60 6 44-38 68-104 78Z" />
          <path className="wing-bone" d="M118 138C72 92 44 68 22 70M262 138c46-46 74-70 96-72" />
        </g>
        <path className="tail fire-fill" d="M102 212c-58 28-78-24-36-48 32-20 58 2 72 28 24-14 48-8 58 12" />
        <ellipse className="body fire-fill" cx="188" cy="180" rx="74" ry="56" />
        <ellipse className="belly" cx="188" cy="188" rx="34" ry="38" style={{ fill: p('belly') }} />
        <path className="detail-line" d="M152 172h72M148 194h84M154 214h72" />
        <g className="armor">
          <path d="M132 152h116l-14 68h-88Z" style={{ fill: p('armor') }} />
          <path d="M152 168h76M148 192h84M150 214h80" />
          <path className="spike" d="M132 152l-8-18 12 18M248 152l8-18-12 18" />
        </g>
        <path className="neck fire-fill" d="M152 138c2-36 26-58 58-54 36 10 44 38 34 68Z" />
        <path className="head fire-fill" d="M108 74c36-34 98-38 136-4 32 4 54 24 52 50-10 36-44 50-88 48-58 6-100-12-118-46-16-2-26-16-22-32 6-18 24-24 48-16Z" />
        <path className="horn" d="M128 68 98 14l52 42ZM220 66 252 12l-58 44ZM158 48l18-48 18 46 20-36 8 54Z" style={{ fill: p('horn') }} />
        <Eyes glow={mood === 'power'} y={98} fierce />
        <path className="teeth" d="M104 128l10 16 10-14 12 16 10-14 10 16" />
        <path className="limb fire-fill" d="M128 206c-26 16-30 42-12 54h48c10-24 2-42-20-54Z" />
        <path className="limb fire-fill" d="M248 206c26 16 30 42 12 54h-48c-10-24-2-42 20-54Z" />
      </svg>
    )
  }

  return (
    <svg className="monster-svg dragon-svg stage-3" viewBox="0 0 380 310">
      <Defs uid={uid} />
      <ellipse className="aura fire" cx="190" cy="178" rx="148" ry="96" filter={`url(#${uid}-glow)`} />
      <g className="wings final-wings">
        <path className="wing fire" d="M118 128C34 44-8 18-6 68c4 58 62 82 132 92Z" />
        <path className="wing fire" d="M262 128c84-84 128-110 126-60-4 58-62 82-132 92Z" />
        <path className="wing-bone" d="M108 134C48 78 14 48-4 62M272 134c60-56 94-86 114-72" />
      </g>
      <g className="fire-fx" filter={`url(#${uid}-glow)`}>
        <path d="M48 92c18-28 42-8 32 18-14 38-48 28-32-18Z" fill="#fb923c" opacity="0.85" />
        <path d="M318 88c22-30 48-6 36 22-18 42-54 30-36-22Z" fill="#fbbf24" opacity="0.8" />
      </g>
      <path className="tail fire-fill" d="M96 218c-68 32-88-28-40-56 38-24 68 6 82 32 38-18 72-8 86 18 28-38 8-62-28-46" />
      <ellipse className="body fire-fill" cx="188" cy="178" rx="96" ry="68" />
      <ellipse className="belly" cx="188" cy="186" rx="46" ry="50" style={{ fill: p('belly') }} />
      <path className="detail-line" d="M148 168h80M142 192h96M148 216h84" />
      <ellipse className="muscle fire-fill" cx="98" cy="162" rx="38" ry="30" />
      <ellipse className="muscle fire-fill" cx="278" cy="162" rx="38" ry="30" />
      <path className="forearm fire-fill" d="M72 178c-22 20-24 44-4 56 28 2 40-18 44-48Z" />
      <path className="forearm fire-fill" d="M304 178c22 20 24 44 4 56-28 2-40-18-44-48Z" />
      <Claws x="58" y="218" />
      <Claws x="286" y="218" />
      <g className="armor">
        <path d="M124 148h132l-16 78h-100Z" style={{ fill: p('armor') }} />
        <path d="M146 166h88M140 192h100M144 218h92" />
      </g>
      <path className="neck fire-fill" d="M148 132c4-42 30-68 68-62 42 12 52 46 40 78Z" />
      <path className="head fire-fill" d="M96 62c42-40 108-44 148-6 36 6 62 28 60 58-12 42-52 56-102 54-68 8-114-14-134-54-18-4-30-22-24-42 8-26 32-34 62-22Z" />
      <path className="horn" d="M120 58 86-8l58 48ZM236 56 272-4l-64 50ZM154 34l22-58 22 56 24-44 14 62Z" style={{ fill: p('horn') }} />
      <Eyes glow fierce y={88} />
      <path className="teeth" d="M98 118l12 18 12-16 14 18 12-16 12 18 12-16" />
      <path className="limb fire-fill" d="M122 204c-30 18-34 48-14 62h56c12-28 2-50-24-62Z" />
      <path className="limb fire-fill" d="M254 204c30 18 34 48 14 62h-56c-12-28-2-50 24-62Z" />
    </svg>
  )
}

function MonkeyArt({ stage, mood, uid }) {
  const p = (n) => `url(#${uid}-${n})`

  if (stage === 0) {
    return (
      <svg className="monster-svg monkey-svg stage-0" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura jungle" cx="190" cy="198" rx="68" ry="44" />
        <path className="tail monkey-fill" d="M248 196c38-8 44-48 18-58-22-8-34 18-20 36" />
        <ellipse className="body monkey-fill" cx="190" cy="196" rx="44" ry="38" style={{ fill: p('fur') }} />
        <ellipse className="belly monkey-belly" cx="190" cy="202" rx="20" ry="22" />
        <circle className="head monkey-fill" cx="190" cy="132" r="40" style={{ fill: p('fur') }} />
        <circle className="ear monkey-belly" cx="152" cy="134" r="16" />
        <circle className="ear monkey-belly" cx="228" cy="134" r="16" />
        <ellipse className="muzzle monkey-belly" cx="190" cy="148" rx="24" ry="16" />
        <path className="bandana" d="M158 118h64l-8 14h-48Z" fill="#ef4444" />
        <Eyes y={126} />
        <path className="mouth" d={mood === 'silly' ? 'M174 152c12 16 28 16 40 0' : 'M178 154c8 6 18 6 26 0'} />
      </svg>
    )
  }

  if (stage === 1) {
    return (
      <svg className="monster-svg monkey-svg stage-1" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura jungle" cx="190" cy="192" rx="96" ry="58" />
        <path className="tail monkey-fill" d="M262 184c62-14 72-72 32-86-36-12-56 32-28 52" style={{ fill: p('fur') }} />
        <ellipse className="body monkey-fill" cx="190" cy="186" rx="58" ry="46" style={{ fill: p('fur') }} />
        <ellipse className="belly monkey-belly" cx="190" cy="194" rx="28" ry="30" />
        <circle className="head monkey-fill" cx="190" cy="108" r="46" style={{ fill: p('fur') }} />
        <circle className="ear monkey-belly" cx="146" cy="110" r="20" />
        <circle className="ear monkey-belly" cx="234" cy="110" r="20" />
        <ellipse className="muzzle monkey-belly" cx="190" cy="124" rx="30" ry="20" />
        <path className="hair tuft" d="M168 72l14-28 12 24 16-26 10 34" style={{ fill: p('horn') }} />
        <Eyes y={102} />
        <path className="limb monkey-fill" d="M148 218c-14 18-8 36 8 42h28c6-20-4-34-18-42Z" style={{ fill: p('fur') }} />
        <path className="limb monkey-fill" d="M232 218c14 18 8 36-8 42h-28c-6-20 4-34 18-42Z" style={{ fill: p('fur') }} />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="monster-svg monkey-svg stage-2" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura jungle" cx="190" cy="188" rx="112" ry="72" />
        <path className="tail monkey-fill" d="M276 180c58-10 68-68 28-82-34-12-52 28-24 48" style={{ fill: p('fur') }} />
        <ellipse className="body monkey-fill" cx="190" cy="180" rx="72" ry="54" style={{ fill: p('fur') }} />
        <ellipse className="belly monkey-belly" cx="190" cy="190" rx="36" ry="38" />
        <ellipse className="shoulder monkey-fill" cx="118" cy="158" rx="28" ry="22" style={{ fill: p('fur') }} />
        <ellipse className="shoulder monkey-fill" cx="262" cy="158" rx="28" ry="22" style={{ fill: p('fur') }} />
        <circle className="head monkey-fill" cx="190" cy="98" r="50" style={{ fill: p('fur') }} />
        <g className="wraps">
          <path d="M108 168h44l-6 38h-32Z" fill="#1e293b" stroke="#facc15" strokeWidth="3" />
          <path d="M228 168h44l6 38h-32Z" fill="#1e293b" stroke="#facc15" strokeWidth="3" />
        </g>
        <g className="armor">
          <path d="M148 152h84l-10 58h-64Z" style={{ fill: p('armor') }} />
          <path d="M162 168h52M158 188h64" />
        </g>
        <Eyes y={92} fierce />
        <path className="mouth" d="M172 118c14 10 32 10 46 0" />
      </svg>
    )
  }

  return (
    <svg className="monster-svg monkey-svg stage-3" viewBox="0 0 380 310">
      <Defs uid={uid} />
      <ellipse className="aura jungle" cx="190" cy="186" rx="142" ry="88" filter={`url(#${uid}-glow)`} />
      <path className="tail monkey-fill" d="M288 176c68-8 82-78 38-94-40-14-62 34-30 56" style={{ fill: p('fur') }} />
      <ellipse className="body monkey-fill" cx="190" cy="174" rx="92" ry="66" style={{ fill: p('fur') }} />
      <ellipse className="belly monkey-belly" cx="190" cy="186" rx="44" ry="46" />
      <ellipse className="muscle monkey-fill" cx="96" cy="168" rx="40" ry="32" style={{ fill: p('fur') }} />
      <ellipse className="muscle monkey-fill" cx="284" cy="168" rx="40" ry="32" style={{ fill: p('fur') }} />
      <path className="forearm monkey-fill" d="M68 188c-24 22-22 48 2 60 32-4 46-24 48-56Z" style={{ fill: p('fur') }} />
      <path className="forearm monkey-fill" d="M312 188c24 22 22 48-2 60-32-4-46-24-48-56Z" style={{ fill: p('fur') }} />
      <circle className="head monkey-fill" cx="190" cy="88" r="58" style={{ fill: p('fur') }} />
      <circle className="ear monkey-belly" cx="132" cy="92" r="24" />
      <circle className="ear monkey-belly" cx="248" cy="92" r="24" />
      <ellipse className="muzzle monkey-belly" cx="190" cy="108" rx="38" ry="26" />
      <g className="burst banana" filter={`url(#${uid}-glow)`}>
        <path d="M268 42c38 10 52 38 32 58-42 4-60-24-32-58Z" fill="#fde047" />
      </g>
      <Eyes glow y={82} fierce />
      <path className="mouth confident" d="M168 112c18 14 42 14 60 0" />
    </svg>
  )
}

function WolfArt({ stage, mood, uid }) {
  const p = (n) => `url(#${uid}-${n})`
  const glow = mood === 'power' || mood === 'celebrate'

  if (stage === 0) {
    return (
      <svg className="monster-svg wolf-svg stage-0" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura cyber" cx="190" cy="200" rx="64" ry="42" />
        <path className="tail wolf-fill" d="M252 198c32-4 48-28 42-52-28 6-48 24-56 48Z" style={{ fill: p('cyber') }} />
        <ellipse className="body wolf-fill" cx="194" cy="198" rx="42" ry="34" style={{ fill: p('cyber') }} />
        <path className="head wolf-fill" d="M148 128c18-32 72-36 98-10 22 2 38 16 40 38-16 28-52 36-88 28-36 6-62-12-58-48 2-12 12-18 28-18Z" style={{ fill: p('cyber') }} />
        <path className="ear wolf-secondary" d="M158 120 150 88 178 112Z" />
        <circle className="collar" cx="194" cy="168" r="28" fill="none" stroke="#22d3ee" strokeWidth="4" />
        <Eyes glow={glow} y={138} />
        <path className="circuit" d="M172 188h44" />
      </svg>
    )
  }

  if (stage === 1) {
    return (
      <svg className="monster-svg wolf-svg stage-1" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura cyber" cx="190" cy="190" rx="92" ry="58" />
        <path className="tail wolf-fill" d="M268 182c48-2 72-32 66-68-38 8-64 30-76 64Z" style={{ fill: p('cyber') }} />
        <ellipse className="body wolf-fill" cx="194" cy="184" rx="58" ry="42" style={{ fill: p('cyber') }} />
        <path className="head wolf-fill" d="M118 98c24-40 94-46 130-12 30 2 54 20 58 48-22 38-72 48-122 38-48 8-84-16-74-72 6-16 22-22 48-14Z" style={{ fill: p('cyber') }} />
        <path className="ear wolf-secondary" d="M132 90 118 38 158 78ZM220 78 262 34 228 88Z" />
        <path className="snout wolf-secondary" d="M98 128c32-18 72-14 90 8-24 24-68 26-96 6-10-6-8-12 6-14Z" />
        <Eyes glow y={112} />
        <path className="energy-ring" d="M88 186c58 42 148 44 206 0" />
        <path className="circuit" d="M148 188h88M160 172l-16-16M234 172l16-16" />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="monster-svg wolf-svg stage-2" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura cyber" cx="190" cy="186" rx="112" ry="70" />
        <path className="tail wolf-fill" d="M274 176c52-2 78-36 72-76-44 8-76 32-88 70Z" style={{ fill: p('cyber') }} />
        <ellipse className="body wolf-fill" cx="194" cy="180" rx="76" ry="50" style={{ fill: p('cyber') }} />
        <path className="head wolf-fill" d="M104 88c28-42 100-48 136-10 32 2 58 22 62 50-24 40-78 52-128 40-52 10-90-18-80-78 8-20 28-28 58-20Z" style={{ fill: p('cyber') }} />
        <g className="armor">
          <path d="M138 148h112l-14 62h-84Z" style={{ fill: p('armor') }} />
          <path d="M154 164h80M148 186h92" />
          <path className="plate" d="M104 168h28v38h-28ZM248 168h28v38h-28Z" />
        </g>
        <path className="circuit" d="M138 188h108M152 170l-20-20M244 170l20-20M168 208l-12 26M228 208l12 26" />
        <Eyes glow y={104} fierce />
      </svg>
    )
  }

  return (
    <svg className="monster-svg wolf-svg stage-3" viewBox="0 0 380 310">
      <Defs uid={uid} />
      <ellipse className="aura cyber" cx="190" cy="182" rx="148" ry="86" filter={`url(#${uid}-glow)`} />
      <path className="tail wolf-fill" d="M282 172c58-2 88-40 80-84-48 10-84 36-98 78Z" style={{ fill: p('cyber') }} />
      <ellipse className="body wolf-fill" cx="194" cy="174" rx="98" ry="62" style={{ fill: p('cyber') }} />
      <ellipse className="shoulder wolf-fill" cx="108" cy="158" rx="36" ry="28" style={{ fill: p('cyber') }} />
      <ellipse className="shoulder wolf-fill" cx="280" cy="158" rx="36" ry="28" style={{ fill: p('cyber') }} />
      <path className="head wolf-fill" d="M96 72c32-48 112-54 148-8 38 4 68 26 72 58-28 46-88 58-140 46-58 12-100-20-88-86 10-26 34-36 68-26Z" style={{ fill: p('cyber') }} />
      <path className="ear wolf-secondary" d="M118 78 98 18 152 68ZM234 68 278 14 248 78Z" />
      <g className="burst cyber-lines" filter={`url(#${uid}-glow)`}>
        <path d="M296 64h42v16h-42ZM38 72h38v14H38ZM312 98h28v12h-28Z" fill="#22d3ee" />
      </g>
      <path className="energy-ring" d="M72 180c68 52 180 54 252 0" />
      <path className="circuit" d="M128 184h128M144 164l-24-24M260 164l24-24M162 212l-14 32M234 212l14 32M190 148v36" />
      <Eyes glow fierce y={96} />
    </svg>
  )
}

function TitanArt({ stage, mood, uid }) {
  const p = (n) => `url(#${uid}-${n})`

  if (stage === 0) {
    return (
      <svg className="monster-svg titan-svg stage-0" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura stone" cx="190" cy="204" rx="58" ry="38" />
        <ellipse className="body stone-fill" cx="190" cy="200" rx="38" ry="32" style={{ fill: p('stone') }} />
        <circle className="head stone-fill" cx="190" cy="148" r="34" style={{ fill: p('stone') }} />
        <circle className="pebble" cx="168" cy="218" r="8" fill="#94a3b8" />
        <circle className="pebble" cx="212" cy="222" r="6" fill="#64748b" />
        <Eyes y={144} />
      </svg>
    )
  }

  if (stage === 1) {
    return (
      <svg className="monster-svg titan-svg stage-1" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura stone" cx="190" cy="194" rx="88" ry="58" />
        <rect className="body stone-fill" x="118" y="148" width="144" height="72" rx="18" style={{ fill: p('stone') }} />
        <rect className="head stone-fill" x="142" y="88" width="96" height="68" rx="16" style={{ fill: p('stone') }} />
        <rect className="arm stone-secondary" x="78" y="158" width="36" height="48" rx="10" />
        <rect className="arm stone-secondary" x="266" y="158" width="36" height="48" rx="10" />
        <path className="stone-lines" d="M128 168h124M122 188h136" />
        <Eyes y={118} />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="monster-svg titan-svg stage-2" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura stone" cx="190" cy="188" rx="108" ry="68" />
        <g className="crystals">
          <path d="M108 88l18-52 26 46Z" fill="#bef264" />
          <path d="M268 92l28-54 16 62Z" fill="#bef264" />
        </g>
        <rect className="body stone-fill" x="104" y="132" width="172" height="92" rx="22" style={{ fill: p('stone') }} />
        <rect className="head stone-fill" x="128" y="68" width="124" height="78" rx="20" style={{ fill: p('stone') }} />
        <rect className="arm stone-secondary" x="58" y="148" width="48" height="62" rx="14" />
        <rect className="arm stone-secondary" x="274" y="148" width="48" height="62" rx="14" />
        <g className="armor">
          <path d="M124 138h132l-16 82h-100Z" style={{ fill: p('armor') }} />
          <path d="M144 156h92M138 182h104M142 206h96" />
        </g>
        <Eyes glow={mood === 'power'} y={102} />
      </svg>
    )
  }

  return (
    <svg className="monster-svg titan-svg stage-3" viewBox="0 0 380 310">
      <Defs uid={uid} />
      <ellipse className="aura stone" cx="190" cy="182" rx="140" ry="86" filter={`url(#${uid}-glow)`} />
      <g className="crystals">
        <path d="M98 78l24-58 28 54Z" fill="#bef264" />
        <path d="M278 82l32-62 18 70Z" fill="#bef264" />
        <path d="M188 48l22-54 24 58Z" fill="#fde047" />
      </g>
      <rect className="body stone-fill" x="82" y="118" width="216" height="108" rx="26" style={{ fill: p('stone') }} />
      <ellipse className="core" cx="190" cy="168" rx="28" ry="32" fill="#fef08a" filter={`url(#${uid}-glow)`} />
      <rect className="head stone-fill" x="118" y="52" width="144" height="88" rx="24" style={{ fill: p('stone') }} />
      <rect className="arm stone-secondary" x="28" y="138" width="62" height="78" rx="18" />
      <rect className="arm stone-secondary" x="290" y="138" width="62" height="78" rx="18" />
      <path className="stone-lines" d="M108 148h164M100 176h180M124 214h132" />
      <Eyes glow fierce y={88} />
      <g className="burst crystal" filter={`url(#${uid}-glow)`}>
        <path d="M62 118l26-48 24 56ZM306 120l26-46 22 54Z" fill="#bef264" />
      </g>
    </svg>
  )
}

function PhoenixArt({ stage, mood, uid }) {
  const p = (n) => `url(#${uid}-${n})`
  const glow = mood === 'power' || mood === 'celebrate'

  if (stage === 0) {
    return (
      <svg className="monster-svg phoenix-svg stage-0" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura phoenix" cx="190" cy="200" rx="62" ry="42" />
        <path className="tail phoenix-fill" d="M178 218c-28 24-18 38 14 18 6 22 24 22 28 0 32 20 42 4 14-18Z" style={{ fill: p('phoenix') }} />
        <ellipse className="body phoenix-fill" cx="190" cy="196" rx="40" ry="36" style={{ fill: p('phoenix') }} />
        <circle className="head phoenix-fill" cx="190" cy="138" r="36" style={{ fill: p('phoenix') }} />
        <path className="beak" d="M208 142l28 10-28 10Z" style={{ fill: p('belly') }} />
        <path className="ember" d="M182 108c4-18 16-22 14-38 16 18 22 32 12 52Z" fill="#fb923c" opacity="0.9" />
        <Eyes glow={glow} y={134} />
      </svg>
    )
  }

  if (stage === 1) {
    return (
      <svg className="monster-svg phoenix-svg stage-1" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura phoenix" cx="190" cy="188" rx="92" ry="58" />
        <g className="wings">
          <path className="wing phoenix-fill" d="M162 156C108 108 78 94 68 118c-2 38 42 52 94 56Z" style={{ fill: p('phoenix') }} />
          <path className="wing phoenix-fill" d="M218 156c54-48 84-62 94-38 2 38-42 52-94 56Z" style={{ fill: p('phoenix') }} />
        </g>
        <path className="tail phoenix-fill" d="M162 214c-38 32-24 52 18 28 10 28 34 28 42-4 44 26 58 6 20-28Z" style={{ fill: p('phoenix') }} />
        <ellipse className="body phoenix-fill" cx="190" cy="178" rx="52" ry="48" style={{ fill: p('phoenix') }} />
        <circle className="head phoenix-fill" cx="190" cy="102" r="40" style={{ fill: p('phoenix') }} />
        <path className="beak" d="M212 106l36 12-36 12Z" style={{ fill: p('belly') }} />
        <Eyes glow y={98} />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="monster-svg phoenix-svg stage-2" viewBox="0 0 380 310">
        <Defs uid={uid} />
        <ellipse className="aura phoenix" cx="190" cy="182" rx="118" ry="72" />
        <g className="wings">
          <path className="wing phoenix-fill" d="M148 140C68 62 28 44 18 88c4 52 58 68 122 74Z" style={{ fill: p('phoenix') }} />
          <path className="wing phoenix-fill" d="M232 140c80-78 120-96 130-52-4 52-58 68-122 74Z" style={{ fill: p('phoenix') }} />
          <path className="wing-armor" d="M138 148h24l-8 48h-8Z" style={{ fill: p('armor') }} />
          <path className="wing-armor" d="M218 148h24l8 48h-8Z" style={{ fill: p('armor') }} />
        </g>
        <path className="tail phoenix-fill" d="M158 218c-48 38-32 62 24 32 12 38 44 38 52-2 54 34 72 10 24-32Z" style={{ fill: p('phoenix') }} />
        <ellipse className="body phoenix-fill" cx="190" cy="170" rx="58" ry="62" style={{ fill: p('phoenix') }} />
        <circle className="head phoenix-fill" cx="190" cy="88" r="44" style={{ fill: p('phoenix') }} />
        <path className="hair flame-crest" d="M168 62c8-38 28-46 26-70 26 28 36 48 22 76Z" style={{ fill: p('horn') }} />
        <Eyes glow y={84} fierce />
        <g className="armor">
          <path d="M150 138h80l-10 66h-60Z" style={{ fill: p('armor') }} />
        </g>
      </svg>
    )
  }

  return (
    <svg className="monster-svg phoenix-svg stage-3" viewBox="0 0 380 310">
      <Defs uid={uid} />
      <ellipse className="aura phoenix" cx="190" cy="176" rx="152" ry="94" filter={`url(#${uid}-glow)`} />
      <g className="wings final-wings">
        <path className="wing phoenix-fill" d="M138 128C42 38-6 14-4 72c6 64 68 88 142 96Z" style={{ fill: p('phoenix') }} />
        <path className="wing phoenix-fill" d="M242 128c96-90 144-116 142-56-6 64-68 88-142 96Z" style={{ fill: p('phoenix') }} />
      </g>
      <g className="burst phoenix-fire" filter={`url(#${uid}-glow)`}>
        <path d="M288 58c32-20 54 8 34 34-26 32-52 26-60 68-26-40-8-78 26-102Z" fill="#fb923c" />
        <path d="M78 82c-28-14-46 12-28 32 22 26 44 20 56 58 18-38 2-72-28-90Z" fill="#fbbf24" />
      </g>
      <path className="tail phoenix-fill" d="M152 224c-58 48-40 78 28 42 14 48 52 48 64-4 62 38 84 10 30-42 18-28 8-52-24-68Z" style={{ fill: p('phoenix') }} />
      <ellipse className="body phoenix-fill" cx="190" cy="166" rx="68" ry="74" style={{ fill: p('phoenix') }} />
      <circle className="head phoenix-fill" cx="190" cy="78" r="52" style={{ fill: p('phoenix') }} />
      <path className="beak" d="M216 82l48 16-48 16Z" style={{ fill: p('belly') }} />
      <path className="hair flame-crest" d="M158 48c10-48 32-58 30-88 32 36 44 62 28 98Z" style={{ fill: p('horn') }} />
      <Eyes glow fierce y={72} />
    </svg>
  )
}
