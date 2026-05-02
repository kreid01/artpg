import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

interface RepEntry {
  id: number;
  categoryId: string;
  xpValue: number;
}

interface CustomRepButtonProps {
  projectId: Id<"projects">;
}

export const AddCustomRepButton: React.FC<CustomRepButtonProps> = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<RepEntry[]>([{ id: 0, categoryId: "", xpValue: 10 }]);
  const [saving, setSaving] = useState(false);

  const categories = useQuery(api.projects.getAllCategories);
  const createRep = useMutation(api.projects.createRep);

  function addEntry() {
    setEntries((prev) => [...prev, { id: Date.now(), categoryId: "", xpValue: 10 }]);
  }

  function removeEntry(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function updateEntry(id: number, field: keyof Omit<RepEntry, "id">, value: string | number) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setEntries([{ id: 0, categoryId: "", xpValue: 10 }]);
    }
  }

  const isValid = entries.length > 0 && entries.every((e) => e.categoryId && e.xpValue > 0);

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    try {
      await Promise.all(
        entries.map((e) =>
          createRep({
            categoryId: e.categoryId as Id<"categories">,
            xpValue: e.xpValue,
          })
        )
      );
      handleClose(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Trigger asChild>
        <button className="px-2 py-1 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
          + Custom
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 rounded-2xl shadow-xl p-6 w-full md:w-[50vw] max-h-[80vh] flex flex-col">
          <Dialog.Title className="text-lg font-semibold text-white mb-1">
            Add Custom Reps
          </Dialog.Title>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
            <div className="grid grid-cols-[1fr_100px_32px] gap-2 px-1">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Category</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">XP</span>
              <span />
            </div>

            {entries.map((entry, idx) => (
              <div key={entry.id} className="grid ml-1 grid-cols-[1fr_100px_32px] gap-2 items-center">
                <Select.Root
                  value={entry.categoryId}
                  onValueChange={(val) => updateEntry(entry.id, "categoryId", val)}
                >
                  <Select.Trigger className="w-full flex items-center justify-between border border-slate-700 text-white rounded-lg px-3 py-2 text-sm bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <Select.Value placeholder="Select…" />
                    <Select.Icon className="ml-2 text-slate-400 text-xs">▾</Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="z-50 text-white bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                      <Select.Viewport className="p-1">
                        {categories?.map((cat) => (
                          <Select.Item
                            key={cat._id}
                            value={cat._id}
                            className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-slate-700 focus:bg-emerald-700 outline-none"
                          >
                            <Select.ItemText>{cat.name}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>

                <input
                  type="number"
                  min={1}
                  className="w-full border border-slate-700 text-white bg-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={entry.xpValue}
                  onChange={(e) => updateEntry(entry.id, "xpValue", Number(e.target.value))}
                />

                <button
                  onClick={() => removeEntry(entry.id)}
                  disabled={entries.length === 1}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="Remove row"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={addEntry}
              className="mt-1 flex items-center gap-1.5 text-sm text-emerald-500 hover:text-emerald-400 transition-colors px-1" >
              <span className="text-base leading-none">+</span> Add another
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-500">
              Log {entries.length} rep{entries.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Dialog.Close asChild>
                <button className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
                disabled={!isValid || saving}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving…" : `Log ${entries.length > 1 ? `${entries.length} reps` : "rep"}`}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};