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
import {
  FaBookOpen,
  FaPalette,
  FaLaptopCode
} from "react-icons/fa";
import { GiMountainClimbing } from "react-icons/gi";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  const projects = useQuery(api.projects.getAllProjects);

  const [selectedProjectId, setSelectedProjectId] = useState<
    Id<"projects"> | undefined
  >();

  const projectId = selectedProjectId ?? projects?.[0]?._id;
  const artProjectId = projects?.[0]?._id;
  const climbingProjectId = projects?.[1]?._id;
  const scholarProjectId = projects?.[2]?._id;
  const engineerProjectId = projects?.[3]?._id;

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

  const changeProject = (id: Id<"projects"> | undefined) => {
    if (!artProjectId || !climbingProjectId || !scholarProjectId || !engineerProjectId) return;
    setSelectedProjectId(id)
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
        <div className="mt-2 flex w-full justify-between md:mt-0">
          <div className="flex gap-2">
            <AddJournalEntryButton />
            <AddCustomRepButton projectId={projectId} />
            <XPChartButton projectId={projectId} />
            <StatChartButton projectId={projectId} />
            <RewardTrackButton projectId={projectId} />
          </div>

          <div className="flex gap-2">
            <button className="px-2 py-1 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
              <FaPalette onClick={() => changeProject(artProjectId)}/>
            </button>

            <button className="px-2 py-1 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
              <GiMountainClimbing onClick={() => changeProject(climbingProjectId)}/>
            </button>

            <button className="px-2 py-1 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
              <FaBookOpen onClick={() => changeProject(scholarProjectId)}/>
            </button>

            <button className="px-2 py-1 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
              <FaLaptopCode onClick={() => changeProject(engineerProjectId)}/>
            </button>
          </div>
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