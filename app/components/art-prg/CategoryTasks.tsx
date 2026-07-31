import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getCategoryColours } from "~/constants/colours";
import { getXpCaps, type ProjectName } from "~/constants/levels";
import { CompleteToast } from "./utils/CompleteToast";

type Category = {
  _id: Id<"categories">;
  name: string;
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

type Props = {
  categories: Category[];
  tasks: Task[];
  reps: Rep[];
  projectId: Id<"projects">;
};


export function CategoryTaskTree({ categories, tasks, reps, projectId }: Props) {
  const taskMap = Object.fromEntries(tasks.map(t => [t._id, t]));

  const projectName = useQuery(api.projects.getProjectById, {
    projectId,
  })?.name as ProjectName 

  const xpCaps = getXpCaps(projectName ?? "art")
  const order = Object.keys(xpCaps);
  const colours = getCategoryColours(projectName ?? "art")

  const sortedCategories = [...categories].sort((a, b) => {
    const ai = order.indexOf(a.name.toLowerCase());
    const bi = order.indexOf(b.name.toLowerCase());
    const aIdx = ai === -1 ? Infinity : ai;
    const bIdx = bi === -1 ? Infinity : bi;
    return aIdx - bIdx;
  });

  const categoryXpTotals: Record<string, number> = {};

  for (const rep of reps) {
    const categoryId = rep.categoryId || (rep.taskId ? taskMap[rep.taskId]?.categoryId : null);
    if (!categoryId) continue;
    categoryXpTotals[categoryId] = (categoryXpTotals[categoryId] || 0) + rep.xpValue;
  }

  return (
    <div className="space-y-2">
      {sortedCategories.map(category => (
        <CategoryBranch
          key={category._id}
          projectId={projectId}
          category={category}
          tasks={tasks.filter(task => task.categoryId === category._id)}
          totalXp={categoryXpTotals[category._id] || 0}
          xpCaps={xpCaps}
          colours={colours}
        />
      ))}
    </div>
  );
}

function CategoryBranch({
  category,
  tasks,
  projectId,
  totalXp,
  xpCaps,
  colours
}: {
  category: Category;
  tasks: Task[];
  projectId: Id<"projects">;
  totalXp: number;
  xpCaps: Record<string, number>,
  colours: Record<string, string>
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [xp, setXp] = useState("");

  const createTask = useMutation(api.projects.createTask);

  const completeTask = useMutation(api.projects.completeTask);

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

  const cap = xpCaps[category.name.toLowerCase()] || 1;
  const progress = Math.min(totalXp / cap, 1);
  const color = colours[category.name.toLowerCase()] || "#64748b"; 

  const [openToast, setOpenToast] = useState(false);
  const [toastData, setToastData] = useState<{ title: string; description?: string } | null>(null);

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
          <div>
            <h3 className="text-sm font-semibold text-white">{category.name}</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{totalXp.toLocaleString()} / {cap.toLocaleString()}</div>
            </div>

            <div className={`text-xl text-amber-400 transition-transform duration-300 ${open ? "rotate-90" : ""}`}>
              ▶
            </div>
          </div>
        </div>
      </button>
    </Collapsible.Trigger>
    <Collapsible.Content className="mt-3 ml-3 space-y-3 border-l-2 border-[#8d6d2c]/40 pl-4">
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
