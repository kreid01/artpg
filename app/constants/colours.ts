import type { ProjectName } from "./levels";

export const getCategoryColours = (projectName: ProjectName) => {
  const name = projectName.toLowerCase() as keyof typeof COLOURS_DICT
  return COLOURS_DICT[name] ?? "gray";
}

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

const SCHOLAR_CATEGORY_COLORS: Record<string, string> = {
  "history":       "#0ea5e9", 
  "lanugage": "#6366f1",
  "nature & biology":               "#22c55e", 
  "mythology & folklore":            "#a855f7", 
  "philosophy": "#ef4444", 
  "psychology":        "#f97316", 
  "chess":       "#f59e0b", 
  "literature": "#ec4899",
};

const ENGINEER_CATEGORY_COLORS: Record<string, string> = {
  "backend":       "#0ea5e9", 
  "frontend":               "#22c55e", 
  "software architecture & design":            "#a855f7", 
  "databases": "#ef4444", 
  "systems":        "#f97316", 
  "testing & quality":       "#f59e0b", 
  "performance & optimisation":              "#ec4899", 
};

const COLOURS_DICT = {
  "art": ART_CATEGORY_COLORS,
  "climbing": CLIMBING_CATEGORY_COLORS,
  "scholar": SCHOLAR_CATEGORY_COLORS,
  "engineer": ENGINEER_CATEGORY_COLORS
}
