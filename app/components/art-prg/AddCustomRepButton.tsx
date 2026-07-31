import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ProjectButton } from "~/routes/home";
import { CloseButton } from "./utils/CloseButton";
import { FaPlus } from "react-icons/fa";

interface CustomRepButtonProps {
  projectId: Id<"projects">;
}

interface RepEntry {
  id: number;
  categoryId: string;
  xpValue: number;
}

export const AddCustomRepButton: React.FC<CustomRepButtonProps> = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<RepEntry[]>([{ id: 0, categoryId: "", xpValue: 10 }]);
  const latestGroupId = useQuery(api.projects.getLatestGroupId, open ? {projectId} : "skip");
  const categories = useQuery(api.projects.getAllCategories, {projectId});
  const createRep = useMutation(api.projects.createChecklistRep);

  function addEntry() {
    setEntries((prev) => [...prev, { id: Date.now(), name: "", categoryId: "", xpValue: 10 }]);
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
      setName("");
      setEntries([{ id: 0, categoryId: "", xpValue: 10 }]);
    }
  }

  const [name, setName] = useState("");
  const isValid = name.trim() && entries.length > 0 && entries.every((e) => e.categoryId && e.xpValue > 0);

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    try {
      const groupId = entries.length > 1 ? (latestGroupId ?? 0) + 1 : undefined;
      await Promise.all(
        entries.map((e) =>
          createRep({
            projectId,
            title: name,
            categoryId: e.categoryId as Id<"categories">,
            xpValue: e.xpValue,
            ...(groupId !== undefined && { groupId }),
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
        <ProjectButton icon={<FaPlus/>}/>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#8d6d2c] bg-gradient-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-white shadow-[0_0_50px_rgba(0,0,0,.7)]">

        <div className="h-0.75 w-full bg-linear-to-r from-[#6d531e] via-[#d4af37] to-[#6d531e]" />
        <div className="flex items-center justify-between border-b border-[#353d47] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-700 bg-[#2b2315] text-2xl font-bold text-amber-300">
              +
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500">Quest Editor</p>
              <Dialog.Title className="text-2xl font-bold text-white">Create Custom Quest</Dialog.Title>
              <p className="mt-1 text-sm text-slate-400">Create one or more custom XP rewards.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-amber-500">Quest Name</label>
            <input
              className="w-full rounded-xl border border-[#3b434f] bg-[#11161c] px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-amber-400 focus:outline-none"
              placeholder="e.g. Anatomy Study"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3 grid grid-cols-[1fr_110px_36px] gap-3 px-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-500">Category</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-500">XP</span>
            <span />
          </div>

          <div className="space-y-3">
           {entries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[1fr_110px_40px] items-center gap-3 rounded-xl border border-[#3b434f] bg-[#11161c] p-3">

                <Select.Root value={entry.categoryId} onValueChange={(val: any) => updateEntry(entry.id, "categoryId", val)}>
                  <Select.Trigger className="flex w-full items-center justify-between rounded-lg border border-[#4b5563] bg-[#161c23] px-3 py-2.5 text-sm text-white transition-colors hover:border-amber-500 focus:border-amber-400 focus:outline-none">
                    <Select.Value placeholder="Select category..." />
                    <Select.Icon className="text-slate-400">▾</Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content className="z-50 overflow-hidden rounded-xl border border-[#8d6d2c] bg-[#171c22] shadow-[0_10px_30px_rgba(0,0,0,.6)]">
                      <Select.Viewport className="p-2">
                        {categories?.map((cat) => (
                          <Select.Item key={cat._id} value={cat._id} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-colors hover:bg-[#2b2315] hover:text-amber-300 focus:bg-[#2b2315] focus:text-amber-300">
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
                  value={entry.xpValue}
                  onChange={(e) => updateEntry(entry.id, "xpValue", Number(e.target.value))}
                  className="w-full rounded-lg border border-[#4b5563] bg-[#161c23] px-3 py-2.5 text-center text-white transition-colors focus:border-amber-400 focus:outline-none"
                />

                <button
                  onClick={() => removeEntry(entry.id)}
                  disabled={entries.length === 1}
                  aria-label="Remove row"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#4b5563] bg-[#161c23] text-slate-500 transition-all duration-300 hover:border-red-500 hover:bg-red-900/20 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30" >
                  ✕
                </button>

              </div>
            ))}

            <button
              onClick={addEntry}
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-dashed border-amber-700 bg-[#11161c] py-3 font-medium text-amber-400 transition-all duration-300 hover:border-amber-400 hover:bg-[#2b2315] hover:shadow-[0_0_12px_rgba(255,190,70,.15)]" >
              + Add Another Category
            </button>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#353d47] px-6 py-5">
              <Dialog.Close asChild>
                <CloseButton />
              </Dialog.Close>

              <button
                onClick={handleSave}
                disabled={!isValid || saving}
                className="rounded-lg border border-amber-700 bg-linear-to-b from-[#8d6d2c] to-[#6d531e] px-5 py-2.5 font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,190,70,.25)] disabled:cursor-not-allowed disabled:opacity-50" >
                {saving ? "Creating..." : `Create ${entries.length > 1 ? `${entries.length} Reps` : "Rep"}`}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};