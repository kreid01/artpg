import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

const LEVELS = [
  { level: 1, xp: 0 }, { level: 2, xp: 500 }, { level: 3, xp: 1100 },
  { level: 4, xp: 1800 }, { level: 5, xp: 2600 }, { level: 6, xp: 3500 },
  { level: 7, xp: 4500 }, { level: 8, xp: 5600 }, { level: 9, xp: 6800 },
  { level: 10, xp: 8100 }, { level: 11, xp: 9600 }, { level: 12, xp: 11200 },
  { level: 13, xp: 12900 }, { level: 14, xp: 14700 }, { level: 15, xp: 16600 },
  { level: 16, xp: 18600 }, { level: 17, xp: 20700 }, { level: 18, xp: 22900 },
  { level: 19, xp: 25200 }, { level: 20, xp: 27600 }, { level: 21, xp: 30100 },
  { level: 22, xp: 32800 }, { level: 23, xp: 35700 }, { level: 24, xp: 38800 },
  { level: 25, xp: 42100 }, { level: 26, xp: 45600 }, { level: 27, xp: 49300 },
  { level: 28, xp: 52000 }, { level: 29, xp: 54000 }, { level: 30, xp: 60000 },
  { level: 31, xp: 64000 }, { level: 32, xp: 68500 }, { level: 33, xp: 73500 },
  { level: 34, xp: 79000 }, { level: 35, xp: 85000 }, { level: 36, xp: 91500 },
  { level: 37, xp: 98500 }, { level: 38, xp: 106000 }, { level: 39, xp: 114000 },
  { level: 40, xp: 122500 }, { level: 41, xp: 131500 }, { level: 42, xp: 141000 },
  { level: 43, xp: 151000 }, { level: 44, xp: 161000 }, { level: 45, xp: 172500 },
  { level: 46, xp: 184000 }, { level: 47, xp: 196000 }, { level: 48, xp: 208500 },
  { level: 49, xp: 221500 }, { level: 50, xp: 235000 },
];

export function XPBar() {
  const reps = useQuery(api.projects.getAllReps);

  if (!reps) return <div>Loading reps...</div>;

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
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b px-6 py-3">
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="font-medium">Level {currentLevel.level}</span>
        <span className="text-gray-400">
          {nextLevel ? `${xpIntoLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP` : "Max level!"}
        </span>
        <span className="text-gray-400">{totalXp.toLocaleString()} total XP</span>
      </div>
      <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
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