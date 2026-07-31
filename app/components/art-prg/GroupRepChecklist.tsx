import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { type ProjectName } from "~/constants/levels";
import { Loader } from "./utils/Loader";
import { ProjectButton, type ProjectId } from "~/routes/home";
import * as Collapsible from "@radix-ui/react-collapsible";
import { FaScroll } from "react-icons/fa";

const hidden = [
  "Extraction / Design", 
  "Prop Ideation", 
  "Synthesis Design", 
  "Focused Render Study", 
  "Integrated Design Session",
  "Limited Palette Study"
];

export const GroupRepChecklist: React.FC<ProjectId> = ({projectId}) => {
  const groups = useQuery(api.projects.getRepGroups, {projectId});
  const createRepsFromGroup = useMutation(api.projects.createRepsFromGroup);
  const [completing, setCompleting] = useState<number | null>(null);

  const reps = useQuery(api.projects.getAllCompleteReps, {projectId});
  if (!reps) return <Loader/> 

  const [open, setOpen] = useState(false);
  
  if (groups === undefined) return <p className="text-sm text-slate-400">Loading…</p>;
  if (groups.length === 0) return <div></div> 

  const visibleGroups = groups.filter((group) => {
    if (hidden.includes(group.name)) return false;
    return true;
  });


  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button
          className=" group relative h-14 mb-4 w-full overflow-hidden rounded-md border border-[#8d6d2c] bg-linear-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-left transition-all duration-300 hover:border-amber-400 hover:shadow-[0_0_18px_rgba(255,190,70,.15)] " >
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-black/20" />

          <div className="relative z-10 flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-700 bg-[#2b2315] text-amber-300">
                <FaScroll />
              </div>

              <div>
                <h3 className="text-md font-semibold text-white">
                  Quest Log
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`text-lg text-amber-400 transition-transform duration-300 ${ open ? "rotate-90" : "" }`} > 
                ▶
              </div>
            </div>
          </div>
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="space-y-3">
        {visibleGroups.map((group, index) => (
          <div
            key={group.groupId}
            className="rounded-md text-sm border border-[#8d6d2c] bg-linear-to-b from-[#1b2027] via-[#171c22] to-[#111418] p-4 shadow-md opacity-0 animate-[fadeIn_.35s_ease_forwards] transition-all duration-300 hover:border-amber-400 hover:shadow-[0_0_18px_rgba(255,190,70,.15)]"
            style={{ animationDelay: `${index * 10}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-amber-300">
                  {group.name} 
                  <span className="mt-1 pl-2 text-xs text-slate-500">
                     +{group.totalXp.toLocaleString()} XP
                  </span>
                </h4>

              </div>

              <ProjectButton
                icon={
                  <span className="text-xs font-semibold text-white">
                    {completing === group.groupId
                      ? "Logging..."
                      : "Complete"}
                  </span>
                }
                onClick={async () => {
                  setCompleting(group.groupId);

                  try {
                    await createRepsFromGroup({
                      groupId: group.groupId,
                      projectId,
                    });
                  } finally {
                    setCompleting(null);
                  }
                }}
              />
            </div>
          </div>
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}