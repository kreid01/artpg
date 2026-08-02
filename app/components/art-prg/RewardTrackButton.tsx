import { useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useQuery } from "convex/react"
import { api } from "convex/_generated/api"
import { generateSkillLevels, getRankImage, getXpCaps, levels, type ProjectName } from "~/constants/levels"
import { FaArrowTrendUp } from "react-icons/fa6";
import { ProjectButton } from "~/routes/home"
import { CloseButton } from "./utils/CloseButton"
import type { Props } from "./CategoryTasks"

export const RewardTrackButton:React.FC<Props> = ({ categories, tasks, reps, projectId }) => {
  const [open, setOpen] = useState(false)

  const projectName = useQuery(api.projects.getProjectById, {
    projectId,
  })?.name as ProjectName;

  const xpCaps = getXpCaps(projectName ?? "art")
  const order = Object.keys(xpCaps);

  const sortedCategories = [...categories].sort((a, b) => {
    const ai = order.indexOf(a.name.toLowerCase());
    const bi = order.indexOf(b.name.toLowerCase());
    const aIdx = ai === -1 ? Infinity : ai;
    const bIdx = bi === -1 ? Infinity : bi;
    return aIdx - bIdx;
  });

  const [selectedCategory, setSelectedCategory] = useState("all");

  const taskMap = useMemo(
    () => Object.fromEntries(tasks?.map(t => [t._id, t])),
    [tasks]
  );

  const categoryXpTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const rep of reps ?? []) {
      const categoryId =
        rep.categoryId ??
        (rep.taskId ? taskMap[rep.taskId]?.categoryId : undefined);

      if (!categoryId) continue;

      totals[categoryId] = (totals[categoryId] || 0) + (rep.xpValue ?? 0);
    }

    return totals;
  }, [reps, taskMap]);

  const LEVELS = useMemo(() => {
    return selectedCategory === "all"
      ? levels(projectName ?? "art")
      : generateSkillLevels(projectName ?? "art", categories.find(c => c._id == selectedCategory)?.name ?? "");
  }, [projectName, selectedCategory]);

  const totalXp = useMemo(() => {
    return selectedCategory === "all"
      ? reps?.reduce((sum, r) => sum + (r.xpValue ?? 0), 0) ?? 0
      : categoryXpTotals[selectedCategory] ?? 0;
  }, [selectedCategory, reps, categoryXpTotals]);

  const currentLevel = useMemo(() => {
    return (
      [...LEVELS].reverse().find(level => totalXp >= level.xp)?.level ?? 1
    );
  }, [LEVELS, totalXp]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <ProjectButton icon={<FaArrowTrendUp/>}/>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[95vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#8d6d2c] bg-gradient-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-white shadow-[0_0_50px_rgba(0,0,0,.7)]">
          <div className="h-0.75 w-full bg-linear-to-r from-[#6d531e] via-[#d4af37] to-[#6d531e]" />
          <div className="flex items-center justify-between border-b border-[#353d47] px-6 py-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-700 bg-[#2b2315] text-2xl text-amber-300">
                <FaArrowTrendUp />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500">Progression</p>
                <Dialog.Title className="text-2xl font-bold text-white">Reward Track</Dialog.Title>
                <p className="mt-1 text-sm text-slate-400">Level {currentLevel} • {totalXp.toLocaleString()} XP</p>
                <div className="mt-2 flex flex-nowrap gap-2 overflow-x-scroll whitespace-nowrap pb-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`rounded-full px-3 py-1 text-xs ${
                      selectedCategory === "all"
                        ? "bg-amber-600 text-white"
                        : "bg-[#222831] text-slate-300 hover:bg-[#2b323d]" }`}>All 
                  </button>
                  {sortedCategories?.map(category => (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategory(category._id)}
                      className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                        selectedCategory === category._id
                          ? "bg-amber-600 text-white"
                          : "bg-[#222831] text-slate-300 hover:bg-[#2b323d]" }`} >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Dialog.Close asChild>
                <CloseButton />
              </Dialog.Close>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-[#171c22]">
                <tr className="border-b border-[#353d47]">
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-[0.25em] text-amber-500">Level</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-[0.25em] text-amber-500">Rank</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-[0.25em] text-amber-500">Required</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-[0.25em] text-amber-500">Reward</th>
                </tr>
              </thead>
                <tbody>
                  {LEVELS.map(({ level, xp, reward, rank }, i) => {
                  const isCurrent = level === currentLevel;
                  const isUnlocked = totalXp >= xp;

                  return (
                    <tr key={level} className={`w-5 transition-all duration-300 ${isCurrent ? "bg-[#2b2315]" : isUnlocked ? "hover:bg-[#1b2027]" : "opacity-50"}`}>
                      <td className="border-b border-[#2e3742] text-[10px] px-3 py-3">
                        {level}
                      </td>

                      <td className="border-b border-[#2e3742] text-[10px] px-3 py-3">
                        <div className="flex items-center gap-2">
                          <img src={getRankImage(level)} alt={rank} className="h-8 w-8" />
                          <span className={isUnlocked ? "text-slate-300" : "text-slate-600"}>{rank ?? "—"}</span>
                        </div>
                      </td>

                      <td className={`border-b border-[#2e3742] text-[10px] px-3 py-3 font-mono ${isUnlocked ? "text-slate-300" : "text-slate-600"}`}>
                        {xp.toLocaleString()}
                      </td>

                      <td className="border-b border-[#2e3742] text-[10px] px-3 py-3">
                        {reward ? (
                          <span className="text-slate-200">
                            {reward}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}