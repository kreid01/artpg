import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useQuery } from "convex/react"
import { api } from "convex/_generated/api"
import { levels } from "~/constants/levels"

const rewardDict = {

}

const LEVELS = levels();

export const RewardTrackButton = () => {
  const [open, setOpen] = useState(false)
  const reps = useQuery(api.projects.getAllCompleteReps)

  const totalXp = reps?.reduce((sum, r) => sum + (r.xpValue ?? 0), 0) ?? 0
  const currentLevel = [...LEVELS].reverse().find(l => totalXp >= l.xp)?.level ?? 1

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-2 py-1 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
            Reward Track
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 text-white -translate-x-1/2 -translate-y-1/2 bg-slate-950 rounded-2xl shadow-xl w-full lg:w-[60%] overflow-hidden flex flex-col max-h-[80vh]">

          <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0 border-b border-slate-800">
            <div>
              <Dialog.Title className="text-base font-semibold text-white">
                Reward Track
              </Dialog.Title>
              <p className="text-xs text-slate-400 mt-0.5">
                Level {currentLevel} · {totalXp.toLocaleString()} XP
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                Close
              </button>
            </Dialog.Close>
          </div>

          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 z-10">
                <tr>
                  <th className="text-left px-6 py-3 text-slate-400 font-medium w-20">Level</th>
                  <th className="text-left px-6 py-3 text-slate-400 font-medium">XP Required</th>
                  <th className="text-left px-6 py-3 text-slate-400 font-medium">XP to Next</th>
                  <th className="text-left px-6 py-3 text-slate-400 font-medium">Reward</th>
                </tr>
              </thead>
              <tbody>
                {LEVELS.map(({ level, xp, reward }, i) => {
                  const next = LEVELS[i + 1];
                  const toNext = next ? (next.xp - xp).toLocaleString() : "—";
                  const isMilestone = level % 10 === 0;
                  const isAchieved = totalXp >= xp;
                  const isCurrent = level === currentLevel;

                  return (
                    <tr
                      key={level}
                      className={`border-b transition-colors
                        ${isCurrent
                          ? "border-emerald-500/40 bg-emerald-950/40"
                          : isAchieved
                          ? "border-slate-800/50 bg-slate-900/20"
                          : "border-slate-800/30 opacity-40"
                        }
                        ${!isCurrent && "hover:opacity-100 hover:bg-slate-900/50"}
                      `}
                    >
                      <td className="px-6 py-2.5">
                        <span className={`font-mono font-semibold flex items-center gap-1.5
                          ${isCurrent ? "text-emerald-400" : isAchieved ? "text-slate-300" : "text-slate-500"}`
                        }>
                          {level}
                          {isCurrent && (
                            <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              YOU
                            </span>
                          )}
                          {!isCurrent && isMilestone && isAchieved && (
                            <span className="text-xs text-emerald-500/70">★</span>
                          )}
                        </span>
                      </td>
                      <td className={`px-6 py-2.5 font-mono ${isAchieved ? "text-slate-300" : "text-slate-600"}`}>
                        {xp.toLocaleString()}
                      </td>
                      <td className="px-6 py-2.5 text-slate-500 font-mono text-xs">
                        +{toNext}
                      </td>
                      <td className="px-6 py-2.5 text-slate-600 italic text-xs">
                        {reward ?? "—"}
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