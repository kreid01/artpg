import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";

type Category = {
  _id: string;
  name: string;
};

type Task = {
  _id: string;
  title: string;
  categoryId: string;
};

type Props = {
  categories: Category[];
  tasks: Task[];
};

export function CategoryTaskTree({ categories, tasks }: Props) {
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <CategoryBranch
          key={category._id}
          category={category}
          tasks={tasks.filter(
            (task) => task.categoryId === category._id
          )}
        />
      ))}
    </div>
  );
}

function CategoryBranch({
  category,
  tasks,
}: {
  category: Category;
  tasks: Task[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      {/* Branch Header */}
      <Collapsible.Trigger asChild>
        <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
          <span className="font-medium">{category.name}</span>
          <span className="text-sm">
            {open ? "▼" : "▶"}
          </span>
        </button>
      </Collapsible.Trigger>

      {/* Branch Content */}
      <Collapsible.Content className="ml-4 mt-2 space-y-1">
        {tasks.length === 0 ? (
          <div className="text-sm text-gray-400 px-2">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="px-3 py-1 rounded hover:bg-gray-100 cursor-pointer"
            >
              {task.title}
            </div>
          ))
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}