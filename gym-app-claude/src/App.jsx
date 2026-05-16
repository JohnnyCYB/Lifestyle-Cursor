import { useCallback, useEffect, useRef, useState } from 'react'
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
import PetArt from './components/PetArt'
import PetsView from './components/PetsView'
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
    if (stageIndex > lastStageRef.current) {
      setPetReaction(stageIndex === 3 ? 'victory' : 'celebrate')
    }
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
    if (!petCanMove || activeView === 'pets') return
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
    const goalToComplete = profile.lifeGoals.find((goal) => goal.id === goalId)
    const isBig = goalToComplete?.size === 'big'
    setProfile((current) => {
      const goal = current.lifeGoals.find((item) => item.id === goalId)
      if (!goal || goal.completed) return current
      const points = goal.points ?? getGoalSize(goal.size).points
      const updated = applyActivity(current, {
        label: `Completed goal: ${goal.title}`,
        points,
        area: goal.category,
        care: { bond: 10, spark: goal.size === 'big' ? 24 : 12, energy: 4 },
      })
      return {
        ...updated,
        lifeGoals: updated.lifeGoals.map((item) => (item.id === goalId ? { ...item, points, completed: true } : item)),
      }
    })
    triggerPetReaction(isBig ? 'victory' : 'celebrate')
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
      <GlobalPet companion={companion} stageIndex={stageIndex} position={profile.petPosition} motionMode={profile.petMotionMode} petCanMove={petCanMove && activeView !== 'pets'} reaction={petReaction} onMovePet={movePetTo} />
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
        <Topbar {...sharedProps} />
        {activeView === 'dashboard' && <DashboardView {...sharedProps} />}
        {activeView === 'pets' && <PetsView {...sharedProps} />}
        {activeView === 'care' && <CareView {...sharedProps} />}
        {activeView === 'gym' && <GymView {...sharedProps} />}
        {activeView === 'nutrition' && <NutritionView {...sharedProps} />}
        {activeView === 'goals' && <GoalsView {...sharedProps} />}
        {activeView === 'progress' && <ProgressView {...sharedProps} />}
      </main>
    </div>
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
      const next = typeof updater === 'function' ? updater(current) : updater
      const merged = mergeProfile(next)
      window.localStorage.setItem(storageKey, JSON.stringify(merged))
      return merged
    })
  }, [])

  return [profile, setProfile]
}

function applyActivity(profile, activity) {
  const points = activity.points ?? 0
  const area = activity.area ?? 'life'
  const care = activity.care ?? {}
  const weeklyPoints = [...profile.weeklyPoints]
  weeklyPoints[weeklyPoints.length - 1] = (weeklyPoints.at(-1) ?? 0) + points

  return {
    ...profile,
    points: profile.points + points,
    care: {
      satiety: clampMeter(profile.care.satiety + (care.satiety ?? -1)),
      energy: clampMeter(profile.care.energy + (care.energy ?? -1)),
      bond: clampMeter(profile.care.bond + (care.bond ?? 1)),
      spark: clampMeter(profile.care.spark + (care.spark ?? 1)),
    },
    skillXp: { ...profile.skillXp, [area]: (profile.skillXp[area] ?? 0) + points },
    ledger: [makeLedgerEntry(activity.label, points, area), ...profile.ledger].slice(0, 10),
    weeklyPoints,
  }
}

function reactionForArea(area) {
  if (area === 'gym') return 'power'
  if (area === 'nutrition') return 'happy'
  if (area === 'focus') return 'celebrate'
  return 'happy'
}

function makeLedgerEntry(label, points, area) {
  return { id: makeId('log'), label, points, area, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}
