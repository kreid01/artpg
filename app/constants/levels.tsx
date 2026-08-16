import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export type ProjectName = "Engineering" | "Scholar" | "Art" | "Climbing"

export const useSkillLevels = (projectId: Id<"projects">) => {
  const categories = useQuery(api.projects.getByProject, { projectId });

  return useMemo(() => {
    if (!categories) return undefined;

    return categories.reduce((acc, category) => {
      acc[category.name.toLowerCase()] = generateLevels(
        category.cap?.value ?? 0
      );
      return acc;
    }, {} as Record<string, ReturnType<typeof generateLevels>>);
  }, [categories]);
};

export const useSkillRankImage = (
  projectId: Id<"projects">,
  categoryName: string,
  totalXp: number
) => {
  const skillLevels = useSkillLevels(projectId);

  return useMemo(() => {
    if (!skillLevels) return "";

    const levels = skillLevels[categoryName.toLowerCase()];
    if (!levels) return "";

    let currentLevel = levels[0];

    for (let i = 0; i < levels.length - 1; i++) {
      if (totalXp >= levels[i].xp && totalXp < levels[i + 1].xp) {
        currentLevel = levels[i];
        break;
      }
    }

    if (totalXp >= levels[levels.length - 1].xp) {
      currentLevel = levels[levels.length - 1];
    }

    return getRankImage(currentLevel.level);
  }, [skillLevels, categoryName, totalXp]);
};

export const useSkillLevelLookup = (projectId: Id<"projects">) => {
  const categories = useQuery(api.projects.getByProject, { projectId });

  return useMemo(() => {
    if (!categories) return undefined;

    const lookup = new Map<string, ReturnType<typeof generateLevels>>();

    for (const category of categories) {
      lookup.set(
        category.name.toLowerCase(),
        generateLevels(category.cap?.value ?? 0)
      );
    }

    return lookup;
  }, [categories]);
};

const rankDict: Record<number, string> = {
  0: "Iron IV",
  2: "Iron III",
  3: "Iron II",
  5: "Iron I",

  7: "Bronze IV",
  9: "Bronze III",
  12: "Bronze II",
  14: "Bronze I",

  17: "Silver IV",
  20: "Silver III",
  23: "Silver II",
  27: "Silver I",

  30: "Gold IV",
  33: "Gold III",
  36: "Gold II",
  39: "Gold I",

  42: "Platinum IV",
  45: "Platinum III",
  48: "Platinum II",
  51: "Platinum I",

  54: "Emerald IV",
  57: "Emerald III",
  60: "Emerald II",
  63: "Emerald I",

  75: "Diamond IV",
  77: "Diamond III",
  79: "Diamond II",
  81: "Diamond I",

  83: "Master",
  92: "Grandmaster",
  100: "Challenger",
};

export function getRankImage(level: number): string {
  if (level >= 100) return "/ranks/challenger.png";
  if (level >= 92) return "/ranks/grandmaster.png";
  if (level >= 83) return "/ranks/master.png";
  if (level >= 75) return "/ranks/diamond.png";
  if (level >= 54) return "/ranks/emerald.png";
  if (level >= 42) return "/ranks/platinum.png";
  if (level >= 30) return "/ranks/gold.png";
  if (level >= 17) return "/ranks/silver.png";
  if (level >= 7) return "/ranks/bronze.png";
  return "/ranks/iron.png";
}

const artRewardDict: Record<number, string> = {
    75: "Intermediate",
    83: "Portfolio Work",
    92: "Comissions",
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

// const TARGET_XP = {
//   "art": 400_000,
//   "scholar": 300_000,
//   "engineer": 200_000,
//   "climbing": 150_000,
// }

export const useOverallLevels = () => {
  const totalCap = useQuery(api.projects.getTotalCap);

  return useMemo(() => {
    if (totalCap === undefined) return undefined;

    return generatePercentageLevels(totalCap);
  }, [totalCap]);
};

// Overall levels are a direct percentage of the 400,000 XP journey. The rank
// breakpoints correspond to the supplied 0–6,000-hour path to Challenger.
const generatePercentageLevels = (targetXp: number, maxLevel = 100) =>
  Array.from({ length: maxLevel }, (_, index) => {
    const level = index + 1;
    return {
      level,
      xp: Math.round((targetXp * (level - 1)) / (maxLevel - 1)),
      rank: rankDict[level],
    };
  });

const generateLevels = (targetXp: number, rewardDict?: Record<number, string>, maxLevel = 100) => {
  const levels = [];
  const k = 0.04;
  const a = targetXp / (Math.exp(k * maxLevel) - 1);

  levels.push({ level: 1, xp: 0, reward: rewardDict?.[1] })

  for (let level = 2; level <= maxLevel; level++) {
    const xp = Math.round(a * (Math.exp(k * level) - 1));
    const reward = rewardDict?.[level] 
    const rank = rankDict[level]
    levels.push({ level, xp, reward, rank });
  }

  return levels;
}

export const useProjectLevels = (projectId: Id<"projects">, maxLevel = 100) => {
  const categories = useQuery(api.projects.getByProject, { projectId });
  const project = useQuery(api.projects.getProjectById, {projectId})

  return useMemo(() => {
    if (!categories) return undefined;

    const targetXp = categories.reduce(
      (sum, category) => sum + (category.cap?.value ?? 0),
      0
    );

    return generateLevels(targetXp, getRewardDict(project?.name ?? ""), maxLevel);
  }, [categories, maxLevel]);
};
