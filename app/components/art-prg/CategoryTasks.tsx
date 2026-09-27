import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getRankImage, useSkillRankImage, type ProjectName } from "~/constants/levels";
import { CompleteToast } from "./utils/CompleteToast";

type Category = {
  _id: Id<"categories">;
  name: string;
  cap: {value: number} | null;
  colour?: string 
};

type Task = {
  _id: Id<"tasks">;
  title: string;
  xpValue: number;
  categoryId: Id<"categories">;
};

type Rep = {
  _id: Id<"reps">;
  xpValue: number;
  categoryId?: Id<"categories">;
  taskId?: Id<"tasks">;
};

export type Props = {
  categories: Category[];
  tasks: Task[];
  reps: Rep[];
  projectId: Id<"projects">;
};

const achievementMilestoneRatios = [0.025, 0.05, 0.1, 0.25, 1] as const;
const achievementMilestoneRankLevels = [0, 7, 17, 30, 100] as const;


export function CategoryTaskTree({ categories, tasks, reps, projectId }: Props) {
  const taskMap = Object.fromEntries(tasks.map(t => [t._id, t]));

  const projectName = useQuery(api.projects.getProjectById, {
    projectId,
  })?.name as ProjectName 

  const sortedCategories = [...categories].sort((a, b) => (b.cap?.value ?? 0) - (a.cap?.value ?? 0));
  const activeAchievement = useQuery(api.projects.getActiveAchievement, { projectId });
  const completeAchievement = useMutation(api.projects.completeAchievementRep);
  const [completingActiveAchievement, setCompletingActiveAchievement] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [toastData, setToastData] = useState<{ title: string; description?: string } | null>(null);
  const categoryXpTotals: Record<string, number> = {};

  for (const rep of reps) {
    const categoryId = rep.categoryId || (rep.taskId ? taskMap[rep.taskId]?.categoryId : null);
    if (!categoryId) continue;
    categoryXpTotals[categoryId] = (categoryXpTotals[categoryId] || 0) + rep.xpValue;
  }

  return (
    <div className="space-y-2">
      {activeAchievement && (
        <button
          type="button"
          onClick={async () => {
            setCompletingActiveAchievement(true);
            try {
              await completeAchievement({ projectId, achievementId: activeAchievement._id });
              setToastData({ title: activeAchievement.name });
              setOpenToast(true);
            } catch {
              setToastData({ title: "Error", description: "Failed to increment achievement" });
              setOpenToast(true);
            } finally {
              setCompletingActiveAchievement(false);
            }
          }}
          disabled={completingActiveAchievement || activeAchievement.currentCount >= activeAchievement.total}
          aria-label={`Increment active achievement ${activeAchievement.name}`}
          className="w-full rounded-xl border border-amber-500 bg-linear-to-r from-[#2b2315] via-[#1d232b] to-[#171c22] p-4 text-left shadow-[0_0_16px_rgba(255,190,70,.12)] transition hover:border-amber-300 hover:brightness-110 disabled:cursor-default disabled:opacity-60"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-400">Active Quest</p>
              <h2 className="mt-1 font-semibold text-white">{activeAchievement.name}</h2>
              {activeAchievement.description && <p className="mt-1 text-xs text-slate-400">{activeAchievement.description}</p>}
            </div>
            <div className="text-right">
              <p className="font-semibold text-amber-300">{activeAchievement.currentCount.toLocaleString()}/{activeAchievement.total.toLocaleString()}</p>
              {activeAchievement.xpValue > 0 && <p className="mt-1 text-xs text-slate-400">+{activeAchievement.xpValue} XP per tap</p>}
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#2b323d]">
            <div className="h-full rounded-full bg-linear-to-r from-amber-700 to-yellow-300" style={{ width: `${Math.min(100, (activeAchievement.currentCount / activeAchievement.total) * 100)}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-1 border-t border-[#56482a] pt-3">
            {achievementMilestoneRatios.map((ratio, index) => {
              const milestone = Math.ceil(activeAchievement.total * ratio);
              const complete = activeAchievement.currentCount >= milestone;
              return (
                <div key={`${activeAchievement._id}-${milestone}`} className="flex justify-center">
                  <img
                    src={getRankImage(achievementMilestoneRankLevels[index])}
                    alt=""
                    aria-hidden="true"
                    className={`h-9 w-9 object-contain transition-all sm:h-10 sm:w-10 ${complete ? "drop-shadow-[0_0_8px_rgba(255,190,70,.45)]" : "grayscale brightness-50 opacity-30"}`}
                  />
                </div>
              );
            })}
          </div>
        </button>
      )}
      {sortedCategories.map(category => (
        <CategoryBranch
          key={category._id}
          projectId={projectId}
          category={category}
          tasks={tasks.filter(task => task.categoryId === category._id)}
          totalXp={categoryXpTotals[category._id] || 0}
          projectName={projectName}
          activeAchievementId={activeAchievement?._id}
        />
      ))}
      <CompleteToast setOpenToast={setOpenToast} toastData={toastData} openToast={openToast} />
    </div>
  );
}

function CategoryBranch({
  category,
  tasks,
  projectId,
  totalXp,
  projectName,
  activeAchievementId,
}: {
  category: Category;
  tasks: Task[];
  projectId: Id<"projects">;
  totalXp: number;
  projectName: ProjectName 
  activeAchievementId?: Id<"achievements">;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [xp, setXp] = useState("");

  const createTask = useMutation(api.projects.createTask);

  const completeTask = useMutation(api.projects.completeTask);
  const completeAchievment = useMutation(api.projects.completeAchievementRep)
  const achievements = useQuery(api.projects.getAchievements, {projectId})

  const handleAdd = async () => {
    if (!title.trim()) return;
    await createTask({
      title: title.trim(),
      xpValue: parseInt(xp) || 0,
      projectId,
      categoryId: category._id,
    });
    setTitle("");
    setXp("");
    setAdding(false);
  };

  const rankImage = useSkillRankImage(projectId, category.name, totalXp); 

  const cap = category?.cap?.value ?? 0
  const progress = Math.min(totalXp / cap, 1);

  const [openToast, setOpenToast] = useState(false);
  const [toastData, setToastData] = useState<{ title: string; description?: string } | null>(null);
  const color = category.colour ?? "gray"

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
    <Collapsible.Trigger asChild>
      <button className="group h-12 text-sm relative w-full overflow-hidden rounded-md border border-[#8d6d2c] bg-linear-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-left transition-all duration-300 hover:border-amber-400 hover:shadow-[0_0_18px_rgba(255,190,70,0.15)]">
        <div className="absolute inset-y-0 left-0 overflow-hidden transition-all duration-700" style={{ width: `${progress * 100}%` }}>
          <div className="h-full" style={{ background: `linear-gradient(90deg, ${color}AA 0%, ${color} 50%, ${color} 100%)` }} />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-black/20" />
        <div className="relative z-10 flex items-center justify-between px-4 py-2">
          <h3 className="text-sm font-semibold text-white">
            {category.name}
          </h3>

          <div className="absolute right-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {projectName && (
                <img
                  className="h-8 w-8"
                  src={rankImage}
                  alt="skill level"
                />
              )}
              <div className="text-sm w-28 font-semibold text-white text-right">
                {totalXp.toLocaleString()} / {cap.toLocaleString()}
              </div>
            </div>

            <div
              className={`text-xl text-amber-400 transition-transform duration-300 ${
                open ? "rotate-90" : ""
              }`}
            >
              ▶
            </div>
          </div>
        </div>
      </button>
    </Collapsible.Trigger>
    <Collapsible.Content className="mt-3 ml-3 space-y-3 border-l-2 border-[#8d6d2c]/40 pl-4">
      {achievements && achievements?.sort((a, b) => a.xpValue - b.xpValue).filter(ach => ach.categoryId == category._id && ach._id !== activeAchievementId).map(ach => (
      <div key={ach._id} onClick={async () => {
          try {
            await completeAchievment({ achievementId: ach._id, projectId });
            setToastData({ title: ach.name});
            setOpenToast(true);
          } catch {
            setToastData({ title: "Error", description: "Failed to complete task" });
            setOpenToast(true);
          } }}
        className="group cursor-pointer h-12 rounded-lg border border-[#3c4654] bg-linear-to-b from-[#1b2027] to-[#13181d] px-4 py-2 transition-all duration-300 hover:border-cyan-400 hover:bg-[#202833] hover:shadow-[0_0_12px_rgba(45,140,211,.25)]" >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white text-sm transition-colors group-hover:text-cyan-200">{ach.name}</p>
          </div>

          <div className="rounded-md border border-amber-700 bg-[#23211a] px-3 py-1 text-sm font-semibold text-amber-300">
            +{ach.xpValue} XP
          </div>
        </div>
      </div>
    ))}

      {tasks.length !== 0 && tasks.sort((a, b) => a.xpValue - b.xpValue).map(task => (
      <div key={task._id} onClick={async () => {
          try {
            await completeTask({ taskId: task._id, projectId });
            setToastData({ title: task.title});
            setOpenToast(true);
          } catch {
            setToastData({ title: "Error", description: "Failed to complete task" });
            setOpenToast(true);
          } }}
        className="group cursor-pointer h-12 rounded-lg border border-[#3c4654] bg-linear-to-b from-[#1b2027] to-[#13181d] px-4 py-2 transition-all duration-300 hover:border-cyan-400 hover:bg-[#202833] hover:shadow-[0_0_12px_rgba(45,140,211,.25)]" >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white text-sm transition-colors group-hover:text-cyan-200">{task.title}</p>
          </div>

          <div className="rounded-md border border-amber-700 bg-[#23211a] px-3 py-1 text-sm font-semibold text-amber-300">
            +{task.xpValue} XP
          </div>
        </div>
      </div>
    ))}

    {adding ? (
      <div className="rounded-xl border border-[#3b434f] bg-[#151a20] p-4">
        <div className="space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="Quest name..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            className="w-full rounded-md border border-[#505966] bg-[#101419] px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />

          <input
            type="number"
            placeholder="XP Reward"
            value={xp}
            onChange={e => setXp(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            className="w-full rounded-md border border-[#505966] bg-[#101419] px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="rounded-md border border-[#8d6d2c] bg-linear-to-b from-[#8d6d2c] to-[#6d531e] px-4 py-2 font-medium text-white transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,190,70,.2)]"
            >
              Create Quest
            </button>

            <button
              onClick={() => {
                setAdding(false);
                setTitle("");
                setXp("");
              }}
              className="rounded-md border border-slate-700 bg-[#171c22] px-4 py-2 text-slate-300 transition-all duration-300 hover:border-slate-500 hover:bg-[#232b33]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    ) : (
        <button
        onClick={() => setAdding(true)}
        className=" w-full rounded-xl border border-dashed border-[#4b5563] bg-[#13181d] px-4 py-3 text-left text-slate-400 transition hover:border-cyan-400 hover:bg-[#171d24] hover:text-white " >
        + Create Quest
        </button>
    )}
    </Collapsible.Content>
    <CompleteToast setOpenToast={setOpenToast} toastData={toastData} openToast={openToast}/>

    </Collapsible.Root>
  );
}
