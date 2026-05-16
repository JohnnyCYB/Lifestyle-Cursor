import { AuraRing, BodyShell, Defs, FireEmbers, FlameTongue, GroundShadow, RealEyes, RimLight, g } from './helpers'

export function PhoenixArt({ stage, mood, uid }) {
  const glow = mood === 'power' || mood === 'celebrate' || mood === 'victory' || stage >= 1

  if (stage === 0) {
    return (
      <svg className="monster-svg phoenix-svg s0" viewBox="0 0 400 320">
        <Defs uid={uid} theme="phoenix" />
        <GroundShadow w={75} y={265} />
        <path className="crest" fill={g(uid, 'fire')} d="M188 82 L200 38 L212 82 L228 52 L218 98 Z" filter={`url(#${uid}-glow)`} />
        <BodyShell uid={uid} d="M168 142 L232 142 L242 232 L158 232 Z" />
        <BodyShell uid={uid} d="M174 100 L226 100 L232 162 L168 162 Z" className="head" />
        <path className="beak" fill={g(uid, 'accent')} d="M228 122 L262 138 L228 148 Z" />
        <FlameTongue uid={uid} d="M182 232 L158 278 L198 252 L212 288 L228 252 L262 278 Z" opacity={0.9} />
        <FireEmbers uid={uid} points={[[168, 268, 3], [232, 272, 4], [198, 248, 3]]} scale={0.7} />
        <RealEyes uid={uid} y={128} spread={28} glow={glow} />
      </svg>
    )
  }

  if (stage === 1) {
    return (
      <svg className="monster-svg phoenix-svg s1" viewBox="0 0 400 320">
        <Defs uid={uid} theme="phoenix" />
        <GroundShadow w={100} y={278} />
        <g className="layer-back">
          <path className="wing" fill={g(uid, 'body')} d="M162 152 L78 108 L108 182 Z M238 152 L322 108 L292 182 Z" />
          <path className="wing-fire" fill={g(uid, 'fire')} opacity="0.4" d="M162 152 L98 88 L148 118 Z M238 152 L302 88 Z" />
        </g>
        <BodyShell uid={uid} d="M152 138 L248 138 L258 258 L142 258 Z" />
        <BodyShell uid={uid} d="M162 68 L238 68 L248 142 L152 142 Z" className="head" />
        <FlameTongue uid={uid} d="M168 258 L128 312 L198 278 L212 318 L228 278 L288 312 Z" />
        <RealEyes uid={uid} y={104} spread={40} glow={glow} />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="monster-svg phoenix-svg s2" viewBox="0 0 400 320">
        <Defs uid={uid} theme="phoenix" />
        <AuraRing uid={uid} rx={125} ry={72} />
        <GroundShadow w={125} y={285} />
        <g className="layer-back">
          <path className="wing" fill={g(uid, 'body')} d="M152 128 L38 58 L72 168 Z M248 128 L362 58 L328 168 Z" />
          <path className="wing-armor" fill={g(uid, 'metal')} d="M152 168 L98 118 L152 128 Z M248 128 L302 118 Z" opacity="0.85" />
        </g>
        <BodyShell uid={uid} d="M142 118 L258 118 L268 268 L132 268 Z" />
        <path className="crest" fill={g(uid, 'fire')} d="M178 48 L200-8 L222 48 L242 12 L228 82 Z" filter={`url(#${uid}-glow)`} />
        <FlameTongue uid={uid} d="M158 268 L108 322 L198 288 L212 328 L228 288 L308 322 Z" />
        <FireEmbers uid={uid} points={[[108, 312, 5], [298, 312, 5], [198, 8, 4]]} />
        <RealEyes uid={uid} y={92} spread={46} glow fierce />
      </svg>
    )
  }

  return (
    <svg className="monster-svg phoenix-svg s3" viewBox="0 0 400 320">
      <Defs uid={uid} theme="phoenix" />
      <AuraRing uid={uid} rx={175} ry={102} />
      <GroundShadow w={165} y={298} />
      <FireEmbers
        uid={uid}
        points={[
          [88, 308, 6],
          [148, 318, 5],
          [252, 318, 5],
          [312, 308, 6],
          [198, 12, 5],
          [48, 58, 4],
          [352, 58, 4],
        ]}
      />
      <g className="layer-back">
        <path className="wing" fill={g(uid, 'body')} d="M138 108 L-8-2 L28 158 Z M262 108 L408-2 L372 158 Z" />
        <path className="wing-inner" fill={g(uid, 'fire')} opacity="0.55" d="M148 158 L28 48 L138 108 Z M252 108 L372 48 Z" />
        <path className="wing-vein" fill="none" stroke="#7c2d12" strokeWidth="2" d="M138 158 L18 38 M382 38 L262 158" />
      </g>
      <BodyShell uid={uid} d="M118 98 L282 98 L298 288 L102 288 Z" />
      <path className="crest" fill={g(uid, 'fire')} d="M168 28 L200-38 L232 28 L258-12 L238 92 Z" filter={`url(#${uid}-glow)`} />
      <FlameTongue uid={uid} d="M138 288 L68 328 L178 298 L200 328 L222 298 L332 328 Z" />
      <BodyShell uid={uid} d="M152 48 L248 48 L258 118 L142 118 Z" className="head" />
      <path className="beak" fill={g(uid, 'accent')} d="M248 78 L302 108 L248 118 Z" />
      <RealEyes uid={uid} y={82} spread={54} glow fierce />
      <RimLight d="M152 50 L248 50" />
    </svg>
  )
}
