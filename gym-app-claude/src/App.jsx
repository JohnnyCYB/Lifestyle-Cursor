import { useCallback, useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
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
  getGoalSize,
  getNextEvolution,
  getStageIndex,
  goalCategories,
  goalSizes,
  gymMovements,
  mergeProfile,
  recommendedWorkouts,
  skillTrees,
} from './data/lifeRpg'
import GlobalPet from './components/GlobalPet'
import { scanFood } from './services/foodScanner'
import './App.css'

const storageKey = 'life-rpg-profile-v1'
const todayKey = new Date().toISOString().slice(0, 10)

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
  { label: 'Water', icon: Leaf, points: 10, area: 'nutrition', reaction: 'happy', care: { energy: 3, satiety: 1, spark: 2 } },
  { label: 'Workout', icon: Dumbbell, points: 45, area: 'gym', reaction: 'power', care: { energy: -7, satiety: -4, bond: 7 } },
  { label: 'Meal', icon: Utensils, points: 25, area: 'nutrition', reaction: 'happy', care: { satiety: 12, energy: 5, bond: 3 } },
  { label: 'Focus', icon: Target, points: 20, area: 'focus', reaction: 'celebrate', care: { spark: 7, bond: 2 } },
]

const careActions = [
  { label: 'Feed', icon: Utensils, points: 16, area: 'nutrition', reaction: 'happy', care: { satiety: 18, bond: 4 } },
  { label: 'Train', icon: Dumbbell, points: 22, area: 'gym', reaction: 'power', care: { energy: -10, spark: 9, bond: 8 } },
  { label: 'Play', icon: Sparkles, points: 14, area: 'focus', reaction: 'celebrate', care: { spark: 12, bond: 7 } },
  { label: 'Rest', icon: Zap, points: 12, area: 'focus', reaction: 'happy', care: { energy: 16, satiety: -2, bond: 2 } },
]

function App() {
  const [profile, setProfile] = usePersistentProfile()
  const [activeView, setActiveView] = useState('dashboard')
  const [foodInput, setFoodInput] = useState('chicken bowl')
  const [foodResult, setFoodResult] = useState(null)
  const [scanState, setScanState] = useState('idle')
  const [petReaction, setPetReaction] = useState('idle')
  const [workoutForm, setWorkoutForm] = useState({ name: '', detail: '' })
  const [goalForm, setGoalForm] = useState({ title: '', category: 'gym', size: 'small' })
  const prefersReducedMotion = useReducedMotion()

  const companion = companions.find((candidate) => candidate.id === profile.petType) ?? companions[0]
  const stageIndex = getStageIndex(profile.points)
  const stageName = companion.stages[stageIndex]
  const evolution = getNextEvolution(profile.points)
  const completedToday = profile.completedByDate[todayKey] ?? []
  const unlockedAchievements = achievementRules.filter((rule) => rule.test(profile))
  const weeklyTotal = profile.weeklyPoints.reduce((total, day) => total + day, 0)
  const petCanMove = profile.settings.animations && !prefersReducedMotion

  useEffect(() => {
    if (petReaction === 'idle') return undefined
    const reactionTimer = window.setTimeout(() => setPetReaction('idle'), 1300)
    return () => window.clearTimeout(reactionTimer)
  }, [petReaction])

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
      const updated = applyActivity(current, quest)
      return {
        ...updated,
        completedByDate: { ...updated.completedByDate, [todayKey]: [...todaysCompletions, quest.id] },
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
      ledger: [makeLedgerEntry(`Bonded with ${nextPet?.name ?? 'companion'}`, 0, 'pet'), ...current.ledger].slice(0, 10),
    }))
    triggerPetReaction('celebrate')
  }

  function toggleSetting(setting) {
    setProfile((current) => ({ ...current, settings: { ...current.settings, [setting]: !current.settings[setting] } }))
  }

  function togglePetRoam() {
    setProfile((current) => ({
      ...current,
      petMotionMode: current.petMotionMode === 'follow-roam' ? 'click-only' : 'follow-roam',
    }))
  }

  function movePetTo(position) {
    if (!petCanMove) return
    setProfile((current) => ({
      ...current,
      petPosition: { x: clampPercent(position.x), y: clampPercent(position.y) },
    }))
  }

  function saveCustomWorkout(event) {
    event.preventDefault()
    const name = workoutForm.name.trim()
    const detail = workoutForm.detail.trim()
    if (!name) return
    const workout = { id: makeId('workout'), name, detail: detail || 'Custom workout', points: 50, createdAt: 'Now' }
    setProfile((current) => ({
      ...current,
      customWorkouts: [workout, ...current.customWorkouts].slice(0, 8),
      ledger: [makeLedgerEntry(`Saved workout: ${workout.name}`, 0, 'gym'), ...current.ledger].slice(0, 10),
    }))
    setWorkoutForm({ name: '', detail: '' })
    triggerPetReaction('celebrate')
  }

  function addLifeGoal(event) {
    event.preventDefault()
    const title = goalForm.title.trim()
    if (!title) return
    const size = getGoalSize(goalForm.size)
    const goal = {
      id: makeId('goal'),
      title,
      category: goalForm.category,
      size: size.id,
      points: size.points,
      completed: false,
      createdAt: 'Now',
    }
    setProfile((current) => ({
      ...current,
      lifeGoals: [goal, ...current.lifeGoals].slice(0, 12),
      ledger: [makeLedgerEntry(`Added ${size.name.toLowerCase()} goal: ${goal.title}`, 0, goal.category), ...current.ledger].slice(0, 10),
    }))
    setGoalForm({ title: '', category: goalForm.category, size: goalForm.size })
    triggerPetReaction('happy')
  }

  function completeGoal(goalId) {
    setProfile((current) => {
      const goalToComplete = current.lifeGoals.find((goal) => goal.id === goalId)
      if (!goalToComplete || goalToComplete.completed) return current
      const points = goalToComplete.points ?? getGoalSize(goalToComplete.size).points
      const updated = applyActivity(current, {
        label: `Completed goal: ${goalToComplete.title}`,
        points,
        area: goalToComplete.category,
        care: { bond: 10, spark: goalToComplete.size === 'big' ? 24 : 12, energy: 4 },
      })
      return {
        ...updated,
        lifeGoals: updated.lifeGoals.map((goal) => (goal.id === goalId ? { ...goal, points, completed: true } : goal)),
      }
    })
    triggerPetReaction('celebrate')
  }

  function deleteGoal(goalId) {
    setProfile((current) => ({ ...current, lifeGoals: current.lifeGoals.filter((goal) => goal.id !== goalId) }))
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
    addActivity({ label: foodResult.name, points: 18 + bonus, area: 'nutrition', reaction: 'happy', care: { satiety: 14, energy: 5, bond: 4 } })
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
    profile, companion, stageIndex, stageName, evolution, completedToday, unlockedAchievements, weeklyTotal,
    petReaction, petCanMove, workoutForm, setWorkoutForm, goalForm, setGoalForm,
    onActivity: addActivity, onCompleteQuest: completeQuest, onSelectPet: selectPet,
    onToggleSetting: toggleSetting, onTogglePetRoam: togglePetRoam, onMovePet: movePetTo,
    onResetProfile: resetProfile, onRecommendedWorkout: (workout) => addActivity({ label: workout.name, points: workout.points, area: 'gym', reaction: 'power', care: { energy: -8, satiety: -4, bond: 7, spark: 8 } }),
    onSaveCustomWorkout: saveCustomWorkout, onLogCustomWorkout: (workout) => addActivity({ label: workout.name, points: workout.points, area: 'gym', reaction: 'power', care: { energy: -6, satiety: -3, bond: 5, spark: 6 } }),
    onAddLifeGoal: addLifeGoal, onCompleteGoal: completeGoal, onDeleteGoal: deleteGoal,
    setActiveView, foodInput, setFoodInput, foodResult, scanState, onFoodScan: handleFoodScan, onLogFood: logFoodScan,
  }

  return (
    <div className={['app-shell', profile.settings.animations ? 'motion-ok' : 'motion-off', profile.settings.focusMode ? 'focus-mode' : ''].filter(Boolean).join(' ')}>
      <GlobalPet companion={companion} stageIndex={stageIndex} position={profile.petPosition} motionMode={profile.petMotionMode} petCanMove={petCanMove} reaction={petReaction} onMovePet={movePetTo} />
      <aside className="app-rail" aria-label="Primary navigation">
        <button className="brand-lockup" type="button" onClick={() => setActiveView('dashboard')}>
          <span className="brand-mark"><PawPrint size={20} aria-hidden="true" /></span>
          <span><strong>Life RPG</strong><small>Companion OS</small></span>
        </button>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon
            return <button key={item.id} className="nav-button" type="button" aria-current={activeView === item.id ? 'page' : undefined} onClick={() => setActiveView(item.id)}><Icon size={18} aria-hidden="true" /><span>{item.label}</span></button>
          })}
        </nav>
      </aside>
      <main className="app-main">
        <header className="topbar" data-no-pet-move="true">
          <div><span className="eyebrow">Welcome back, {profile.userName}</span><h1>{activeTitle(activeView)}</h1></div>
          <div className="topbar-actions">
            <MetricPill icon={Flame} label={`${profile.streak} day streak`} />
            <MetricPill icon={Sparkles} label={`${profile.points} pts`} />
            <button className="icon-toggle" type="button" aria-pressed={profile.settings.animations} title="Toggle animations" onClick={() => toggleSetting('animations')}><Settings2 size={18} aria-hidden="true" /></button>
          </div>
        </header>
        {renderActiveView(activeView, sharedProps)}
      </main>
    </div>
  )
}

function DashboardView({ profile, companion, stageIndex, stageName, evolution, completedToday, unlockedAchievements, weeklyTotal, onActivity, onCompleteQuest, onTogglePetRoam, setActiveView }) {
  return <div className="view-stack">
    <section className="hero-panel hero-panel-global">
      <div className="hero-copy">
        <span className="status-chip">{companion.mood} bond</span>
        <h2>{companion.name} is a {stageName} {companion.species}</h2>
        <p>{companion.trait}</p>
        <ProgressBar value={evolution.progress} label={evolution.label} />
        <div className="quick-grid" aria-label="Quick actions">{quickActions.map((action) => { const Icon = action.icon; return <button key={action.label} className="action-button" type="button" onClick={() => onActivity(action)}><Icon size={18} aria-hidden="true" /><span>{action.label}</span><strong>+{action.points}</strong></button> })}</div>
      </div>
      <section className="pet-command-panel" data-no-pet-move="true">
        <span className="eyebrow">Screen pet active</span>
        <h2>Tap anywhere empty and your dragon follows.</h2>
        <p>Free roam lets it walk across tabs. Buttons and forms are protected so it will not steal your clicks.</p>
        <div className="playfield-actions static"><button className="secondary-button" type="button" onClick={() => setActiveView('pets')}><PawPrint size={18} />Change companion</button><button className="secondary-button" type="button" aria-pressed={profile.petMotionMode === 'follow-roam'} onClick={onTogglePetRoam}><Sparkles size={18} />{profile.petMotionMode === 'follow-roam' ? 'Free roam on' : 'Tap follow only'}</button></div>
      </section>
    </section>
    <section className="dashboard-grid"><StatTile label="Weekly XP" value={weeklyTotal} icon={Activity} /><StatTile label="Bond" value={`${profile.care.bond}%`} icon={Heart} /><StatTile label="Unlocked" value={unlockedAchievements.length} icon={BadgeCheck} /></section>
    <section className="content-grid"><QuestBoard completedToday={completedToday} onCompleteQuest={onCompleteQuest} /><WeeklyChart weeklyPoints={profile.weeklyPoints} /></section>
  </div>
}

function PetsView({ profile, companion, stageIndex, stageName, onSelectPet }) {
  return <div className="view-stack"><section className="split-panel"><div><span className="eyebrow">Active companion</span><h2>{companion.name}, {stageName} {companion.species}</h2><p>{companion.trait}</p><div className="meter-list"><Meter label="Bond" value={profile.care.bond} /><Meter label="Spark" value={profile.care.spark} /></div></div><PetAvatar companion={companion} stageIndex={stageIndex} size="medium" /></section><section className="pet-grid" aria-label="Companion selection">{companions.map((pet) => <article className="pet-card" key={pet.id}><PetAvatar companion={pet} stageIndex={stageIndex} size="small" /><div><h3>{pet.name}</h3><p>{pet.species}</p><span>{pet.archetype}</span></div><div className="stage-preview" aria-label={`${pet.name} evolution preview`}>{pet.stages.map((stage, index) => <span key={stage} title={stage}><PetAvatar companion={pet} stageIndex={index} size="tiny" /><small>{index + 1}</small></span>)}</div><button className={pet.id === profile.petType ? 'primary-button' : 'secondary-button'} type="button" onClick={() => onSelectPet(pet.id)}>{pet.id === profile.petType ? <CheckCircle2 size={17} /> : <Plus size={17} />}{pet.id === profile.petType ? 'Bonded' : 'Select'}</button></article>)}</section></div>
}

function CareView({ profile, companion, stageIndex, onActivity, onTogglePetRoam }) {
  return <div className="care-layout"><section className="care-stage"><PetAvatar companion={companion} stageIndex={stageIndex} size="large" /><div><span className="status-chip">{companion.mood} mood</span><h2>Care room</h2><p>{companion.name} responds to meals, training, play, rest, and screen movement.</p><button className="secondary-button" type="button" onClick={onTogglePetRoam}><Sparkles size={18} />Toggle free roam</button></div></section><section className="care-meters"><Meter label="Satiety" value={profile.care.satiety} /><Meter label="Energy" value={profile.care.energy} /><Meter label="Bond" value={profile.care.bond} /><Meter label="Spark" value={profile.care.spark} /></section><section className="care-actions">{careActions.map((action) => { const Icon = action.icon; return <button className="care-button" key={action.label} type="button" onClick={() => onActivity(action)}><Icon size={20} /><span>{action.label}</span><strong>+{action.points}</strong></button> })}</section></div>
}

function GymView({ profile, workoutForm, setWorkoutForm, onRecommendedWorkout, onSaveCustomWorkout, onLogCustomWorkout, onActivity }) {
  return <div className="view-stack"><section className="section-heading"><span className="eyebrow">Recommended workouts</span><h2>Pick a workout and power up your pet</h2></section><section className="recommendation-grid">{recommendedWorkouts.map((workout) => <article className="recommendation-card" key={workout.id}><div className="movement-icon"><Dumbbell size={22} /></div><div><h3>{workout.name}</h3><p>{workout.details}</p><span>{workout.focus}</span></div><button className="primary-button" type="button" onClick={() => onRecommendedWorkout(workout)}><Plus size={17} />+{workout.points}</button></article>)}</section><section className="gym-tools-grid"><form className="custom-card" onSubmit={onSaveCustomWorkout}><div className="section-heading"><span className="eyebrow">Your own workout</span><h2>Add a custom one</h2></div><label htmlFor="custom-workout-name">Workout name</label><input id="custom-workout-name" value={workoutForm.name} onChange={(event) => setWorkoutForm((current) => ({ ...current, name: event.target.value }))} placeholder="Example: Push day" /><label htmlFor="custom-workout-detail">Sets, reps, or note</label><input id="custom-workout-detail" value={workoutForm.detail} onChange={(event) => setWorkoutForm((current) => ({ ...current, detail: event.target.value }))} placeholder="Bench 4x6, row 4x10" /><button className="primary-button full-width" type="submit"><Save size={18} />Save workout</button></form><section className="custom-card"><div className="section-heading"><span className="eyebrow">Saved customs</span><h2>Replay list</h2></div><div className="mini-list">{profile.customWorkouts.length ? profile.customWorkouts.map((workout) => <article className="mini-row" key={workout.id}><div><h3>{workout.name}</h3><p>{workout.detail}</p></div><button className="secondary-button" type="button" onClick={() => onLogCustomWorkout(workout)}><Plus size={17} />+{workout.points}</button></article>) : <div className="empty-state small"><Wand2 size={28} /><h2>No custom workouts yet</h2><p>Add one and it will stay here.</p></div>}</div></section></section><section className="movement-grid">{gymMovements.map((movement) => <article className="movement-card" key={movement.id}><div className="movement-icon"><Dumbbell size={22} /></div><div><h3>{movement.name}</h3><p>{movement.target}</p><span>{movement.pattern} - {movement.prescription}</span></div><button className="secondary-button" type="button" onClick={() => onActivity({ label: movement.name, points: movement.points, area: 'gym', reaction: 'power', care: { energy: -4, satiety: -2, bond: 3, spark: 2 } })}><Plus size={17} />Log set</button></article>)}</section></div>
}

function NutritionView({ foodInput, setFoodInput, foodResult, scanState, onFoodScan, onLogFood }) {
  return <div className="nutrition-layout"><section className="scanner-panel"><div className="section-heading"><span className="eyebrow">Nutrition scanner</span><h2>Convert meals into XP</h2></div><form className="scanner-form" onSubmit={onFoodScan}><label htmlFor="food-input">Meal, barcode, or provider result</label><div className="input-row"><input id="food-input" value={foodInput} onChange={(event) => setFoodInput(event.target.value)} placeholder="chicken bowl" /><button className="primary-button" type="submit"><ScanLine size={18} />{scanState === 'scanning' ? 'Scanning' : 'Scan'}</button></div></form><div className="shortcut-row">{foodShortcuts.map((food) => <button className="shortcut-chip" key={food} type="button" onClick={() => setFoodInput(food)}>{food}</button>)}</div></section><section className="scan-result">{foodResult ? <><div><span className="status-chip">{Math.round(foodResult.confidence * 100)}% match</span><h2>{foodResult.name}</h2></div><div className="macro-grid"><StatTile label="Calories" value={foodResult.calories} icon={Flame} /><StatTile label="Protein" value={`${foodResult.protein}g`} icon={Dumbbell} /><StatTile label="Carbs" value={`${foodResult.carbs}g`} icon={Zap} /><StatTile label="Fat" value={`${foodResult.fat}g`} icon={Leaf} /></div><button className="primary-button full-width" type="button" onClick={onLogFood}><Plus size={18} />{scanState === 'logged' ? 'Logged' : 'Log meal'}</button></> : <div className="empty-state"><ScanLine size={36} /><h2>Ready to scan</h2><p>Meal estimates appear here with macros and companion XP.</p></div>}</section></div>
}

function GoalsView({ profile, goalForm, setGoalForm, onAddLifeGoal, onCompleteGoal, onDeleteGoal }) {
  const openGoals = profile.lifeGoals.filter((goal) => !goal.completed)
  const completedGoals = profile.lifeGoals.filter((goal) => goal.completed)
  return <div className="goals-layout"><form className="goal-form" onSubmit={onAddLifeGoal}><div className="section-heading"><span className="eyebrow">Life goals</span><h2>Add a goal worth XP</h2></div><label htmlFor="goal-title">Goal title</label><input id="goal-title" value={goalForm.title} onChange={(event) => setGoalForm((current) => ({ ...current, title: event.target.value }))} placeholder="Example: Apply to two internships" /><label htmlFor="goal-category">Category</label><select id="goal-category" value={goalForm.category} onChange={(event) => setGoalForm((current) => ({ ...current, category: event.target.value }))}>{goalCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><label>Reward size</label><div className="goal-size-grid">{goalSizes.map((size) => <label className="goal-size-card" key={size.id}><input type="radio" name="goal-size" value={size.id} checked={goalForm.size === size.id} onChange={(event) => setGoalForm((current) => ({ ...current, size: event.target.value }))} /><strong>{size.label}</strong><span>{size.range}</span><small>{size.description}</small></label>)}</div><button className="primary-button full-width" type="submit"><Plus size={18} />Add goal</button></form><section className="goals-panel"><div className="section-heading"><span className="eyebrow">Active goals</span><h2>Finish for variable XP</h2></div><GoalList goals={openGoals} emptyTitle="No active goals" emptyText="Add something you actually want to win this week." onCompleteGoal={onCompleteGoal} onDeleteGoal={onDeleteGoal} /></section><section className="goals-panel completed-goals"><div className="section-heading"><span className="eyebrow">Completed</span><h2>Wins</h2></div><GoalList goals={completedGoals} emptyTitle="No wins logged yet" emptyText="Complete one goal and your pet celebrates." onCompleteGoal={onCompleteGoal} onDeleteGoal={onDeleteGoal} /></section></div>
}

function GoalList({ goals, emptyTitle, emptyText, onCompleteGoal, onDeleteGoal }) {
  if (!goals.length) return <div className="empty-state small"><Flag size={28} /><h2>{emptyTitle}</h2><p>{emptyText}</p></div>
  return <div className="goal-list">{goals.map((goal) => { const category = goalCategories.find((item) => item.id === goal.category); const size = getGoalSize(goal.size); const points = goal.points ?? size.points; return <article className={goal.completed ? 'goal-row done' : 'goal-row'} key={goal.id}><div><span className="goal-chip" style={{ '--goal-color': category?.color ?? '#34d399' }}>{category?.name ?? 'Life'}</span><span className="goal-reward">{size.name} +{points} XP</span><h3>{goal.title}</h3></div><div className="row-actions">{!goal.completed && <button className="primary-button" type="button" onClick={() => onCompleteGoal(goal.id)}><CheckCircle2 size={17} />+{points}</button>}<button className="icon-toggle danger" type="button" title="Delete goal" onClick={() => onDeleteGoal(goal.id)}><Trash2 size={17} /></button></div></article> })}</div>
}

function ProgressView({ profile, unlockedAchievements, onToggleSetting, onTogglePetRoam, onResetProfile }) {
  return <div className="progress-layout"><section className="skill-panel"><div className="section-heading"><span className="eyebrow">Skill trees</span><h2>Paths</h2></div>{skillTrees.map((tree) => { const xp = profile.skillXp[tree.id] ?? 0; const nextMilestone = tree.milestones.find((milestone) => xp < milestone) ?? tree.milestones.at(-1); const value = Math.min(100, Math.round((xp / nextMilestone) * 100)); return <div className="skill-row" key={tree.id}><div><h3>{tree.name}</h3><p>{tree.perk}</p></div><ProgressBar value={value} label={`${xp} XP`} color={tree.color} /></div> })}</section><section className="achievement-panel"><div className="section-heading"><span className="eyebrow">Badges</span><h2>Achievements</h2></div><div className="badge-grid">{achievementRules.map((achievement) => { const unlocked = unlockedAchievements.some((item) => item.id === achievement.id); return <article className={unlocked ? 'badge-card unlocked' : 'badge-card'} key={achievement.id}>{unlocked ? <BadgeCheck size={22} /> : <Circle size={22} />}<h3>{achievement.title}</h3><p>{achievement.detail}</p></article> })}</div></section><section className="settings-panel"><div className="section-heading"><span className="eyebrow">Settings</span><h2>Comfort</h2></div><ToggleRow label="Pet animations" checked={profile.settings.animations} onClick={() => onToggleSetting('animations')} /><ToggleRow label="Free roam" checked={profile.petMotionMode === 'follow-roam'} onClick={onTogglePetRoam} /><ToggleRow label="Focus mode" checked={profile.settings.focusMode} onClick={() => onToggleSetting('focusMode')} /><button className="secondary-button" type="button" onClick={onResetProfile}><RefreshCcw size={17} />Reset demo</button></section><section className="ledger-panel"><div className="section-heading"><span className="eyebrow">Ledger</span><h2>Recent XP</h2></div><div className="ledger-list">{profile.ledger.map((entry) => <div className="ledger-row" key={entry.id}><span>{entry.label}</span><strong>{entry.points > 0 ? '+' : ''}{entry.points}</strong></div>)}</div></section></div>
}

function QuestBoard({ completedToday, onCompleteQuest }) { return <section className="quest-board"><div className="section-heading"><span className="eyebrow">Daily quests</span><h2>Today</h2></div><div className="quest-list">{dailyQuests.map((quest) => { const completed = completedToday.includes(quest.id); return <article className="quest-row" key={quest.id}><div><h3>{quest.title}</h3><p>{quest.label}</p></div><button className={completed ? 'complete-button done' : 'complete-button'} type="button" disabled={completed} onClick={() => onCompleteQuest(quest)}>{completed ? <CheckCircle2 size={18} /> : <Plus size={18} />}{completed ? 'Done' : `+${quest.points}`}</button></article> })}</div></section> }
function WeeklyChart({ weeklyPoints }) { const maxValue = Math.max(...weeklyPoints, 1); return <section className="weekly-panel"><div className="section-heading"><span className="eyebrow">Weekly summary</span><h2>XP rhythm</h2></div><div className="bar-chart" aria-label="Weekly point chart">{weeklyPoints.map((value, index) => <div className="bar-column" key={`${value}-${index}`}><span style={{ height: `${Math.max(12, (value / maxValue) * 100)}%` }} /><small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</small></div>)}</div></section> }
function PetAvatar({ companion, stageIndex, size }) { return <div className={`pet-avatar pet-${companion.id} pet-stage-${stageIndex} pet-${size}`} style={{ '--pet-a': companion.palette[0], '--pet-b': companion.palette[1], '--pet-c': companion.palette[2], '--pet-d': companion.palette[3] }}><span className="pet-shadow" aria-hidden="true" /><span className="pet-mini-core"><PawPrint size={size === 'tiny' ? 18 : 34} /></span></div> }
function StatTile({ label, value, icon: Icon }) { return <article className="stat-tile"><Icon size={19} /><span>{label}</span><strong>{value}</strong></article> }
function MetricPill({ icon: Icon, label }) { return <span className="metric-pill"><Icon size={16} />{label}</span> }
function Meter({ label, value }) { return <div className="meter"><div><span>{label}</span><strong>{value}%</strong></div><span className="meter-track"><span style={{ width: `${value}%` }} /></span></div> }
function ProgressBar({ value, label, color }) { return <div className="progress-block" style={{ '--progress-color': color }}><div><span>{label}</span><strong>{value}%</strong></div><span className="progress-track"><span style={{ width: `${value}%` }} /></span></div> }
function ToggleRow({ label, checked, onClick }) { return <button className="toggle-row" type="button" aria-pressed={checked} onClick={onClick}><span>{label}</span><span className="switch"><span /></span></button> }

function usePersistentProfile() {
  const [profile, setProfileState] = useState(() => {
    try { const saved = window.localStorage.getItem(storageKey); return saved ? mergeProfile(JSON.parse(saved)) : defaultProfile } catch { return defaultProfile }
  })
  const setProfile = useCallback((updater) => {
    setProfileState((current) => { const next = mergeProfile(typeof updater === 'function' ? updater(current) : updater); window.localStorage.setItem(storageKey, JSON.stringify(next)); return next })
  }, [])
  return [profile, setProfile]
}
function applyActivity(profile, activity) { const points = activity.points ?? 0; const area = normalizeArea(activity.area); const weeklyPoints = [...profile.weeklyPoints]; weeklyPoints[weeklyPoints.length - 1] += points; return { ...profile, points: profile.points + points, care: applyCare(profile.care, activity.care), skillXp: { ...profile.skillXp, [area]: (profile.skillXp[area] ?? 0) + points }, weeklyPoints, ledger: [makeLedgerEntry(activity.label, points, area), ...profile.ledger].slice(0, 10) } }
function applyCare(care, delta = {}) { return { satiety: clampMeter(care.satiety + (delta.satiety ?? 0)), energy: clampMeter(care.energy + (delta.energy ?? 0)), bond: clampMeter(care.bond + (delta.bond ?? 0)), spark: clampMeter(care.spark + (delta.spark ?? 0)) } }
function makeLedgerEntry(label, points, area) { return { id: makeId('ledger'), label, points, area, time: 'Now' } }
function makeId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}` }
function normalizeArea(area) { return ['gym', 'nutrition', 'focus', 'life'].includes(area) ? area : 'life' }
function reactionForArea(area) { if (area === 'gym') return 'power'; if (area === 'nutrition') return 'happy'; return 'celebrate' }
function activeTitle(activeView) { return { pets: 'Companions', care: 'Pet Care', gym: 'Gym', nutrition: 'Nutrition', goals: 'Goals', progress: 'Progress' }[activeView] ?? 'Dashboard' }
function renderActiveView(activeView, sharedProps) { return { pets: <PetsView {...sharedProps} />, care: <CareView {...sharedProps} />, gym: <GymView {...sharedProps} />, nutrition: <NutritionView {...sharedProps} />, goals: <GoalsView {...sharedProps} />, progress: <ProgressView {...sharedProps} /> }[activeView] ?? <DashboardView {...sharedProps} /> }

export default App
