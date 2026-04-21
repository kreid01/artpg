import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader } from "./Loader";

const generateLevels = (maxLevel = 100) => {
  const levels = [];
  let xp = 0;

  for (let level = 1; level <= maxLevel; level++) {
    const increment = Math.floor(
      400 + (level * 120) + Math.pow(level, 1.35) * 25
    );

    xp += level === 1 ? 0 : increment;

    levels.push({ level, xp });
  }

  return levels;
};

export function XPBar() {
  const reps = useQuery(api.projects.getAllCompleteReps);

  if (!reps) return <Loader/> 

  const LEVELS = generateLevels();

  const totalXp = reps.reduce((sum, rep) => sum + rep.xpValue, 0);

  let currentLevel = LEVELS[0];
  let nextLevel: typeof LEVELS[0] | null = LEVELS[1];
  for (let i = 0; i < LEVELS.length - 1; i++) {
    if (totalXp >= LEVELS[i].xp && totalXp < LEVELS[i + 1].xp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1];
      break;
    }
  }
  if (totalXp >= LEVELS[LEVELS.length - 1].xp) {
    currentLevel = LEVELS[LEVELS.length - 1];
    nextLevel = null;
  }

  const xpIntoLevel = totalXp - currentLevel.xp;
  const xpNeeded = nextLevel ? nextLevel.xp - currentLevel.xp : 1;
  const pct = nextLevel ? Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100)) : 100;

  return (
    <div className="fixed bg-slate-950  top-0 left-0 right-0 z-50 border-b px-6 py-3">
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="font-medium text-gray-100">Level {currentLevel.level}</span>
        <span className="text-gray-100">
          {nextLevel ? `${xpIntoLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP` : "Max level!"}
        </span>
        <span className="text-gray-100">{totalXp.toLocaleString()} total XP</span>
      </div>
      <div className="relative h-6 bg-slate-950 border-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-sm">
          {pct}%
        </span>
      </div>
    </div>
  );
}