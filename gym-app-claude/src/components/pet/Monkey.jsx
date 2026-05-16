import { AuraRing, BodyShell, Defs, FireEmbers, GroundShadow, RealEyes, RimLight, g } from './helpers'

export function MonkeyArt({ stage, mood, uid }) {
  const glow = mood === 'power' || mood === 'celebrate' || mood === 'victory'

  if (stage === 0) {
    return (
      <svg className="monster-svg monkey-svg s0" viewBox="0 0 400 320">
        <Defs uid={uid} theme="monkey" />
        <GroundShadow w={85} y={268} />
        <path className="tail" fill={g(uid, 'body')} d="M262 192 C318 168 328 118 298 98 C272 128 262 168 262 192" />
        <BodyShell uid={uid} d="M158 172 L242 172 L252 242 L148 242 Z" />
        <BodyShell uid={uid} d="M168 102 L232 102 L242 168 L158 168 Z" className="head" />
        <path className="ear" fill={g(uid, 'highlight')} d="M162 112 L138 88 L168 128 Z M238 128 L262 88 L232 112 Z" />
        <path className="band" fill="#b91c1c" d="M172 132 L228 132 L224 148 L176 148 Z" />
        <path className="arm" fill={g(uid, 'body')} d="M148 176 L112 222 L148 208 Z M252 176 L288 222 L252 208 Z" />
        <path className="leg" fill={g(uid, 'body')} d="M168 238 L158 278 L192 278 L196 238 Z M204 238 L214 278 L180 278 L186 238 Z" />
        <RealEyes uid={uid} y={136} spread={30} glow={glow} />
        <path className="mouth" d="M180 158 Q200 172 220 158" />
      </svg>
    )
  }

  if (stage === 1) {
    return (
      <svg className="monster-svg monkey-svg s1" viewBox="0 0 400 320">
        <Defs uid={uid} theme="monkey" />
        <GroundShadow w={100} y={278} />
        <path className="tail" fill={g(uid, 'body')} d="M272 178 C348 128 338 72 302 58 C278 98 272 142 272 178" stroke={g(uid, 'shadow')} strokeWidth="8" />
        <BodyShell uid={uid} d="M142 158 L258 158 L268 258 L132 258 Z" />
        <BodyShell uid={uid} d="M152 78 L248 78 L258 158 L142 158 Z" className="head" />
        <path className="arm" fill={g(uid, 'body')} d="M132 168 L78 118 L108 202 Z M268 168 L322 118 L292 202 Z" />
        <path className="leg" fill={g(uid, 'body')} d="M158 252 L138 302 L188 302 L198 252 Z M202 252 L222 302 L172 302 L166 252 Z" />
        <RealEyes uid={uid} y={118} spread={42} fierce />
        <RimLight d="M152 80 L248 80" />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="monster-svg monkey-svg s2" viewBox="0 0 400 320">
        <Defs uid={uid} theme="monkey" />
        <GroundShadow w={120} y={282} />
        <path className="tail" fill={g(uid, 'body')} d="M282 162 C378 98 362 38 318 22 C288 72 282 122 282 162" />
        <BodyShell uid={uid} d="M118 142 L282 142 L292 268 L108 268 Z" />
        <BodyShell uid={uid} d="M78 152 L42 118 L118 142 Z M322 142 L358 118 Z" className="shoulder" />
        <path className="wrap" fill="#0f172a" stroke={g(uid, 'accent')} strokeWidth="3" d="M62 192 L38 252 L92 238 L108 178 Z M338 178 L354 238 L408 252 L384 192 Z" />
        <path className="armor" fill={g(uid, 'metal')} d="M152 142 L248 142 L238 208 L162 208 Z" opacity="0.85" />
        <BodyShell uid={uid} d="M142 58 L258 58 L268 138 L132 138 Z" className="head" />
        <RealEyes uid={uid} y={98} spread={46} glow fierce />
      </svg>
    )
  }

  return (
    <svg className="monster-svg monkey-svg s3" viewBox="0 0 400 320">
      <Defs uid={uid} theme="monkey" />
      <AuraRing uid={uid} rx={150} ry={88} />
      <GroundShadow w={155} y={292} />
      <path className="banana-glow" fill={g(uid, 'accent')} d="M308 38 L358 58 L332 98 L278 72 Z" filter={`url(#${uid}-glow)`} />
      <FireEmbers uid={uid} points={[[298, 48, 4], [328, 72, 5], [348, 52, 3]]} scale={0.9} />
      <path className="tail" fill={g(uid, 'body')} d="M292 148 C398 62 378-8 328 8 C292 78 292 118 292 148" />
      <BodyShell uid={uid} d="M88 118 L312 118 L328 288 L72 288 Z" />
      <path className="pec" fill={g(uid, 'metal')} d="M118 148 L282 148 L268 258 L132 258 Z" opacity="0.6" />
      <BodyShell uid={uid} d="M22 138 L-12 78 L32 68 L72 128 L48 228 L108 268 L128 198 L68 138 Z" className="arm-l" />
      <BodyShell uid={uid} d="M378 138 L412 78 L368 68 L328 128 L352 228 L292 268 L272 198 L332 138 Z" className="arm-r" />
      <BodyShell uid={uid} d="M128 32 L272 32 L282 118 L118 118 Z" className="head" />
      <path className="grin" d="M148 92 Q200 118 252 92" stroke={g(uid, 'accent')} strokeWidth="4" fill="none" />
      <RealEyes uid={uid} y={72} spread={52} glow fierce />
      <RimLight d="M128 34 L272 34" />
    </svg>
  )
}
