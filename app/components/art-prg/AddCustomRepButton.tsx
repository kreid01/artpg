import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

interface CustomRepButtonProps  {
 projectId: Id<"projects">
}

export const AddCustomRepButton: React.FC<CustomRepButtonProps> = ({projectId}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const [xpValue, setXpValue] = useState(10);
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = useQuery(api.projects.getAllCategories);
  const createRep = useMutation(api.projects.createRep);

  async function handleSave() {
    if (!title.trim() || !categoryId) return;
    setSaving(true);
    try {
      await createRep({ categoryId: categoryId as Id<"categories">, xpValue });
      setOpen(false);
      setTitle("");
      setXpValue(0)
      setCategoryId("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-2 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
          + Custom 
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 rounded-2xl shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold mb-1">
            Add Custom Rep
          </Dialog.Title>
          <Dialog.Description className="text-sm text-white mb-4">
            Name your task and pick a category.
          </Dialog.Description>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Task Name
            </label>
            <input
              className="w-full border text-white border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Anatomy Study"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select.Root value={categoryId} onValueChange={setCategoryId}>
              <Select.Trigger className="w-full flex items-center justify-between border text-white border-gray-300 rounded-lg px-3 py-2 text-sm bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Select.Value placeholder="Select a category…" />
                <Select.Icon className="ml-2 text-white">▾</Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content className="z-50 text-white bg-slate-950 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <Select.Viewport className="p-1">
                    {categories?.map((cat) => (
                      <Select.Item
                        key={cat._id}
                        value={cat._id}
                        className="flex items-center px-3 py-2 text-sm bg-slate-950 rounded-md text-white cursor-pointer hover:bg-slate-700 focus:bg-emerald-700 outline-none"
                      >
                        <Select.ItemText>{cat.name}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-1">
              XP Value
            </label>
            <input
              type="number"
              className="w-full border text-white border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 10"
              value={xpValue}
              onChange={(e) => setXpValue(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="px-2 py-1 rounded border text-sm text-gray-600 bg-gray-100 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={!title.trim() || !categoryId || !xpValue || saving}
              className="px-2 py-1 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}