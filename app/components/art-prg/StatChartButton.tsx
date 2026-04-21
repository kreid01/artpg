import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { RadarChart } from "@mui/x-charts/RadarChart";
import * as Dialog from "@radix-ui/react-dialog";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

const CATEGORY_COLORS: Record<string, string> = {
  "design": "#ef4444",
  "rendering": "#f97316",
  "clothing & material": "#f59e0b",
  "colour theory": "#84cc16",
  "visual library": "#22c55e",
  "observation": "#14b8a6",
  "composition": "#0ea5e9",
  "form & construction": "#6366f1",
  "perspective": "#a855f7",
  "gesture": "#ec4899",
  "anatomy": "#f97316",
};

export const StatChartButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const reps = useQuery(api.projects.getAllCompleteReps, open ? {} : "skip");
  const tasks = useQuery(api.projects.getAllTasks, open ? {} : "skip");
  const categories = useQuery(api.projects.getAllCategories, open ? {} : "skip");

  const taskMap = useMemo(
    () => new Map((tasks ?? []).map((t) => [t._id, t])),
    [tasks]
  );

  const xpByCategory = useMemo(() => {
    const acc = new Map<string, number>();
    for (const rep of reps ?? []) {
      const catId = rep.categoryId ?? taskMap.get(rep.taskId as Id<"tasks">)?.categoryId;
      if (!catId) continue;
      acc.set(catId, (acc.get(catId) ?? 0) + rep.xpValue);
    }
    return acc;
  }, [reps, taskMap]);

  
  const activeCategories = useMemo(() => categories ?? [], [categories]);

  const totalXp = useMemo(
    () => Array.from(xpByCategory.values()).reduce((a, b) => a + b, 0),
    [xpByCategory]
  );

  const maxXp = useMemo(
    () => Math.max(...Array.from(xpByCategory.values()), 1),
    [xpByCategory]
  );

  const isLoading = reps === undefined || tasks === undefined || categories === undefined;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2 py-1 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
        View Stats
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 text-white -translate-x-1/2 -translate-y-1/2 bg-slate-950 rounded-2xl shadow-xl w-full lg:w-[70%]  overflow-hidden">

            <div className="px-6 pt-6 pb-2 flex items-center justify-between">
              <Dialog.Title className="text-base font-semibold text-white">
                XP by Category
              </Dialog.Title>
              <div>
                <span className="text-sm text-slate-400">
                  {totalXp.toLocaleString()} total XP
                </span>
              <Dialog.Close asChild>
                <button className="px-3 ml-5 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                  Close
                </button>
              </Dialog.Close>
              </div>
            </div>

            <div className="px-6 pb-4">
              {isLoading ? (
                <p className="text-slate-400 text-sm text-center py-10">Loading…</p>
              ) : activeCategories.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-10">
                  No reps recorded yet.
                </p>
              ) : (
                <>
                  <RadarChart
                    height={300}
                    series={[
                      {
                        label: "XP",
                        data: activeCategories.map((c) => xpByCategory.get(c._id) ?? 0),
                        color: "#22c55e",
                        fillArea: true

                      },
                    ]}
                    radar={{
                      metrics: activeCategories.map((c) => ({
                        name: c.name,
                        max: maxXp,
                      })),
                    }}
                  />

                  <div className="mt-4 space-y-2.5">
                    {activeCategories.map((cat, i) => {
                      const xp = xpByCategory.get(cat._id) ?? 0;
                      const pct = Math.round((xp / maxXp) * 100);
                      const color = CATEGORY_COLORS[cat.name.toLowerCase()] ?? "#64748b"; 
                      return (
                        <div key={cat._id} className="grid items-center gap-2" style={{ gridTemplateColumns: "120px 1fr 48px" }}>
                          <span className="text-sm text-slate-300 truncate">{cat.name}</span>
                          <div className="h-2 rounded-l-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                          <span className="text-sm text-slate-400 text-right">{xp.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
