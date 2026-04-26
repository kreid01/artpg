import * as Dialog from "@radix-ui/react-dialog";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { LineChart } from "@mui/x-charts/LineChart";
import { api } from "convex/_generated/api";

const GOAL_XP = 300_000;

function getWeekKey(dateMs: number): string {
  const d = new Date(dateMs);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

export const XPChartButton = () => {
  const [open, setOpen] = useState(false);

  const reps = useQuery(api.projects.getAllCompleteReps, open ? {} : "skip");
  const tasks = useQuery(api.projects.getAllTasks, open ? {} : "skip");

  const filteredReps = useMemo(() => {
  return (reps ?? []).filter((rep) => {
    const d = new Date(rep._creationTime);
    return !(d.getFullYear() === 2026 && d.getMonth() === 3 && d.getDate() === 18);
  });
}, [reps]);

  const { weeks, xpPerWeek, avgXp, weeksToGoal } = useMemo(() => {
    if (!filteredReps || filteredReps.length === 0)
      return { weeks: [], xpPerWeek: [], avgXp: 0, weeksToGoal: 0 };

    const byWeek = new Map<string, number>();
    for (const rep of filteredReps) {
      const key = getWeekKey(rep._creationTime);
      byWeek.set(key, (byWeek.get(key) ?? 0) + rep.xpValue);
    }

    const sorted = Array.from(byWeek.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const weeks = sorted.map(([k]) => k);
    const xpPerWeek = sorted.map(([, v]) => v);
    const avgXp =
      xpPerWeek.length > 0
        ? Math.round(xpPerWeek.reduce((a, b) => a + b, 0) / xpPerWeek.length)
        : 0;

    const totalXp = xpPerWeek.reduce((a, b) => a + b, 0);
    const remaining = Math.max(GOAL_XP - totalXp, 0);
    const weeksToGoal = avgXp > 0 ? Math.ceil(remaining / avgXp) : Infinity;

    return { weeks, xpPerWeek, avgXp, weeksToGoal };
  }, [filteredReps, tasks]);

  const isLoading = filteredReps === undefined || tasks === undefined;
  const hasData = weeks.length > 0;

  const formattedWeeks = weeks.map((w) => {
    const d = new Date(w);
    return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-2 py-1 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
            Weekly XP
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 text-white -translate-x-1/2 -translate-y-1/2 bg-slate-950 rounded-2xl shadow-xl w-full lg:w-[70%] overflow-hidden">

          <div className="px-6 pt-6 pb-2 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-white">
                Weekly XP
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                Close
              </button>
            </Dialog.Close>
          </div>

          <div className="px-6 pb-6">
            {isLoading ? (
              <p className="text-slate-400 text-sm text-center py-10">Loading…</p>
            ) : !hasData ? (
              <p className="text-slate-400 text-sm text-center py-10">
                No reps recorded yet.
              </p>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-4 rounded-xl bg-slate-900 border border-slate-800 px-4 py-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">
                      Avg XP / week
                    </p>
                    <p className="text-lg font-semibold text-emerald-400">
                      {avgXp.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-px bg-slate-800 self-stretch" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">
                      Weeks to 300k
                    </p>
                    <p className="text-lg font-semibold text-amber-400">
                      {weeksToGoal === Infinity ? "∞" : weeksToGoal.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-px bg-slate-800 self-stretch" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">
                      Goal
                    </p>
                    <p className="text-lg font-semibold text-slate-300">
                      {GOAL_XP.toLocaleString()} XP
                    </p>
                  </div>
                </div>

                <LineChart
                  height={260}
                  xAxis={[
                    {
                      scaleType: "point",
                      data: formattedWeeks,
                      tickLabelStyle: { fill: "#94a3b8", fontSize: 11 },
                    },
                  ]}
                  yAxis={[
                    {
                      tickLabelStyle: { fill: "#94a3b8", fontSize: 11 },
                    },
                  ]}
                  series={[
                    {
                      label: "XP By Week",
                      data: xpPerWeek,
                      color: "#22c55e",
                      area: true,
                      showMark: true,
                    },
                    {
                      label: "Weekly avg",
                      data: Array(xpPerWeek.length).fill(avgXp),
                      color: "#f59e0b",
                      showMark: false,
                      curve: "linear",
                    },
                  ]}
                  sx={{
                    "& .MuiChartsAxis-line": { stroke: "#334155" },
                    "& .MuiChartsAxis-tick": { stroke: "#334155" },
                    "& .MuiChartsLegend-mark": { rx: 3 },
                    "& .MuiAreaElement-root": { opacity: 0.15 },
                    backgroundColor: "transparent",
                  }}
                />
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};