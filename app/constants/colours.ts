export const getCategoryColours = (projectName: string) => projectName.toLowerCase() == "art" ? ART_CATEGORY_COLORS : CLIMBING_CATEGORY_COLORS

const ART_CATEGORY_COLORS: Record<string, string> = {
  "design":               "#ef4444", 
  "rendering":            "#f97316", 
  "clothing & materials": "#f59e0b", 
  "colour theory":        "#84cc16", 
  "observation & recall": "#14b8a6", 
  "composition":          "#0ea5e9", 
  "form & construction":  "#6366f1", 
  "perspective":          "#a855f7", 
  "gesture":              "#ec4899", 
  "anatomy":              "#f97316", 
};

const CLIMBING_CATEGORY_COLORS: Record<string, string> = {
  "movement":       "#22c55e", 
  "strength":               "#0ea5e9", 
  "body tension":            "#a855f7", 
  "dynamics & power": "#ef4444", 
  "capacity":        "#f97316", 
  "execution":       "#f59e0b", 
};
