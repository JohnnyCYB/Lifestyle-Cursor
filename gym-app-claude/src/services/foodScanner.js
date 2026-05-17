const foodDatabase = [
  {
    keywords: ['chicken', 'bowl', 'rice', 'chipotle'],
    name: 'Chicken Power Bowl',
    calories: 540,
    protein: 46,
    carbs: 52,
    fat: 16,
    confidence: 0.92,
    tags: ['high-protein', 'balanced'],
  },
  {
    keywords: ['salmon', 'rice'],
    name: 'Salmon Rice Plate',
    calories: 610,
    protein: 42,
    carbs: 58,
    fat: 24,
    confidence: 0.89,
    tags: ['high-protein', 'healthy-fat'],
  },
  {
    keywords: ['yogurt', 'greek'],
    name: 'Greek Yogurt Bowl',
    calories: 310,
    protein: 28,
    carbs: 34,
    fat: 7,
    confidence: 0.9,
    tags: ['high-protein', 'light-meal'],
  },
  {
    keywords: ['shake', 'protein', 'whey'],
    name: 'Protein Shake',
    calories: 260,
    protein: 34,
    carbs: 18,
    fat: 6,
    confidence: 0.86,
    tags: ['high-protein', 'quick'],
  },
  {
    keywords: ['omelet', 'omelette', 'veggie', 'egg'],
    name: 'Veggie Omelet',
    calories: 380,
    protein: 29,
    carbs: 12,
    fat: 24,
    confidence: 0.84,
    tags: ['protein', 'low-carb'],
  },
  {
    keywords: ['steak', 'sirloin', 'beef'],
    name: 'Steak Plate',
    calories: 650,
    protein: 54,
    carbs: 36,
    fat: 30,
    confidence: 0.82,
    tags: ['high-protein', 'strength'],
  },
  {
    keywords: ['turkey', 'sandwich', 'sub'],
    name: 'Turkey Sandwich',
    calories: 470,
    protein: 34,
    carbs: 52,
    fat: 14,
    confidence: 0.82,
    tags: ['balanced', 'easy'],
  },
  {
    keywords: ['tuna', 'wrap'],
    name: 'Tuna Wrap',
    calories: 430,
    protein: 36,
    carbs: 38,
    fat: 14,
    confidence: 0.82,
    tags: ['high-protein', 'lean'],
  },
  {
    keywords: ['oats', 'oatmeal'],
    name: 'Protein Oatmeal',
    calories: 420,
    protein: 26,
    carbs: 58,
    fat: 10,
    confidence: 0.8,
    tags: ['pre-workout', 'energy'],
  },
  {
    keywords: ['banana', 'peanut', 'butter'],
    name: 'Banana Peanut Butter Snack',
    calories: 330,
    protein: 10,
    carbs: 42,
    fat: 15,
    confidence: 0.78,
    tags: ['snack', 'energy'],
  },
  {
    keywords: ['salad', 'chicken'],
    name: 'Chicken Salad',
    calories: 390,
    protein: 38,
    carbs: 18,
    fat: 19,
    confidence: 0.84,
    tags: ['lean', 'high-protein'],
  },
  {
    keywords: ['burger'],
    name: 'Burger Meal',
    calories: 760,
    protein: 34,
    carbs: 62,
    fat: 42,
    confidence: 0.76,
    tags: ['heavy', 'treat'],
  },
  {
    keywords: ['pizza'],
    name: 'Pizza Slices',
    calories: 720,
    protein: 30,
    carbs: 78,
    fat: 32,
    confidence: 0.76,
    tags: ['treat', 'high-carb'],
  },
]

const fallbackFood = {
  name: 'Balanced Meal',
  calories: 450,
  protein: 30,
  carbs: 42,
  fat: 15,
  confidence: 0.62,
  tags: ['estimated'],
}

const macroHints = [
  { pattern: /(\d+)\s*(g|grams?)\s*(protein|prot)/i, key: 'protein' },
  { pattern: /(protein|prot)\s*(\d+)\s*(g|grams?)/i, key: 'protein', valueIndex: 2 },
  { pattern: /(\d+)\s*(g|grams?)\s*(carb|carbs|carbohydrates?)/i, key: 'carbs' },
  { pattern: /(carb|carbs|carbohydrates?)\s*(\d+)\s*(g|grams?)/i, key: 'carbs', valueIndex: 2 },
  { pattern: /(\d+)\s*(g|grams?)\s*(fat|fats)/i, key: 'fat' },
  { pattern: /(fat|fats)\s*(\d+)\s*(g|grams?)/i, key: 'fat', valueIndex: 2 },
  { pattern: /(\d+)\s*(cal|cals|calories|kcal)/i, key: 'calories' },
  { pattern: /(cal|cals|calories|kcal)\s*(\d+)/i, key: 'calories', valueIndex: 2 },
]

export async function scanFood(input) {
  const query = String(input ?? '').trim().toLowerCase()

  await new Promise((resolve) => {
    window.setTimeout(resolve, 450)
  })

  if (!query) {
    return {
      ...fallbackFood,
      score: nutritionScore(fallbackFood),
      xpPreview: xpFromFood(fallbackFood),
      notes: 'Add a food name, barcode, or provider result to improve detection.',
    }
  }

  const match = findBestFood(query)
  const base = match ?? estimateFoodFromQuery(query)
  const hinted = applyMacroHints(base, query)

  return {
    ...hinted,
    score: nutritionScore(hinted),
    xpPreview: xpFromFood(hinted),
    source: match ? 'local-food-library' : 'estimated-profile',
    notes: match
      ? buildFoodNote(hinted)
      : 'Estimated from your text. Add calories or macros like “600 calories 45g protein” for better results.',
  }
}

function findBestFood(query) {
  let best = null
  let bestScore = 0

  for (const food of foodDatabase) {
    const score = food.keywords.reduce((total, keyword) => total + (query.includes(keyword) ? keyword.length : 0), 0)
    if (score > bestScore) {
      best = food
      bestScore = score
    }
  }

  return best
}

function estimateFoodFromQuery(query) {
  const proteinBoost = includesAny(query, ['chicken', 'turkey', 'steak', 'beef', 'fish', 'tuna', 'salmon', 'shrimp', 'eggs', 'egg', 'protein'])
  const carbBoost = includesAny(query, ['rice', 'pasta', 'bread', 'oats', 'potato', 'fries', 'tortilla'])
  const fatBoost = includesAny(query, ['cheese', 'avocado', 'peanut', 'butter', 'oil', 'nuts'])
  const treatBoost = includesAny(query, ['pizza', 'burger', 'cookie', 'cake', 'ice cream', 'fries'])

  const result = {
    ...fallbackFood,
    name: titleCase(query),
    confidence: 0.58,
    protein: fallbackFood.protein + (proteinBoost ? 12 : 0),
    carbs: fallbackFood.carbs + (carbBoost ? 14 : 0),
    fat: fallbackFood.fat + (fatBoost ? 10 : 0) + (treatBoost ? 8 : 0),
    calories: fallbackFood.calories + (proteinBoost ? 80 : 0) + (carbBoost ? 90 : 0) + (fatBoost ? 90 : 0) + (treatBoost ? 140 : 0),
    tags: ['estimated', proteinBoost ? 'protein' : null, carbBoost ? 'carb-source' : null, treatBoost ? 'treat' : null].filter(Boolean),
  }

  return normalizeFood(result)
}

function applyMacroHints(food, query) {
  const result = { ...food }

  for (const hint of macroHints) {
    const match = query.match(hint.pattern)
    if (!match) continue
    const value = Number(match[hint.valueIndex ?? 1])
    if (Number.isFinite(value)) result[hint.key] = value
  }

  if (!query.match(/cal|kcal|calories/i)) {
    const macroCalories = result.protein * 4 + result.carbs * 4 + result.fat * 9
    if (Math.abs(macroCalories - result.calories) > 220) result.calories = Math.round((result.calories + macroCalories) / 2)
  }

  return normalizeFood(result)
}

function nutritionScore(food) {
  let score = 55
  if (food.protein >= 30) score += 20
  if (food.protein >= 45) score += 8
  if (food.calories <= 650) score += 8
  if (food.fat <= 25) score += 6
  if (food.tags?.includes('treat')) score -= 12
  if (food.tags?.includes('balanced')) score += 6
  return Math.max(0, Math.min(100, Math.round(score)))
}

function xpFromFood(food) {
  return Math.min(42, Math.max(12, Math.round(12 + food.protein * 0.45 + nutritionScore(food) * 0.12)))
}

function buildFoodNote(food) {
  if (food.protein >= 40) return 'High-protein meal. Great for muscle repair and companion energy.'
  if (food.tags?.includes('treat')) return 'Treat meal logged. Still counts — consistency beats perfection.'
  if (food.tags?.includes('pre-workout')) return 'Good energy source before training. Pair with protein later.'
  return 'Balanced meal estimate. Use exact macros later for tighter scoring.'
}

function normalizeFood(food) {
  return {
    ...food,
    calories: Math.max(0, Math.round(food.calories)),
    protein: Math.max(0, Math.round(food.protein)),
    carbs: Math.max(0, Math.round(food.carbs)),
    fat: Math.max(0, Math.round(food.fat)),
  }
}

function includesAny(query, values) {
  return values.some((value) => query.includes(value))
}

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
