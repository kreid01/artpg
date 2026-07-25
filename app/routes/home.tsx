import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CategoryTaskTree } from "~/components/art-prg/CategoryTasks";
import { SignIn, useUser } from "@clerk/react-router";
import { XPBar } from "~/components/art-prg/XPBar";
import { Loader } from "~/components/art-prg/Loader";
import { AddCustomRepButton } from "~/components/art-prg/AddCustomRepButton";
import { RewardTrackButton } from "~/components/art-prg/RewardTrackButton";
import { StatChartButton } from "~/components/art-prg/StatChartButton";
import { XPChartButton } from "~/components/art-prg/XPChartButton";
import { GroupRepChecklist } from "~/components/art-prg/GroupRepChecklist";
import { AddJournalEntryButton } from "~/components/art-prg/JournalEntryButton";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { FaArrowRightArrowLeft } from "react-icons/fa6";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  const projects = useQuery(api.projects.getAllProjects);

  const [selectedProjectId, setSelectedProjectId] = useState<
    Id<"projects"> | undefined
  >();

  const projectId = selectedProjectId ?? projects?.[0]?._id;

  const artProjectId = projects?.[0]?._id;
  const climbingProjectId = projects?.[1]?._id;

  const categories = useQuery(
    api.projects.getAllCategories,
    projectId ? { projectId } : "skip"
  );

  const reps = useQuery(
    api.projects.getAllCompleteReps,
    projectId ? { projectId } : "skip"
  );

  const tasks = useQuery(
    api.projects.getTasksByProject,
    projectId ? { projectId } : "skip"
  );

  const changeProject = () => {
    if (!artProjectId || !climbingProjectId) return;

    if (!selectedProjectId) {
      setSelectedProjectId(climbingProjectId)
      return
    }

    setSelectedProjectId((prev) =>
      prev === artProjectId ? climbingProjectId : artProjectId
    );
  };

  if (!isLoaded) return <Loader />;
  if (!isSignedIn) return <SignIn />;

  if (!projects || !projectId || !categories || !reps || !tasks) {
    return <Loader />;
  }

  return (
    <div className="h-screen bg-slate-950 p-4">
      <XPBar projectId={projectId} />

      <div className="mx-5 mt-32 mb-5 justify-between text-white md:flex lg:mx-40">
        <div className="mt-2 flex gap-2 md:mt-0">
          <button
            onClick={changeProject}
            className="rounded bg-emerald-700 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <FaArrowRightArrowLeft/>
          </button>

          <AddJournalEntryButton />
          <AddCustomRepButton projectId={projectId} />
          <XPChartButton projectId={projectId} />
          <StatChartButton projectId={projectId} />
          <RewardTrackButton projectId={projectId} />
        </div>
      </div>

      <div className="mx-5 gap-5 lg:mx-40 lg:flex">
        <div className="mb-10 lg:mb-0 lg:w-[30%]">
          <GroupRepChecklist projectId={projectId} />
        </div>

        <div className="lg:w-[70%]">
          <CategoryTaskTree
            reps={reps}
            tasks={tasks}
            categories={categories}
            projectId={projectId}
          />
        </div>
      </div>
    </div>
  );
}