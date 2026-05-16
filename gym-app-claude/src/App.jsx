import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Activity,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Dumbbell,
  Flame,
  Flag,
  Heart,
  Home,
  Leaf,
  MapPin,
  PawPrint,
  Plus,
  RefreshCcw,
  Save,
  ScanLine,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Utensils,
  Wand2,
  Zap,
} from 'lucide-react'
import {
  achievementRules,
  clampMeter,
  clampPercent,
  companions,
  dailyQuests,
  defaultProfile,
  foodShortcuts,
  getNextEvolution,
  getStageIndex,
  goalCategories,
  gymMovements,
  mergeProfile,
  recommendedWorkouts,
  skillTrees,
} from './data/lifeRpg'
import { scanFood } from './services/foodScanner'
import './App.css'

const storageKey = 'life-rpg-profile-v1'

const navItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'pets', label: 'Pets', icon: PawPrint },
  { id: 'care', label: 'Care', icon: Heart },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'nutrition', label: 'Food', icon: Utensils },
  { id: 'goals', label: 'Goals', icon: Flag },
  { id: 'progress', label: 'Progress', icon: Trophy },
]

const quickActions = [
  {
    label: 'Water',
    icon: Leaf,
    points: 10,
    area: 'nutrition',
    reaction: 'happy',
    care: { energy: 3, satiety: 1, spark: 2 },
  },
  {
    label: 'Workout',
    icon: Dumbbell,
    points: 45,
    area: 'gym',
    reaction: 'power',
    care: { energy: -7, satiety: -4, bond: 7 },
  },
  {
    label: 'Meal',
    icon: Utensils,
    points: 25,
    area: 'nutrition',
    reaction: 'happy',
    care: { satiety: 12, energy: 5, bond: 3 },
  },
  {
    label: 'Focus',
    icon: Target,
    points: 20,
    area: 'focus',
    reaction: 'celebrate',
    care: { spark: 7, bond: 2 },
  },
]

const careActions = [
  {
    label: 'Feed',
    icon: Utensils,
    points: 16,
    area: 'nutrition',
    reaction: 'happy',
    care: { satiety: 18, bond: 4 },
  },
  {
    label: 'Train',
    icon: Dumbbell,
    points: 22,
    area: 'gym',
    reaction: 'power',
    care: { energy: -10, spark: 9, bond: 8 },
  },
  {
    label: 'Play',
    icon: Sparkles,
    points: 14,
    area: 'focus',
    reaction: 'celebrate',
    care: { spark: 12, bond: 7 },
  },
  {
    label: 'Rest',
    icon: Zap,
    points: 12,
    area: 'focus',
    reaction: 'happy',
    care: { energy: 16, satiety: -2, bond: 2 },
  },
]

const todayKey = new Date().toISOString().slice(0, 10)

function App() {
  const [profile, setProfile] = usePersistentProfile()
  const [activeView, setActiveView] = useState('dashboard')
  const [foodInput, setFoodInput] = useState('chicken bowl')
  const [foodResult, setFoodResult] = useState(null)
  const [scanState, setScanState] = useState('idle')
  const [petReaction, setPetReaction] = useState('idle')
  const [workoutForm, setWorkoutForm] = useState({ name: '', detail: '' })
  const [goalForm, setGoalForm] = useState({ title: '', category: 'gym' })
  const prefersReducedMotion = useReducedMotion()

  const companion =
    companions.find((candidate) => candidate.id === profile.petType) ??
    companions[0]
  const stageIndex = getStageIndex(profile.points)
  const stageName = companion.stages[stageIndex]
  const evolution = getNextEvolution(profile.points)
  const completedToday = profile.completedByDate[todayKey] ?? []
  const unlockedAchievements = achievementRules.filter((rule) =>
    rule.test(profile),
  )
  const weeklyTotal = profile.weeklyPoints.reduce((total, day) => total + day, 0)
  const petCanMove = profile.settings.animations && !prefersReducedMotion

  useEffect(() => {
    if (!petCanMove || profile.petMotionMode !== 'follow-roam') return undefined

    const roamTimer = window.setInterval(() => {
      setProfile((current) => ({
        ...current,
        petPosition: getRoamPosition(current.petPosition),
      }))
    }, 4200)

    return () => window.clearInterval(roamTimer)
  }, [petCanMove, profile.petMotionMode, setProfile])

  useEffect(() => {
    if (petReaction === 'idle') return undefined

    const reactionTimer = window.setTimeout(() => {
      setPetReaction('idle')
    }, 1200)

    return () => window.clearTimeout(reactionTimer)
  }, [petReaction])

  const shellClass = [
    'app-shell',
    profile.settings.animations ? 'motion-ok' : 'motion-off',
    profile.settings.focusMode ? 'focus-mode' : '',
  ]
    .filter(Boolean)
    .join(' ')

  function triggerPetReaction(reaction) {
    if (!profile.settings.animations) return
    setPetReaction(reaction ?? 'happy')
  }

  function addActivity(activity) {
    setProfile((current) => applyActivity(current, activity))
    triggerPetReaction(activity.reaction ?? reactionForArea(activity.area))
  }

  function completeQuest(quest) {
    setProfile((current) => {
      const todaysCompletions = current.completedByDate[todayKey] ?? []
      if (todaysCompletions.includes(quest.id)) return current

      const updated = applyActivity(current, {
        label: quest.title,
        points: quest.points,
        area: quest.area,
        care: quest.care,
      })

      return {
        ...updated,
        completedByDate: {
          ...updated.completedByDate,
          [todayKey]: [...todaysCompletions, quest.id],
        },
      }
    })
    triggerPetReaction(quest.reaction)
  }

  function selectPet(petId) {
    const nextPet = companions.find((candidate) => candidate.id === petId)
    setProfile((current) => ({
      ...current,
      petType: petId,
      care: { ...current.care, bond: clampMeter(current.care.bond + 4) },
      ledger: [
        makeLedgerEntry(`Bonded with ${nextPet?.name ?? 'companion'}`, 0, 'pet'),
        ...current.ledger,
      ].slice(0, 10),
    }))
    triggerPetReaction('celebrate')
  }

  function toggleSetting(setting) {
    setProfile((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [setting]: !current.settings[setting],
      },
    }))
  }

  function togglePetRoam() {
    setProfile((current) => ({
      ...current,
      petMotionMode:
        current.petMotionMode === 'follow-roam' ? 'click-only' : 'follow-roam',
    }))
  }

  function movePetTo(position) {
    if (!petCanMove) return

    setProfile((current) => ({
      ...current,
      petPosition: {
        x: clampPercent(position.x),
        y: clampPercent(position.y),
      },
    }))
  }

  function logRecommendedWorkout(workout) {
    addActivity({
      label: workout.name,
      points: workout.points,
      area: 'gym',
      reaction: 'power',
      care: { energy: -8, satiety: -4, bond: 7, spark: 8 },
    })
  }

  function saveCustomWorkout(event) {
    event.preventDefault()
    const name = workoutForm.name.trim()
    const detail = workoutForm.detail.trim()
    if (!name) return

    const workout = {
      id: makeId('workout'),
      name,
      detail: detail || 'Custom workout',
      points: 50,
      createdAt: 'Now',
    }

    setProfile((current) => ({
      ...current,
      customWorkouts: [workout, ...current.customWorkouts].slice(0, 8),
      ledger: [
        makeLedgerEntry(`Saved workout: ${workout.name}`, 0, 'gym'),
        ...current.ledger,
      ].slice(0, 10),
    }))
    setWorkoutForm({ name: '', detail: '' })
    triggerPetReaction('celebrate')
  }

  function logCustomWorkout(workout) {
    addActivity({
      label: workout.name,
      points: workout.points,
      area: 'gym',
      reaction: 'power',
      care: { energy: -6, satiety: -3, bond: 5, spark: 6 },
    })
  }

  function addLifeGoal(event) {
    event.preventDefault()
    const title = goalForm.title.trim()
    if (!title) return

    const goal = {
      id: makeId('goal'),
      title,
      category: goalForm.category,
      completed: false,
      createdAt: 'Now',
    }

    setProfile((current) => ({
      ...current,
      lifeGoals: [goal, ...current.lifeGoals].slice(0, 12),
      ledger: [
        makeLedgerEntry(`Added goal: ${goal.title}`, 0, goal.category),
        ...current.ledger,
      ].slice(0, 10),
    }))
    setGoalForm({ title: '', category: goalForm.category })
    triggerPetReaction('happy')
  }

  function completeGoal(goalId) {
    const completedGoal = profile.lifeGoals.find((goal) => goal.id === goalId)
    if (!completedGoal || completedGoal.completed) return

    setProfile((current) => {
      const goalToComplete = current.lifeGoals.find((goal) => goal.id === goalId)
      if (!goalToComplete || goalToComplete.completed) return current

      const updated = applyActivity(current, {
        label: `Completed goal: ${goalToComplete.title}`,
        points: 50,
        area: goalToComplete.category,
        care: { bond: 10, spark: 12, energy: 4 },
      })

      return {
        ...updated,
        lifeGoals: updated.lifeGoals.map((goal) =>
          goal.id === goalId ? { ...goal, completed: true } : goal,
        ),
      }
    })

    triggerPetReaction('celebrate')
  }

  function deleteGoal(goalId) {
    setProfile((current) => ({
      ...current,
      lifeGoals: current.lifeGoals.filter((goal) => goal.id !== goalId),
    }))
  }

  async function handleFoodScan(event) {
    event.preventDefault()
    setScanState('scanning')
    const result = await scanFood(foodInput)
    setFoodResult(result)
    setScanState('ready')
    triggerPetReaction('happy')
  }

  function logFoodScan() {
    if (!foodResult) return

    const bonus = Math.min(24, Math.round(foodResult.protein / 2))
    addActivity({
      label: foodResult.name,
      points: 18 + bonus,
      area: 'nutrition',
      reaction: 'happy',
      care: { satiety: 14, energy: 5, bond: 4 },
    })
    setScanState('logged')
  }

  function resetProfile() {
    setProfile(defaultProfile)
    setFoodResult(null)
    setScanState('idle')
    setActiveView('dashboard')
    setPetReaction('idle')
  }

  const sharedProps = {
    profile,
    companion,
    stageIndex,
    stageName,
    evolution,
    completedToday,
    unlockedAchievements,
    weeklyTotal,
    petReaction,
    petCanMove,
    workoutForm,
    setWorkoutForm,
    goalForm,
    setGoalForm,
    onActivity: addActivity,
    onCompleteQuest: completeQuest,
    onSelectPet: selectPet,
    onToggleSetting: toggleSetting,
    onTogglePetRoam: togglePetRoam,
    onMovePet: movePetTo,
    onResetProfile: resetProfile,
    onRecommendedWorkout: logRecommendedWorkout,
    onSaveCustomWorkout: saveCustomWorkout,
    onLogCustomWorkout: logCustomWorkout,
    onAddLifeGoal: addLifeGoal,
    onCompleteGoal: completeGoal,
    onDeleteGoal: deleteGoal,
    setActiveView,
    foodInput,
    setFoodInput,
    foodResult,
    scanState,
    onFoodScan: handleFoodScan,
    onLogFood: logFoodScan,
  }

  const view = renderActiveView(activeView, sharedProps)

  return (
    <div className={shellClass}>
      <aside className="app-rail" aria-label="Primary navigation">
        <button
          className="brand-lockup"
          type="button"
          onClick={() => setActiveView('dashboard')}
        >
          <span className="brand-mark">
            <PawPrint size={20} aria-hidden="true" />
          </span>
          <span>
            <strong>Life RPG</strong>
            <small>Companion OS</small>
          </span>
        </button>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className="nav-button"
                type="button"
                aria-current={activeView === item.id ? 'page' : undefined}
                onClick={() => setActiveView(item.id)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Welcome back, {profile.userName}</span>
            <h1>{activeTitle(activeView)}</h1>
          </div>
          <div className="topbar-actions">
            <MetricPill icon={Flame} label={`${profile.streak} day streak`} />
            <MetricPill icon={Sparkles} label={`${profile.points} pts`} />
            <button
              className="icon-toggle"
              type="button"
              aria-pressed={profile.settings.animations}
              title="Toggle animations"
              onClick={() => toggleSetting('animations')}
            >
              <Settings2 size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {view}
      </main>
    </div>
  )
}

function DashboardView({
  profile,
  companion,
  stageIndex,
  stageName,
  evolution,
  completedToday,
  unlockedAchievements,
  weeklyTotal,
  petReaction,
  petCanMove,
  onActivity,
  onCompleteQuest,
  onTogglePetRoam,
  onMovePet,
  setActiveView,
}) {
  return (
    <div className="view-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="status-chip">{companion.mood} bond</span>
          <h2>
            {companion.name} is a {stageName} {companion.species}
          </h2>
          <p>{companion.trait}</p>
          <ProgressBar value={evolution.progress} label={evolution.label} />
          <div className="quick-grid" aria-label="Quick actions">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  className="action-button"
                  type="button"
                  onClick={() => onActivity(action)}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{action.label}</span>
                  <strong>+{action.points}</strong>
                </button>
              )
            })}
          </div>
        </div>

        <PetPlayfield
          companion={companion}
          stageIndex={stageIndex}
          position={profile.petPosition}
          motionMode={profile.petMotionMode}
          petCanMove={petCanMove}
          reaction={petReaction}
          onMovePet={onMovePet}
          onToggleRoam={onTogglePetRoam}
          onChangeCompanion={() => setActiveView('pets')}
        />
      </section>

      <section className="dashboard-grid">
        <StatTile label="Weekly XP" value={weeklyTotal} icon={Activity} />
        <StatTile label="Bond" value={`${profile.care.bond}%`} icon={Heart} />
        <StatTile label="Unlocked" value={unlockedAchievements.length} icon={BadgeCheck} />
      </section>

      <section className="content-grid">
        <QuestBoard
          completedToday={completedToday}
          onCompleteQuest={onCompleteQuest}
        />
        <WeeklyChart weeklyPoints={profile.weeklyPoints} />
      </section>
    </div>
  )
}

function PetsView({ profile, companion, stageIndex, stageName, onSelectPet }) {
  return (
    <div className="view-stack">
      <section className="split-panel">
        <div>
          <span className="eyebrow">Active companion</span>
          <h2>
            {companion.name}, {stageName} {companion.species}
          </h2>
          <p>{companion.trait}</p>
          <div className="meter-list">
            <Meter label="Bond" value={profile.care.bond} />
            <Meter label="Spark" value={profile.care.spark} />
          </div>
        </div>
        <PetAvatar companion={companion} stageIndex={stageIndex} size="medium" />
      </section>

      <section className="pet-grid" aria-label="Companion selection">
        {companions.map((pet) => {
          const selected = pet.id === profile.petType
          return (
            <article className="pet-card" key={pet.id}>
              <PetAvatar companion={pet} stageIndex={stageIndex} size="small" />
              <div>
                <h3>{pet.name}</h3>
                <p>{pet.species}</p>
                <span>{pet.archetype}</span>
              </div>
              <div className="stage-preview" aria-label={`${pet.name} evolution preview`}>
                {pet.stages.map((stage, index) => (
                  <span key={stage} title={stage}>
                    <PetAvatar companion={pet} stageIndex={index} size="tiny" />
                    <small>{index + 1}</small>
                  </span>
                ))}
              </div>
              <button
                className={selected ? 'primary-button' : 'secondary-button'}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectPet(pet.id)}
              >
                {selected ? (
                  <CheckCircle2 size={17} aria-hidden="true" />
                ) : (
                  <Plus size={17} aria-hidden="true" />
                )}
                {selected ? 'Bonded' : 'Select'}
              </button>
            </article>
          )
        })}
      </section>
    </div>
  )
}

function CareView({
  profile,
  companion,
  stageIndex,
  petReaction,
  petCanMove,
  onActivity,
  onMovePet,
}) {
  return (
    <div className="care-layout">
      <section className="care-stage">
        <div className="care-playfield">
          <PetPlayfield
            companion={companion}
            stageIndex={stageIndex}
            position={profile.petPosition}
            motionMode={profile.petMotionMode}
            petCanMove={petCanMove}
            reaction={petReaction}
            compact
            onMovePet={onMovePet}
          />
        </div>
        <div>
          <span className="status-chip">{companion.mood} mood</span>
          <h2>Care room</h2>
          <p>{companion.name} responds to meals, training, play, and rest.</p>
        </div>
      </section>

      <section className="care-meters">
        <Meter label="Satiety" value={profile.care.satiety} />
        <Meter label="Energy" value={profile.care.energy} />
        <Meter label="Bond" value={profile.care.bond} />
        <Meter label="Spark" value={profile.care.spark} />
      </section>

      <section className="care-actions">
        {careActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              className="care-button"
              key={action.label}
              type="button"
              onClick={() => onActivity(action)}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{action.label}</span>
              <strong>+{action.points}</strong>
            </button>
          )
        })}
      </section>
    </div>
  )
}

function GymView({
  profile,
  workoutForm,
  setWorkoutForm,
  onRecommendedWorkout,
  onSaveCustomWorkout,
  onLogCustomWorkout,
  onActivity,
}) {
  return (
    <div className="view-stack">
      <section className="section-heading">
        <span className="eyebrow">Recommended workouts</span>
        <h2>Pick a workout and power up your pet</h2>
      </section>

      <section className="recommendation-grid">
        {recommendedWorkouts.map((workout) => (
          <article className="recommendation-card" key={workout.id}>
            <div className="movement-icon">
              <Dumbbell size={22} aria-hidden="true" />
            </div>
            <div>
              <h3>{workout.name}</h3>
              <p>{workout.details}</p>
              <span>{workout.focus}</span>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={() => onRecommendedWorkout(workout)}
            >
              <Plus size={17} aria-hidden="true" />
              +{workout.points}
            </button>
          </article>
        ))}
      </section>

      <section className="gym-tools-grid">
        <form className="custom-card" onSubmit={onSaveCustomWorkout}>
          <div className="section-heading">
            <span className="eyebrow">Your own workout</span>
            <h2>Add a custom one</h2>
          </div>
          <label htmlFor="custom-workout-name">Workout name</label>
          <input
            id="custom-workout-name"
            value={workoutForm.name}
            onChange={(event) =>
              setWorkoutForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            placeholder="Example: Push day"
          />
          <label htmlFor="custom-workout-detail">Sets, reps, or note</label>
          <input
            id="custom-workout-detail"
            value={workoutForm.detail}
            onChange={(event) =>
              setWorkoutForm((current) => ({
                ...current,
                detail: event.target.value,
              }))
            }
            placeholder="Bench 4x6, row 4x10"
          />
          <button className="primary-button full-width" type="submit">
            <Save size={18} aria-hidden="true" />
            Save workout
          </button>
        </form>

        <section className="custom-card">
          <div className="section-heading">
            <span className="eyebrow">Saved customs</span>
            <h2>Replay list</h2>
          </div>
          <div className="mini-list">
            {profile.customWorkouts.length ? (
              profile.customWorkouts.map((workout) => (
                <article className="mini-row" key={workout.id}>
                  <div>
                    <h3>{workout.name}</h3>
                    <p>{workout.detail}</p>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => onLogCustomWorkout(workout)}
                  >
                    <Plus size={17} aria-hidden="true" />
                    +{workout.points}
                  </button>
                </article>
              ))
            ) : (
              <div className="empty-state small">
                <Wand2 size={28} aria-hidden="true" />
                <h2>No custom workouts yet</h2>
                <p>Add one and it will stay here.</p>
              </div>
            )}
          </div>
        </section>
      </section>

      <section className="movement-grid">
        {gymMovements.map((movement) => (
          <article className="movement-card" key={movement.id}>
            <div className="movement-icon">
              <Dumbbell size={22} aria-hidden="true" />
            </div>
            <div>
              <h3>{movement.name}</h3>
              <p>{movement.target}</p>
              <span>
                {movement.pattern} - {movement.prescription}
              </span>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                onActivity({
                  label: movement.name,
                  points: movement.points,
                  area: 'gym',
                  reaction: 'power',
                  care: { energy: -4, satiety: -2, bond: 3, spark: 2 },
                })
              }
            >
              <Plus size={17} aria-hidden="true" />
              Log set
            </button>
          </article>
        ))}
      </section>
    </div>
  )
}

function NutritionView({
  foodInput,
  setFoodInput,
  foodResult,
  scanState,
  onFoodScan,
  onLogFood,
}) {
  return (
    <div className="nutrition-layout">
      <section className="scanner-panel">
        <div className="section-heading">
          <span className="eyebrow">Nutrition scanner</span>
          <h2>Convert meals into XP</h2>
        </div>

        <form className="scanner-form" onSubmit={onFoodScan}>
          <label htmlFor="food-input">Meal, barcode, or provider result</label>
          <div className="input-row">
            <input
              id="food-input"
              value={foodInput}
              onChange={(event) => setFoodInput(event.target.value)}
              placeholder="chicken bowl"
            />
            <button className="primary-button" type="submit">
              <ScanLine size={18} aria-hidden="true" />
              {scanState === 'scanning' ? 'Scanning' : 'Scan'}
            </button>
          </div>
        </form>

        <div className="shortcut-row">
          {foodShortcuts.map((food) => (
            <button
              className="shortcut-chip"
              key={food}
              type="button"
              onClick={() => setFoodInput(food)}
            >
              {food}
            </button>
          ))}
        </div>
      </section>

      <section className="scan-result">
        {foodResult ? (
          <>
            <div>
              <span className="status-chip">
                {Math.round(foodResult.confidence * 100)}% match
              </span>
              <h2>{foodResult.name}</h2>
            </div>
            <div className="macro-grid">
              <StatTile label="Calories" value={foodResult.calories} icon={Flame} />
              <StatTile label="Protein" value={`${foodResult.protein}g`} icon={Dumbbell} />
              <StatTile label="Carbs" value={`${foodResult.carbs}g`} icon={Zap} />
              <StatTile label="Fat" value={`${foodResult.fat}g`} icon={Leaf} />
            </div>
            <button className="primary-button full-width" type="button" onClick={onLogFood}>
              <Plus size={18} aria-hidden="true" />
              {scanState === 'logged' ? 'Logged' : 'Log meal'}
            </button>
          </>
        ) : (
          <div className="empty-state">
            <ScanLine size={36} aria-hidden="true" />
            <h2>Ready to scan</h2>
            <p>Meal estimates appear here with macros and companion XP.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function GoalsView({
  profile,
  goalForm,
  setGoalForm,
  onAddLifeGoal,
  onCompleteGoal,
  onDeleteGoal,
}) {
  const openGoals = profile.lifeGoals.filter((goal) => !goal.completed)
  const completedGoals = profile.lifeGoals.filter((goal) => goal.completed)

  return (
    <div className="goals-layout">
      <form className="goal-form" onSubmit={onAddLifeGoal}>
        <div className="section-heading">
          <span className="eyebrow">Life goals</span>
          <h2>Add a goal worth XP</h2>
        </div>
        <label htmlFor="goal-title">Goal title</label>
        <input
          id="goal-title"
          value={goalForm.title}
          onChange={(event) =>
            setGoalForm((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
          placeholder="Example: Apply to two internships"
        />
        <label htmlFor="goal-category">Category</label>
        <select
          id="goal-category"
          value={goalForm.category}
          onChange={(event) =>
            setGoalForm((current) => ({
              ...current,
              category: event.target.value,
            }))
          }
        >
          {goalCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button className="primary-button full-width" type="submit">
          <Plus size={18} aria-hidden="true" />
          Add goal
        </button>
      </form>

      <section className="goals-panel">
        <div className="section-heading">
          <span className="eyebrow">Active goals</span>
          <h2>Finish for +50 XP</h2>
        </div>
        <GoalList
          goals={openGoals}
          emptyTitle="No active goals"
          emptyText="Add something you actually want to win this week."
          onCompleteGoal={onCompleteGoal}
          onDeleteGoal={onDeleteGoal}
        />
      </section>

      <section className="goals-panel completed-goals">
        <div className="section-heading">
          <span className="eyebrow">Completed</span>
          <h2>Wins</h2>
        </div>
        <GoalList
          goals={completedGoals}
          emptyTitle="No wins logged yet"
          emptyText="Complete one goal and your pet celebrates."
          onCompleteGoal={onCompleteGoal}
          onDeleteGoal={onDeleteGoal}
        />
      </section>
    </div>
  )
}

function GoalList({
  goals,
  emptyTitle,
  emptyText,
  onCompleteGoal,
  onDeleteGoal,
}) {
  if (!goals.length) {
    return (
      <div className="empty-state small">
        <Flag size={28} aria-hidden="true" />
        <h2>{emptyTitle}</h2>
        <p>{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="goal-list">
      {goals.map((goal) => {
        const category = goalCategories.find((item) => item.id === goal.category)
        return (
          <article className={goal.completed ? 'goal-row done' : 'goal-row'} key={goal.id}>
            <div>
              <span
                className="goal-chip"
                style={{ '--goal-color': category?.color ?? '#34d399' }}
              >
                {category?.name ?? 'Life'}
              </span>
              <h3>{goal.title}</h3>
            </div>
            <div className="row-actions">
              {!goal.completed && (
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => onCompleteGoal(goal.id)}
                >
                  <CheckCircle2 size={17} aria-hidden="true" />
                  +50
                </button>
              )}
              <button
                className="icon-toggle danger"
                type="button"
                title="Delete goal"
                onClick={() => onDeleteGoal(goal.id)}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function ProgressView({
  profile,
  unlockedAchievements,
  onToggleSetting,
  onTogglePetRoam,
  onResetProfile,
}) {
  return (
    <div className="progress-layout">
      <section className="skill-panel">
        <div className="section-heading">
          <span className="eyebrow">Skill trees</span>
          <h2>Paths</h2>
        </div>
        {skillTrees.map((tree) => {
          const xp = profile.skillXp[tree.id] ?? 0
          const nextMilestone =
            tree.milestones.find((milestone) => xp < milestone) ??
            tree.milestones.at(-1)
          const value = Math.min(100, Math.round((xp / nextMilestone) * 100))

          return (
            <div className="skill-row" key={tree.id}>
              <div>
                <h3>{tree.name}</h3>
                <p>{tree.perk}</p>
              </div>
              <ProgressBar value={value} label={`${xp} XP`} color={tree.color} />
            </div>
          )
        })}
      </section>

      <section className="achievement-panel">
        <div className="section-heading">
          <span className="eyebrow">Badges</span>
          <h2>Achievements</h2>
        </div>
        <div className="badge-grid">
          {achievementRules.map((achievement) => {
            const unlocked = unlockedAchievements.some(
              (item) => item.id === achievement.id,
            )
            return (
              <article
                className={unlocked ? 'badge-card unlocked' : 'badge-card'}
                key={achievement.id}
              >
                {unlocked ? (
                  <BadgeCheck size={22} aria-hidden="true" />
                ) : (
                  <Circle size={22} aria-hidden="true" />
                )}
                <h3>{achievement.title}</h3>
                <p>{achievement.detail}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="settings-panel">
        <div className="section-heading">
          <span className="eyebrow">Settings</span>
          <h2>Comfort</h2>
        </div>
        <ToggleRow
          label="Pet animations"
          checked={profile.settings.animations}
          onClick={() => onToggleSetting('animations')}
        />
        <ToggleRow
          label="Free roam"
          checked={profile.petMotionMode === 'follow-roam'}
          onClick={onTogglePetRoam}
        />
        <ToggleRow
          label="Focus mode"
          checked={profile.settings.focusMode}
          onClick={() => onToggleSetting('focusMode')}
        />
        <button className="secondary-button" type="button" onClick={onResetProfile}>
          <RefreshCcw size={17} aria-hidden="true" />
          Reset demo
        </button>
      </section>

      <section className="ledger-panel">
        <div className="section-heading">
          <span className="eyebrow">Ledger</span>
          <h2>Recent XP</h2>
        </div>
        <div className="ledger-list">
          {profile.ledger.map((entry) => (
            <div className="ledger-row" key={entry.id}>
              <span>{entry.label}</span>
              <strong>
                {entry.points > 0 ? '+' : ''}
                {entry.points}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function PetPlayfield({
  companion,
  stageIndex,
  position,
  motionMode,
  petCanMove,
  reaction,
  compact = false,
  onMovePet,
  onToggleRoam,
  onChangeCompanion,
}) {
  function handlePlayfieldClick(event) {
    if (!petCanMove) return
    if (event.target.closest('[data-no-pet-move="true"]')) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100
    onMovePet({ x, y })
  }

  return (
    <section
      className={compact ? 'pet-playfield compact' : 'pet-playfield'}
      aria-label="Interactive pet playfield"
      onClick={handlePlayfieldClick}
    >
      <div className="playfield-hint">
        <MapPin size={15} aria-hidden="true" />
        {petCanMove ? 'Click anywhere here' : 'Movement paused'}
      </div>
      <motion.div
        className={`playfield-pet reaction-${reaction}`}
        animate={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          scale:
            reaction === 'power'
              ? 1.08
              : reaction === 'celebrate'
                ? 1.04
                : 1,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <PetAvatar
          companion={companion}
          stageIndex={stageIndex}
          size={compact ? 'medium' : 'large'}
        />
      </motion.div>
      {!compact && (
        <div className="playfield-actions" data-no-pet-move="true">
          <button className="secondary-button" type="button" onClick={onChangeCompanion}>
            <PawPrint size={18} aria-hidden="true" />
            Change companion
          </button>
          <button
            className="secondary-button"
            type="button"
            aria-pressed={motionMode === 'follow-roam'}
            onClick={onToggleRoam}
          >
            <Sparkles size={18} aria-hidden="true" />
            {motionMode === 'follow-roam' ? 'Free roam on' : 'Click follow'}
          </button>
        </div>
      )}
    </section>
  )
}

function QuestBoard({ completedToday, onCompleteQuest }) {
  return (
    <section className="quest-board">
      <div className="section-heading">
        <span className="eyebrow">Daily quests</span>
        <h2>Today</h2>
      </div>
      <div className="quest-list">
        {dailyQuests.map((quest) => {
          const completed = completedToday.includes(quest.id)
          return (
            <article className="quest-row" key={quest.id}>
              <div>
                <h3>{quest.title}</h3>
                <p>{quest.label}</p>
              </div>
              <button
                className={completed ? 'complete-button done' : 'complete-button'}
                type="button"
                disabled={completed}
                onClick={() => onCompleteQuest(quest)}
              >
                {completed ? (
                  <CheckCircle2 size={18} aria-hidden="true" />
                ) : (
                  <Plus size={18} aria-hidden="true" />
                )}
                {completed ? 'Done' : `+${quest.points}`}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function WeeklyChart({ weeklyPoints }) {
  const maxValue = Math.max(...weeklyPoints, 1)

  return (
    <section className="weekly-panel">
      <div className="section-heading">
        <span className="eyebrow">Weekly summary</span>
        <h2>XP rhythm</h2>
      </div>
      <div className="bar-chart" aria-label="Weekly point chart">
        {weeklyPoints.map((value, index) => (
          <div className="bar-column" key={`${value}-${index}`}>
            <span style={{ height: `${Math.max(12, (value / maxValue) * 100)}%` }} />
            <small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function PetAvatar({ companion, stageIndex, size }) {
  const style = {
    '--pet-a': companion.palette[0],
    '--pet-b': companion.palette[1],
    '--pet-c': companion.palette[2],
    '--pet-d': companion.palette[3],
  }

  return (
    <div
      className={`pet-avatar pet-${companion.id} pet-stage-${stageIndex} pet-${size}`}
      style={style}
    >
      <svg viewBox="0 0 240 240" role="img" aria-label={companion.name}>
        <title>{companion.name}</title>
        <circle className="pet-aura" cx="120" cy="120" r={stageIndex > 2 ? 101 : 92} />
        {renderPetShape(companion.id, stageIndex)}
        {stageIndex > 0 && (
          <g className="evolution-mark">
            <circle cx="184" cy="55" r="8" />
            <circle cx="204" cy="82" r="6" />
            {stageIndex > 2 && <circle cx="47" cy="74" r="7" />}
          </g>
        )}
        {stageIndex > 2 && (
          <path
            className="crown-mark"
            d="M83 38 105 64 122 34 139 64 160 38 154 76H89Z"
          />
        )}
      </svg>
      <span className="pet-shadow" aria-hidden="true" />
    </div>
  )
}

function renderPetShape(id, stageIndex) {
  switch (id) {
    case 'monkey':
      return renderMonkey(stageIndex)
    case 'wolf':
      return renderWolf(stageIndex)
    case 'titan':
      return renderTitan(stageIndex)
    case 'dragon':
    default:
      return renderDragon(stageIndex)
  }
}

function renderDragon(stageIndex) {
  const isArmored = stageIndex >= 2
  const isBuff = stageIndex >= 3

  return (
    <g className="pet-core">
      {stageIndex >= 1 && (
        <>
          <path className="pet-secondary" d="M72 125C34 84 31 48 53 35c29 13 50 45 57 87Z" />
          <path className="pet-secondary" d="M168 125c38-41 41-77 19-90-29 13-50 45-57 87Z" />
        </>
      )}
      <ellipse
        className="pet-primary"
        cx="121"
        cy={isBuff ? 147 : 145}
        rx={isBuff ? 70 : 55 + stageIndex * 4}
        ry={isBuff ? 54 : 49 + stageIndex * 2}
      />
      {isBuff && (
        <>
          <ellipse className="pet-primary muscle" cx="66" cy="141" rx="25" ry="22" />
          <ellipse className="pet-primary muscle" cx="176" cy="141" rx="25" ry="22" />
        </>
      )}
      <circle className="pet-primary" cx="122" cy="88" r={41 + stageIndex * 3} />
      <path className="pet-secondary" d="M86 61 70 30l35 14Zm71 0 17-31-35 14Z" />
      {isArmored && <path className="armor-plate" d="M89 132h67l-10 36h-47Z" />}
      <circle className="pet-light" cx="106" cy="85" r="7" />
      <circle className="pet-light" cx="139" cy="85" r="7" />
      <path className="pet-line" d="M112 107c8 9 18 9 27 0" />
      <path className="pet-secondary" d="M117 128h14l-7 20Z" />
      {isBuff && <path className="pet-light flame-mark" d="M123 22c20 20 18 39 0 54-18-15-20-34 0-54Z" />}
    </g>
  )
}

function renderMonkey(stageIndex) {
  const isArmored = stageIndex >= 2
  const isBuff = stageIndex >= 3

  return (
    <g className="pet-core">
      <path className="pet-line filled" d="M169 151c36-3 45-38 25-54-16-13-38 5-23 24" />
      <ellipse className="pet-primary" cx="120" cy="144" rx={isBuff ? 66 : 54} ry={isBuff ? 51 : 46} />
      {isBuff && (
        <>
          <ellipse className="pet-primary muscle" cx="65" cy="137" rx="26" ry="21" />
          <ellipse className="pet-primary muscle" cx="175" cy="137" rx="26" ry="21" />
        </>
      )}
      <circle className="pet-primary" cx="120" cy="91" r={isBuff ? 46 : 40 + stageIndex * 2} />
      <circle className="pet-secondary" cx="83" cy="91" r="18" />
      <circle className="pet-secondary" cx="157" cy="91" r="18" />
      <ellipse className="pet-secondary" cx="120" cy="105" rx="28" ry="19" />
      {isArmored && <path className="armor-plate" d="M86 133h68l-9 30H95Z" />}
      <circle className="pet-light" cx="107" cy="88" r="6" />
      <circle className="pet-light" cx="135" cy="88" r="6" />
      <path className="pet-line" d="M111 110c7 7 16 7 24 0" />
      {stageIndex >= 1 && <path className="pet-ring" d="M89 172c20 14 44 16 68 0" />}
      {isBuff && <path className="pet-secondary" d="M103 40h36l-8-19h-20Z" />}
    </g>
  )
}

function renderWolf(stageIndex) {
  const isArmored = stageIndex >= 2
  const isBuff = stageIndex >= 3

  return (
    <g className="pet-core">
      <path className="pet-secondary" d="M69 91 87 44l29 34 36-34 22 47c-23 24-82 24-105 0Z" />
      <ellipse className="pet-primary" cx="124" cy="145" rx={isBuff ? 69 : 59} ry={isBuff ? 49 : 43} />
      {isBuff && (
        <>
          <path className="pet-primary muscle" d="M63 132c-24 2-34 25-18 38 20 2 33-11 38-29Z" />
          <path className="pet-primary muscle" d="M181 132c24 2 34 25 18 38-20 2-33-11-38-29Z" />
        </>
      )}
      <path className="pet-primary" d="M74 91c20-28 78-28 98 0 3 33-18 56-49 56-30 0-52-23-49-56Z" />
      {isArmored && <path className="armor-plate" d="M85 126h78l-14 34h-52Z" />}
      <circle className="pet-light" cx="106" cy="96" r="7" />
      <circle className="pet-light" cx="140" cy="96" r="7" />
      <path className="pet-secondary" d="M118 110h12l-6 10Z" />
      <path className="pet-line" d="M102 123c12 9 31 9 43 0" />
      <path className="pet-ring" d="M62 162c32 26 86 28 120 0" />
      {isBuff && <path className="pet-light" d="M181 72h24v9h-24Zm-147 0h24v9H34Z" />}
    </g>
  )
}

function renderTitan(stageIndex) {
  const isArmored = stageIndex >= 2
  const isBuff = stageIndex >= 3

  return (
    <g className="pet-core">
      <rect
        className="pet-primary"
        x={isBuff ? 61 : 74}
        y="98"
        width={isBuff ? 119 : 92}
        height={isBuff ? 84 : 72}
        rx="20"
      />
      <rect className="pet-primary" x="82" y="55" width="78" height="61" rx="18" />
      <rect className="pet-secondary" x="72" y="47" width="30" height="31" rx="8" />
      <rect className="pet-secondary" x="139" y="47" width="30" height="31" rx="8" />
      <rect className="pet-secondary muscle" x={isBuff ? 35 : 52} y="121" width="36" height="44" rx="15" />
      <rect className="pet-secondary muscle" x={isBuff ? 169 : 152} y="121" width="36" height="44" rx="15" />
      {isArmored && <path className="armor-plate" d="M87 117h67l-9 39H96Z" />}
      <circle className="pet-light" cx="106" cy="83" r="7" />
      <circle className="pet-light" cx="136" cy="83" r="7" />
      <path className="pet-line" d="M109 101c8 6 20 6 28 0" />
      <path className="pet-ring" d="M88 181h68" />
      {isBuff && <path className="pet-light" d="M96 34h52l-13-18h-26Z" />}
    </g>
  )
}

function StatTile({ label, value, icon: Icon }) {
  return (
    <article className="stat-tile">
      <Icon size={19} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function MetricPill({ icon: Icon, label }) {
  return (
    <span className="metric-pill">
      <Icon size={16} aria-hidden="true" />
      {label}
    </span>
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

function ProgressBar({ value, label, color }) {
  return (
    <div className="progress-block" style={{ '--progress-color': color }}>
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <span className="progress-track">
        <span style={{ width: `${value}%` }} />
      </span>
    </div>
  )
}

function ToggleRow({ label, checked, onClick }) {
  return (
    <button className="toggle-row" type="button" aria-pressed={checked} onClick={onClick}>
      <span>{label}</span>
      <span className="switch">
        <span />
      </span>
    </button>
  )
}

function usePersistentProfile() {
  const [profile, setProfileState] = useState(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      return saved ? mergeProfile(JSON.parse(saved)) : defaultProfile
    } catch {
      return defaultProfile
    }
  })

  const setProfile = useCallback((updater) => {
    setProfileState((current) => {
      const next = mergeProfile(
        typeof updater === 'function' ? updater(current) : updater,
      )
      window.localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }, [])

  return [profile, setProfile]
}

function applyActivity(profile, activity) {
  const points = activity.points ?? 0
  const area = normalizeArea(activity.area)
  const weeklyPoints = [...profile.weeklyPoints]
  weeklyPoints[weeklyPoints.length - 1] += points

  return {
    ...profile,
    points: profile.points + points,
    care: applyCare(profile.care, activity.care),
    skillXp: {
      ...profile.skillXp,
      [area]: (profile.skillXp[area] ?? 0) + points,
    },
    weeklyPoints,
    ledger: [
      makeLedgerEntry(activity.label, points, area),
      ...profile.ledger,
    ].slice(0, 10),
  }
}

function applyCare(care, delta = {}) {
  return {
    satiety: clampMeter(care.satiety + (delta.satiety ?? 0)),
    energy: clampMeter(care.energy + (delta.energy ?? 0)),
    bond: clampMeter(care.bond + (delta.bond ?? 0)),
    spark: clampMeter(care.spark + (delta.spark ?? 0)),
  }
}

function makeLedgerEntry(label, points, area) {
  return {
    id: makeId('ledger'),
    label,
    points,
    area,
    time: 'Now',
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeArea(area) {
  return ['gym', 'nutrition', 'focus', 'life'].includes(area) ? area : 'life'
}

function reactionForArea(area) {
  if (area === 'gym') return 'power'
  if (area === 'nutrition') return 'happy'
  return 'celebrate'
}

function getRoamPosition(position) {
  const nextX = position.x + (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 14)
  const nextY = position.y + (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 12)

  return {
    x: clampPercent(nextX),
    y: clampPercent(nextY),
  }
}

function activeTitle(activeView) {
  switch (activeView) {
    case 'pets':
      return 'Companions'
    case 'care':
      return 'Pet Care'
    case 'gym':
      return 'Gym'
    case 'nutrition':
      return 'Nutrition'
    case 'goals':
      return 'Goals'
    case 'progress':
      return 'Progress'
    default:
      return 'Dashboard'
  }
}

function renderActiveView(activeView, sharedProps) {
  switch (activeView) {
    case 'pets':
      return <PetsView {...sharedProps} />
    case 'care':
      return <CareView {...sharedProps} />
    case 'gym':
      return <GymView {...sharedProps} />
    case 'nutrition':
      return <NutritionView {...sharedProps} />
    case 'goals':
      return <GoalsView {...sharedProps} />
    case 'progress':
      return <ProgressView {...sharedProps} />
    default:
      return <DashboardView {...sharedProps} />
  }
}

export default App
