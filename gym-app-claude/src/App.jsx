import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Circle,
  Dumbbell,
  Flame,
  Flag,
  Heart,
  Home,
  Leaf,
  MoreHorizontal,
  PawPrint,
  Plus,
  RefreshCcw,
  Repeat2,
  Save,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Utensils,
  Wand2,
  X,
  Zap,
} from 'lucide-react'
import {
  achievementRules,
  clampMeter,
  clampPercent,
  companions,
  dailyQuests,
  defaultProfile,
  getGoalSize,
  getNextEvolution,
  getStageIndex,
  goalCategories,
  goalSizes,
  gymMovements,
  mergeProfile,
  recommendedWorkouts,
  skillTrees,
  starterGoalBacklog,
  unlockRewards,
} from './data/lifeRpg'
import GlobalPet from './components/GlobalPet'
import PetArt from './components/PetArt'
import PetsView from './components/PetsView'
import NutritionScanner from './components/NutritionScanner'
import './components/NutritionScanner.css'
import './components/CalendarRewards.css'
import './App.css'

const storageKey = 'life-rpg-profile-v1'
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
  const [petReaction, setPetReaction] = useState('idle')
  const [workoutForm, setWorkoutForm] = useState({ name: '', detail: '' })
  const [goalForm, setGoalForm] = useState({ title: '', category: 'gym', size: 'small' })
  const [winFilter, setWinFilter] = useState('all')
  const [nutritionFocus, setNutritionFocus] = useState(true)
  const [snackReady, setSnackReady] = useState(false)
  const [snackFed, setSnackFed] = useState(false)
  const [lastFoodEntry, setLastFoodEntry] = useState(null)
  const todayKey = useMemo(() => localDateKey(), [])
  const prefersReducedMotion = useReducedMotion()
  const lastStageRef = useRef(getStageIndex(profile.points))

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
    const duration = { victory: 2600, celebrate: 1800, power: 1500, happy: 1400, silly: 1600, curious: 1100 }[petReaction] ?? 1300
    const reactionTimer = window.setTimeout(() => setPetReaction('idle'), duration)
    return () => window.clearTimeout(reactionTimer)
  }, [petReaction])

  useEffect(() => {
    if (!profile.settings.animations) {
      lastStageRef.current = stageIndex
      return
    }
    if (stageIndex > lastStageRef.current) setPetReaction(stageIndex === 3 ? 'victory' : 'celebrate')
    lastStageRef.current = stageIndex
  }, [profile.settings.animations, stageIndex])

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
      return { ...updated, completedByDate: { ...updated.completedByDate, [todayKey]: [...todaysCompletions, quest.id] } }
    })
    triggerPetReaction(quest.reaction)
  }

  function selectPet(petId) {
    const nextPet = companions.find((candidate) => candidate.id === petId)
    setProfile((current) => ({ ...current, petType: petId, care: { ...current.care, bond: clampMeter(current.care.bond + 4) }, ledger: [makeLedgerEntry(`Bonded with ${nextPet?.name ?? 'companion'}`, 0, 'pet'), ...current.ledger].slice(0, 10) }))
    triggerPetReaction('celebrate')
  }

  function toggleSetting(setting) {
    setProfile((current) => ({ ...current, settings: { ...current.settings, [setting]: !current.settings[setting] } }))
  }

  function togglePetRoam() {
    setProfile((current) => ({ ...current, petMotionMode: current.petMotionMode === 'follow-roam' ? 'click-only' : 'follow-roam' }))
  }

  function movePetTo(position) {
    if (!petCanMove) return
    setProfile((current) => ({ ...current, petPosition: { x: clampPercent(position.x), y: clampPercent(position.y) } }))
  }

  function saveCustomWorkout(event) {
    event.preventDefault()
    const name = workoutForm.name.trim()
    const detail = workoutForm.detail.trim()
    if (!name) return
    const workout = { id: makeId('workout'), name, detail: detail || 'Custom workout', points: 50, createdAt: 'Now' }
    setProfile((current) => ({ ...current, customWorkouts: [workout, ...current.customWorkouts].slice(0, 8), ledger: [makeLedgerEntry(`Saved workout: ${workout.name}`, 0, 'gym'), ...current.ledger].slice(0, 10) }))
    setWorkoutForm({ name: '', detail: '' })
    triggerPetReaction('celebrate')
  }

  function saveGymTemplate(template) {
    setProfile((current) => {
      const templates = getGymTemplates(current).map((item) => (item.id === template.id ? { ...item, ...template } : item))
      return { ...current, gymTemplates: templates, ledger: [makeLedgerEntry(`Updated workout day: ${template.name}`, 0, 'gym'), ...current.ledger].slice(0, 10) }
    })
    triggerPetReaction('happy')
  }

  function logGymTemplate(template) {
    setProfile((current) => {
      const existingDates = Array.isArray(current.workoutLogDates) ? current.workoutLogDates : []
      const alreadyLoggedToday = existingDates.includes(todayKey)
      const workoutLogDates = alreadyLoggedToday ? existingDates : [...existingDates, todayKey].slice(-60)
      const nextSessionCount = (current.gymSessionCount ?? 0) + 1
      const updated = applyActivity(current, { label: template.name, points: template.points ?? 65, area: 'gym', reaction: 'power', care: { energy: -8, satiety: -4, bond: 7, spark: 8 } })
      return { ...updated, workoutLogDates, gymSessionCount: nextSessionCount, gymStreak: computeGymStreak(workoutLogDates) }
    })
    triggerPetReaction('power')
  }

  function addLifeGoal(event) {
    event.preventDefault()
    const title = goalForm.title.trim()
    if (!title) return
    const size = getGoalSize(goalForm.size)
    const goal = { id: makeId('goal'), title, category: goalForm.category, size: size.id, points: size.points, completed: false, createdAt: 'Now' }
    setProfile((current) => ({ ...current, lifeGoals: [goal, ...current.lifeGoals].slice(0, 18), ledger: [makeLedgerEntry(`Added ${size.name.toLowerCase()} goal: ${goal.title}`, 0, goal.category), ...current.ledger].slice(0, 10) }))
    setGoalForm({ title: '', category: goalForm.category, size: goalForm.size })
    triggerPetReaction('happy')
  }

  function completeGoal(goalId) {
    const goalToComplete = profile.lifeGoals.find((goal) => goal.id === goalId)
    const isBig = goalToComplete?.size === 'big'
    setProfile((current) => {
      const goal = current.lifeGoals.find((item) => item.id === goalId)
      if (!goal || goal.completed) return current
      const points = goal.points ?? getGoalSize(goal.size).points
      const updated = applyActivity(current, { label: `Completed goal: ${goal.title}`, points, area: goal.category, care: { bond: 10, spark: goal.size === 'big' ? 24 : 12, energy: 4 } })
      const completed = updated.lifeGoals.map((item) => (item.id === goalId ? { ...item, points, completed: true, completedAt: todayKey } : item))
      const withCompleted = { ...updated, lifeGoals: completed }
      return current.settings.autoRefillGoals ? refillGoalsToMinimum(withCompleted, 3) : withCompleted
    })
    triggerPetReaction(isBig ? 'victory' : 'celebrate')
  }

  function refillGoalsNow() {
    setProfile((current) => addEasyGoals(current, 3))
    triggerPetReaction('happy')
  }

  function deleteGoal(goalId) {
    setProfile((current) => ({ ...current, lifeGoals: current.lifeGoals.filter((goal) => goal.id !== goalId) }))
  }

  function handleFoodLog(entry) {
    const points = entry.xpPreview ?? Math.min(45, Math.max(12, Math.round(12 + Number(entry.protein ?? 0) * 0.45)))
    setLastFoodEntry(entry)
    setProfile((current) => applyActivity(current, { label: entry.name, points, area: 'nutrition', reaction: 'happy', care: { satiety: 14, energy: 5, bond: 4 } }))
    setSnackReady(true)
    setSnackFed(false)
    triggerPetReaction('happy')
  }

  function feedPetSnack(rewardId = null) {
    if (rewardId) {
      const reward = unlockRewards.find((item) => item.id === rewardId)
      if (!reward) return
      setProfile((current) => ({
        ...current,
        rewardInventory: current.rewardInventory.filter((id) => id !== rewardId),
        activeXpMultiplier: reward.multiplier,
        activeXpMultiplierLabel: reward.title,
        care: applyCare(current.care, { satiety: 10, bond: 6, spark: 8 }),
        ledger: [makeLedgerEntry(`Fed ${reward.title}. Next XP is ${reward.multiplier}x`, 0, 'nutrition'), ...current.ledger].slice(0, 10),
      }))
      setSnackFed(true)
      triggerPetReaction('victory')
      return
    }

    if (!snackReady || snackFed) return
    setSnackFed(true)
    setProfile((current) => ({ ...current, care: applyCare(current.care, { satiety: 6, bond: 3, spark: 2 }), ledger: [makeLedgerEntry('Fed companion a game fruit', 0, 'nutrition'), ...current.ledger].slice(0, 10) }))
    triggerPetReaction('happy')
  }

  function resetProfile() {
    setProfile(defaultProfile)
    setSnackReady(false)
    setSnackFed(false)
    setLastFoodEntry(null)
    setActiveView('dashboard')
    setPetReaction('idle')
  }

  const sharedProps = {
    profile, companion, stageIndex, stageName, evolution, completedToday, unlockedAchievements, weeklyTotal,
    petReaction, petCanMove, workoutForm, setWorkoutForm, goalForm, setGoalForm, winFilter, setWinFilter,
    nutritionFocus, setNutritionFocus, snackReady, snackFed, lastFoodEntry, todayKey,
    onActivity: addActivity, onCompleteQuest: completeQuest, onSelectPet: selectPet,
    onToggleSetting: toggleSetting, onTogglePetRoam: togglePetRoam, onMovePet: movePetTo,
    onResetProfile: resetProfile, onRecommendedWorkout: logGymTemplate, onSaveGymTemplate: saveGymTemplate,
    onSaveCustomWorkout: saveCustomWorkout, onLogCustomWorkout: (workout) => addActivity({ label: workout.name, points: workout.points, area: 'gym', reaction: 'power', care: { energy: -6, satiety: -3, bond: 5, spark: 6 } }),
    onAddLifeGoal: addLifeGoal, onCompleteGoal: completeGoal, onDeleteGoal: deleteGoal, onRefillGoals: refillGoalsNow,
    setActiveView, onFoodLog: handleFoodLog, onFeedSnack: feedPetSnack,
  }

  return (
    <div className={['app-shell', profile.settings.animations ? 'motion-ok' : 'motion-off', profile.settings.focusMode ? 'focus-mode' : ''].filter(Boolean).join(' ')}>
      <GlobalPet companion={companion} stageIndex={stageIndex} position={profile.petPosition} motionMode={profile.petMotionMode} petCanMove={petCanMove} reaction={petReaction} onMovePet={movePetTo} />
      <aside className="app-rail" aria-label="Primary navigation">
        <button className="brand-lockup" type="button" onClick={() => setActiveView('dashboard')}><span className="brand-mark"><PawPrint size={20} aria-hidden="true" /></span><span><strong>Life RPG</strong><small>Companion OS</small></span></button>
        <nav className="nav-list">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} className="nav-button" type="button" aria-current={activeView === item.id ? 'page' : undefined} onClick={() => setActiveView(item.id)}><Icon size={18} aria-hidden="true" /><span>{item.label}</span></button> })}</nav>
      </aside>
      <main className="app-main">
        <header className="topbar" data-no-pet-move="true"><div><span className="eyebrow">Welcome back, {profile.userName}</span><h1>{activeTitle(activeView)}</h1></div><div className="topbar-actions"><MetricPill icon={Flame} label={`${profile.streak} day streak`} /><MetricPill icon={Sparkles} label={`${profile.points} pts`} /><button className="icon-toggle" type="button" aria-pressed={profile.settings.animations} title="Toggle animations" onClick={() => toggleSetting('animations')}><Settings2 size={18} aria-hidden="true" /></button></div></header>
        {renderActiveView(activeView, sharedProps)}
      </main>
    </div>
  )
}

function DashboardView({ profile, companion, stageName, evolution, completedToday, unlockedAchievements, weeklyTotal, onActivity, onCompleteQuest, onTogglePetRoam, setActiveView }) {
  return <div className="view-stack"><section className="hero-panel hero-panel-global"><div className="hero-copy"><span className="status-chip">{companion.mood} bond</span><h2>{companion.name} · {stageName} {companion.species}</h2><p>{companion.trait}</p><ProgressBar value={evolution.progress} label={evolution.label} /><div className="quick-grid" aria-label="Quick actions">{quickActions.map((action) => { const Icon = action.icon; return <button key={action.label} className="action-button" type="button" onClick={() => onActivity(action)}><Icon size={18} aria-hidden="true" /><span>{action.label}</span><strong>+{action.points}</strong></button> })}</div></div><section className="pet-command-panel" data-no-pet-move="true"><span className="eyebrow">Screen pet active</span><h2>Tap empty space — {companion.name} follows you everywhere.</h2><p>Free roam wanders across every tab. Buttons, nav, and forms stay clickable — your pet never blocks the grind.</p><div className="playfield-actions static"><button className="secondary-button" type="button" onClick={() => setActiveView('pets')}><PawPrint size={18} />Change companion</button><button className="secondary-button" type="button" aria-pressed={profile.petMotionMode === 'follow-roam'} onClick={onTogglePetRoam}><Sparkles size={18} />{profile.petMotionMode === 'follow-roam' ? 'Free roam on' : 'Tap follow only'}</button></div></section></section><section className="dashboard-grid"><StatTile label="Weekly XP" value={weeklyTotal} icon={Activity} /><StatTile label="Bond" value={`${profile.care.bond}%`} icon={Heart} /><StatTile label="Unlocked" value={unlockedAchievements.length} icon={BadgeCheck} /></section><section className="content-grid"><QuestBoard completedToday={completedToday} onCompleteQuest={onCompleteQuest} /><WeeklyChart weeklyPoints={profile.weeklyPoints} /></section></div>
}

function CareView({ profile, companion, stageIndex, onActivity, onTogglePetRoam }) {
  return <div className="care-layout"><section className="care-stage"><PetAvatar companion={companion} stageIndex={stageIndex} size="large" /><div><span className="status-chip">{companion.mood} mood</span><h2>Care room</h2><p>{companion.name} responds to meals, training, play, rest, and screen movement.</p><button className="secondary-button" type="button" onClick={onTogglePetRoam}><Sparkles size={18} />Toggle free roam</button></div></section><section className="care-meters"><Meter label="Satiety" value={profile.care.satiety} /><Meter label="Energy" value={profile.care.energy} /><Meter label="Bond" value={profile.care.bond} /><Meter label="Spark" value={profile.care.spark} /></section><section className="care-actions">{careActions.map((action) => { const Icon = action.icon; return <button className="care-button" key={action.label} type="button" onClick={() => onActivity(action)}><Icon size={20} /><span>{action.label}</span><strong>+{action.points}</strong></button> })}</section></div>
}

function GymView({ profile, workoutForm, setWorkoutForm, onRecommendedWorkout, onSaveGymTemplate, onSaveCustomWorkout, onLogCustomWorkout, onActivity }) {
  const templates = getGymTemplates(profile)
  const workoutDates = Array.isArray(profile.workoutLogDates) ? profile.workoutLogDates : []
  const gymStreak = computeGymStreak(workoutDates)
  const sessionCount = profile.gymSessionCount ?? 0
  const todayTemplate = templates[sessionCount % templates.length] ?? templates[0]
  return <div className="view-stack"><section className={gymStreak >= 3 ? 'gym-command-center on-fire' : 'gym-command-center'}><div><span className="eyebrow">Training calendar</span><h2>{gymStreak >= 3 ? 'You are on fire.' : 'Build the streak.'}</h2><p>Next up: <strong>{todayTemplate?.name}</strong>. Log workouts on real days and the streak catches fire after 3 in a row.</p>{profile.activeXpMultiplier && <p className="bonus-live">{profile.activeXpMultiplierLabel} ready: next XP is {profile.activeXpMultiplier}x</p>}</div><div className="gym-streak-card"><Flame size={28} /><strong>{gymStreak}</strong><span>day gym streak</span></div><MiniWorkoutCalendar workoutDates={workoutDates} /></section><RealWorkoutCalendar workoutDates={workoutDates} /><section className="section-heading"><span className="eyebrow">Editable workout days</span><h2>Turn these into your normal weekly split</h2></section><section className="recommendation-grid">{templates.map((workout) => <EditableWorkoutCard key={workout.id} workout={workout} onLog={() => onRecommendedWorkout(workout)} onSave={onSaveGymTemplate} />)}</section><section className="gym-tools-grid"><form className="custom-card" onSubmit={onSaveCustomWorkout}><div className="section-heading"><span className="eyebrow">Your own workout</span><h2>Add a custom one</h2></div><label htmlFor="custom-workout-name">Workout name</label><input id="custom-workout-name" value={workoutForm.name} onChange={(event) => setWorkoutForm((current) => ({ ...current, name: event.target.value }))} placeholder="Example: Push day" /><label htmlFor="custom-workout-detail">Sets, reps, or note</label><input id="custom-workout-detail" value={workoutForm.detail} onChange={(event) => setWorkoutForm((current) => ({ ...current, detail: event.target.value }))} placeholder="Bench 4x6, row 4x10" /><button className="primary-button full-width" type="submit"><Save size={18} />Save workout</button></form><section className="custom-card"><div className="section-heading"><span className="eyebrow">Saved customs</span><h2>Replay list</h2></div><div className="mini-list">{profile.customWorkouts.length ? profile.customWorkouts.map((workout) => <article className="mini-row" key={workout.id}><div><h3>{workout.name}</h3><p>{workout.detail}</p></div><button className="secondary-button" type="button" onClick={() => onLogCustomWorkout(workout)}><Plus size={17} />+{workout.points}</button></article>) : <div className="empty-state small"><Wand2 size={28} /><h2>No custom workouts yet</h2><p>Add one and it will stay here.</p></div>}</div></section></section><section className="movement-grid">{gymMovements.map((movement) => <article className="movement-card" key={movement.id}><div className="movement-icon"><Dumbbell size={22} /></div><div><h3>{movement.name}</h3><p>{movement.target}</p><span>{movement.pattern} - {movement.prescription}</span></div><button className="secondary-button" type="button" onClick={() => onActivity({ label: movement.name, points: movement.points, area: 'gym', reaction: 'power', care: { energy: -4, satiety: -2, bond: 3, spark: 2 } })}><Plus size={17} />Log set</button></article>)}</section></div>
}

function EditableWorkoutCard({ workout, onLog, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: workout.name, focus: workout.focus, details: workout.details, days: workout.days ?? '' })
  useEffect(() => setDraft({ name: workout.name, focus: workout.focus, details: workout.details, days: workout.days ?? '' }), [workout])
  function save() { onSave({ ...workout, ...draft }); setEditing(false) }
  return <article className="recommendation-card workout-template-card"><div className="workout-card-menu"><button className="icon-toggle" type="button" title="Edit workout" onClick={() => setEditing(!editing)}>{editing ? <X size={17} /> : <MoreHorizontal size={17} />}</button></div><div className="movement-icon"><Dumbbell size={22} /></div>{editing ? <div className="workout-edit-form"><input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Workout name" /><input value={draft.focus} onChange={(event) => setDraft((current) => ({ ...current, focus: event.target.value }))} placeholder="Focus" /><input value={draft.days} onChange={(event) => setDraft((current) => ({ ...current, days: event.target.value }))} placeholder="Days: Mon / Thu" /><input value={draft.details} onChange={(event) => setDraft((current) => ({ ...current, details: event.target.value }))} placeholder="Exercises" /><button className="primary-button full-width" type="button" onClick={save}><Save size={17} />Save day</button></div> : <><div><h3>{workout.name}</h3><p>{workout.details}</p><span>{workout.focus}</span>{workout.days && <small className="workout-days">{workout.days}</small>}</div><button className="primary-button" type="button" onClick={onLog}><Plus size={17} />+{workout.points}</button></>}</article>
}

function MiniWorkoutCalendar({ workoutDates }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = localDateKey(date)
    return { key, label: dayLabels[date.getDay()], day: date.getDate(), done: workoutDates.includes(key) }
  })
  return <div className="mini-calendar"><CalendarDays size={19} />{days.map((day) => <span key={day.key} className={day.done ? 'calendar-day done' : 'calendar-day'}><small>{day.label}</small><strong>{day.day}</strong></span>)}</div>
}

function RealWorkoutCalendar({ workoutDates }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const blanks = Array.from({ length: firstDay.getDay() }, (_, index) => `blank-${index}`)
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, month, index + 1)
    const key = localDateKey(date)
    return { key, day: index + 1, today: key === localDateKey(now), done: workoutDates.includes(key) }
  })
  return <section className="real-calendar-card"><div className="section-heading"><span className="eyebrow">Local calendar</span><h2>{monthLabels[month]} {year}</h2></div><div className="real-calendar-grid">{dayLabels.map((label) => <span className="real-calendar-label" key={label}>{label}</span>)}{blanks.map((item) => <span className="real-calendar-empty" key={item} />)}{days.map((day) => <span className={['real-calendar-day', day.done ? 'done' : '', day.today ? 'today' : ''].filter(Boolean).join(' ')} key={day.key}>{day.day}{day.done && <small>🔥</small>}</span>)}</div></section>
}

function NutritionView({ companion, stageIndex, profile, nutritionFocus, setNutritionFocus, snackReady, snackFed, lastFoodEntry, onFoodLog, onFeedSnack }) {
  const rewardInventory = profile.rewardInventory ?? []
  return <div className={nutritionFocus ? 'nutrition-layout nutrition-focus-on' : 'nutrition-layout'}><section className="nutrition-habitat" data-no-pet-move="true"><div className="habitat-copy"><span className="eyebrow">Pet focus habitat</span><h2>{companion.name}'s nutrition enclosure</h2><p>Log a meal to drop a game fruit. Special milestone fruit applies bonus XP to your next activity.</p><button className="secondary-button" type="button" onClick={() => setNutritionFocus(!nutritionFocus)} aria-pressed={nutritionFocus}><PawPrint size={18} />{nutritionFocus ? 'Pet focus default' : 'Show pet focus'}</button>{profile.activeXpMultiplier && <span className="bonus-live">{profile.activeXpMultiplierLabel}: next XP {profile.activeXpMultiplier}x</span>}</div><div className="habitat-stage" onDragOver={(event) => event.preventDefault()} onDrop={() => onFeedSnack()}><div className="habitat-sky" /><div className="habitat-hills" /><div className="habitat-ground" /><div className={snackFed ? 'habitat-pet fed' : 'habitat-pet'}><PetAvatar companion={companion} stageIndex={stageIndex} size="medium" mood={snackFed ? 'happy' : snackReady ? 'curious' : 'idle'} /></div><div className="snack-basket" aria-live="polite"><span>Basket</span>{snackReady && !snackFed ? <button className="snack-apple" type="button" draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', 'game-fruit')} onClick={() => onFeedSnack()} title="Drag or tap to feed">🍎</button> : <small>{snackFed ? 'Fed!' : 'Log food first'}</small>}</div>{snackReady && !snackFed && <button className="primary-button feed-drop-button" type="button" onClick={() => onFeedSnack()}>Feed apple</button>}{snackFed && <div className="fed-burst">+ bond ✨</div>}</div></section><section className="scanner-panel"><div className="section-heading"><span className="eyebrow">Nutrition scanner</span><h2>Tell me what you ate</h2></div><NutritionScanner onLog={onFoodLog} /></section><section className="scan-result reward-inventory-panel"><div className="section-heading"><span className="eyebrow">Feed inventory</span><h2>Special fruit</h2></div>{lastFoodEntry && <p className="helper-copy">Last meal: {lastFoodEntry.name} · {lastFoodEntry.calories} cal · {lastFoodEntry.protein}g protein</p>}<div className="reward-inventory-list">{rewardInventory.length ? rewardInventory.map((rewardId) => { const reward = unlockRewards.find((item) => item.id === rewardId); if (!reward) return null; return <article className="reward-fruit-card unlocked" key={rewardId}><span className="reward-icon">{reward.icon}</span><div><h3>{reward.title}</h3><p>{reward.detail}</p></div><button className="primary-button" type="button" onClick={() => onFeedSnack(reward.id)}>Feed</button></article> }) : <div className="empty-state small"><Utensils size={28} /><h2>No special fruit yet</h2><p>Reach milestone XP levels to unlock bonus fruit.</p></div>}</div></section></div>
}

function GoalsView({ profile, goalForm, setGoalForm, onAddLifeGoal, onCompleteGoal, onDeleteGoal, onToggleSetting, onRefillGoals, winFilter, setWinFilter }) {
  const openGoals = profile.lifeGoals.filter((goal) => !goal.completed)
  const completedGoals = profile.lifeGoals.filter((goal) => goal.completed)
  const filteredWins = filterWins(completedGoals, winFilter)
  return <div className="goals-layout"><form className="goal-form" onSubmit={onAddLifeGoal}><div className="section-heading"><span className="eyebrow">Life goals</span><h2>Add a goal worth XP</h2></div><label htmlFor="goal-title">Goal title</label><input id="goal-title" value={goalForm.title} onChange={(event) => setGoalForm((current) => ({ ...current, title: event.target.value }))} placeholder="Example: Apply to two internships" /><label htmlFor="goal-category">Category</label><select id="goal-category" value={goalForm.category} onChange={(event) => setGoalForm((current) => ({ ...current, category: event.target.value }))}>{goalCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><label>Reward size</label><div className="goal-size-grid">{goalSizes.map((size) => <label className="goal-size-card" key={size.id}><input type="radio" name="goal-size" value={size.id} checked={goalForm.size === size.id} onChange={(event) => setGoalForm((current) => ({ ...current, size: event.target.value }))} /><strong>{size.label}</strong><span>{size.range}</span><small>{size.description}</small></label>)}</div><button className="primary-button full-width" type="submit"><Plus size={18} />Add goal</button></form><section className="goals-panel"><div className="section-heading"><span className="eyebrow">Active goals</span><h2>Always have something easy to do</h2></div><div className="goal-control-row"><button className="secondary-button" type="button" aria-pressed={profile.settings.autoRefillGoals} onClick={() => onToggleSetting('autoRefillGoals')}><Repeat2 size={17} />Auto refill {profile.settings.autoRefillGoals ? 'on' : 'off'}</button><button className="secondary-button" type="button" onClick={onRefillGoals}><Plus size={17} />Grab 3 easy goals</button></div><p className="helper-copy">Auto refill keeps at least 3 open goals. The grab button always adds a fresh set.</p><GoalList goals={openGoals} emptyTitle="No active goals" emptyText="You can keep it empty, or turn on auto refill to always get easy goals." onCompleteGoal={onCompleteGoal} onDeleteGoal={onDeleteGoal} /></section><section className="goals-panel completed-goals"><div className="section-heading"><span className="eyebrow">Completed</span><h2>Wins</h2></div><div className="filter-tabs"><button type="button" aria-pressed={winFilter === 'all'} onClick={() => setWinFilter('all')}>All</button>{goalSizes.map((size) => <button type="button" key={size.id} aria-pressed={winFilter === size.id} onClick={() => setWinFilter(size.id)}>{size.name}</button>)}</div><GoalList goals={filteredWins} emptyTitle="No wins in this tab" emptyText="Finish a goal and it will land here." onCompleteGoal={onCompleteGoal} onDeleteGoal={onDeleteGoal} /></section></div>
}

function GoalList({ goals, emptyTitle, emptyText, onCompleteGoal, onDeleteGoal }) {
  if (!goals.length) return <div className="empty-state small"><Flag size={28} /><h2>{emptyTitle}</h2><p>{emptyText}</p></div>
  return <div className="goal-list">{goals.map((goal) => { const category = goalCategories.find((item) => item.id === goal.category); const size = getGoalSize(goal.size); const points = goal.points ?? size.points; return <article className={goal.completed ? 'goal-row done' : 'goal-row'} key={goal.id}><div><span className="goal-chip" style={{ '--goal-color': category?.color ?? '#34d399' }}>{category?.name ?? 'Life'}</span><span className={`goal-reward reward-${size.id}`}>{size.name} +{points} XP</span><h3>{goal.title}</h3></div><div className="row-actions">{!goal.completed && <button className="primary-button" type="button" onClick={() => onCompleteGoal(goal.id)}><CheckCircle2 size={17} />+{points}</button>}<button className="icon-toggle danger" type="button" title="Delete goal" onClick={() => onDeleteGoal(goal.id)}><Trash2 size={17} /></button></div></article> })}</div>
}

function ProgressView({ profile, companion, stageIndex, stageName, evolution, unlockedAchievements, onToggleSetting, onTogglePetRoam, onResetProfile, setActiveView }) {
  const level = Math.max(1, Math.floor(profile.points / 250) + 1)
  const completedGoals = profile.lifeGoals.filter((goal) => goal.completed).length
  const gymStreak = computeGymStreak(Array.isArray(profile.workoutLogDates) ? profile.workoutLogDates : [])
  return <div className="progress-quest-layout"><section className="progress-hero"><div><span className="eyebrow">Hero progress</span><h2>Level {level} · {stageName}</h2><p>{companion.name} evolves when your real habits stack up. Hidden milestone fruit appears as you grow.</p><ProgressBar value={evolution.progress} label={evolution.label} color="#a855f7" /><div className="progress-actions"><button className="primary-button" type="button" onClick={() => setActiveView('gym')}><Dumbbell size={17} />Train today</button><button className="secondary-button" type="button" onClick={() => setActiveView('goals')}><Flag size={17} />Pick a win</button></div></div><PetAvatar companion={companion} stageIndex={stageIndex} size="large" /></section><section className="progress-stat-grid"><StatTile label="Current level" value={level} icon={Sparkles} /><StatTile label="Gym streak" value={gymStreak >= 3 ? `${gymStreak} 🔥` : gymStreak} icon={Flame} /><StatTile label="Wins banked" value={completedGoals} icon={Trophy} /><StatTile label="Badges" value={unlockedAchievements.length} icon={BadgeCheck} /></section><section className="quest-map"><div className="section-heading"><span className="eyebrow">Quest map</span><h2>What to chase next</h2></div>{skillTrees.map((tree) => { const xp = profile.skillXp[tree.id] ?? 0; const nextMilestone = tree.milestones.find((milestone) => xp < milestone) ?? tree.milestones.at(-1); const value = Math.min(100, Math.round((xp / nextMilestone) * 100)); return <article className="quest-map-row" key={tree.id} style={{ '--quest-color': tree.color }}><div className="quest-node"><Zap size={18} /></div><div><h3>{tree.name}</h3><p>{tree.perk}</p><ProgressBar value={value} label={`${xp} / ${nextMilestone} XP`} color={tree.color} /></div></article> })}</section><section className="achievement-panel progress-badges"><div className="section-heading"><span className="eyebrow">Hidden fruit unlocks</span><h2>Milestones</h2></div><div className="reward-unlock-grid">{unlockRewards.filter((reward) => profile.points >= reward.hiddenUntil || profile.unlockedRewardIds.includes(reward.id)).map((reward) => { const unlocked = profile.unlockedRewardIds.includes(reward.id) || profile.points >= reward.points; return <article className={unlocked ? 'reward-unlock-card unlocked' : 'reward-unlock-card'} key={reward.id}><span className="reward-icon">{unlocked ? reward.icon : '❔'}</span><div><h3>{unlocked ? reward.title : 'Mystery fruit'}</h3><p>{unlocked ? reward.detail : `Reach ${reward.points} points to reveal this reward.`}</p></div><ProgressBar value={Math.min(100, Math.round((profile.points / reward.points) * 100))} label={`${Math.min(profile.points, reward.points)} / ${reward.points} pts`} color="#a855f7" /></article> })}</div></section><section className="settings-panel"><div className="section-heading"><span className="eyebrow">Settings</span><h2>Comfort</h2></div><ToggleRow label="Pet animations" checked={profile.settings.animations} onClick={() => onToggleSetting('animations')} /><ToggleRow label="Free roam" checked={profile.petMotionMode === 'follow-roam'} onClick={onTogglePetRoam} /><ToggleRow label="Auto refill goals" checked={profile.settings.autoRefillGoals} onClick={() => onToggleSetting('autoRefillGoals')} /><ToggleRow label="Focus mode" checked={profile.settings.focusMode} onClick={() => onToggleSetting('focusMode')} /><button className="secondary-button" type="button" onClick={onResetProfile}><RefreshCcw size={17} />Reset demo</button></section></div>
}

function QuestBoard({ completedToday, onCompleteQuest }) { return <section className="quest-board"><div className="section-heading"><span className="eyebrow">Daily quests</span><h2>Today</h2></div><div className="quest-list">{dailyQuests.map((quest) => { const completed = completedToday.includes(quest.id); return <article className="quest-row" key={quest.id}><div><h3>{quest.title}</h3><p>{quest.label}</p></div><button className={completed ? 'complete-button done' : 'complete-button'} type="button" disabled={completed} onClick={() => onCompleteQuest(quest)}>{completed ? <CheckCircle2 size={18} /> : <Plus size={18} />}{completed ? 'Done' : `+${quest.points}`}</button></article> })}</div></section> }
function WeeklyChart({ weeklyPoints }) { const maxValue = Math.max(...weeklyPoints, 1); return <section className="weekly-panel"><div className="section-heading"><span className="eyebrow">Weekly summary</span><h2>XP rhythm</h2></div><div className="bar-chart" aria-label="Weekly point chart">{weeklyPoints.map((value, index) => <div className="bar-column" key={`${value}-${index}`}><span style={{ height: `${Math.max(12, (value / maxValue) * 100)}%` }} /><small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</small></div>)}</div></section> }
function PetAvatar({ companion, stageIndex, size, mood = 'idle' }) { return <div className={`pet-avatar pet-${companion.id} pet-stage-${stageIndex} pet-${size}`} style={{ '--pet-a': companion.palette[0], '--pet-b': companion.palette[1], '--pet-c': companion.palette[2], '--pet-d': companion.palette[3] }}><span className="pet-shadow" aria-hidden="true" /><PetArt id={companion.id} stageIndex={stageIndex} mood={mood} /></div> }
function StatTile({ label, value, icon: Icon }) { return <article className="stat-tile"><Icon size={19} /><span>{label}</span><strong>{value}</strong></article> }
function MetricPill({ icon: Icon, label }) { return <span className="metric-pill"><Icon size={16} />{label}</span> }
function Meter({ label, value }) { return <div className="meter"><div><span>{label}</span><strong>{value}%</strong></div><span className="meter-track"><span style={{ width: `${value}%` }} /></span></div> }
function ProgressBar({ value, label, color }) { return <div className="progress-block" style={{ '--progress-color': color }}><div><span>{label}</span><strong>{value}%</strong></div><span className="progress-track"><span style={{ width: `${value}%` }} /></span></div> }
function ToggleRow({ label, checked, onClick }) { return <button className="toggle-row" type="button" aria-pressed={checked} onClick={onClick}><span>{label}</span><span className="switch"><span /></span></button> }

function usePersistentProfile() {
  const [profile, setProfileState] = useState(() => {
    try { const saved = window.localStorage.getItem(storageKey); return saved ? normalizeProfile(mergeProfile(JSON.parse(saved))) : normalizeProfile(defaultProfile) } catch { return normalizeProfile(defaultProfile) }
  })
  const setProfile = useCallback((updater) => {
    setProfileState((current) => { const next = normalizeProfile(mergeProfile(typeof updater === 'function' ? updater(current) : updater)); window.localStorage.setItem(storageKey, JSON.stringify(next)); return next })
  }, [])
  return [profile, setProfile]
}
function normalizeProfile(profile) { return { ...profile, gymTemplates: Array.isArray(profile.gymTemplates) ? profile.gymTemplates : getDefaultGymTemplates(), workoutLogDates: Array.isArray(profile.workoutLogDates) ? profile.workoutLogDates : [], gymSessionCount: Number.isFinite(profile.gymSessionCount) ? profile.gymSessionCount : 0, gymStreak: Number.isFinite(profile.gymStreak) ? profile.gymStreak : 0, unlockedRewardIds: Array.isArray(profile.unlockedRewardIds) ? profile.unlockedRewardIds : [], rewardInventory: Array.isArray(profile.rewardInventory) ? profile.rewardInventory : [], activeXpMultiplier: profile.activeXpMultiplier ?? null, activeXpMultiplierLabel: profile.activeXpMultiplierLabel ?? null } }
function getDefaultGymTemplates() { return recommendedWorkouts.map((workout, index) => ({ ...workout, days: ['Mon / Thu', 'Tue / Fri', 'Wed / Sat', 'Any day'][index] ?? 'Any day' })) }
function getGymTemplates(profile) { return Array.isArray(profile.gymTemplates) && profile.gymTemplates.length ? profile.gymTemplates : getDefaultGymTemplates() }
function computeGymStreak(dates) { if (!Array.isArray(dates) || !dates.length) return 0; const unique = new Set(dates); let streak = 0; const cursor = new Date(); for (let i = 0; i < 30; i += 1) { const key = localDateKey(cursor); if (!unique.has(key)) break; streak += 1; cursor.setDate(cursor.getDate() - 1) } return streak }
function applyActivity(profile, activity) { const basePoints = activity.points ?? 0; const multiplier = profile.activeXpMultiplier ?? 1; const points = Math.round(basePoints * multiplier); const area = normalizeArea(activity.area); const weeklyPoints = [...profile.weeklyPoints]; weeklyPoints[weeklyPoints.length - 1] += points; const afterPoints = profile.points + points; let next = { ...profile, points: afterPoints, activeXpMultiplier: null, activeXpMultiplierLabel: null, care: applyCare(profile.care, activity.care), skillXp: { ...profile.skillXp, [area]: (profile.skillXp[area] ?? 0) + points }, weeklyPoints, ledger: [makeLedgerEntry(`${activity.label}${multiplier > 1 ? ` (${multiplier}x bonus)` : ''}`, points, area), ...profile.ledger].slice(0, 10) }; next = grantUnlockedRewards(next, profile.points, afterPoints); return next }
function grantUnlockedRewards(profile, previousPoints, nextPoints) { const unlockedRewardIds = new Set(profile.unlockedRewardIds ?? []); const inventory = [...(profile.rewardInventory ?? [])]; const ledgerEntries = []; unlockRewards.forEach((reward) => { if (previousPoints < reward.points && nextPoints >= reward.points && !unlockedRewardIds.has(reward.id)) { unlockedRewardIds.add(reward.id); inventory.push(reward.id); ledgerEntries.push(makeLedgerEntry(`Unlocked ${reward.title}`, 0, 'nutrition')) } }); return ledgerEntries.length ? { ...profile, unlockedRewardIds: [...unlockedRewardIds], rewardInventory: inventory, ledger: [...ledgerEntries, ...profile.ledger].slice(0, 10) } : { ...profile, unlockedRewardIds: [...unlockedRewardIds], rewardInventory: inventory } }
function applyCare(care, delta = {}) { return { satiety: clampMeter(care.satiety + (delta.satiety ?? 0)), energy: clampMeter(care.energy + (delta.energy ?? 0)), bond: clampMeter(care.bond + (delta.bond ?? 0)), spark: clampMeter(care.spark + (delta.spark ?? 0)) } }
function makeLedgerEntry(label, points, area) { return { id: makeId('ledger'), label, points, area, time: 'Now' } }
function makeId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}` }
function normalizeArea(area) { return ['gym', 'nutrition', 'focus', 'life', 'pet'].includes(area) ? area : 'life' }
function reactionForArea(area) { if (area === 'gym') return 'power'; if (area === 'nutrition') return 'happy'; return 'celebrate' }
function activeTitle(activeView) { return { pets: 'Companions', care: 'Pet Care', gym: 'Gym', nutrition: 'Nutrition', goals: 'Goals', progress: 'Progress' }[activeView] ?? 'Dashboard' }
function filterWins(goals, filter) { if (filter === 'all') return goals; return goals.filter((goal) => goal.size === filter) }
function getNextGoalTemplates(profile, count) { let cursor = profile.goalBacklogCursor ?? 0; const additions = []; for (let index = 0; index < count; index += 1) { const template = starterGoalBacklog[cursor % starterGoalBacklog.length]; additions.push({ ...template, id: makeId('auto-goal'), completed: false, createdAt: 'Auto refill' }); cursor += 1 } return { additions, cursor } }
function addEasyGoals(profile, count = 3) { const { additions, cursor } = getNextGoalTemplates(profile, count); return { ...profile, goalBacklogCursor: cursor, lifeGoals: [...additions, ...profile.lifeGoals].slice(0, 18), ledger: [makeLedgerEntry(`Added ${additions.length} easy goal${additions.length > 1 ? 's' : ''}`, 0, 'life'), ...profile.ledger].slice(0, 10) } }
function refillGoalsToMinimum(profile, targetCount = 3) { const openCount = profile.lifeGoals.filter((goal) => !goal.completed).length; if (openCount >= targetCount) return profile; return addEasyGoals(profile, targetCount - openCount) }
function localDateKey(date = new Date()) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${year}-${month}-${day}` }
function renderActiveView(activeView, sharedProps) { return { pets: <PetsView profile={sharedProps.profile} companion={sharedProps.companion} stageIndex={sharedProps.stageIndex} stageName={sharedProps.stageName} onSelectPet={sharedProps.onSelectPet} />, care: <CareView {...sharedProps} />, gym: <GymView {...sharedProps} />, nutrition: <NutritionView {...sharedProps} />, goals: <GoalsView {...sharedProps} />, progress: <ProgressView {...sharedProps} /> }[activeView] ?? <DashboardView {...sharedProps} /> }

export default App