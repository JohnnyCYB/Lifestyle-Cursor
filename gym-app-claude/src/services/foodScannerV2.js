// Local nutrition database used by the upgraded NutritionScanner component.
// All values are estimates per PRIMARY serving unit listed.

const FOOD_DB = {
  egg: { cal: 70, pro: 6, carb: 0, fat: 5, serving: '1 egg', aliases: ['eggs', 'egg white'] },
  chicken: { cal: 185, pro: 35, carb: 0, fat: 4, serving: '100g', aliases: ['chicken breast', 'grilled chicken'] },
  steak: { cal: 250, pro: 26, carb: 0, fat: 17, serving: '100g', aliases: ['beef', 'ribeye', 'sirloin', 'flank steak'] },
  salmon: { cal: 208, pro: 20, carb: 0, fat: 13, serving: '100g', aliases: ['salmon fillet', 'grilled salmon'] },
  tuna: { cal: 100, pro: 22, carb: 0, fat: 1, serving: '100g', aliases: ['canned tuna', 'tuna fish'] },
  rice: { cal: 206, pro: 4, carb: 45, fat: 0, serving: '1 cup cooked', aliases: ['white rice', 'brown rice', 'cooked rice'] },
  oats: { cal: 150, pro: 5, carb: 27, fat: 3, serving: '0.5 cup dry', aliases: ['oatmeal', 'oat', 'rolled oats'] },
  bread: { cal: 79, pro: 3, carb: 15, fat: 1, serving: '1 slice', aliases: ['toast', 'slice of bread', 'white bread', 'sourdough'] },
  banana: { cal: 105, pro: 1, carb: 27, fat: 0, serving: '1 medium', aliases: ['bananas'] },
  greek_yogurt: { cal: 100, pro: 17, carb: 6, fat: 0, serving: '170g cup', aliases: ['greek yogurt', 'greek yoghurt', 'fage', 'chobani'] },
  protein_shake: { cal: 130, pro: 25, carb: 5, fat: 2, serving: '1 scoop', aliases: ['protein shake', 'whey shake', 'protein powder', 'whey'] },
  whey: { cal: 120, pro: 24, carb: 3, fat: 2, serving: '1 scoop', aliases: ['whey protein', 'protein powder'] },
  peanut_butter: { cal: 94, pro: 4, carb: 3, fat: 8, serving: '1 tbsp', aliases: ['peanut butter', 'pb', 'almond butter', 'nut butter'] },
  burger: { cal: 540, pro: 30, carb: 40, fat: 27, serving: '1 burger', aliases: ['hamburger', 'cheeseburger', 'beef burger'] },
  fries: { cal: 365, pro: 4, carb: 48, fat: 17, serving: 'medium order', aliases: ['french fries', 'chips', 'potato fries'] },
  pizza: { cal: 285, pro: 12, carb: 36, fat: 10, serving: '1 slice', aliases: ['pizza slice', 'pepperoni pizza'] },
  salad: { cal: 20, pro: 1, carb: 3, fat: 0, serving: '1 cup', aliases: ['green salad', 'side salad', 'mixed greens', 'lettuce'] },
  chicken_salad: { cal: 300, pro: 28, carb: 10, fat: 15, serving: '1 bowl', aliases: ['grilled chicken salad', 'caesar salad with chicken'] },
  potato: { cal: 161, pro: 4, carb: 37, fat: 0, serving: '1 medium', aliases: ['baked potato', 'sweet potato', 'yam'] },
  avocado: { cal: 160, pro: 2, carb: 9, fat: 15, serving: 'half avocado', aliases: ['avocado toast', 'avo'] },
  milk: { cal: 149, pro: 8, carb: 12, fat: 8, serving: '1 cup', aliases: ['whole milk', 'skim milk', '2% milk'] },
}

const OZ_TO_G = 28.3495
const UNIT_MULTIPLIERS = {
  g: (value) => value / 100,
  oz: (value) => (value * OZ_TO_G) / 100,
  lb: (value) => (value * 453.6) / 100,
  cup: (value) => value,
  cups: (value) => value,
  tbsp: (value) => value,
  tsp: (value) => value * 0.33,
  slice: (value) => value,
  slices: (value) => value,
  scoop: (value) => value,
  scoops: (value) => value,
  piece: (value) => value,
  pieces: (value) => value,
}

function extractExactMacros(text) {
  const value = text.toLowerCase()
  const calories = (value.match(/(\d+(?:\.\d+)?)\s*(?:cal(?:ories?)?|kcal)/) || [])[1]
  const protein = (value.match(/(\d+(?:\.\d+)?)\s*g?\s*pro(?:tein)?/) || [])[1]
  const carbs = (value.match(/(\d+(?:\.\d+)?)\s*g?\s*carb(?:s|ohydrates?)?/) || [])[1]
  const fat = (value.match(/(\d+(?:\.\d+)?)\s*g?\s*fat(?:s)?/) || [])[1]

  if (calories || (protein && carbs && fat)) {
    return {
      calories: calories ? Math.round(parseFloat(calories)) : null,
      protein: protein ? Math.round(parseFloat(protein)) : null,
      carbs: carbs ? Math.round(parseFloat(carbs)) : null,
      fat: fat ? Math.round(parseFloat(fat)) : null,
    }
  }

  return null
}

function matchFood(word) {
  for (const [key, entry] of Object.entries(FOOD_DB)) {
    const targets = [key.replace('_', ' '), ...entry.aliases]
    if (targets.some((target) => target.toLowerCase() === word.toLowerCase())) return { key, entry }
  }
  return null
}

function fuzzyMatchFood(phrase) {
  const lower = phrase.toLowerCase()
  for (const [key, entry] of Object.entries(FOOD_DB)) {
    const targets = [key.replace('_', ' '), ...entry.aliases]
    if (targets.some((target) => lower.includes(target.toLowerCase()))) return { key, entry }
  }
  return null
}

function parseQuantity(raw) {
  if (!raw) return { count: 1, unit: null }
  const numberMatch = raw.match(/(\d+(?:\.\d+)?(?:\/\d+)?)/)
  const unitMatch = raw.match(/\b(g|oz|lb|cup|cups|tbsp|tsp|slice|slices|scoop|scoops|piece|pieces)\b/i)
  let count = numberMatch ? parseFloat(numberMatch[1]) : 1

  if (numberMatch && numberMatch[1].includes('/')) {
    const [top, bottom] = numberMatch[1].split('/')
    count = parseFloat(top) / parseFloat(bottom)
  }

  return { count, unit: unitMatch ? unitMatch[1].toLowerCase() : null }
}

function computeMultiplier(entry, count, unit) {
  if (!unit) return count
  const converter = UNIT_MULTIPLIERS[unit]
  if (!converter) return count
  const isWeightBased = entry.serving.includes('g') || entry.serving.includes('oz')
  if (isWeightBased && ['g', 'oz', 'lb'].includes(unit)) return converter(count)
  return converter(count)
}

function tokenizeFoods(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .split(/\s*(?:and|with|\+|,)\s*/i)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseSingleToken(token) {
  const match = token.match(/^([\d./]+(?:\s*(?:g|oz|lb|cup|cups|tbsp|tsp|slice|slices|scoop|scoops|piece|pieces))?)\s+(.+)$/i)
  let quantityString = null
  let foodString = token

  if (match) {
    quantityString = match[1]
    foodString = match[2]
  }

  const { count, unit } = parseQuantity(quantityString)
  const found = matchFood(foodString) || fuzzyMatchFood(foodString)

  if (!found) return { name: token, multiplier: 1, entry: null, confidence: 'low' }

  return {
    name: token,
    multiplier: computeMultiplier(found.entry, count, unit),
    entry: found.entry,
    confidence: 'medium',
  }
}

export function parseNaturalLanguage(text) {
  if (!text.trim()) return null

  const exact = extractExactMacros(text)
  const hasExactMacros = exact && (exact.calories || (exact.protein !== null && exact.carbs !== null))
  const tokens = tokenizeFoods(text)
  const items = tokens.map(parseSingleToken)

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  let allFound = true

  for (const item of items) {
    if (!item.entry) {
      allFound = false
      totalCalories += 200
      totalProtein += 10
      totalCarbs += 25
      totalFat += 8
    } else {
      totalCalories += Math.round(item.entry.cal * item.multiplier)
      totalProtein += Math.round(item.entry.pro * item.multiplier)
      totalCarbs += Math.round(item.entry.carb * item.multiplier)
      totalFat += Math.round(item.entry.fat * item.multiplier)
    }
  }

  const confidence = hasExactMacros && exact.calories && exact.protein ? 'high' : allFound ? 'medium' : 'low'
  const mealName = tokens.map((token) => token.replace(/^\d+[\s./\w]*\s+/, '')).join(' + ')

  return {
    name: mealName || text,
    calories: exact?.calories ?? totalCalories,
    protein: exact?.protein ?? totalProtein,
    carbs: exact?.carbs ?? totalCarbs,
    fat: exact?.fat ?? totalFat,
    confidence,
    source: hasExactMacros ? 'exact' : 'estimated',
    score: confidence === 'high' ? 95 : confidence === 'medium' ? 78 : 52,
    xpPreview: Math.min(45, Math.max(12, Math.round(12 + (exact?.protein ?? totalProtein) * 0.45))),
    items,
  }
}

export function calcFromLabel({ calories, protein, carbs, fat, servings = 1, servingSize = '' }) {
  const multiplier = parseFloat(servings) || 1
  return {
    name: servingSize || 'Manual label entry',
    calories: Math.round((parseFloat(calories) || 0) * multiplier),
    protein: Math.round((parseFloat(protein) || 0) * multiplier),
    carbs: Math.round((parseFloat(carbs) || 0) * multiplier),
    fat: Math.round((parseFloat(fat) || 0) * multiplier),
    confidence: 'high',
    source: 'label',
    score: 95,
    xpPreview: Math.min(45, Math.max(12, Math.round(12 + (parseFloat(protein) || 0) * multiplier * 0.45))),
    items: [],
  }
}
