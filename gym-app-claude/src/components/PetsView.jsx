import { CheckCircle2, Plus } from 'lucide-react'
import { companions } from '../data/lifeRpg'
import PetArt from './PetArt'

function PetAvatar({ companion, stageIndex, size }) {
  return (
    <div
      className={`pet-avatar pet-${companion.id} pet-stage-${stageIndex} pet-${size}`}
      style={{
        '--pet-a': companion.palette[0],
        '--pet-b': companion.palette[1],
        '--pet-c': companion.palette[2],
        '--pet-d': companion.palette[3],
      }}
    >
      <span className="pet-shadow" aria-hidden="true" />
      <PetArt id={companion.id} stageIndex={stageIndex} mood="idle" />
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
        {companions.map((pet) => (
          <article
            className={['pet-card', 'pet-monster-card', pet.id === profile.petType ? 'pet-card-active' : '']
              .filter(Boolean)
              .join(' ')}
            key={pet.id}
            style={{ '--card-accent': pet.palette[0], '--card-glow': pet.palette[1] }}
          >
            <header className="pet-card-header">
              <PetAvatar companion={pet} stageIndex={profile.petType === pet.id ? stageIndex : 0} size="card-hero" />
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
            <div className="stage-preview-grid" aria-label={`${pet.name} evolution line`}>
              {pet.stages.map((stage, index) => {
                const label = pet.stageShort?.[index] ?? stage
                return (
                  <div
                    key={stage}
                    className={['stage-preview-cell', index === 3 ? 'stage-final' : ''].filter(Boolean).join(' ')}
                    title={stage}
                  >
                    <PetAvatar companion={pet} stageIndex={index} size="preview" />
                    <span className="stage-label">{label}</span>
                  </div>
                )
              })}
            </div>
            <button
              className={pet.id === profile.petType ? 'primary-button' : 'secondary-button'}
              type="button"
              onClick={() => onSelectPet(pet.id)}
            >
              {pet.id === profile.petType ? <CheckCircle2 size={17} /> : <Plus size={17} />}
              {pet.id === profile.petType ? 'Bonded' : 'Select'}
            </button>
          </article>
        ))}
      </section>
    </div>
  )
}
