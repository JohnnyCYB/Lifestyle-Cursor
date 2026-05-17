export const evolutionThresholds = [0, 500, 1500, 3500]

export const companions = [
  {
    id: 'dragon',
    name: 'Ember',
    species: 'Lava Dragon',
    archetype: 'Strength companion',
    personality: 'Aggressive grinder — rewards heavy lifts and PR attempts.',
    habit: 'Gym strength & progressive overload',
    trait: 'Grows from scrappy hatchling into a molten winged boss dragon.',
    mood: 'Fierce',
    palette: ['#ff7a45', '#ffd166', '#7b2d26', '#fef3c7'],
    stages: ['Hatchling', 'Drake', 'Molten Wyvern', 'Inferno Ancient'],
    stageShort: ['Hatchling', 'Drake', 'Wyvern', 'Ancient'],
  },
  {
    id: 'monkey',
    name: 'Mango',
    species: 'Monkey King',
    archetype: 'Gym companion',
    personality: 'Chaotic gym bro — loves volume days and never skips arm work.',
    habit: 'Consistency & high-energy training',
    trait: 'Starts as a cocky gym monkey and evolves into a legendary purple champion.',
    mood: 'Hyped',
    palette: ['#c084fc', '#f59e0b', '#3b2415', '#fef08a'],
    stages: ['Gym Monkey', 'Agile Climber', 'Power Ape', 'Monkey King'],
    stageShort: ['Gym Monkey', 'Climber', 'Power Ape', 'King'],
  },
  {
    id: 'wolf',
    name: 'Volt',
    species: 'Cyber Wolf',
    archetype: 'Speed companion',
    personality: 'Relentless runner — sprints, steps, and cardio streaks fuel its core.',
    habit: 'Cardio, steps & fast recovery',
    trait: 'Builds from neon pup into an armored alpha mech wolf with glowing blue armor.',
    mood: 'Locked in',
    palette: ['#60a5fa', '#22d3ee', '#172554', '#e0f2fe'],
    stages: ['Neon Pup', 'Runner', 'Armored Wolf', 'Alpha Mech Wolf'],
    stageShort: ['Neon Pup', 'Runner', 'Armored', 'Alpha Mech'],
  },
  {
    id: 'titan',
    name: 'Atlas',
    species: 'Stone Titan',
    archetype: 'Discipline companion',
    personality: 'Stoic tank — slow XP, huge payoff when you never miss the habit.',
    habit: 'Daily discipline & streak building',
    trait: 'Turns tiny stone grit into a huge crystal-backed titan built from consistency.',
    mood: 'Solid',
    palette: ['#a3e635', '#94a3b8', '#334155', '#f8fafc'],
    stages: ['Pebble Buddy', 'Training Golem', 'Guardian', 'Buff Titan'],
    stageShort: ['Pebble', 'Training', 'Guardian', 'Titan'],
  },
  {
    id: 'bull',
    name: 'Brutus',
    species: 'Molten Bull',
    archetype: 'Power companion',
    personality: 'Explosive lifter — rewards leg days, max effort sets, and showing up angry in a good way.',
    habit: 'Heavy lifts, confidence & intensity',
    trait: 'A molten bull line that evolves into an armored minotaur-style gym beast.',
    mood: 'Charged',
    palette: ['#fb923c', '#a855f7', '#1f1028', '#fed7aa'],
    stages: ['Spark Calf', 'Iron Bull', 'Armored Guardian', 'Molten Minotaur'],
    stageShort: ['Calf', 'Bull', 'Guardian', 'Minotaur'],
  },
  {
    id: 'raptor',
    name: 'Vex',
    species: 'Void Raptor',
    archetype: 'Special edition',
    personality: 'Locked predator — built for elite streaks, big goals, and no-excuse training weeks.',
    habit: 'Special unlock: 3,500 lifetime points',
    trait: 'A rare armored raptor line with purple crystal blades, claws, and boss-form energy.',
    mood: 'Elite',
    palette: ['#a855f7', '#f59e0b', '#1e1b4b', '#f5f3ff'],
    stages: ['Shardling', 'Blade Raptor', 'Apex Stalker', 'Void Apex'],
    stageShort: ['Shardling', 'Blade', 'Apex', 'Void Apex'],
    unlockAt: 3500,
    special: true,
  },
  {
    id: 'panda',
    name: 'Kuma',
    species: 'Spirit Panda',
    archetype: 'Recovery companion',
    personality: 'Calm savage — rewards sleep, mobility, food discipline, and bounce-back days.',
    habit: 'Recovery, mobility & nutrition rebound',
    trait: 'A martial panda line that evolves from cub fighter into a purple-aura grandmaster.',
    mood: 'Focused',
    palette: ['#a855f7', '#f8fafc', '#18181b', '#ddd6fe'],
    stages: ['Cub Fighter', 'Robe Warrior', 'Aura Striker', 'Grandmaster Panda'],
    stageShort: ['Cub', 'Warrior', 'Striker', 'Grandmaster'],
  },
]

export const dailyQuests = [
  { id: 'hydrate', title: 'Hydration Rune', area: 'nutrition', label: 'Drink 80 oz water', points: 20, reaction: 'happy', care: { energy: 4, satiety: 2, bond: 2 } },
  { id: 'lift', title: 'Iron Trial', area: 'gym', label: 'Log any 3 working sets', points: 45, reaction: 'power', care: { energy: -6, satiety: -3, bond: 6, spark: 4 } },
  { id: 'protein', title: 'Protein Offering', area: 'nutrition', label: 'Log a protein-rich meal', points: 30, reaction: 'happy', care: { satiety: 10, bond: 4 } },
  { id: 'focus', title: 'Focus Sigil', area: 'focus', label: 'Finish one deep-work block', points: 25, reaction: 'celebrate', care: { bond: 3, spark: 5 } },
]

export const starterGoalBacklog = [
  { title: 'Do a 15 min workout', category: 'gym', size: 'small', points: 50 },
  { title: 'Drink 64 oz water', category: 'nutrition', size: 'small', points: 50 },
  { title: 'Eat one protein-focused meal', category: 'nutrition', size: 'small', points: 50 },
  { title: 'Walk for 10 minutes', category: 'gym', size: 'small', points: 50 },
  { title: 'Stretch for 5 minutes', category: 'focus', size: 'small', points: 50 },
  { title: 'Prep gym clothes for tomorrow', category: 'life', size: 'small', points: 50 },
  { title: 'Log today’s food honestly', category: 'nutrition', size: 'small', points: 50 },
  { title: 'Sleep setup: no phone for 10 minutes', category: 'focus', size: 'small', points: 50 },
]

export const gymMovements = [
  { id: 'squat', name: 'Squat', pattern: 'Lower', target: 'Quads, glutes, trunk', prescription: '3 x 5-8', points: 18 },
  { id: 'deadlift', name: 'Deadlift', pattern: 'Hinge', target: 'Posterior chain', prescription: '3 x 3-6', points: 22 },
  { id: 'pushup', name: 'Push-up', pattern: 'Push', target: 'Chest, shoulders, triceps', prescription: '4 x 8-15', points: 14 },
  { id: 'row', name: 'Cable Row', pattern: 'Pull', target: 'Back and biceps', prescription: '3 x 8-12', points: 16 },
  { id: 'plank', name: 'Plank', pattern: 'Core', target: 'Anti-extension', prescription: '3 x 45 sec', points: 12 },
]

export const recommendedWorkouts = [
  { id: 'strength-starter', name: 'Strength Starter', focus: 'Full body', details: 'Squat 3x5, row 3x10, push-up 3xAMRAP', points: 65 },
  { id: 'upper-body', name: 'Upper Body', focus: 'Push and pull', details: 'Bench 4x6, cable row 4x10, shoulder press 3x8', points: 70 },
  { id: 'lower-body', name: 'Lower Body', focus: 'Legs and core', details: 'Deadlift 3x5, split squat 3x8, plank 3x45 sec', points: 75 },
  { id: 'core-conditioning', name: 'Core & Conditioning', focus: 'Engine', details: 'Bike 10 min, carries 4 rounds, dead bug 3x12', points: 55 },
]

export const foodShortcuts = ['1 egg', '2 eggs and toast', 'chicken bowl', 'protein shake 34g protein', 'steak rice 650 calories 54g protein']

export const goalCategories = [
  { id: 'gym', name: 'Gym', color: '#ff7a45' },
  { id: 'nutrition', name: 'Nutrition', color: '#34d399' },
  { id: 'focus', name: 'Focus', color: '#60a5fa' },
  { id: 'life', name: 'Life', color: '#c084fc' },
]

export const goalSizes = [
  { id: 'small', name: 'Small', label: 'Small win', range: '25-75 pts', points: 50, description: 'Quick task, under an hour, low friction.' },
  { id: 'medium', name: 'Medium', label: 'Medium mission', range: '100-250 pts', points: 150, description: 'Takes effort, planning, or a few sessions.' },
  { id: 'big', name: 'Big', label: 'Big achievement', range: '300-750 pts', points: 500, description: 'Major milestone, multi-day grind, or real-life unlock.' },
]

export const skillTrees = [
  { id: 'gym', name: 'Gym', perk: 'Unlock heavier quest bonuses', color: '#ff7a45', milestones: [120, 320, 640] },
  { id: 'nutrition', name: 'Nutrition', perk: 'Improve companion recovery', color: '#34d399', milestones: [100, 280, 580] },
  { id: 'focus', name: 'Focus', perk: 'Reduce missed-day penalties', color: '#60a5fa', milestones: [90, 240, 520] },
  { id: 'life', name: 'Life', perk: 'Turn personal goals into character growth', color: '#c084fc', milestones: [100, 300, 700] },
]

export const achievementRules = [
  { id: 'first-bond', title: 'First Bond', detail: 'Choose a companion', test: (profile) => Boolean(profile.petType) },
  { id: 'drake-shift', title: 'Second Form', detail: 'Reach 500 total points', test: (profile) => profile.points >= 500 },
  { id: 'armor-up', title: 'Armor Up', detail: 'Reach 1,500 total points', test: (profile) => profile.points >= 1500 },
  { id: 'final-form', title: 'Final Form', detail: 'Reach 3,500 total points', test: (profile) => profile.points >= 3500 },
  { id: 'special-edition', title: 'Special Edition', detail: 'Unlock Vex at 3,500 total points', test: (profile) => profile.points >= 3500 },
  { id: 'goal-crusher', title: 'Goal Crusher', detail: 'Complete a life goal', test: (profile) => profile.lifeGoals.some((goal) => goal.completed) },
  { id: 'big-win', title: 'Big Win', detail: 'Complete a big achievement goal', test: (profile) => profile.lifeGoals.some((goal) => goal.completed && goal.size === 'big') },
  { id: 'custom-grind', title: 'Custom Grind', detail: 'Save a custom workout', test: (profile) => profile.customWorkouts.length > 0 },
]

export const defaultProfile = {
  userName: 'Player',
  petType: 'dragon',
  points: 0,
  streak: 1,
  care: { satiety: 70, energy: 70, bond: 20, spark: 15 },
  settings: { animations: true, focusMode: false, autoRefillGoals: true },
  skillXp: { gym: 0, nutrition: 0, focus: 0, life: 0 },
  weeklyPoints: [0, 0, 0, 0, 0, 0, 0],
  completedByDate: {},
  customWorkouts: [],
  lifeGoals: [
    { id: 'seed-goal-1', title: 'Do a 15 min workout', category: 'gym', size: 'small', points: 50, completed: false, createdAt: 'Starter' },
    { id: 'seed-goal-2', title: 'Drink 64 oz water', category: 'nutrition', size: 'small', points: 50, completed: false, createdAt: 'Starter' },
    { id: 'seed-goal-3', title: 'Eat one protein-focused meal', category: 'nutrition', size: 'small', points: 50, completed: false, createdAt: 'Starter' },
  ],
  goalBacklogCursor: 3,
  petMotionMode: 'follow-roam',
  petPosition: { x: 68, y: 52 },
  ledger: [],
}

export function clampMeter(value) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function clampPercent(value) {
  return Math.max(8, Math.min(92, Math.round(value)))
}

export function getGoalSize(sizeId) {
  return goalSizes.find((size) => size.id === sizeId) ?? goalSizes[0]
}

export function getStageIndex(points) {
  if (points >= evolutionThresholds[3]) return 3
  if (points >= evolutionThresholds[2]) return 2
  if (points >= evolutionThresholds[1]) return 1
  return 0
}

export function getNextEvolution(points) {
  const stageIndex = getStageIndex(points)
  if (stageIndex === evolutionThresholds.length - 1) return { target: points, progress: 100, remaining: 0, label: 'Final form unlocked' }
  const target = evolutionThresholds[stageIndex + 1]
  const previous = evolutionThresholds[stageIndex]
  const progress = ((points - previous) / (target - previous)) * 100
  const remaining = Math.max(0, target - points)
  return { target, progress: clampMeter(progress), remaining, label: `${remaining} pts to evolve` }
}

export function mergeProfile(savedProfile) {
  const selectedPet = companions.find((pet) => pet.id === savedProfile?.petType && !pet.comingSoon)
  const nextPetType = selectedPet?.id ?? defaultProfile.petType
  return {
    ...defaultProfile,
    ...savedProfile,
    petType: nextPetType,
    care: { ...defaultProfile.care, ...(savedProfile?.care ?? {}) },
    settings: { ...defaultProfile.settings, ...(savedProfile?.settings ?? {}) },
    skillXp: { ...defaultProfile.skillXp, ...(savedProfile?.skillXp ?? {}) },
    completedByDate: savedProfile?.completedByDate ?? {},
    customWorkouts: Array.isArray(savedProfile?.customWorkouts) ? savedProfile.customWorkouts : defaultProfile.customWorkouts,
    lifeGoals: Array.isArray(savedProfile?.lifeGoals)
      ? savedProfile.lifeGoals.map((goal) => {
          const size = getGoalSize(goal.size)
          return { ...goal, size: goal.size ?? size.id, points: Number.isFinite(goal.points) ? goal.points : size.points }
        })
      : defaultProfile.lifeGoals,
    goalBacklogCursor: Number.isFinite(savedProfile?.goalBacklogCursor) ? savedProfile.goalBacklogCursor : defaultProfile.goalBacklogCursor,
    petMotionMode: savedProfile?.petMotionMode ?? defaultProfile.petMotionMode,
    petPosition: { x: clampPercent(savedProfile?.petPosition?.x ?? defaultProfile.petPosition.x), y: clampPercent(savedProfile?.petPosition?.y ?? defaultProfile.petPosition.y) },
    ledger: Array.isArray(savedProfile?.ledger) ? savedProfile.ledger : defaultProfile.ledger,
    weeklyPoints: Array.isArray(savedProfile?.weeklyPoints) ? savedProfile.weeklyPoints : defaultProfile.weeklyPoints,
  }
}