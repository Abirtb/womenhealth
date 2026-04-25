/**
 * Curated stock imagery (Unsplash) — calm maternity + whole foods.
 * Replace with your own CDN or licensed art for production.
 */
const q = (src, w = 900) => `${src}&auto=format&fit=crop&w=${w}&q=82`

export const imagery = {
  heroMain: q('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3', 1100),
  heroFood: q('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3', 900),
  heroFruit: q('https://images.unsplash.com/photo-1619566636858-adfe3ffc16fe?ixlib=rb-4.0.3', 800),
  market: q('https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3', 1100),
  breakfast: q('https://images.unsplash.com/photo-1494390248081-4e521a5940eb?ixlib=rb-4.0.3', 800),
  hydration: q('https://images.unsplash.com/photo-1548839140-29a749e1cf4d?ixlib=rb-4.0.3', 800),
  greens: q('https://images.unsplash.com/photo-1540420773420-3360872ea499?ixlib=rb-4.0.3', 800),
  protein: q('https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3', 800),
  grains: q('https://images.unsplash.com/photo-1509440159596-0249088770ff?ixlib=rb-4.0.3', 800),
  dairy: q('https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3', 800),
  calmHands: q('https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3', 900),
  nurserySoft: q('https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3', 1000),
}

const articleCovers = {
  'first-trimester-nutrition': imagery.greens,
  'foods-to-avoid': imagery.heroFood,
  'hydration-tips': imagery.hydration,
  'weekly-iron-vitamin-c': imagery.protein,
}

export function articleCoverUrl(slug) {
  return articleCovers[slug] || imagery.heroFruit
}

const categoryFallback = {
  fruit: imagery.heroFruit,
  vegetable: imagery.greens,
  protein: imagery.protein,
  dairy: imagery.dairy,
  grain: imagery.grains,
  snack: imagery.breakfast,
  other: imagery.heroFood,
}

export function foodImageForCategory(category) {
  const key = (category || 'other').toLowerCase()
  return categoryFallback[key] || categoryFallback.other
}
