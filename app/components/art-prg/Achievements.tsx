import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { useState } from "react";
import { FaPlus, FaTrophy } from "react-icons/fa6";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getRankImage } from "~/constants/levels";
import { CloseButton } from "./utils/CloseButton";
import { ProjectButton } from "~/routes/home";

type Category = {
  _id: Id<"categories">;
  name: string;
};

type Entry = {
  id: string;
  categoryId: string;
  name: string;
  total: number;
  xpValue: number;
  description?: string
};

export type Props = {
  categories: Category[];
  projectId: Id<"projects">;
};

const blankEntry = (): Entry => ({
  id: crypto.randomUUID(),
  categoryId: "",
  name: "",
  total: 1,
  xpValue: 10,
  description: ""
});

const milestoneRatios = [0.025, 0.05, 0.1, 0.25, 1] as const;
const milestoneRankLevels = [0, 15, 35, 55, 98] as const;

export function Achievements({ categories, projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState<Id<"achievements"> | null>(null);
  const [entries, setEntries] = useState<Entry[]>([blankEntry()]);
  const achievements = useQuery(api.projects.getAchievements, { projectId });
  const createAchievement = useMutation(api.projects.createAchievement);
  const completeAchievementRep = useMutation(api.projects.completeAchievementRep);

  const categoryNames = new Map(categories.map((category) => [category._id, category.name]));
  const isValid = entries.every(
    (entry) => entry.categoryId && entry.name.trim() && Number.isFinite(entry.total) && entry.total > 0 && Number.isFinite(entry.xpValue) && entry.xpValue > 0
  );

  const resetEditor = () => {
    setEntries([blankEntry()]);
    setShowEditor(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetEditor();
  };

  const addEntry = () => setEntries((current) => [...current, blankEntry()]);

  const removeEntry = (id: string) => {
    setEntries((current) => current.length === 1 ? current : current.filter((entry) => entry.id !== id));
  };

  const updateEntry = (id: string, field: keyof Omit<Entry, "id">, value: string | number) => {
    setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, [field]: value } : entry));
  };

  const handleSave = async () => {
    if (!isValid) return;

    setSaving(true);
    try {
      await Promise.all(entries.map((entry) => createAchievement({
        projectId,
        categoryId: entry.categoryId as Id<"categories">,
        name: entry.name.trim(),
        total: entry.total,
        xpValue: entry.xpValue,
        description: entry.description
      })));
      resetEditor();
    } finally {
      setSaving(false);
    }
  };

  const handleAchievementClick = async (achievementId: Id<"achievements">) => {
    setCompletingId(achievementId);
    try {
      await completeAchievementRep({ projectId, achievementId });
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <ProjectButton icon={<FaTrophy />} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#8d6d2c] bg-gradient-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-white shadow-[0_0_50px_rgba(0,0,0,.7)]">
          <div className="h-0.75 w-full bg-linear-to-r from-[#6d531e] via-[#d4af37] to-[#6d531e]" />
          <div className="flex items-center justify-between border-b border-[#353d47] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-700 bg-[#2b2315] text-xl text-amber-300 sm:h-14 sm:w-14 sm:text-2xl">
                <FaTrophy />
              </div>
              <div>
                <p className="text-[8px] uppercase tracking-[0.22em] text-amber-500 sm:text-[10px] sm:tracking-[0.3em]">Achievement Hall</p>
                <Dialog.Title className="text-xl font-bold text-white sm:text-2xl">
                  {showEditor ? "Create Achievement" : "Achievements"}
                </Dialog.Title>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  {showEditor ? "Create one or more custom achievements." : "Track your progress across every achievement."}
                </p>
              </div>
            </div>
          </div>

          {showEditor ? (
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-3 hidden grid-cols-[1fr_1fr_100px_90px_36px] gap-3 px-1 md:grid">
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-500">Category</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-500">Achievement name</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-500">Final target</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-500">XP</span>
                <span />
              </div>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="grid grid-cols-2 items-center gap-2 rounded-xl border border-[#3b434f] bg-[#11161c] p-3 md:grid-cols-[1fr_1fr_100px_90px_40px] md:gap-3">
                    <Select.Root value={entry.categoryId} onValueChange={(value) => updateEntry(entry.id, "categoryId", value)}>
                      <Select.Trigger className="flex w-full items-center justify-between rounded-lg border border-[#4b5563] bg-[#161c23] px-2 py-2 text-xs text-white hover:border-amber-500 focus:border-amber-400 focus:outline-none sm:px-3 sm:py-2.5 sm:text-sm">
                        <Select.Value placeholder="Category..." />
                        <Select.Icon className="text-slate-400">▾</Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="z-50 overflow-hidden rounded-xl border border-[#8d6d2c] bg-[#171c22] shadow-[0_10px_30px_rgba(0,0,0,.6)]">
                          <Select.Viewport className="p-2">
                            {categories.map((category) => (
                              <Select.Item key={category._id} value={category._id} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-200 outline-none hover:bg-[#2b2315] hover:text-amber-300 focus:bg-[#2b2315] focus:text-amber-300">
                                <Select.ItemText>{category.name}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                    <input type="text" placeholder="Achievement name" value={entry.name} onChange={(event) => updateEntry(entry.id, "name", event.target.value)} className="w-full rounded-lg border border-[#4b5563] bg-[#161c23] px-2 py-2 text-xs text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none sm:px-3 sm:py-2.5 sm:text-sm" />
                    <input type="number" min={1} aria-label="Target" value={entry.total} onChange={(event) => updateEntry(entry.id, "total", Number(event.target.value))} className="w-full rounded-lg border border-[#4b5563] bg-[#161c23] px-2 py-2 text-center text-xs text-white focus:border-amber-400 focus:outline-none sm:px-3 sm:py-2.5 sm:text-sm" />
                    <input type="number" min={1} aria-label="XP reward" value={entry.xpValue} onChange={(event) => updateEntry(entry.id, "xpValue", Number(event.target.value))} className="w-full rounded-lg border border-[#4b5563] bg-[#161c23] px-2 py-2 text-center text-xs text-white focus:border-amber-400 focus:outline-none sm:px-3 sm:py-2.5 sm:text-sm" />
                    <input type="text"  aria-label="Description" value={entry.description} onChange={(event) => updateEntry(entry.id, "description", event.target.value)} className="w-full col-span-2 rounded-lg border border-[#4b5563] bg-[#161c23] px-2 py-2 text-center text-xs text-white focus:border-amber-400 focus:outline-none sm:px-3 sm:py-2.5 sm:text-sm" />
                    <button onClick={() => removeEntry(entry.id)} disabled={entries.length === 1} aria-label="Remove achievement" className="flex h-9 w-full items-center justify-center rounded-lg border border-[#4b5563] bg-[#161c23] text-xs text-slate-500 hover:border-red-500 hover:bg-red-900/20 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 md:h-10 md:w-10">✕</button>
                  </div>
                ))}
                <button onClick={addEntry} className="mt-4 flex w-full items-center justify-center rounded-xl border border-dashed border-amber-700 bg-[#11161c] py-2.5 text-xs font-medium text-amber-400 hover:border-amber-400 hover:bg-[#2b2315] sm:py-3 sm:text-sm">
                  + Add another achievement
                </button>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#353d47] pt-4">
                <button onClick={resetEditor} className="rounded-md px-3 py-2 text-xs text-slate-300 hover:text-white sm:px-4 sm:text-sm">Cancel</button>
                <button onClick={handleSave} disabled={!isValid || saving} className="h-9 rounded-md border border-amber-500 bg-linear-to-b from-[#8d6d2c] to-[#6d531e] px-3 text-xs font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-5 sm:text-sm">
                  {saving ? "Creating..." : `Create ${entries.length > 1 ? `${entries.length} achievements` : "achievement"}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              {achievements === undefined ? (
                <p className="py-10 text-center text-sm text-slate-400">Loading achievements...</p>
              ) : achievements.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#4b5563] bg-[#11161c] px-6 py-12 text-center">
                  <FaTrophy className="mx-auto mb-4 text-3xl text-amber-500" />
                  <p className="font-semibold text-white">No achievements yet</p>
                  <p className="mt-1 text-sm text-slate-400">Create a target for a skill you want to master.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {achievements.map((achievement) => {
                    const progress = Math.min(100, Math.round((achievement.currentCount / achievement.total) * 100));
                    const milestones = milestoneRatios.map((ratio) => Math.ceil(achievement.total * ratio));
                    const isComplete = achievement.currentCount >= achievement.total;
                    const isCompleting = completingId === achievement._id;
                    return (
                      <button
                        key={achievement._id}
                        type="button"
                        onClick={() => handleAchievementClick(achievement._id)}
                        disabled={isComplete || isCompleting}
                        aria-label={`Complete one rep for ${achievement.name} and earn ${achievement.xpValue} XP`}
                        className="w-full rounded-xl border border-[#3b434f] bg-[#11161c] p-4 text-left transition-all hover:border-amber-500 hover:bg-[#171c22] hover:shadow-[0_0_16px_rgba(255,190,70,.12)] focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:cursor-default disabled:hover:border-[#3b434f] disabled:hover:bg-[#11161c] disabled:hover:shadow-none"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500">{achievement.categoryId ? categoryNames.get(achievement.categoryId) ?? "Uncategorised" : "Uncategorised"}</p>
                            <h3 className="mt-1 font-semibold text-white">{achievement.name}</h3>
                            <p className="text-[10px] h-4 text-slate-400">{achievement.description}</p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-amber-300">
                            {achievement.currentCount.toLocaleString()}/{achievement.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#2b323d]">
                          <div className="h-full rounded-full bg-linear-to-r from-amber-700 to-yellow-300" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-4 grid grid-cols-5 gap-1 border-t border-[#353d47] pt-3">
                          {milestones.map((milestone, index) => {
                            const complete = achievement.currentCount >= milestone;
                            return (
                              <div key={`${achievement._id}-${milestone}-${index}`} className="flex justify-center">
                                <img
                                  src={getRankImage(milestoneRankLevels[index])}
                                  alt=""
                                  aria-hidden="true"
                                  className={`h-10 w-10 object-contain transition-all ${complete ? "drop-shadow-[0_0_8px_rgba(255,190,70,.45)]" : "grayscale brightness-50 opacity-30"}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-6 flex justify-end border-t border-[#353d47] pt-4">
                <button onClick={() => setShowEditor(true)} className="flex h-10 items-center gap-2 rounded-md border border-amber-500 bg-linear-to-b from-[#8d6d2c] to-[#6d531e] px-5 font-semibold text-white hover:brightness-110">
                  <FaPlus /> Create achievement
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-[#353d47] px-6 py-4">
            <Dialog.Close asChild><CloseButton /></Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
