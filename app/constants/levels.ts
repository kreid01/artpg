
export const levels = (projectName: ProjectName) => generateLevels(projectName, 100)

export type ProjectName = "Engineering" | "Scholar" | "Art" | "Climbing"

const artRewardDict: Record<number, string> = {
    70: "Illustration Series",
    75: "Portfolio Work",
    80: "Art Station",
    85: "Comissions",
    90: "Social Media",
    95: "Mentorship",
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
  "climbing": 150_000,
  "scholar": 200_000,
  "engineer": 200_000
}

const generateLevels = (projectName: ProjectName, maxLevel = 100) => {
  const levels = [];
  const name = projectName.toLowerCase() as keyof typeof TARGET_XP;
  const targetXp = TARGET_XP[name] 

  const rewardDict = getRewardDict(projectName) 

  const k = 0.04;
  const a = targetXp / (Math.exp(k * maxLevel) - 1);

  levels.push({ level: 1, xp: 0, reward: rewardDict[1] })

  for (let level = 2; level <= maxLevel; level++) {
    const xp = Math.round(a * (Math.exp(k * level) - 1));
    const reward = rewardDict[level] 
    levels.push({ level, xp, reward });
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
  "history":  60000,
  "mythology & folklore":        60000,
  "nature & biology":        30000,
  "philosophy": 25000,
  "chess":               25000,
  "psychology":          20000,
  "literature": 30000,
  "language": 50000
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