import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { FaSliders } from "react-icons/fa6";
import { ProjectButton } from "~/routes/home";
import { CloseButton } from "./utils/CloseButton";
import type { Id } from "convex/_generated/dataModel";

type Props = {
  projectId: Id<"projects">;
};

export const ConfigureCapsButton: React.FC<Props> = ({ projectId }) => {
  const [open, setOpen] = useState(false);

  const categories = useQuery(api.projects.getByProject, {
    projectId,
  });

  const upsertCap = useMutation(api.projects.upsertCap);

  async function handleChange(categoryId: Id<"categories">, value: number) {
    await upsertCap({
      categoryId,
      value,
    });
  }

    const [newCategory, setNewCategory] = useState("");
    const [adding, setAdding] = useState(false);

    const createCategory = useMutation(api.projects.createCategory);

    async function handleAddCategory() {
        if (!newCategory.trim()) return;

        setAdding(true);

        try {
            await createCategory({
            projectId,
            name: newCategory.trim(),
            });

            setNewCategory("");
        } finally {
            setAdding(false);
        }
    }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <ProjectButton icon={<FaSliders />} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#8d6d2c] bg-gradient-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-white shadow-[0_0_50px_rgba(0,0,0,.7)]">
          <div className="h-0.75 w-full bg-linear-to-r from-[#6d531e] via-[#d4af37] to-[#6d531e]" />

          <div className="flex items-center justify-between border-b border-[#353d47] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-700 bg-[#2b2315] text-2xl text-amber-300">
                <FaSliders />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500">
                  Configuration
                </p>

                <Dialog.Title className="text-2xl font-bold">
                  Category Caps
                </Dialog.Title>
              </div>
            </div>

            <Dialog.Close asChild>
                <CloseButton />
            </Dialog.Close>
          </div>

          <div className="space-y-4 p-6 max-h-[60vh] overflow-scroll">
            {categories === undefined && (
              <p className="text-sm text-gray-400">Loading...</p>
            )}

            {categories?.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between rounded-xl border border-[#353d47] bg-[#1b2026] p-4"
              >
                <span className="font-medium">{category.name}</span>

                <input
                  type="number"
                  min={0}
                  defaultValue={category.cap?.value ?? 0}
                  className="w-24 rounded-lg border border-[#4b5563] bg-[#11161b] px-3 py-2 text-right outline-none focus:border-amber-500"
                  onBlur={(e) =>
                    handleChange(category._id, Number(e.target.value))
                  }
                />
              </div>
            ))}

            <div className="mt-6 rounded-xl border border-[#353d47] bg-[#1b2026] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                    Add Category
                </p>

                <div className="flex gap-3">
                    <input
                    type="text"
                    placeholder="Category name..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCategory()
                    }}
                    className="flex-1 rounded-lg border border-[#4b5563] bg-[#11161b] px-3 py-2 outline-none focus:border-amber-500"
                    />

                    <button
                    disabled={adding || !newCategory.trim()}
                    onClick={handleAddCategory}
                    className="rounded-lg border border-amber-700 bg-[#2b2315] px-4 py-2 font-medium text-amber-300 transition hover:bg-[#352b18] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                    Add
                    </button>
                </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};