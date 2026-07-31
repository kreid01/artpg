import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { RadarChart } from "@mui/x-charts/RadarChart";
import * as Dialog from "@radix-ui/react-dialog";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getCategoryColours } from "~/constants/colours";
import { getXpCaps } from "~/constants/levels";
import { FaBullseye } from "react-icons/fa6";
import type { ProjectName } from "~/constants/levels";
import { ProjectButton, type ProjectId } from "~/routes/home";
import { CloseButton } from "../utils/CloseButton";

export const StatChartButton: React.FC<ProjectId> = ({ projectId }) => {
  const [open, setOpen] = useState(false);

  const reps = useQuery(
    api.projects.getAllCompleteReps,
    open ? { projectId } : "skip"
  );

  const tasks = useQuery(
    api.projects.getAllTasks,
    open ? { projectId } : "skip"
  );

  const categories = useQuery(
    api.projects.getAllCategories,
    open ? { projectId } : "skip"
  );

  const projectName = useQuery(api.projects.getProjectById, {
    projectId,
  })?.name as ProjectName;

  const colours = getCategoryColours(projectName ?? "art");
  const xpCaps = getXpCaps(projectName ?? "art");

  const taskMap = useMemo(
    () => new Map((tasks ?? []).map((t) => [t._id, t])),
    [tasks]
  );

  const xpByCategory = useMemo(() => {
    const acc = new Map<string, number>();

    for (const rep of reps ?? []) {
      const catId =
        rep.categoryId ??
        taskMap.get(rep.taskId as Id<"tasks">)?.categoryId;

      if (!catId) continue;

      acc.set(catId, (acc.get(catId) ?? 0) + rep.xpValue);
    }

    return acc;
  }, [reps, taskMap]);

  const activeCategories = useMemo(
    () => categories ?? [],
    [categories]
  );

  const totalXp = useMemo(
    () =>
      Array.from(xpByCategory.values()).reduce(
        (a, b) => a + b,
        0
      ),
    [xpByCategory]
  );

  const isLoading =
    reps === undefined ||
    tasks === undefined ||
    categories === undefined;

  return (
    <>
      <ProjectButton icon={<FaBullseye/>} onClick={() => setOpen(true)}/>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md" />
          <Dialog.Content className=" fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#8d6d2c] bg-linear-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-white shadow-[0_0_50px_rgba(0,0,0,.7)] " >
            <div className="h-0.75 w-full bg-linear-to-r from-[#6d531e] via-[#d4af37] to-[#6d531e]" />
            <div className="flex items-center justify-between border-b border-[#353d47] px-6 py-5">

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500">
                  Project 
                  </p>
                  <Dialog.Title className="text-2xl font-bold text-white">
                    Mastery
                  </Dialog.Title>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <Dialog.Close asChild>
                  <CloseButton/>
                </Dialog.Close>
              </div>
            </div>

            <div className="px-2 pb-6 mt-4">
            {isLoading ? (
              <div className="flex h-125 items-center justify-center text-slate-400">
                Loading mastery...
              </div>
            ) : activeCategories.length === 0 ? (
              <div className="flex h-125 items-center justify-center text-slate-400">
                No mastery data yet.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
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
                      Overview
                    </h3>
                  </div>

                  <RadarChart
                    height={300}
                    series={[
                      {
                        label: "Mastery",
                        data: activeCategories.map((cat) => {
                          const xp = xpByCategory.get(cat._id) ?? 0;
                          const cap = xpCaps[cat.name.toLowerCase()] ?? 1;

                          return Math.min(xp, cap);
                        }),
                        color: "#55b7ff",
                        fillArea: true,
                      },
                    ]}
                    radar={{
                      metrics: activeCategories.map((cat) => ({
                        name: cat.name,
                        max: xpCaps[cat.name.toLowerCase()] ?? 1,
                      })),
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};