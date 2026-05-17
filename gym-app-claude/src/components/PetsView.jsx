import { CheckCircle2, Lock, Plus, Sparkles } from 'lucide-react'
import { companions, getNextEvolution, getStageIndex } from '../data/lifeRpg'
import PetArt from './PetArt'
import './PetsView.css'

function getPetPoints(profile, petId) {
  if (profile.demoMode) return Math.max(profile.points, 5000)
  const saved = profile.petXp?.[petId]
  if (Number.isFinite(saved)) return saved
  return profile.petType === petId ? profile.points : 0
}

function PetAvatar({ companion, stageIndex, size, locked = false, silhouette = false }) {
  return (
    <div
      className={`pet-avatar pet-${companion.id} pet-stage-${stageIndex} pet-${size} ${locked ? 'pet-avatar-locked' : ''} ${silhouette ? 'pet-avatar-silhouette' : ''}`}
      style={{
        '--pet-a': companion.palette[0],
        '--pet-b': companion.palette[1],
        '--pet-c': companion.palette[2],
        '--pet-d': companion.palette[3],
      }}
    >
      <span className="pet-shadow" aria-hidden="true" />
      <PetArt id={companion.id} stageIndex={stageIndex} mood={locked || silhouette ? 'idle' : 'power'} />
      {locked && <span className="pet-lock-overlay"><Lock size={18} />Locked</span>}
      {silhouette && <span className="pet-lock-overlay"><Lock size={18} />Evolve</span>}
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
  if (profile.demoMode) return false
  return Number.isFinite(pet.unlockAt) && profile.points < pet.unlockAt
}

export default function PetsView({ profile, companion, stageIndex, stageName, onSelectPet }) {
  const activePetPoints = getPetPoints(profile, companion.id)
  const activeEvolution = getNextEvolution(activePetPoints)

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
            <span className="pet-personality-chip">{profile.demoMode ? 'Demo account · everything revealed' : 'Real account · evolutions hidden until earned'}</span>
            <span className="pet-habit-chip">{companion.habit}</span>
          </div>
          <div className="pet-progress-card">
            <span>{companion.name}'s XP</span>
            <strong>{activePetPoints.toLocaleString()} pts</strong>
            <small>{activeEvolution.label}</small>
            <span className="unlock-track"><span style={{ width: `${activeEvolution.progress}%` }} /></span>
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
          const petPoints = getPetPoints(profile, pet.id)
          const petStageIndex = getStageIndex(petPoints)
          const petEvolution = getNextEvolution(petPoints)
          const cardStage = profile.demoMode ? 3 : profile.petType === pet.id ? petStageIndex : locked ? 3 : 0
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
                <PetAvatar companion={pet} stageIndex={cardStage} size="card-hero" locked={locked} silhouette={!profile.demoMode && !locked && profile.petType !== pet.id && petStageIndex === 0} />
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
              {locked ? (
                <div className="unlock-progress">
                  <span>{required.toLocaleString()} pts until unlock</span>
                  <span className="unlock-track">
                    <span style={{ width: `${Math.min(100, Math.round((profile.points / pet.unlockAt) * 100))}%` }} />
                  </span>
                </div>
              ) : (
                <div className="unlock-progress pet-xp-progress">
                  <span>{pet.name} progress · {petPoints.toLocaleString()} pts</span>
                  <span className="unlock-track">
                    <span style={{ width: `${petEvolution.progress}%` }} />
                  </span>
                </div>
              )}
              <div className="stage-preview-grid" aria-label={`${pet.name} evolution line`}>
                {pet.stages.map((stage, index) => {
                  const label = pet.stageShort?.[index] ?? stage
                  const previewLocked = !profile.demoMode && (locked || index > petStageIndex)
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
                      title={previewLocked ? 'Unlock by earning XP with this companion' : stage}
                    >
                      <PetAvatar companion={pet} stageIndex={index} size="preview" locked={locked && index > 0} silhouette={previewLocked && !locked} />
                      <span className="stage-label">{previewLocked ? `Stage ${index + 1}` : label}</span>
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
