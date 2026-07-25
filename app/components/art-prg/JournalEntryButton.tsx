import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { FaBookOpen } from "react-icons/fa6";

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
        <button className="px-2 py-1 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
          <FaBookOpen/>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 rounded-2xl shadow-xl p-6 w-full max-w-xl flex flex-col">
          <Dialog.Title className="text-lg font-semibold text-white mb-5">
            Daily Journal
          </Dialog.Title>

          <div className="space-y-5">
            <div>
              <label className="block text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
                Wins
              </label>

              <textarea
                rows={4}
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="What went well this week?"
                className="w-full border border-slate-700 text-white bg-slate-900 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
                What could improve?
              </label>

              <textarea
                rows={4}
                value={toImprove}
                onChange={(e) => setToImprove(e.target.value)}
                placeholder="What could have gone better?"
                className="w-full border border-slate-700 text-white bg-slate-900 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
                Next Weeks Focus
              </label>

              <textarea
                rows={3}
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="What's the main thing to focus on next week?"
                className="w-full border border-slate-700 text-white bg-slate-900 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-800">
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
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};