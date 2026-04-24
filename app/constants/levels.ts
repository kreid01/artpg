
export const levels = () => generateLevels(100)

const rewardDict: Record<number, string> = {
    70: "Art Book",
    75: "Drawing Tablet",
    80: "Art Book",
    85: "Course",
    90: "Art Book",
    95: "Course",
}

const generateLevels = (maxLevel = 100) => {
  const levels = [];
  const targetXp = 300_000;
  const k = 0.04;
  const a = targetXp / (Math.exp(k * maxLevel) - 1);

  for (let level = 1; level <= maxLevel; level++) {
    const xp = Math.round(a * (Math.exp(k * level) - 1));
    const reward = rewardDict[level]
    levels.push({ level, xp, reward });
  }

  return levels;
};