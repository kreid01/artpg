export const levels = (projectName: ProjectName) => generateLevels(projectName, 100)
export type ProjectName = "Engineering" | "Scholar" | "Art" | "Climbing"

const rankDict: Record<number, string> = {
  0: "Iron IV",
  4: "Iron III",
  8: "Iron II",
  11: "Iron I",

  15: "Bronze IV",
  20: "Bronze III",
  25: "Bronze II",
  30: "Bronze I",

  35: "Silver IV",
  40: "Silver III",
  45: "Silver II",
  50: "Silver I",

  55: "Gold IV",
  59: "Gold III",
  63: "Gold II",
  67: "Gold I",

  70: "Platinum IV",
  73: "Platinum III",
  76: "Platinum II",
  78: "Platinum I",

  80: "Emerald IV",
  82: "Emerald III",
  84: "Emerald II",
  85: "Emerald I",

  86: "Diamond IV",
  87: "Diamond III",
  88: "Diamond II",
  89: "Diamond I",

  90: "Master",
  95: "Grandmaster",
  98: "Challenger",
};

export function getRankImage(level: number): string {
  if (level >= 98) return "/ranks/challenger.png";
  if (level >= 95) return "/ranks/grandmaster.png";
  if (level >= 90) return "/ranks/master.png";
  if (level >= 86) return "/ranks/diamond.png";
  if (level >= 80) return "/ranks/emerald.png";
  if (level >= 70) return "/ranks/platinum.png";
  if (level >= 55) return "/ranks/gold.png";
  if (level >= 35) return "/ranks/silver.png";
  if (level >= 15) return "/ranks/bronze.png";
  return "/ranks/iron.png";
}

const artRewardDict: Record<number, string> = {
    70: "Intermediate",
    80: "Portfolio Work",
    90: "Comissions",
    95: "Mentorship",
    100: "Job Ready"
}

const climbingRewardDict: Record<number, string> = {
  75: "V6",
  85: "V7",
  95: "V8",
  100: "V9",
}

const getRewardDict = (projectName: string) => {
  const name =  projectName.toLowerCase()
  if (name == "art") return artRewardDict
  if (name == "climbing") return climbingRewardDict;
  return {}
}

const TARGET_XP = {
  "art": 400_000,
  "scholar": 300_000,
  "engineer": 200_000,
  "climbing": 150_000,
}

export const getTargetXp = (projectName: ProjectName) => {
  const name = projectName?.toLowerCase() as keyof typeof TARGET_XP;
  return TARGET_XP[name] 
}

const generateLevels = (projectName: ProjectName, maxLevel = 100) => {
  const levels = [];

  const targetXp = getTargetXp(projectName)
  const rewardDict = getRewardDict(projectName) 

  const k = 0.04;
  const a = targetXp / (Math.exp(k * maxLevel) - 1);

  levels.push({ level: 1, xp: 0, reward: rewardDict[1] })

  for (let level = 2; level <= maxLevel; level++) {
    const xp = Math.round(a * (Math.exp(k * level) - 1));
    const reward = rewardDict[level] 
    const rank = rankDict[level]
    levels.push({ level, xp, reward, rank });
  }

  return levels;
};

export const getXpCaps = (projectName: ProjectName) => {
  const xpCapDict = {
    art: ART_CATEGORY_XP_CAPS,
    climbing: CLIMBING_CATEGORY_XP_CAPS,
    scholar: SCHOLAR_CATEGORY_XP_CAPS,
    engineer: ENGINEER_CATEGORY_XP_CAPS
  };

  const name = projectName.toLowerCase() as keyof typeof xpCapDict;

  return xpCapDict[name];
};

const ART_CATEGORY_XP_CAPS: Record<string, number> = {
  "form & construction":  50000,
  "value & light":        45000,
  "observation & recall": 45000,
  "composition":          40000,
  "design":               40000,
  "colour theory":        35000,
  "anatomy":              35000,
  "perspective":          30000,
  "rendering":            30000,
  "clothing & materials": 25000,
  "gesture":              25000,
};

const CLIMBING_CATEGORY_XP_CAPS: Record<string, number> = {
  "movement":  40000,
  "body tension":        25000,
  "strength":        20000,
  "dynamics & power": 20000,
  "execution":          30000,
  "capacity":               15000,
}

const SCHOLAR_CATEGORY_XP_CAPS: Record<string, number> = {
  "history":  50000,
  "mythology & folklore":        50000,
  "language": 40000,
  "nature & biology":        40000,
  "literature": 30000,
  "space":               30000,
  "philosophy":          20000,
  "psychology":          20000,
  "chess":               20000,
}

const ENGINEER_CATEGORY_XP_CAPS: Record<string, number> = {
  "backend":  40000,
  "systems":        40000,
  "software architecture & design": 30000,
  "databases":               30000,
  "frontend":        20000,
  "testing & quality":          20000,
  "performance & optimisation":          20000,
}