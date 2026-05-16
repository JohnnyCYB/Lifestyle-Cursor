const foodDatabase = [
  {
    keywords: ['chicken', 'bowl'],
    name: 'Chicken Power Bowl',
    calories: 540,
    protein: 46,
    carbs: 52,
    fat: 16,
    confidence: 0.92,
  },
  {
    keywords: ['salmon', 'rice'],
    name: 'Salmon Rice Plate',
    calories: 610,
    protein: 42,
    carbs: 58,
    fat: 24,
    confidence: 0.89,
  },
  {
    keywords: ['yogurt', 'greek'],
    name: 'Greek Yogurt Bowl',
    calories: 310,
    protein: 28,
    carbs: 34,
    fat: 7,
    confidence: 0.9,
  },
  {
    keywords: ['shake', 'protein'],
    name: 'Protein Shake',
    calories: 260,
    protein: 34,
    carbs: 18,
    fat: 6,
    confidence: 0.86,
  },
  {
    keywords: ['omelet', 'veggie', 'egg'],
    name: 'Veggie Omelet',
    calories: 380,
    protein: 29,
    carbs: 12,
    fat: 24,
    confidence: 0.84,
  },
]

const fallbackFood = {
  name: 'Balanced Meal',
  calories: 450,
  protein: 30,
  carbs: 42,
  fat: 15,
  confidence: 0.62,
}

export async function scanFood(input) {
  const query = String(input ?? '').trim().toLowerCase()

  await new Promise((resolve) => {
    window.setTimeout(resolve, 450)
  })

  if (!query) {
    return {
      ...fallbackFood,
      notes: 'Add a food name, barcode, or provider result to improve detection.',
    }
  }

  const match = foodDatabase.find((food) =>
    food.keywords.some((keyword) => query.includes(keyword)),
  )

  const result = match ?? {
    ...fallbackFood,
    name: titleCase(query),
    confidence: 0.58,
  }

  return {
    ...result,
    source: match ? 'local-food-library' : 'estimated-profile',
    notes: 'Swap this service for a barcode, image recognition, or nutrition API when credentials are ready.',
  }
}

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
