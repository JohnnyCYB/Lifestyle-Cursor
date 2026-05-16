import {
  AuraRing,
  BodyShell,
  Claws,
  Defs,
  FireEmbers,
  FlameTongue,
  GroundShadow,
  RealEyes,
  RimLight,
  ScaleLines,
  g,
} from './helpers'

export function DragonArt({ stage, mood, uid }) {
  const glow = mood === 'power' || mood === 'celebrate' || mood === 'victory'
  const fierce = glow || stage >= 2

  if (stage === 0) {
    return (
      <svg className="monster-svg dragon-svg s0" viewBox="0 0 400 320">
        <Defs uid={uid} theme="dragon" />
        <GroundShadow w={90} y={268} />
        <FireEmbers uid={uid} points={[[42, 248, 4], [58, 262, 3], [72, 238, 5]]} scale={0.7} />
        <g className="layer-back">
          <path className="wing-membrane" fill={g(uid, 'body')} opacity="0.5" d="M142 172 L98 148 L118 192 Z M258 192 L298 148 L262 172 Z" />
        </g>
        <BodyShell uid={uid} d="M88 208 L52 268 L78 242 L62 278 L108 218 Z" className="tail" />
        <BodyShell uid={uid} d="M152 178 L248 178 L262 238 L138 238 Z" />
        <path className="belly-scales" fill={g(uid, 'highlight')} d="M172 192 L228 192 L222 228 L178 228 Z" opacity="0.5" />
        <ScaleLines lines={['M168 200 L232 200', 'M175 215 L225 215']} />
        <BodyShell uid={uid} d="M158 98 L242 98 L254 158 L146 158 Z" className="head" />
        <path className="snout" fill={g(uid, 'body')} d="M112 128 L148 112 L142 158 L98 148 Z" />
        <path className="horn" fill={g(uid, 'accent')} d="M168 94 L152 52 L182 90 Z M232 90 L248 48 L218 92 Z" />
        <RimLight d="M158 100 L240 100" />
        <path className="leg" fill={g(uid, 'body')} d="M162 234 L148 272 L180 272 L188 234 Z M212 234 L226 272 L194 272 L206 234 Z" />
        <Claws x={152} y={262} />
        <Claws x={208} y={262} flip />
        <RealEyes uid={uid} y={130} spread={34} glow={glow} fierce={fierce} />
        <path className="teeth" d="M122 148 L130 166 L140 150 L150 168 L160 150" />
        <FlameTongue uid={uid} d="M48 258 Q32 290 58 272 Q42 302 68 278 Z" />
      </svg>
    )
  }

  if (stage === 1) {
    return (
      <svg className="monster-svg dragon-svg s1" viewBox="0 0 400 320">
        <Defs uid={uid} theme="dragon" />
        <GroundShadow w={110} y={278} />
        <g className="layer-back">
          <path className="wing" fill={g(uid, 'body')} d="M102 128 L22 68 L42 158 L108 178 Z M298 178 L358 68 L278 128 Z" />
          <path className="wing-vein" fill="none" stroke={g(uid, 'accent')} strokeWidth="2" d="M98 168 L38 88 M302 168 L362 88" opacity="0.6" />
        </g>
        <BodyShell uid={uid} d="M68 202 L18 258 L62 222 L38 292 L118 208 Z" className="tail" />
        <BodyShell uid={uid} d="M122 152 L278 152 L294 252 L106 252 Z" />
        <path className="neck" fill={g(uid, 'body')} d="M162 112 L238 112 L248 162 L152 162 Z" />
        <BodyShell uid={uid} d="M132 52 L268 52 L284 132 L116 132 Z" className="head" />
        <path className="snout" fill={g(uid, 'body')} d="M92 102 L132 82 L126 138 L82 128 Z" />
        <path className="horn" fill={g(uid, 'metal')} d="M148 48 L124-2 L168 58 Z M252 58 L276-2 L232 48 Z M198 32 L202-18 L214 42 Z" />
        <ScaleLines lines={['M138 168 L262 168', 'M128 198 L272 198', 'M142 222 L258 222']} />
        <path className="leg" fill={g(uid, 'body')} d="M138 248 L118 298 L168 298 L178 248 Z M222 248 L242 298 L192 298 L206 248 Z" />
        <RealEyes uid={uid} y={96} spread={46} glow fierce={fierce} />
        <path className="teeth" d="M102 122 L114 148 L128 126 L142 152 L156 126 L170 152" />
        <FireEmbers uid={uid} points={[[18, 258, 5], [28, 278, 4], [12, 242, 6]]} />
        <FlameTongue uid={uid} d="M18 258 L-2 302 L32 278 L12 318 Z" />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="monster-svg dragon-svg s2" viewBox="0 0 400 320">
        <Defs uid={uid} theme="dragon" />
        <AuraRing uid={uid} rx={130} ry={75} />
        <GroundShadow w={130} y={285} />
        <g className="layer-back">
          <path className="wing" fill={g(uid, 'body')} d="M92 108 L-2 28 L22 148 L108 178 Z M308 178 L398 28 L378 148 Z" />
          <path className="wing-inner" fill={g(uid, 'accent')} opacity="0.4" d="M108 178 L32 88 L92 108 Z M292 108 L368 88 L292 178 Z" />
        </g>
        <BodyShell uid={uid} d="M52 192 L-8 262 L58 212 L28 302 L128 198 Z" className="tail" />
        <BodyShell uid={uid} d="M98 138 L302 138 L318 268 L82 268 Z" />
        <path className="armor" fill={g(uid, 'metal')} d="M118 152 L282 152 L268 242 L132 242 Z" />
        <path className="armor-rim" fill="none" stroke={g(uid, 'accent')} strokeWidth="2" d="M128 168 L272 168 M122 198 L278 198" />
        <path className="spike" fill={g(uid, 'accent')} d="M118 152 L108 118 L132 152 Z M282 152 L292 118 L268 152 Z" />
        <BodyShell uid={uid} d="M72 158 L48 118 L108 142 Z M328 142 L352 118 L292 158 Z" className="shoulder" />
        <BodyShell uid={uid} d="M118 38 L282 38 L300 128 L100 128 Z" className="head" />
        <path className="horn" fill={g(uid, 'metal')} d="M138 36 L112-22 L162 48 Z M262 48 L288-22 L238 36 Z M198 18 L204-38 L216 28 Z" />
        <BodyShell uid={uid} d="M42 172 L2 222 L38 258 L92 198 Z M358 198 L398 258 L362 222 Z" className="arm" />
        <ScaleLines lines={['M112 158 L288 158', 'M108 188 L292 188', 'M118 218 L282 218', 'M128 248 L272 248']} />
        <RealEyes uid={uid} y={78} spread={52} glow fierce />
        <path className="teeth" d="M98 102 L112 132 L126 108 L142 138 L158 108 L172 138 L186 108" />
        <FireEmbers uid={uid} points={[[-8, 262, 6], [8, 288, 5], [22, 248, 4], [318, 88, 5]]} />
      </svg>
    )
  }

  return (
    <svg className="monster-svg dragon-svg s3" viewBox="0 0 400 320">
      <Defs uid={uid} theme="dragon" />
      <AuraRing uid={uid} rx={175} ry={100} cy={185} />
      <GroundShadow w={165} y={295} />
      <FireEmbers
        uid={uid}
        points={[
          [-22, 268, 7],
          [8, 298, 6],
          [388, 72, 6],
          [402, 98, 5],
          [198, 12, 4],
          [168, 28, 5],
          [232, 28, 5],
        ]}
      />
      <g className="layer-back">
        <path className="wing" fill={g(uid, 'body')} d="M78 88 L-18-2 L12 158 L108 188 Z M322 188 L388-2 L382 158 Z" />
        <path className="wing-feather" fill={g(uid, 'accent')} opacity="0.35" d="M108 188 L18 58 L78 88 L48 148 Z M292 88 L382 148 L352 58 Z" />
        <path className="wing-vein" fill="none" stroke="#7f1d1d" strokeWidth="2" d="M98 178 L12 48 M302 48 L382 178" />
      </g>
      <FlameTongue uid={uid} d="M-22 268 L-48 318 L-2 288 L18 308 Z" />
      <BodyShell uid={uid} d="M32 178 L-28 268 L52 208 L18 308 L138 192 Z" className="tail" />
      <BodyShell uid={uid} d="M62 122 L338 122 L358 288 L42 288 Z" />
      <path className="pec" fill={g(uid, 'metal')} d="M108 148 L292 148 L278 252 L122 252 Z" />
      <path className="pec-shine" fill={g(uid, 'highlight')} d="M128 158 L272 158 L262 220 L138 220 Z" opacity="0.35" />
      <path className="abs" d="M158 172 L242 172 M148 198 L252 198 M158 224 L242 224" />
      <BodyShell uid={uid} d="M18 138 L-22 88 L12 68 L58 118 L38 208 L92 248 L112 188 L62 138 Z" className="arm-l" />
      <BodyShell uid={uid} d="M382 138 L422 88 L388 68 L342 118 L362 208 L308 248 L288 188 L338 138 Z" className="arm-r" />
      <BodyShell uid={uid} d="M98 12 L302 12 L322 108 L78 108 Z" className="head" />
      <path className="jaw" fill={g(uid, 'body')} d="M78 82 L122 62 L112 118 L68 108 Z M322 108 L278 62 L288 118 Z" />
      <path className="horn" fill={g(uid, 'metal')} d="M118 8 L82-58 L148 42 Z M252 42 L288-58 L222 8 Z M188-8 L198-62 L212-2 Z M168 8 L178-38 L202 32 Z M218 32 L228-38 L248 8 Z" />
      <ScaleLines
        lines={[
          'M88 138 L312 138',
          'M78 168 L322 168',
          'M92 198 L308 198',
          'M102 228 L298 228',
          'M118 258 L282 258',
        ]}
      />
      <RealEyes uid={uid} y={58} spread={58} glow fierce />
      <path className="teeth" d="M88 88 L104 122 L122 94 L148 128 L168 94 L188 128 L208 94 L228 128 L248 94 L268 122 L282 88" />
      <FlameTongue uid={uid} d="M388 72 L428 28 L408 108 L418 48 Z" />
      <RimLight d="M98 14 L300 14" />
    </svg>
  )
}
