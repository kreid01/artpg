import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import * as Toast from "@radix-ui/react-toast";
import { CATEGORY_COLORS } from "~/constants/colours";

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

const CATEGORY_XP_CAPS: Record<string, number> = {
  "design":               70000,
  "form & construction":  60000,
  "value & light":        50000,
  "colour theory":        20000,
  "visual library":       30000,
  "composition":          20000,
  "gesture":              20000,
  "anatomy":              20000,
  "clothing & materials": 15000,
  "rendering":            15000,
  "perspective":          15000,
};


export function CategoryTaskTree({ categories, tasks, reps, projectId }: Props) {
  const taskMap = Object.fromEntries(tasks.map(t => [t._id, t]));

  const categoryXpTotals: Record<string, number> = {};

  for (const rep of reps) {
    const categoryId = rep.categoryId || (rep.taskId ? taskMap[rep.taskId]?.categoryId : null);
    if (!categoryId) continue;
    categoryXpTotals[categoryId] = (categoryXpTotals[categoryId] || 0) + rep.xpValue;
  }

  return (
    <div className="space-y-2">
      {categories.map(category => (
        <CategoryBranch
          key={category._id}
          projectId={projectId}
          category={category}
          tasks={tasks.filter(task => task.categoryId === category._id)}
          totalXp={categoryXpTotals[category._id] || 0}
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
}: {
  category: Category;
  tasks: Task[];
  projectId: Id<"projects">;
  totalXp: number;
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

  const cap = CATEGORY_XP_CAPS[category.name.toLowerCase()] || 1;
  const progress = Math.min(totalXp / cap, 1);
  const color = CATEGORY_COLORS[category.name.toLowerCase()] || "#64748b"; 

  const [openToast, setOpenToast] = useState(false);
  const [toastData, setToastData] = useState<{ title: string; description?: string } | null>(null);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button className="w-full relative text-left rounded border overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full transition-all duration-500"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: color,
              opacity: 1,
            }}
          />
          <div className="flex justify-between items-center relative z-10 px-3 py-2 text-white">
            <span className="font-medium">
              {category.name}
            </span>
            <span className="text-sm">
              {totalXp} / {cap} XP
              {" "}{open ? "▼" : "▶"}
            </span>
          </div>
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="ml-4 mt-2 space-y-1">
        {tasks.length !== 0 &&
          tasks.sort((a, b) => a.xpValue - b.xpValue).map(task => (
            <div onClick={async () => {
                try {
                  await completeTask({ taskId: task._id });
                  setToastData({ title: `${task.title} completed` });
                  setOpenToast(true);
                } catch {
                  setToastData({
                    title: "Error",
                    description: "Failed to complete task",
                  });
                  setOpenToast(true);
                }
              }}
              key={task._id}
              className="px-3 py-1 rounded border text-white cursor-pointer hover:bg-emerald-700" >
              {task.title} - {task.xpValue}xp
            </div>
          ))}

        {adding ? (
          <div className="flex flex-col gap-2 px-2 pt-2">
            <input
              autoFocus
              type="text"
              placeholder="Task name"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="border rounded px-2 py-1 text-white text-sm w-full"
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <input
              type="number"
              placeholder="XP value"
              value={xp}
              onChange={e => setXp(e.target.value)}
              className="border rounded px-2 py-1 text-white text-sm w-full"
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="text-sm bg-emerald-700 text-white px-3 py-1 rounded hover:bg-emerald-600"
              >
                Add
              </button>
              <button
                onClick={() => { setAdding(false); setTitle(""); setXp(""); }}
                className="text-sm text-white border px-3 py-1 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="text-sm text-gray-400 rounded border h-8 hover:text-white px-2 py-1 w-full text-left"
          >
            + Add task
          </button>
        )}
      </Collapsible.Content>
      <Toast.Root
        open={openToast}
        onOpenChange={setOpenToast}
        className="fixed bottom-6 right-6 bg-emerald-900 text-white px-4 py-3 rounded-lg shadow-lg border border-emerald-700" >
        <Toast.Title className="font-semibold">
          {toastData?.title}
        </Toast.Title>
        {toastData?.description && (
          <Toast.Description className="text-sm text-slate-400">
            {toastData.description}
          </Toast.Description>
        )}
      </Toast.Root>

      <Toast.Viewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-2 w-[320px] max-w-full z-50" />
    </Collapsible.Root>
  );
}
