import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

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

type Props = {
  categories: Category[];
  tasks: Task[];
  projectId: Id<"projects">
};

export function CategoryTaskTree({ categories, tasks, projectId}: Props) {
  return (
    <div className="space-y-2 mx-40">
      {categories.map((category) => (
        <CategoryBranch
          projectId={projectId}
          key={category._id}
          category={category}
          tasks={tasks.filter((task) => task.categoryId === category._id)}
        />
      ))}
    </div>
  );
}

function CategoryBranch({
  category,
  tasks,
  projectId,
}: {
  category: Category;
  tasks: Task[];
  projectId: Id<"projects">
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

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
          <span className="font-medium">{category.name}</span>
          <span className="text-sm">{open ? "▼" : "▶"}</span>
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="ml-4 mt-2 space-y-1">
        {tasks.length === 0 ? (
          <div className="text-sm text-gray-400 px-2">No tasks</div>
        ) : (
          tasks.map((task) => (
            <div
              onClick={() => completeTask({ taskId: task._id })}
              key={task._id}
              className="px-3 py-1 rounded transition-colors cursor-pointer hover:bg-green-600"
            >
              {task.title} - {task.xpValue}xp
            </div>
          ))
        )}

        {adding ? (
          <div className="flex flex-col gap-2 px-2 pt-2">
            <input
              autoFocus
              type="text"
              placeholder="Task name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <input
              type="number"
              placeholder="XP"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => { setAdding(false); setTitle(""); setXp(""); }}
                className="text-sm text-gray-500 px-3 py-1 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="text-sm text-gray-400 hover:text-gray-600 px-2 py-1 w-full text-left"
          >
            + Add task
          </button>
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}