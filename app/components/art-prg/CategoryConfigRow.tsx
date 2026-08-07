import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { FaCheck, FaPen, FaXmark } from "react-icons/fa6";

type CategoryConfigRowProps = {
  category: {
    _id: Id<"categories">;
    name: string;
    colour?: string;
    cap?: {
      value: number;
    } | null;
  };
};

export function CategoryConfigRow({ category }: CategoryConfigRowProps) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.colour ?? "gray");
  const [cap, setCap] = useState(category.cap?.value ?? 0);

  const updateCategory = useMutation(api.projects.updateCategory);
    const [editing, setEditing] = useState(false);

    async function handleSave() {
    await updateCategory({
        categoryId: category._id,
        name,
        color,
        cap,
    });

        setEditing(false);
    }


    if (!editing) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#353d47] bg-[#1b2026] px-4 py-3">
      <div
        className="h-5 w-5 rounded-full border border-white/20"
        style={{ backgroundColor: color }}
      />

      <span className="flex-1 font-medium">{name}</span>

      <span className="text-sm text-slate-400">
        {cap.toLocaleString()} XP
      </span>

      <button
        onClick={() => setEditing(true)}
        className="rounded-md p-2 text-slate-400 transition hover:bg-[#2a313a] hover:text-white"
      >
        <FaPen />
      </button>
    </div>
  );
}

return (
  <div className="space-y-4 rounded-xl border border-[#353d47] bg-[#1b2026] p-4">
    <div className="flex gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-lg border border-[#4b5563] bg-[#11161b] px-3 py-2"
      />

      <input
        type="number"
        value={cap}
        onChange={(e) => setCap(Number(e.target.value))}
        className="w-32 rounded-lg border border-[#4b5563] bg-[#11161b] px-3 py-2"
      />
    </div>

    <div className="flex items-end justify-between gap-6">
      <div>
        <HexColorPicker
          className="h-28!"
          color={color}
          onChange={setColor}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setEditing(false)}
          className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300"
        >
          <FaXmark />
        </button>

        <button
          onClick={handleSave}
          className="rounded-lg border border-amber-700 bg-[#2b2315] px-4 py-2 text-amber-300"
        >
          <FaCheck />
        </button>
      </div>
    </div>
  </div>
  );
}