import { CheckCircle2, Lock, Plus, Sparkles } from 'lucide-react'
import { companions } from '../data/lifeRpg'
import PetArt from './PetArt'
import './PetsView.css'

function PetAvatar({ companion, stageIndex, size, locked = false }) {
  return (
    <div
      className={`pet-avatar pet-${companion.id} pet-stage-${stageIndex} pet-${size} ${locked ? 'pet-avatar-locked' : ''}`}
      style={{
        '--pet-a': companion.palette[0],
        '--pet-b': companion.palette[1],
        '--pet-c': companion.palette[2],
        '--pet-d': companion.palette[3],
      }}
    >
      <span className="pet-shadow" aria-hidden="true" />
      <PetArt id={companion.id} stageIndex={stageIndex} mood={locked ? 'idle' : 'power'} />
      {locked && <span className="pet-lock-overlay"><Lock size={18} />Locked</span>}
    </div>
  )
}

function Meter({ label, value }) {
  return (
    <div className="meter">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <span className="meter-track">
        <span style={{ width: `${value}%` }} />
      </span>
    </div>
  )
}

function isPetLocked(pet, profile) {
  return Number.isFinite(pet.unlockAt) && profile.points < pet.unlockAt
}

export default function PetsView({ profile, companion, stageIndex, stageName, onSelectPet }) {
  return (
    <div className="view-stack">
      <section className="split-panel pets-hero">
        <div>
          <span className="eyebrow">Active companion</span>
          <h2>
            {companion.name} · {stageName}
          </h2>
          <p className="pet-trait-line">{companion.trait}</p>
          <div className="pet-meta-row">
            <span className="pet-personality-chip">{companion.personality}</span>
            <span className="pet-habit-chip">{companion.habit}</span>
          </div>
          <div className="meter-list">
            <Meter label="Bond" value={profile.care.bond} />
            <Meter label="Spark" value={profile.care.spark} />
          </div>
        </div>
        <PetAvatar companion={companion} stageIndex={stageIndex} size="medium" />
      </section>
      <section className="pet-grid" aria-label="Companion selection">
        {companions.map((pet) => {
          const locked = isPetLocked(pet, profile)
          const required = Math.max(0, (pet.unlockAt ?? 0) - profile.points)
          const cardStage = profile.petType === pet.id ? stageIndex : locked ? 3 : 0
          return (
            <article
              className={[
                'pet-card',
                'pet-monster-card',
                pet.special ? 'pet-card-special' : '',
                pet.id === profile.petType ? 'pet-card-active' : '',
                locked ? 'pet-card-locked' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={pet.id}
              style={{ '--card-accent': pet.palette[0], '--card-glow': pet.palette[1] }}
            >
              {pet.special && (
                <div className="special-edition-banner">
                  <Sparkles size={14} /> Special edition
                </div>
              )}
              <header className="pet-card-header">
                <PetAvatar companion={pet} stageIndex={cardStage} size="card-hero" locked={locked} />
                <div>
                  <span className="pet-card-rarity">{pet.archetype}</span>
                  <h3>{pet.name}</h3>
                  <p>{pet.species}</p>
                </div>
              </header>
              <p className="pet-card-personality">{pet.personality}</p>
              <p className="pet-card-habit">
                <strong>Habit:</strong> {pet.habit}
              </p>
              {locked && (
                <div className="unlock-progress">
                  <span>{required.toLocaleString()} pts until unlock</span>
                  <span className="unlock-track">
                    <span style={{ width: `${Math.min(100, Math.round((profile.points / pet.unlockAt) * 100))}%` }} />
                  </span>
                </div>
              )}
              <div className="stage-preview-grid" aria-label={`${pet.name} evolution line`}>
                {pet.stages.map((stage, index) => {
                  const label = pet.stageShort?.[index] ?? stage
                  const previewLocked = locked && index > 0
                  return (
                    <div
                      key={stage}
                      className={[
                        'stage-preview-cell',
                        index === 3 ? 'stage-final' : '',
                        previewLocked ? 'stage-preview-locked' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      title={stage}
                    >
                      <PetAvatar companion={pet} stageIndex={index} size="preview" locked={previewLocked} />
                      <span className="stage-label">{label}</span>
                    </div>
                  )
                })}
              </div>
              <button
                className={pet.id === profile.petType ? 'primary-button' : 'secondary-button'}
                type="button"
                disabled={locked}
                onClick={() => !locked && onSelectPet(pet.id)}
              >
                {locked ? <Lock size={17} /> : pet.id === profile.petType ? <CheckCircle2 size={17} /> : <Plus size={17} />}
                {locked ? `Locked · ${pet.unlockAt.toLocaleString()} pts` : pet.id === profile.petType ? 'Bonded' : 'Select'}
              </button>
            </article>
          )
        })}
      </section>
    </div>
  )
}
