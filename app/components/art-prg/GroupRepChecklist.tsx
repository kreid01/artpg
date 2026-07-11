import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { CATEGORY_COLORS } from "./RepChecklist";
import { useState } from "react";
import { levels } from "~/constants/levels";
import { Loader } from "./Loader";

const hidden = [
  "Extraction / Design", 
  "Prop Ideation", 
  "Synthesis Design", 
  "Focused Render Study", 
  "Integrated Design Session",
  "Limited Palette Study"
];

function getCategoryColor(categoryName?: string): string {
  if (!categoryName) return "#64748b";
  return CATEGORY_COLORS[categoryName.toLowerCase()] ?? "#64748b";
}

export const GroupRepChecklist: React.FC = () => {
  const groups = useQuery(api.projects.getRepGroups);
  const createRepsFromGroup = useMutation(api.projects.createRepsFromGroup);
  const [completing, setCompleting] = useState<number | null>(null);


  const reps = useQuery(api.projects.getAllCompleteReps);
  if (!reps) return <Loader/> 

  const LEVELS = levels();

  const totalXp = reps.reduce((sum, rep) => sum + rep.xpValue, 0);
  
  let currentLevel = LEVELS[0];
  for (let i = 0; i < LEVELS.length - 1; i++) {
    if (totalXp >= LEVELS[i].xp && totalXp < LEVELS[i + 1].xp) {
      currentLevel = LEVELS[i];
      break;
    }
  }
  if (totalXp >= LEVELS[LEVELS.length - 1].xp) {
    currentLevel = LEVELS[LEVELS.length - 1];
  }


  if (groups === undefined) return <p className="text-sm text-slate-400">Loading…</p>;
  if (groups.length === 0) return <div></div> 

  const visibleGroups = groups.filter((group) => {
    if (hidden.includes(group.name)) return false;
    return true;
  });

  return (
    <ul className="space-y-2 mt-5">
      {visibleGroups.map((group) => (
        <li key={group.groupId} className="flex items-center gap-3">
          <div className="flex-1 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-slate-300">{group.name}</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {group.entries.map((entry, i) => {
                  const color = getCategoryColor(entry.categoryName);
                  return (
                    <span key={i} className="flex items-center gap-1 text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      {entry.categoryName}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 ml-3 shrink-0">
              <span className="text-xs text-slate-500">{group.totalXp.toLocaleString()} XP</span>
              <button
                disabled={completing === group.groupId}
                onClick={async () => {
                  setCompleting(group.groupId);
                  try {
                    await createRepsFromGroup({ groupId: group.groupId });
                  } finally {
                    setCompleting(null);
                  }
                }}
                className="px-2 py-1 rounded bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {completing === group.groupId ? "Logging…" : "Log"}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};