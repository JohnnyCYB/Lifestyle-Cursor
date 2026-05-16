import { AuraRing, BodyShell, Defs, FireEmbers, GroundShadow, RealEyes, RimLight, g } from './helpers'

export function WolfArt({ stage, mood, uid }) {
  const glow = mood === 'power' || mood === 'celebrate' || mood === 'victory' || stage >= 1

  if (stage === 0) {
    return (
      <svg className="monster-svg wolf-svg s0" viewBox="0 0 400 320">
        <Defs uid={uid} theme="wolf" />
        <GroundShadow w={80} y={265} />
        <BodyShell uid={uid} d="M158 172 L242 172 L252 242 L148 242 Z" />
        <BodyShell uid={uid} d="M142 98 L258 98 L272 168 L128 168 Z" className="head" />
        <path className="ear" fill={g(uid, 'body')} d="M148 98 L128 38 L178 92 Z M252 92 L272 38 L222 98 Z" />
        <path className="collar" fill="none" stroke={g(uid, 'accent')} strokeWidth="3" d="M152 158 L248 158 L244 172 L156 172 Z" filter={`url(#${uid}-glow)`} />
        <path className="circuit" d="M172 192 L228 192 M162 178 L148 162 M252 178 L268 162" />
        <path className="tail" fill={g(uid, 'body')} d="M248 188 L302 168 L282 212 Z" />
        <RealEyes uid={uid} y={132} spread={34} glow={glow} />
      </svg>
    )
  }

  if (stage === 1) {
    return (
      <svg className="monster-svg wolf-svg s1" viewBox="0 0 400 320">
        <Defs uid={uid} theme="wolf" />
        <GroundShadow w={105} y={278} />
        <BodyShell uid={uid} d="M132 152 L268 152 L284 262 L116 262 Z" />
        <BodyShell uid={uid} d="M118 68 L282 68 L298 148 L102 148 Z" className="head" />
        <path className="leg" fill={g(uid, 'body')} d="M142 258 L124 308 L172 308 L182 258 Z M218 258 L236 308 L188 308 L178 258 Z" />
        <path className="tail" fill={g(uid, 'body')} d="M272 178 L352 142 L318 218 Z" />
        <path className="circuit" d="M142 182 L258 182 M118 158 L92 132 M282 158 L308 132" />
        <RealEyes uid={uid} y={108} spread={48} glow fierce />
        <RimLight d="M118 70 L282 70" />
      </svg>
    )
  }

  if (stage === 2) {
    return (
      <svg className="monster-svg wolf-svg s2" viewBox="0 0 400 320">
        <Defs uid={uid} theme="wolf" />
        <AuraRing uid={uid} rx={125} ry={72} />
        <GroundShadow w={125} y={285} />
        <BodyShell uid={uid} d="M108 138 L292 138 L308 278 L92 278 Z" />
        <path className="plate" fill={g(uid, 'metal')} d="M128 152 L272 152 L258 248 L142 248 Z" />
        <path className="plate-side" fill={g(uid, 'metal')} d="M82 168 L48 218 L98 248 L122 182 Z M318 182 L342 248 L392 218 L358 168 Z" />
        <BodyShell uid={uid} d="M108 48 L292 48 L308 138 L92 138 Z" className="head" />
        <path className="spine" stroke={g(uid, 'accent')} strokeWidth="4" fill="none" d="M200 138 L200 78 M182 92 L218 92" filter={`url(#${uid}-glow)`} />
        <path className="circuit" d="M122 188 L278 188 M142 168 L118 142 M282 168 L308 142 M158 238 L132 272 M242 238 L268 272" />
        <RealEyes uid={uid} y={92} spread={52} glow fierce />
      </svg>
    )
  }

  return (
    <svg className="monster-svg wolf-svg s3" viewBox="0 0 400 320">
      <Defs uid={uid} theme="wolf" />
      <AuraRing uid={uid} rx={165} ry={95} />
      <GroundShadow w={160} y={295} />
      <FireEmbers uid={uid} points={[[388, 58, 5], [12, 98, 5], [198, 28, 4]]} />
      <path className="blade" fill={g(uid, 'accent')} d="M382 58 L418 22 L398 108 Z M18 98 L-18 62 L8 128 Z" filter={`url(#${uid}-glow)`} />
      <BodyShell uid={uid} d="M78 118 L322 118 L338 288 L62 288 Z" />
      <path className="shoulder" fill={g(uid, 'metal')} d="M38 138 L2 88 L88 118 Z M362 118 L398 88 Z" />
      <BodyShell uid={uid} d="M98 22 L302 22 L318 118 L82 118 Z" className="head" />
      <path className="spine" stroke={g(uid, 'accent')} strokeWidth="5" fill="none" d="M200 108 L200 28 M178 48 L222 48 M188 68 L212 68 M192 88 L208 88" filter={`url(#${uid}-glow)`} />
      <path className="circuit" d="M98 188 L302 188 M78 148 L52 108 M328 148 L354 108 M138 258 L108 298 M262 258 L292 298" />
      <path className="tail" fill={g(uid, 'body')} d="M308 158 L398 108 L362 208 Z" />
      <RealEyes uid={uid} y={68} spread={58} glow fierce />
      <RimLight d="M98 24 L302 24" />
    </svg>
  )
}
