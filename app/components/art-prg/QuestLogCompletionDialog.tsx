import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";

type Props = {
  groupName: string;
  fullXp: number;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onConfirm: (multiplier: 1 | 0.5) => Promise<void>;
};

export function QuestLogCompletionDialog({
  groupName,
  fullXp,
  open,
  saving,
  onClose,
  onConfirm,
}: Props) {
  const [multiplier, setMultiplier] = useState<1 | 0.5>(1);

  useEffect(() => {
    if (open) setMultiplier(1);
  }, [open]);

  const handleConfirm = async () => {
    await onConfirm(multiplier);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#8d6d2c] bg-gradient-to-b from-[#1d232b] via-[#171c22] to-[#101419] p-6 text-white shadow-[0_0_50px_rgba(0,0,0,.7)] focus:outline-none">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-400">Complete quest log</p>
          <Dialog.Title className="mt-2 text-xl font-bold">{groupName}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-slate-400">
            How much of this quest log did you complete?
          </Dialog.Description>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMultiplier(1)}
              className={`rounded-xl border p-4 text-left transition ${multiplier === 1 ? "border-amber-400 bg-[#2b2315] shadow-[0_0_14px_rgba(255,190,70,.16)]" : "border-[#3b434f] bg-[#11161c] hover:border-amber-700"}`}
            >
              <span className="block font-semibold text-white">Full</span>
              <span className="mt-1 block text-xs text-amber-300">+{fullXp.toLocaleString()} XP</span>
            </button>
            <button
              type="button"
              onClick={() => setMultiplier(0.5)}
              className={`rounded-xl border p-4 text-left transition ${multiplier === 0.5 ? "border-amber-400 bg-[#2b2315] shadow-[0_0_14px_rgba(255,190,70,.16)]" : "border-[#3b434f] bg-[#11161c] hover:border-amber-700"}`}
            >
              <span className="block font-semibold text-white">Half</span>
              <span className="mt-1 block text-xs text-amber-300">+{(fullXp * 0.5).toLocaleString()} XP</span>
            </button>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-md px-4 py-2 text-sm text-slate-300 hover:text-white disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={() => void handleConfirm()} disabled={saving} className="rounded-md border border-amber-500 bg-linear-to-b from-[#8d6d2c] to-[#6d531e] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-60">
              {saving ? "Logging..." : "Confirm completion"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
