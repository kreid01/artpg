import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader } from "./utils/Loader";
import { getRankImage, levels, type ProjectName } from "~/constants/levels";
import type { ProjectId } from "~/routes/home";
import type { ReactNode } from "react";

type XPBarProps = ProjectId & { actions?: ReactNode };

export const XPBar: React.FC<XPBarProps> = ({projectId, actions}) => {
  const reps = useQuery(api.projects.getAllCompleteReps, {projectId});
  const latestFocus = useQuery(api.projects.getLatestFocus);

  const projectName = useQuery(api.projects.getProjectById, {
    projectId,
  })?.name as ProjectName;

  if (!projectName || !reps || latestFocus === undefined) return <Loader />;

  const LEVELS = levels(projectName ?? "");

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
  <div className="fixed left-0 right-0 top-0 z-50 border-b border-[#5c4a1f] bg-linear-to-b from-[#14181d] to-[#0c0f13] px-4 py-3 shadow-lg sm:px-6">
    <div className="mb-3 flex items-center gap-3">
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      <img
        src={getRankImage(currentLevel.level)}
        alt="Rank"
        className="h-12 w-12 ml-20 shrink-0 drop-shadow-[0_0_10px_rgba(255,215,120,.35)] sm:h-16 sm:w-16"
      />
      <div className="min-w-0 ml-auto">
        <div className="flex flex-col items-end justify-end gap-2">
          <p className="text-sm font-bold text-white sm:text-xl">Level {currentLevel.level}</p>
          <p className="truncate text-right text-[10px] text-slate-400 sm:text-sm">
            {nextLevel ? `${xpIntoLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP` : "MAX LEVEL"}
          </p>
        </div>
      </div>
    </div>

    <div className="relative h-5 overflow-hidden rounded-full border border-[#92753a] bg-[#1a1f24] shadow-inner">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-cyan-700 via-cyan-400 to-cyan-300 transition-all duration-700"
        style={{ width: `${pct}%` }} >
        <div className="h-1/2 w-full bg-white/20" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 to-transparent" />

      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tracking-wide text-white sm:text-xs">
        {pct}%
      </span>
    </div>
  </div>
);
}
