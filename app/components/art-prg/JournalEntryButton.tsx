import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { FaBookOpen } from "react-icons/fa6";
import { ProjectButton } from "~/routes/home";
import { CloseButton } from "./utils/CloseButton";

export const AddJournalEntryButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [wins, setWins] = useState("");
  const [toImprove, setToImprove] = useState("");
  const [focus, setFocus] = useState("");

  const createJournalEntry = useMutation(api.projects.createJournalEntry);

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);

    if (!isOpen) {
      setWins("");
      setToImprove("");
      setFocus("");
    }
  }

  const isValid =
    wins.trim().length > 0 ||
    toImprove.trim().length > 0 ||
    focus.trim().length > 0;

  async function handleSave() {
    if (!isValid) return;

    setSaving(true);

    try {
      await createJournalEntry({
        wins,
        toImprove,
        focus,
      });

      handleClose(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Trigger asChild>
        <ProjectButton icon={<FaBookOpen/>}/>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#8d6d2c] bg-gradient-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-white shadow-[0_0_50px_rgba(0,0,0,.7)]">
            <div className="h-0.75 w-full bg-linear-to-r from-[#6d531e] via-[#d4af37] to-[#6d531e]" />
            <div className="flex items-center justify-between border-b border-[#353d47] px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-700 bg-[#2b2315] text-2xl text-amber-300">
                  <FaBookOpen />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500">Journal</p>
                  <Dialog.Title className="text-2xl font-bold text-white">Daily Reflection</Dialog.Title>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-amber-500">Wins</label>
                <textarea rows={4} value={wins} onChange={(e) => setWins(e.target.value)} placeholder="What went well today?" className="w-full rounded-xl border border-[#3b434f] bg-[#11161c] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none" />
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-amber-500">Areas To Improve</label>
                <textarea rows={4} value={toImprove} onChange={(e) => setToImprove(e.target.value)} placeholder="What could have gone better?" className="w-full rounded-xl border border-[#3b434f] bg-[#11161c] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none" />
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-amber-500">Next Focus</label>
                <textarea rows={3} value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="What is tomorrow's main objective?" className="w-full rounded-xl border border-[#3b434f] bg-[#11161c] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#353d47] px-6 py-5">
              <Dialog.Close asChild>
                <CloseButton />
              </Dialog.Close>

              <button
                onClick={handleSave}
                disabled={!isValid || saving}
                className="rounded-md h-10 text-md border border-amber-500 bg-linear-to-b from-[#8d6d2c] to-[#6d531e] px-5 py-1 font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,190,70,.25)] disabled:cursor-not-allowed disabled:opacity-50" >
                {saving ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};