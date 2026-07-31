import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { type ProjectId } from "./RepChecklist";
import { useState } from "react";
import { levels, type ProjectName } from "~/constants/levels";
import { Loader } from "./Loader";
import { getCategoryColours } from "~/constants/colours";
import { ProjectButton } from "~/routes/home";
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

function getCategoryColor(colours: Record<string, string>, categoryName?: string): string {
  if (!categoryName) return "#64748b";
  return colours[categoryName.toLowerCase()] ?? "#64748b";
}

export const GroupRepChecklist: React.FC<ProjectId> = ({projectId}) => {
  const groups = useQuery(api.projects.getRepGroups, {projectId});
  const createRepsFromGroup = useMutation(api.projects.createRepsFromGroup);
  const [completing, setCompleting] = useState<number | null>(null);


  const reps = useQuery(api.projects.getAllCompleteReps, {projectId});
  if (!reps) return <Loader/> 

  const projectName = useQuery(api.projects.getProjectById, {
    projectId,
  })?.name as ProjectName;


  const colours = getCategoryColours(projectName ?? "art")
  const [open, setOpen] = useState(true);
  
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
          className="
            group
            relative
            mb-4
            w-full
            overflow-hidden
            rounded-xl
            border
            border-[#8d6d2c]
            bg-linear-to-b
            from-[#1d232b]
            via-[#171c22]
            to-[#101419]
            text-left
            transition-all
            duration-300
            hover:border-amber-400
            hover:shadow-[0_0_18px_rgba(255,190,70,.15)]
          "
        >
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-black/20" />

          <div className="relative z-10 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-700 bg-[#2b2315] text-amber-300">
                <FaScroll />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">
                  Quest Log
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`text-xl text-amber-400 transition-transform duration-300 ${
                  open ? "rotate-90" : ""
                }`}
              >
                ▶
              </div>
            </div>
          </div>
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="space-y-3">
        {visibleGroups.map((group) => (
          <div
            key={group.groupId}
            className="
              rounded-xl
              border
              border-[#8d6d2c]
              bg-linear-to-b
              from-[#1b2027]
              via-[#171c22]
              to-[#111418]
              p-4
              shadow-md
              transition-all
              duration-300
              hover:border-amber-400
              hover:shadow-[0_0_18px_rgba(255,190,70,.15)]
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-amber-300">
                  {group.name}
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  Reward: +{group.totalXp.toLocaleString()} XP
                </p>
              </div>

              <ProjectButton
                icon={
                  <span className="text-sm font-semibold text-amber-400">
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