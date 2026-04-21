import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Select from "@radix-ui/react-select";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export const CATEGORY_COLORS: Record<string, string> = {
  "design":               "#ef4444",
  "rendering":            "#f97316",
  "clothing & materials":  "#f59e0b",
  "colour theory":        "#84cc16",
  "visual library":       "#22c55e",
  "observation":          "#14b8a6",
  "composition":          "#0ea5e9",
  "form & construction":  "#6366f1",
  "perspective":          "#a855f7",
  "gesture":              "#ec4899",
  "anatomy":              "#f97316",
};

function getCategoryColor(categoryName?: string): string {
  if (!categoryName) return "#64748b"; // slate-500 fallback
  return CATEGORY_COLORS[categoryName.toLowerCase()] ?? "#64748b";
}

export const RepChecklist: React.FC = () => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [xpValue, setXpValue] = useState(10);
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  const reps = useQuery(api.projects.getIncompleteReps) as any;
  const categories = useQuery(api.projects.getAllCategories, adding ? {} : "skip");
  const completeRep = useMutation(api.projects.completeRep);
  const createRep = useMutation(api.projects.createChecklistRep);

  async function handleAdd() {
    if (!title.trim() || !categoryId) return;
    setSaving(true);
    try {
      await createRep({ categoryId: categoryId as Id<"categories">, xpValue, title });
      setTitle("");
      setXpValue(10);
      setCategoryId("");
      setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {reps === undefined ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : reps.length === 0 && !adding ? (
        <p className="text-sm text-slate-400">All tasks complete!</p>
      ) : (
        <ul className="space-y-2">
          {reps.map((rep: any) => {
            const categoryName =
              rep.categoryName ??
              rep.task?.categoryName ??
              rep.category?.name;
            const color = getCategoryColor(categoryName);

            return (
              <li key={rep._id} className="flex items-center gap-3">
                <Checkbox.Root
                  id={rep._id}
                  className="w-5 h-5 rounded flex items-center justify-center transition-colors focus:outline-none focus:ring-2 shrink-0"
                  style={{
                    border: `2px solid ${color}`,
                    backgroundColor: "rgb(2 6 23)", 
                    // @ts-ignore — inline CSS vars for focus ring colour
                    "--tw-ring-color": color,
                  }}
                  onCheckedChange={(checked) => {
                    if (checked) completeRep({ repId: rep._id as Id<"reps"> });
                  }}
                >
                  <Checkbox.Indicator>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Checkbox.Indicator>
                </Checkbox.Root>

                <label
                  htmlFor={rep._id}
                  className="text-sm text-slate-300 cursor-pointer select-none flex-1 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {rep.title ?? "Untitled rep"}
                  </span>
                  <span className="text-xs text-slate-500">{rep.xpValue} XP</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {adding ? (
        <div className="border border-slate-700 rounded-lg p-3 space-y-3 bg-slate-900">
          <input
            autoFocus
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
            placeholder="Rep name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />

          <Select.Root value={categoryId} onValueChange={setCategoryId}>
            <Select.Trigger className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <Select.Value placeholder={categories ? "Select category…" : "Loading…"} />
              <Select.Icon className="text-slate-400">▾</Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                <Select.Viewport className="p-1">
                  {categories?.map((cat) => {
                    const catColor = getCategoryColor(cat.name);
                    return (
                      <Select.Item
                        key={cat._id}
                        value={cat._id}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-white cursor-pointer hover:bg-slate-700 focus:bg-slate-700 outline-none"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: catColor }}
                        />
                        <Select.ItemText>{cat.name}</Select.ItemText>
                      </Select.Item>
                    );
                  })}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="XP value"
            value={xpValue}
            onChange={(e) => setXpValue(Number(e.target.value))}
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setAdding(false); setTitle(""); setCategoryId(""); setXpValue(10); }}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!title.trim() || !categoryId || !xpValue || saving}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving…" : "Add"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full px-3 py-1.5 rounded-lg border border-dashed border-slate-700 text-sm text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors"
        >
          + Add rep
        </button>
      )}
    </div>
  );
};