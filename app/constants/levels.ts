
export const levels = () => generateLevels(100)

const rewardDict: Record<number, string> = {
    70: "Illustration Series",
    75: "Portfolio Work",
    80: "Art Station",
    85: "Comissions",
    90: "Social Media",
    95: "Mentorship",
}

const generateLevels = (maxLevel = 100) => {
  const levels = [];
  const targetXp = 400_000;
  const k = 0.04;
  const a = targetXp / (Math.exp(k * maxLevel) - 1);

  for (let level = 1; level <= maxLevel; level++) {
    const xp = Math.round(a * (Math.exp(k * level) - 1));
    const reward = rewardDict[level]
    levels.push({ level, xp, reward });
  }

  return levels;
};