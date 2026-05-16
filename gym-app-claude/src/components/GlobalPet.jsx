import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { clampPercent } from '../data/lifeRpg'
import PetArt from './PetArt'
import './GlobalPet.css'

const reactionText = {
  idle: 'Ready',
  happy: 'Snack mode',
  power: 'Beast mode',
  celebrate: 'Victory dance',
  curious: 'Boop?',
  silly: 'Zoomies',
}

function isInteractiveTarget(target) {
  return Boolean(
    target.closest(
      'button, a, input, textarea, select, label, [role="button"], [data-no-pet-move="true"]',
    ),
  )
}

function nextRoamPosition(position) {
  const driftX = 10 + Math.random() * 24
  const driftY = 8 + Math.random() * 20
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

export default function GlobalPet({ companion, stageIndex, position, motionMode, petCanMove, reaction, onMovePet }) {
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
      setExpression(Math.random() > 0.76 ? 'silly' : 'idle')
      onMovePet(nextRoamPosition(lastPositionRef.current))
    }, 3000)
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
  const size = useMemo(() => Math.min(260, 130 + stageIndex * 34), [stageIndex])

  if (!petCanMove) return null

  return (
    <motion.div
      className={`global-pet global-pet-${companion.id} global-pet-stage-${stageIndex} reaction-${mood} facing-${facing}`}
      style={{ '--pet-size': `${size}px` }}
      animate={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        scale: mood === 'power' ? 1.08 : mood === 'celebrate' ? 1.12 : mood === 'silly' ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 70, damping: 13, mass: 0.95 }}
      aria-label={`${companion.name}, your roaming ${companion.species}`}
    >
      <div className="global-pet-bubble">
        <Sparkles size={13} aria-hidden="true" />
        {reactionText[mood] ?? reactionText.idle}
      </div>
      <PetArt id={companion.id} stageIndex={stageIndex} mood={mood} />
      <span className="global-pet-ground" aria-hidden="true" />
    </motion.div>
  )
}
