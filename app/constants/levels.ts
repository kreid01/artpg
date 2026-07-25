
export const levels = (projectName: string) => generateLevels(projectName, 100)

const rewardDict: Record<number, string> = {
    70: "Illustration Series",
    75: "Portfolio Work",
    80: "Art Station",
    85: "Comissions",
    90: "Social Media",
    95: "Mentorship",
}

const generateLevels = (projectName: string, maxLevel = 100) => {
  const levels = [];
  const targetXp = projectName.toLowerCase() == "art" ?  400_000 : 150_000
  const k = 0.04;
  const a = targetXp / (Math.exp(k * maxLevel) - 1);

  for (let level = 1; level <= maxLevel; level++) {
    const xp = Math.round(a * (Math.exp(k * level) - 1));
    const reward = projectName.toLowerCase() == "art" ? rewardDict[level] : {}
    levels.push({ level, xp, reward });
  }

  return levels;
};