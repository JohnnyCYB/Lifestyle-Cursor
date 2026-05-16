import { AuraRing, BodyShell, Defs, FireEmbers, GroundShadow, RealEyes, RimLight, ScaleLines, g } from './helpers'

export function TitanArt({ stage, mood, uid }) {
  const glow = mood === 'power' || mood === 'celebrate' || mood === 'victory' || stage >= 2

  if (stage === 0) {
    return (
      <svg className="monster-svg titan-svg s0" viewBox="0 0 400 320">
        <Defs uid={uid} theme="titan" />
        <GroundShadow w={70} y={262} />
        <BodyShell uid={uid} d="M168 162 L232 162 L242 242 L158 242 Z" />
        <BodyShell uid={uid} d="M176 112 L224 112 L230 172 L170 172 Z" className="head" />
        <path className="crack" d="M188 182 L198 208 L208 182" stroke={g(uid, 'accent')} strokeWidth="2" />
        <path className="pebble" fill={g(uid, 'accent')} d="M152 248 L138 272 L168 258 Z M248 258 L262 282 L232 268 Z" />
        <RealEyes uid={uid} y={138} spread={22} glow={glow} />
      </svg>
    )
  }

  if (stage === 1) {
    return (
      <svg className="monster-svg titan-svg s1" viewBox="0 0 400 320">
        <Defs uid={uid} theme="titan" />
        <GroundShadow w={95} y={275} />
        <BodyShell uid={uid} d="M142 142 L258 142 L268 268 L132 268 Z" />
        <BodyShell uid={uid} d="M152 78 L248 78 L258 152 L142 152 Z" className="head" />
        <BodyShell uid={uid} d="M132 152 L88 202 L128 238 L152 172 Z M268 172 L292 238 L332 202 Z" className="arm" />
        <path className="leg" fill={g(uid, 'body')} d="M162 262 L142 308 L192 308 L202 262 Z M198 262 L218 308 L168 308 Z" />
        <ScaleLines lines={['M148 158 L252 158', 'M138 188 L262 188']} />
        <RealEyes uid={uid} y={112} spread={38} fierce />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="monster-svg titan-svg s2" viewBox="0 0 400 320">
        <Defs uid={uid} theme="titan" />
        <AuraRing uid={uid} rx={120} ry={70} />
        <GroundShadow w={125} y={285} />
        <path className="crystal" fill={g(uid, 'accent')} d="M92 78 L118 12 L142 78 Z M258 78 L282 12 L308 78 Z" filter={`url(#${uid}-glow)`} />
        <BodyShell uid={uid} d="M108 122 L292 122 L308 278 L92 278 Z" />
        <path className="armor" fill={g(uid, 'metal')} d="M128 136 L272 136 L258 252 L142 252 Z" />
        <BodyShell uid={uid} d="M88 142 L38 192 L88 258 L118 162 Z M312 162 L362 258 Z" className="arm" />
        <ellipse className="core" cx="200" cy="188" rx="22" ry="26" fill={g(uid, 'core')} filter={`url(#${uid}-glow)`} />
        <RealEyes uid={uid} y={102} spread={44} glow fierce />
      </svg>
    )
  }

  return (
    <svg className="monster-svg titan-svg s3" viewBox="0 0 400 320">
      <Defs uid={uid} theme="titan" />
      <AuraRing uid={uid} rx={170} ry={98} />
      <GroundShadow w={170} y={298} />
      <FireEmbers uid={uid} points={[[88, 42, 5], [312, 42, 5], [198, 18, 6]]} />
      <path className="crystal" fill={g(uid, 'accent')} d="M68 68 L108-18 L138 68 Z M262 68 L292-18 L332 68 Z M178 38 L208-28 L238 58 Z" filter={`url(#${uid}-glow)`} />
      <BodyShell uid={uid} d="M58 98 L342 98 L358 298 L42 298 Z" />
      <BodyShell uid={uid} d="M18 118 L-22 68 L58 88 Z M382 88 L422 68 Z" className="shoulder" />
      <BodyShell uid={uid} d="M-2 138 L-42 78 L18 58 L68 118 L42 238 L108 288 L128 208 L58 138 Z" className="arm-l" />
      <BodyShell uid={uid} d="M402 138 L442 78 L382 58 L332 118 L358 238 L292 288 L272 208 Z" className="arm-r" />
      <ellipse className="core" cx="200" cy="178" rx="32" ry="38" fill={g(uid, 'core')} filter={`url(#${uid}-glow)`} />
      <path className="crack-glow" d="M118 168 L148 228 L178 168 M222 168 L252 228 M188 248 L200 288 L212 248" stroke={g(uid, 'accent')} strokeWidth="3" fill="none" filter={`url(#${uid}-glow)`} />
      <BodyShell uid={uid} d="M138 38 L262 38 L272 112 L128 112 Z" className="head" />
      <ScaleLines lines={['M78 108 L322 108', 'M88 148 L312 148', 'M98 188 L302 188', 'M108 228 L292 228']} />
      <RealEyes uid={uid} y={72} spread={52} glow fierce />
      <RimLight d="M138 40 L262 40" />
    </svg>
  )
}
