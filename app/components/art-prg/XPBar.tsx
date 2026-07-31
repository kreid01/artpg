import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader } from "./Loader";
import { getRankImage, levels, type ProjectName } from "~/constants/levels";
import type { ProjectId } from "./RepChecklist";

export const XPBar: React.FC<ProjectId> = ({projectId}) => {
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
  <div className="fixed top-0 left-0 right-0 z-50 border-b border-[#5c4a1f] bg-gradient-to-b from-[#14181d] to-[#0c0f13] px-6 py-3 shadow-lg">
    <div className="mb-3 flex items-center justify-between">

      <div>
        <p className="text-xs uppercase tracking-widest text-amber-500">
          Rank
        </p>
        <p className="text-xl font-bold text-white">
          Level {currentLevel.level}
        </p>
      </div>

      <img
        src={getRankImage(currentLevel.level)}
        alt="Rank"
        className="h-20 w-20 drop-shadow-[0_0_10px_rgba(255,215,120,.35)]"
      />

      <div className="text-right">
        <p className="text-sm text-slate-300">
          {nextLevel
            ? `${xpIntoLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`
            : "MAX LEVEL"}
        </p>

        <p className="text-xs text-slate-500">
          {totalXp.toLocaleString()} XP
        </p>
      </div>

    </div>

    <div className="relative h-5 overflow-hidden rounded-full border border-[#92753a] bg-[#1a1f24] shadow-inner">

      <div
        className="absolute inset-y-0 left-0 rounded-full
                   bg-linear-to-r
                   from-cyan-700
                   via-cyan-400
                   to-cyan-300
                   transition-all duration-700"
        style={{ width: `${pct}%` }}
      >

        <div className="h-1/2 w-full bg-white/20" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 to-transparent" />

      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tracking-wide text-white">
        {pct}%
      </span>

    </div>
  </div>
);
}