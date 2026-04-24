export const CATEGORY_COLORS: Record<string, string> = {
  "design":               "#ef4444", 
  "rendering":            "#f97316", 
  "clothing & materials": "#f59e0b", 
  "colour theory":        "#84cc16", 
  "visual library":       "#22c55e", 
  "observation":          "#14b8a6", 
  "composition":          "#0ea5e9", 
  "form & construction":  "#6366f1", 
  "perspective":          "#a855f7", 
  "gesture":              "#ec4899", 
  "anatomy":              "#f97316", 
};

export const levels = () => generateLevels(100)

const generateLevels = (maxLevel = 100) => {
  const levels = [];
  let xp = 0;

  for (let level = 1; level <= maxLevel; level++) {
    const increment = Math.floor( 200 + (level * 90) + Math.pow(level, 1.5) * 18);

    xp += level === 1 ? 0 : increment;
    levels.push({ level, xp });
  }

  return levels;
};
