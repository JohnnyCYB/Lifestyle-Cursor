import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { clampPercent } from '../data/lifeRpg'
import './GlobalPet.css'

const reactionText = {
  idle: 'Ready',
  happy: 'Fed + focused',
  power: 'Power surge',
  celebrate: 'Big win',
}

function isInteractiveTarget(target) {
  return Boolean(
    target.closest(
      'button, a, input, textarea, select, label, [role="button"], [data-no-pet-move="true"]',
    ),
  )
}

function nextRoamPosition(position) {
  const driftX = 10 + Math.random() * 22
  const driftY = 8 + Math.random() * 18
  const nextX = position.x + (Math.random() > 0.5 ? driftX : -driftX)
  const nextY = position.y + (Math.random() > 0.5 ? driftY : -driftY)

  return {
    x: clampPercent(nextX),
    y: clampPercent(nextY),
  }
}

function pointerToPercent(event) {
  const point = event.touches?.[0] ?? event
  return {
    x: clampPercent((point.clientX / window.innerWidth) * 100),
    y: clampPercent((point.clientY / window.innerHeight) * 100),
  }
}

export default function GlobalPet({
  companion,
  stageIndex,
  position,
  motionMode,
  petCanMove,
  reaction,
  onMovePet,
}) {
  const lastPositionRef = useRef(position)
  const [facing, setFacing] = useState('right')
  const [expression, setExpression] = useState('idle')

  useEffect(() => {
    const previous = lastPositionRef.current
    if (position.x < previous.x - 1) setFacing('left')
    if (position.x > previous.x + 1) setFacing('right')
    lastPositionRef.current = position
  }, [position])

  useEffect(() => {
    if (!petCanMove || motionMode !== 'follow-roam') return undefined

    const roamTimer = window.setInterval(() => {
      onMovePet(nextRoamPosition(lastPositionRef.current))
    }, 3200)

    return () => window.clearInterval(roamTimer)
  }, [motionMode, onMovePet, petCanMove])

  useEffect(() => {
    if (!petCanMove) return undefined

    function handlePointer(event) {
      if (isInteractiveTarget(event.target)) return
      onMovePet(pointerToPercent(event))
      setExpression('curious')
      window.setTimeout(() => setExpression('idle'), 900)
    }

    window.addEventListener('pointerdown', handlePointer)
    window.addEventListener('touchstart', handlePointer, { passive: true })

    return () => {
      window.removeEventListener('pointerdown', handlePointer)
      window.removeEventListener('touchstart', handlePointer)
    }
  }, [onMovePet, petCanMove])

  const mood = reaction === 'idle' ? expression : reaction
  const size = useMemo(() => Math.min(230, 124 + stageIndex * 28), [stageIndex])

  if (!petCanMove) return null

  return (
    <motion.div
      className={`global-pet global-pet-${companion.id} global-pet-stage-${stageIndex} reaction-${mood} facing-${facing}`}
      style={{ '--pet-size': `${size}px` }}
      animate={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        scale: mood === 'power' ? 1.08 : mood === 'celebrate' ? 1.12 : 1,
      }}
      transition={{ type: 'spring', stiffness: 72, damping: 14, mass: 0.95 }}
      aria-label={`${companion.name}, your roaming ${companion.species}`}
    >
      <div className="global-pet-bubble">
        <Sparkles size={13} aria-hidden="true" />
        {reactionText[mood] ?? reactionText.idle}
      </div>
      <RealisticDragon stageIndex={stageIndex} mood={mood} />
      <span className="global-pet-ground" aria-hidden="true" />
    </motion.div>
  )
}

function RealisticDragon({ stageIndex, mood }) {
  const evolved = stageIndex >= 1
  const armored = stageIndex >= 2
  const final = stageIndex >= 3
  const eyeGlow = mood === 'power' || mood === 'celebrate'

  return (
    <svg className="real-dragon" viewBox="0 0 360 300" role="img" aria-label="Realistic evolving dragon companion">
      <defs>
        <radialGradient id="dragonBody" cx="42%" cy="32%" r="74%">
          <stop offset="0%" stopColor="#ffb15c" />
          <stop offset="46%" stopColor="#e94b35" />
          <stop offset="100%" stopColor="#6f171f" />
        </radialGradient>
        <linearGradient id="dragonBelly" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffe39a" />
          <stop offset="100%" stopColor="#d8932d" />
        </linearGradient>
        <linearGradient id="dragonHorn" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff7c7" />
          <stop offset="100%" stopColor="#c08436" />
        </linearGradient>
        <filter id="dragonGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse className="dragon-aura" cx="184" cy="174" rx={final ? 132 : 104} ry={final ? 88 : 74} />

      {evolved && (
        <g className="dragon-wings">
          <path className="wing membrane" d="M126 132C71 73 45 44 32 68c-10 46 28 72 84 88Z" />
          <path className="wing bone" d="M118 136C83 96 57 74 36 67" />
          <path className="wing membrane" d="M229 132c55-59 81-88 94-64 10 46-28 72-84 88Z" />
          <path className="wing bone" d="M237 136c35-40 61-62 82-69" />
        </g>
      )}

      <path className="dragon-tail" d="M105 203C48 221 29 177 61 154c30-21 54 3 37 25 38-8 62 3 74 26" />

      <g className="dragon-body-group">
        <ellipse className="dragon-body" cx="180" cy="178" rx={final ? 86 : 64 + stageIndex * 7} ry={final ? 62 : 50 + stageIndex * 4} />
        <ellipse className="dragon-belly" cx="180" cy="185" rx={final ? 42 : 31 + stageIndex * 3} ry={final ? 45 : 36} />
        <path className="belly-lines" d="M150 170h61M144 189h72M151 208h58" />
      </g>

      <g className="dragon-legs">
        <path className="limb rear" d="M128 203c-23 13-26 36-10 48h42c7-20 2-37-17-50Z" />
        <path className="limb rear" d="M229 203c23 13 26 36 10 48h-42c-7-20-2-37 17-50Z" />
        <path className="claws" d="M118 252l-12 10M135 253l-6 13M154 252l8 12M239 252l12 10M222 253l6 13M203 252l-8 12" />
      </g>

      {final && (
        <g className="dragon-arms buff">
          <ellipse className="muscle" cx="105" cy="166" rx="31" ry="25" />
          <ellipse className="muscle" cx="255" cy="166" rx="31" ry="25" />
          <path className="forearm" d="M88 178c-17 16-19 36-4 46 21 0 31-14 35-37Z" />
          <path className="forearm" d="M272 178c17 16 19 36 4 46-21 0-31-14-35-37Z" />
        </g>
      )}

      <g className="dragon-head">
        <path className="neck" d="M150 139c2-31 19-50 50-50 30 8 38 32 29 60Z" />
        <path className="head" d="M109 77c28-29 89-34 125-3 27 3 47 19 47 42-8 31-37 45-76 44-50 6-90-9-108-40-17-1-27-12-25-25 4-13 17-18 37-18Z" />
        <path className="snout" d="M84 96c34-15 72-11 91 13-11 21-52 31-91 12-15-8-15-17 0-25Z" />
        <path className="jaw" d="M101 125c22 18 51 19 73 5-14 29-58 37-82 9Z" />
        <path className="horn left" d="M126 73 103 18l45 38Z" />
        <path className="horn right" d="M205 70 231 17l-50 38Z" />
        <path className="spike crest" d="M151 53l15-44 16 43 15-31 5 48Z" />
        <circle className={eyeGlow ? 'eye glowing' : 'eye'} cx="144" cy="98" r="7" />
        <circle className={eyeGlow ? 'eye glowing' : 'eye'} cx="204" cy="96" r="7" />
        <path className="brow" d="M132 87c16-9 28-9 39 1M193 86c15-8 29-8 42 2" />
        <path className="teeth" d="M106 127l8 14 9-13 9 14 9-13" />
      </g>

      {armored && (
        <g className="armor">
          <path d="M130 151h101l-12 58h-78Z" />
          <path d="M148 161h64M145 181h70M143 201h73" />
          <path d="M115 78l-21-30 38 18M230 76l30-30-10 39" />
        </g>
      )}

      {final && (
        <g className="final-flame" filter="url(#dragonGlow)">
          <path d="M267 73c23-22 41-6 34 13-8 22-36 20-44 45-17-22-11-43 10-58Z" />
          <path d="M279 86c11-9 18-3 16 7-4 10-17 10-21 21-7-11-5-20 5-28Z" />
        </g>
      )}
    </svg>
  )
}
