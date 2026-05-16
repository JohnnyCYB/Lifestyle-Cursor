import { useId } from 'react'

const petStyles = {
  dragon: {
    title: 'dragon',
    base: ['#ffb55f', '#f04432', '#78151d'],
    accent: '#ffd166',
    glow: '#fb6b22',
    wing: true,
    horns: true,
    flame: true,
    tail: 'flame',
  },
  monkey: {
    title: 'monkey',
    base: ['#f7c477', '#9a5726', '#30170d'],
    accent: '#facc15',
    glow: '#f59e0b',
    ears: true,
    tail: 'curl',
    flex: true,
  },
  wolf: {
    title: 'cyber wolf',
    base: ['#7dd3fc', '#2563eb', '#07101f'],
    accent: '#22d3ee',
    glow: '#38bdf8',
    ears: 'sharp',
    tail: 'blade',
    cyber: true,
  },
  titan: {
    title: 'stone titan',
    base: ['#d8f99b', '#657385', '#151b25'],
    accent: '#bef264',
    glow: '#84cc16',
    crystals: true,
    flex: true,
    block: true,
  },
  phoenix: {
    title: 'phoenix',
    base: ['#fff08a', '#fb6a3a', '#7c1d12'],
    accent: '#fde047',
    glow: '#ef4444',
    wing: true,
    flame: true,
    tail: 'feather',
    beak: true,
  },
}

export default function PetArt({ id, stageIndex, mood = 'idle' }) {
  const uid = useId().replace(/:/g, '')
  const stage = Math.max(0, Math.min(3, stageIndex))
  const style = petStyles[id] ?? petStyles.dragon
  return <ConceptMonster id={id} uid={uid} stage={stage} mood={mood} style={style} />
}

function ConceptMonster({ id, uid, stage, mood, style }) {
  const final = stage === 3
  const powered = mood === 'power' || mood === 'celebrate' || mood === 'victory' || final
  const p = (name) => `${uid}-${name}`
  const scale = [0.72, 0.86, 1, 1.18][stage]
  const yLift = [34, 22, 10, 0][stage]
  const body = getBody(stage, id)
  const head = getHead(stage, id)

  return (
    <svg className={`monster-svg concept-art concept-${id} stage-${stage}`} viewBox="0 0 520 380" role="img" aria-label={`${style.title} evolution stage ${stage + 1}`}>
      <defs>
        <linearGradient id={p('body')} x1="24%" y1="3%" x2="76%" y2="100%">
          <stop offset="0%" stopColor={style.base[0]} />
          <stop offset="48%" stopColor={style.base[1]} />
          <stop offset="100%" stopColor={style.base[2]} />
        </linearGradient>
        <linearGradient id={p('belly')} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fff4b8" />
          <stop offset="100%" stopColor={style.accent} />
        </linearGradient>
        <linearGradient id={p('metal')} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="45%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <radialGradient id={p('aura')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={style.glow} stopOpacity="0.48" />
          <stop offset="100%" stopColor={style.glow} stopOpacity="0" />
        </radialGradient>
        <filter id={p('glow')} x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={p('shadow')} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      <ellipse className="concept-aura" cx="260" cy="208" rx={final ? 190 : 130 + stage * 18} ry={final ? 118 : 82 + stage * 9} fill={`url(#${p('aura')})`} />
      <ellipse cx="260" cy="325" rx={final ? 150 : 88 + stage * 18} ry="18" fill="rgba(0,0,0,.45)" />
      <Emotes mood={mood} color={style.accent} />

      <g transform={`translate(260 196) scale(${scale}) translate(-260 ${-196 + yLift})`} filter={`url(#${p('shadow')})`}>
        {style.wing && stage > 0 && <Wings uid={uid} id={id} stage={stage} style={style} />}
        {style.crystals && stage > 0 && <Crystals uid={uid} stage={stage} />}
        <Tail uid={uid} type={style.tail} id={id} stage={stage} style={style} />
        {final && style.flex && <FlexArms uid={uid} id={id} style={style} />}
        <path className="concept-body" d={body} fill={`url(#${p('body')})`} />
        <path className="concept-highlight" d={body} fill="#fff" opacity="0.12" transform="translate(-10 -14) scale(.98)" />
        <path className="concept-belly" d={getBelly(stage, id)} fill={`url(#${p('belly')})`} />
        {stage > 1 && <Armor uid={uid} stage={stage} />}
        <Legs uid={uid} id={id} stage={stage} />
        <path className="concept-head" d={head} fill={`url(#${p('body')})`} />
        {style.horns && <Horns uid={uid} stage={stage} />}
        {style.ears && <Ears uid={uid} type={style.ears} id={id} stage={stage} />}
        {style.beak && <path className="concept-beak" d="M326 127 C365 133 382 146 326 160 Z" fill={style.accent} />}
        <Eyes powered={powered} uid={uid} stage={stage} />
        <Mouth id={id} stage={stage} mood={mood} />
        <Details id={id} uid={uid} stage={stage} style={style} />
        {style.flame && <Flames uid={uid} id={id} stage={stage} final={final} />}
      </g>
    </svg>
  )
}

function getBody(stage, id) {
  if (id === 'titan') return stage === 3 ? 'M122 164 L398 164 L368 302 L146 302 Z' : `M${166 - stage * 16} ${178 - stage * 8} L${354 + stage * 16} ${178 - stage * 8} L${334 + stage * 10} 286 L${186 - stage * 10} 286 Z`
  if (id === 'wolf') return stage === 3 ? 'M126 196 C150 138 318 126 392 200 C362 278 174 292 126 196 Z' : `M${156 - stage * 12} 204 C180 ${158 - stage * 8} 310 ${150 - stage * 8} ${366 + stage * 10} 204 C338 266 190 278 ${156 - stage * 12} 204 Z`
  if (id === 'phoenix') return stage === 3 ? 'M196 128 C248 86 323 130 337 215 C302 300 218 314 178 218 C178 178 180 152 196 128 Z' : `M210 ${150 - stage * 12} C248 ${114 - stage * 10} 304 150 315 218 C288 278 226 286 194 220 C194 184 198 164 210 ${150 - stage * 12} Z`
  return stage === 3 ? 'M145 170 C170 104 322 104 360 178 C346 294 180 314 124 226 C122 202 130 184 145 170 Z' : `M${178 - stage * 16} ${178 - stage * 12} C196 ${132 - stage * 12} 304 ${132 - stage * 10} ${338 + stage * 8} 186 C322 274 ${198 - stage * 8} 286 ${160 - stage * 14} 220 C158 202 164 190 ${178 - stage * 16} ${178 - stage * 12} Z`
}

function getHead(stage, id) {
  if (id === 'wolf') return stage === 3 ? 'M140 112 C174 48 300 48 348 110 C390 126 404 172 366 204 C310 222 186 210 142 174 C126 150 128 130 140 112 Z' : `M${166 - stage * 10} ${124 - stage * 8} C194 ${78 - stage * 8} 288 ${78 - stage * 8} ${330 + stage * 8} ${126 - stage * 6} C362 138 372 172 342 194 C286 208 198 198 ${164 - stage * 10} 170 C154 150 154 136 ${166 - stage * 10} ${124 - stage * 8} Z`
  if (id === 'titan') return stage === 3 ? 'M158 70 L350 70 L380 164 L134 164 Z' : `M${188 - stage * 10} ${94 - stage * 8} L${326 + stage * 10} ${94 - stage * 8} L${350 + stage * 8} 164 L${166 - stage * 8} 164 Z`
  if (id === 'phoenix') return stage === 3 ? 'M190 80 C224 34 300 54 322 108 C318 158 260 182 210 154 C184 132 178 104 190 80 Z' : `M212 ${100 - stage * 8} C236 ${70 - stage * 6} 292 86 304 124 C298 160 248 174 218 148 C206 132 204 114 212 ${100 - stage * 8} Z`
  return stage === 3 ? 'M146 82 C188 24 300 24 350 88 C384 112 390 164 346 190 C292 210 190 198 146 164 C128 138 130 104 146 82 Z' : `M${176 - stage * 12} ${104 - stage * 10} C204 ${62 - stage * 8} 292 ${62 - stage * 8} ${326 + stage * 8} ${108 - stage * 8} C352 126 356 166 326 186 C278 202 206 194 ${176 - stage * 12} 166 C162 146 162 122 ${176 - stage * 12} ${104 - stage * 10} Z`
}

function getBelly(stage, id) {
  if (id === 'wolf') return `M210 ${188 - stage * 8} C238 ${176 - stage * 8} 296 ${180 - stage * 4} 316 206 C292 244 238 246 210 218 Z`
  if (id === 'titan') return stage === 3 ? 'M190 176 L314 176 L292 270 L212 270 Z' : `M210 186 L300 186 L282 258 L226 258 Z`
  return stage === 3 ? 'M204 162 C242 184 278 184 314 162 C326 232 294 276 254 286 C214 276 190 232 204 162 Z' : `M218 176 C244 192 272 192 296 176 C304 226 282 258 254 264 C226 258 210 226 218 176 Z`
}

function Eyes({ powered, uid, stage }) {
  const y = stage === 3 ? 124 : 132
  const spread = stage === 3 ? 42 : 34
  return <g filter={powered ? `url(#${uid}-glow)` : undefined}><path className="concept-brow" d={`M${238 - spread} ${y - 16} L${258 - spread} ${y - 27} M${262 + spread} ${y - 27} L${284 + spread} ${y - 16}`} /><ellipse className="concept-eye" cx={250 - spread} cy={y} rx="12" ry="13"/><ellipse className="concept-eye" cx={250 + spread} cy={y} rx="12" ry="13"/><ellipse cx={250 - spread} cy={y + 2} rx="5" ry="8" fill="#0b1020"/><ellipse cx={250 + spread} cy={y + 2} rx="5" ry="8" fill="#0b1020"/></g>
}

function Wings({ uid, id, stage, style }) {
  const final = stage === 3
  const left = final ? 'M190 164 C126 82 70 36 34 58 C32 124 78 198 174 220 Z' : 'M200 174 C146 106 98 74 66 92 C70 150 108 202 182 214 Z'
  const right = final ? 'M330 164 C394 82 450 36 486 58 C488 124 442 198 346 220 Z' : 'M320 174 C374 106 422 74 454 92 C450 150 412 202 338 214 Z'
  return <g><path d={left} fill={`url(#${uid}-body)`} opacity="0.82"/><path d={right} fill={`url(#${uid}-body)`} opacity="0.82"/><path className="concept-line" d={final ? 'M180 204 L58 76 M340 204 L462 76 M132 186 L82 128 M388 186 L438 128' : 'M188 202 L82 102 M332 202 L438 102'} /></g>
}

function Tail({ uid, type, id, stage }) {
  const final = stage === 3
  const d = type === 'curl' ? 'M344 214 C428 178 430 84 368 70 C326 64 314 118 350 136' : type === 'blade' ? 'M350 200 C424 188 474 148 470 84 C408 96 358 138 334 190' : type === 'feather' ? 'M224 260 C160 328 205 342 250 286 C260 352 314 350 304 286 C358 338 404 320 328 258' : final ? 'M154 220 C68 250 34 192 80 154 C118 122 158 146 150 188' : 'M178 224 C108 242 86 196 118 170 C148 146 178 166 170 198'
  return <path className="concept-tail" d={d} fill={`url(#${uid}-body)`} />
}

function FlexArms({ uid, id }) {
  return <g><path className="concept-arm" d="M152 174 C88 178 54 236 86 286 C144 292 178 252 184 194 Z" fill={`url(#${uid}-body)`}/><path className="concept-arm" d="M368 174 C432 178 466 236 434 286 C376 292 342 252 336 194 Z" fill={`url(#${uid}-body)`}/></g>
}

function Legs({ uid, id, stage }) {
  return <g><path className="concept-leg" d="M194 250 L164 322 L220 322 L232 252 Z" fill={`url(#${uid}-body)`}/><path className="concept-leg" d="M292 250 L322 322 L266 322 L254 252 Z" fill={`url(#${uid}-body)`}/><path className="concept-claw" d="M164 318 l-16 18 l28 -8 M196 322 l-6 22 l20 -18 M322 318 l16 18 l-28 -8 M290 322 l6 22 l-20 -18"/></g>
}

function Horns({ uid, stage }) {
  const final = stage === 3
  return <path className="concept-horn" d={final ? 'M188 90 L132 18 L220 72 M316 90 L374 18 L284 72 M246 72 L258 6 L278 74' : 'M206 104 L176 48 L230 90 M298 104 L328 48 L274 90'} fill={`url(#${uid}-metal)`} />
}

function Ears({ uid, type, id, stage }) {
  if (type === 'sharp') return <path className="concept-ear" d="M178 118 L150 42 L220 98 M310 98 L370 42 L340 118" fill={`url(#${uid}-body)`}/>
  return <g><ellipse className="concept-ear" cx="174" cy="136" rx="31" ry="36" fill={`url(#${uid}-belly)`}/><ellipse className="concept-ear" cx="330" cy="136" rx="31" ry="36" fill={`url(#${uid}-belly)`}/></g>
}

function Armor({ uid, stage }) {
  return <g><path className="concept-armor" d={stage === 3 ? 'M176 176 L334 176 L310 262 L198 262 Z' : 'M198 188 L314 188 L296 250 L216 250 Z'} fill={`url(#${uid}-metal)`}/><path className="concept-line" d={stage === 3 ? 'M198 200 H312 M188 228 H322' : 'M214 208 H298 M210 232 H302'} /></g>
}

function Crystals({ uid, stage }) {
  return <g filter={`url(#${uid}-glow)`}><path className="concept-crystal" d="M166 102 L194 18 L230 108 Z"/><path className="concept-crystal" d="M322 112 L370 28 L392 126 Z"/></g>
}

function Flames({ uid, id, stage, final }) {
  return <g filter={`url(#${uid}-glow)`}><path className="concept-flame" d={final ? 'M386 78 C430 38 462 74 444 112 C424 154 382 136 366 194 C330 140 346 104 386 78 Z' : 'M360 94 C388 70 408 94 394 120 C380 146 356 134 348 170 C326 132 338 108 360 94 Z'} fill={`url(#${uid}-aura)`}/></g>
}

function Details({ id, uid, stage, style }) {
  if (id === 'wolf') return <path className="concept-line cyber" d="M188 210 H334 M212 188 L170 150 M318 188 L364 150 M236 238 L220 282 M286 238 L302 282" />
  if (id === 'titan') return <path className="concept-line stone" d="M152 198 H366 M142 230 H378 M178 272 H334 M196 94 L172 142 M336 94 L364 142" />
  return <path className="concept-line" d="M204 194 H308 M194 220 H318 M210 248 H296" />
}

function Mouth({ id, stage, mood }) {
  if (mood === 'silly') return <path className="concept-mouth" d="M218 158 C246 190 286 190 314 158" />
  return <path className="concept-mouth" d="M214 158 C244 174 288 174 318 158" />
}

function Emotes({ mood, color }) {
  if (mood === 'happy') return <g className="concept-emote"><path d="M92 78 C76 48 28 70 54 108 C68 130 96 148 96 148 S128 128 140 108 C166 70 108 48 92 78 Z" fill={color}/></g>
  if (mood === 'silly') return <g className="concept-emote"><path d="M92 88 C132 94 158 118 174 154 M428 100 C392 104 364 124 344 160"/><circle cx="408" cy="74" r="13" fill={color}/></g>
  if (mood === 'power' || mood === 'celebrate' || mood === 'victory') return <g className="concept-emote"><path d="M72 146 L128 110 L108 170 L158 154 L82 230 L102 170 Z" fill={color}/><path d="M448 132 L398 102 L414 162 L370 150 L438 218 L422 162 Z" fill={color}/></g>
  if (mood === 'curious') return <text className="pet-question" x="408" y="90">?</text>
  return null
}
