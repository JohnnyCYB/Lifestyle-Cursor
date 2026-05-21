import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { clampPercent } from '../data/lifeRpg'
import PetArt from './PetArt'
import './GlobalPet.css'

function isInteractiveTarget(target) {
  return Boolean(
    target.closest(
      'button, a, input, textarea, select, label, [role="button"], [data-no-pet-move="true"], nav, .app-rail, .topbar',
    ),
  )
}

function nextRoamPosition(position) {
  const driftX = 12 + Math.random() * 28
  const driftY = 10 + Math.random() * 24
  return {
    x: clampPercent(position.x + (Math.random() > 0.5 ? driftX : -driftX)),
    y: clampPercent(position.y + (Math.random() > 0.5 ? driftY : -driftY)),
  }
}

function pointerToPercent(event) {
  const point = event.touches?.[0] ?? event
  return {
    x: clampPercent((point.clientX / window.innerWidth) * 100),
    y: clampPercent((point.clientY / window.innerHeight) * 100),
  }
}

function PetEmotes({ mood, facing }) {
  if (mood === 'idle') return null

  const flip = facing === 'left' ? ' emote-flip' : ''

  if (mood === 'happy') {
    return (
      <motion.div className={`pet-emotes emote-happy${flip}`} aria-hidden="true">
        <span className="emote-heart">♥</span>
        <span className="emote-heart delay-1">♥</span>
        <span className="emote-spark">✦</span>
        <span className="emote-spark delay-2">✦</span>
      </motion.div>
    )
  }

  if (mood === 'power') {
    return (
      <motion.div className={`pet-emotes emote-power${flip}`} aria-hidden="true">
        <span className="emote-aura-ring" />
        <span className="emote-flex">💪</span>
        <span className="emote-shockwave" />
        <span className="emote-impact" />
        <span className="emote-zap">⚡</span>
      </motion.div>
    )
  }

  if (mood === 'celebrate' || mood === 'victory') {
    return (
      <motion.div className={`pet-emotes emote-celebrate${mood === 'victory' ? ' emote-victory' : ''}${flip}`} aria-hidden="true">
        <span className="emote-star">★</span>
        <span className="emote-star delay-1">★</span>
        <span className="emote-star delay-2">★</span>
        <span className="emote-star delay-3">★</span>
        {mood === 'victory' && (
          <>
            <span className="emote-burst">✦</span>
            <span className="emote-gold-ring" />
          </>
        )}
      </motion.div>
    )
  }

  if (mood === 'curious') {
    return (
      <motion.div className={`pet-emotes emote-curious${flip}`} aria-hidden="true">
        <span className="emote-question">?</span>
      </motion.div>
    )
  }

  if (mood === 'silly') {
    return (
      <motion.div className={`pet-emotes emote-silly${flip}`} aria-hidden="true">
        <span className="emote-sweat">💧</span>
        <span className="emote-zoom">»</span>
        <span className="emote-zoom delay-1">»</span>
        <span className="emote-zoom delay-2">»</span>
      </motion.div>
    )
  }

  return null
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
  const [isMoving, setIsMoving] = useState(false)
  const moveTimerRef = useRef(null)

  useEffect(() => {
    const previous = lastPositionRef.current
    const deltaX = position.x - previous.x
    const deltaY = position.y - previous.y
    if (Math.abs(deltaX) > 0.4) setFacing(deltaX < 0 ? 'left' : 'right')
    if (Math.abs(deltaX) > 0.8 || Math.abs(deltaY) > 0.8) {
      setIsMoving(true)
      window.clearTimeout(moveTimerRef.current)
      moveTimerRef.current = window.setTimeout(() => setIsMoving(false), 420)
    }
    lastPositionRef.current = position
  }, [position])

  useEffect(() => {
    if (!petCanMove || motionMode !== 'follow-roam') return undefined
    const roamTimer = window.setInterval(() => {
      setExpression(Math.random() > 0.78 ? 'silly' : 'idle')
      onMovePet(nextRoamPosition(lastPositionRef.current))
    }, 3200 + Math.random() * 800)
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

  useEffect(() => () => window.clearTimeout(moveTimerRef.current), [])

  const mood = reaction === 'idle' ? expression : reaction
  const size = useMemo(() => Math.min(380, 148 + stageIndex * 58), [stageIndex])
  const springStiffness = isMoving ? (companion.id === 'wolf' ? 110 : companion.id === 'titan' ? 55 : 85) : 62
  const springDamping = companion.id === 'titan' ? 18 : 14
  const scale =
    mood === 'victory' ? 1.22 : mood === 'celebrate' ? 1.14 : mood === 'power' ? 1.1 : mood === 'silly' ? 1.06 : 1

  const hopByPet = {
    dragon: [0, -18, 0, -11, 0],
    monkey: [0, -22, 0, -14, 0],
    wolf: [0, -6, -4, -6, 0],
    titan: [0, -12, 0, -12, 0],
    phoenix: [0, -14, -6, -14, 0],
    panda: [0, -10, 0, -7, 0],
    raptor: [0, -10, 0, -6, 0],
    bull: [0, -8, 0, -5, 0],
  }
  const hopY = hopByPet[companion.id] ?? hopByPet.dragon
  const hopDuration = companion.id === 'wolf' ? 0.28 : companion.id === 'titan' ? 0.55 : 0.42

  if (!petCanMove) return null

  return (
    <motion.div
      className={[
        'global-pet',
        `global-pet-${companion.id}`,
        `global-pet-stage-${stageIndex}`,
        `reaction-${mood}`,
        `facing-${facing}`,
        isMoving ? 'pet-walking' : 'pet-idle',
      ].join(' ')}
      style={{ '--pet-size': `${size}px` }}
      animate={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        scale,
      }}
      transition={{ type: 'spring', stiffness: springStiffness, damping: springDamping, mass: companion.id === 'titan' ? 1.15 : 0.88 }}
      aria-label={`${companion.name}, your roaming ${companion.species}`}
    >
      <PetEmotes mood={mood} facing={facing} />
      <motion.div
        className="global-pet-sprite"
        animate={isMoving ? { y: hopY } : { y: 0 }}
        transition={{ duration: hopDuration, ease: 'easeOut', repeat: isMoving ? Infinity : 0, repeatType: 'loop' }}
      >
        <PetArt id={companion.id} stageIndex={stageIndex} mood={mood} />
      </motion.div>
      <span className="global-pet-ground" aria-hidden="true" />
    </motion.div>
  )
}