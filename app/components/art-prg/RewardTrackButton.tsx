import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useQuery } from "convex/react"
import { api } from "convex/_generated/api"
import { getRankImage, levels, type ProjectName } from "~/constants/levels"
import { FaArrowTrendUp } from "react-icons/fa6";
import { ProjectButton, type ProjectId } from "~/routes/home"
import { CloseButton } from "./utils/CloseButton"

export const RewardTrackButton:React.FC<ProjectId> = ({projectId}) => {
  const [open, setOpen] = useState(false)
  const reps = useQuery(api.projects.getAllCompleteReps, {projectId})

  const projectName = useQuery(api.projects.getProjectById, {
    projectId,
  })?.name as ProjectName;

  const LEVELS = levels(projectName ?? "art");

  const totalXp = reps?.reduce((sum, r) => sum + (r.xpValue ?? 0), 0) ?? 0
  const currentLevel = [...LEVELS].reverse().find(l => totalXp >= l.xp)?.level ?? 1

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
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-700 bg-[#2b2315] text-2xl text-amber-300">
                <FaArrowTrendUp />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500">Progression</p>
                <Dialog.Title className="text-2xl font-bold text-white">Reward Track</Dialog.Title>
                <p className="mt-1 text-sm text-slate-400">Level {currentLevel} • {totalXp.toLocaleString()} XP</p>
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
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.25em] text-amber-500">Level</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.25em] text-amber-500">Rank</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.25em] text-amber-500">XP Required</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.25em] text-amber-500">To Next</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.25em] text-amber-500">Reward</th>
                </tr>
              </thead>
                <tbody>
                  {LEVELS.map(({ level, xp, reward, rank }, i) => {
                  const next = LEVELS[i + 1];
                  const toNext = next ? (next.xp - xp).toLocaleString() : "MAX";
                  const isCurrent = level === currentLevel;
                  const isUnlocked = totalXp >= xp;

                  return (
                    <tr key={level} className={`transition-all duration-300 ${isCurrent ? "bg-[#2b2315]" : isUnlocked ? "hover:bg-[#1b2027]" : "opacity-50"}`}>
                      <td className="border-b border-[#2e3742] px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold ${isCurrent ? "border-amber-400 bg-[#3a3118] text-amber-300" : isUnlocked ? "border-[#555] bg-[#1d232b] text-white" : "border-[#333] bg-[#12161a] text-slate-500"}`}>
                            {level}
                          </span>
                          {isCurrent && <span className="rounded-full border border-amber-500 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">Current</span>}
                        </div>
                      </td>

                      <td className="border-b border-[#2e3742] px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={getRankImage(level)} alt={rank} className="h-8 w-8" />
                          <span className={isUnlocked ? "text-slate-300" : "text-slate-600"}>{rank ?? "—"}</span>
                        </div>
                      </td>

                      <td className={`border-b border-[#2e3742] px-6 py-4 font-mono ${isUnlocked ? "text-slate-300" : "text-slate-600"}`}>
                        {xp.toLocaleString()}
                      </td>

                      <td className="border-b border-[#2e3742] px-6 py-4 font-mono text-slate-400">
                        +{toNext}
                      </td>

                      <td className="border-b border-[#2e3742] px-6 py-4">
                        {reward ? (
                          <span className="rounded-lg border border-[#3b434f] bg-[#11161c] px-3 py-1 text-xs text-slate-200">
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