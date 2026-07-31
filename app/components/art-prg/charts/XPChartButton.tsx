import * as Dialog from "@radix-ui/react-dialog";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { LineChart } from "@mui/x-charts/LineChart";
import { api } from "convex/_generated/api";
import { FaChartLine } from "react-icons/fa";
import { getTargetXp, type ProjectName } from "~/constants/levels";
import { ProjectButton, type ProjectId } from "~/routes/home";
import { CloseButton } from "../utils/CloseButton";

const getWeekKey = (dateMs: number): string => {
  const d = new Date(dateMs);
  const day = d.getUTCDay(); 
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - ((day + 6) % 7)); 
  monday.setUTCHours(0, 0, 0, 0); 
  return monday.toISOString().slice(0, 10);
}

export const XPChartButton: React.FC<ProjectId> = ({projectId}) => {
  const [open, setOpen] = useState(false);

  const projectName = useQuery(api.projects.getProjectById, {
    projectId,
  })?.name as ProjectName;

  const goalXp = getTargetXp(projectName ?? "art")

  const reps = useQuery(api.projects.getAllCompleteReps, open ? {projectId} : "skip");
  const tasks = useQuery(api.projects.getAllTasks, open ? {projectId} : "skip");

  const filteredReps = useMemo(() => {
    return (reps ?? []).filter((rep) => {
      const d = new Date(rep.completedAt ?? new Date());
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

    const totalXp = (reps ?? []).reduce((sum, rep) => sum + rep.xpValue, 0);
    const remaining = Math.max(goalXp - totalXp, 0);
    const weeksToGoal = avgXp > 0 ? Math.ceil(remaining / avgXp) : Infinity;

    return { weeks, xpPerWeek, avgXp, weeksToGoal };
  }, [filteredReps, reps, tasks, goalXp]);

  const isLoading = filteredReps === undefined || tasks === undefined;
  const hasData = weeks.length > 0;

  const formattedWeeks = weeks.map((w) => {
    const d = new Date(w);
    return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <ProjectButton icon={<FaChartLine/>}/>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className=" fixed left-1/2 top-1/2 z-50 w-[98vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#8d6d2c] bg-linear-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-white shadow-[0_0_50px_rgba(0,0,0,.7)] ">
          <div className="h-0.75 w-full bg-linear-to-r from-[#6d531e] via-[#d4af37] to-[#6d531e]" />
          <div className="flex items-center justify-between border-b border-[#353d47] px-2 py-5">

            <div className="flex items-center gap-4">
              <div>

                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500">
                  Progress
                </p>

                <Dialog.Title className="text-2xl font-bold text-white">
                  Weekly XP earned 
                </Dialog.Title>
              </div>
            </div>

            <Dialog.Close asChild>
              <CloseButton/>
            </Dialog.Close>

          </div>
        <div className="px-2 pb-6 mt-2">
      {isLoading ? (
        <div className="flex h-105 items-center justify-center text-slate-400">
          Loading journey...
        </div>
      ) : !hasData ? (
        <div className="flex h-105 items-center justify-center text-slate-400">
          No XP recorded yet.
        </div>
      ) : (
      <>
      <div className="mb-6 grid gap-4 grid-cols-3">
        <div className="rounded-xl border border-[#3b434f] bg-[#11161c] p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
            Weekly Average
          </p>
          <p className="mt-2 text-3xl font-bold text-cyan-300">
            {avgXp.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            XP per week
          </p>
        </div>

        <div className="rounded-xl border border-[#3b434f] bg-[#11161c] p-4">

          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
            Estimated Finish
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-400">
            {weeksToGoal === Infinity
              ? "∞"
              : weeksToGoal.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Weeks remaining
          </p>

        </div>

        <div className="rounded-xl border border-[#3b434f] bg-[#11161c] p-4">

          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
            Target XP
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {goalXp.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Final milestone
          </p>

        </div>

      </div>

      <div
        className="
          rounded-2xl
          border
          border-[#3b434f]
          bg-[#11161c]
          p-6
        "
      >

        <div className="mb-5 border-b border-[#353d47] pb-3">

          <h3 className="text-lg font-semibold text-white">
            Weekly Progress
          </h3>

          <p className="text-sm text-slate-500">
            XP earned each week across your journey.
          </p>

        </div>

        <LineChart
          height={320}
          xAxis={[
            {
              scaleType: "point",
              data: formattedWeeks,
              tickLabelStyle: {
                fill: "#94a3b8",
                fontSize: 11,
              },
            },
          ]}
          yAxis={[
            {
              tickLabelStyle: {
                fill: "#94a3b8",
                fontSize: 11,
              },
            },
          ]}
          series={[
            {
              label: "Weekly XP",
              data: xpPerWeek,
              color: "#55b7ff",
              area: true,
              showMark: true,
            },
            {
              label: "Average",
              data: Array(xpPerWeek.length).fill(avgXp),
              color: "#d4af37",
              showMark: false,
              curve: "linear",
            },
          ]}
          sx={{
            "& .MuiChartsAxis-line": {
              stroke: "#49515b",
            },

            "& .MuiChartsAxis-tick": {
              stroke: "#49515b",
            },

            "& .MuiChartsGrid-line": {
              stroke: "#26313d",
            },

            "& .MuiLineElement-root": {
              strokeWidth: 3,
            },

            "& .MuiAreaElement-root": {
              opacity: 0.2,
            },

            "& .MuiMarkElement-root": {
              stroke: "#55b7ff",
              strokeWidth: 2,
              fill: "#101419",
            },

            "& .MuiChartsLegend-mark": {
              rx: 4,
            },

            backgroundColor: "transparent",
          }}
        />

      </div>

    </>
  )}

</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};