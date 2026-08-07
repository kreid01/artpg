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

    return generateLevels(totalCap);
  }, [totalCap]);
};

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