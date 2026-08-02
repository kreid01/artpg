import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CategoryTaskTree } from "~/components/art-prg/CategoryTasks";
import { SignIn, useUser } from "@clerk/react-router";
import { XPBar } from "~/components/art-prg/XPBar";
import { Loader } from "~/components/art-prg/utils/Loader";
import { GroupRepChecklist } from "~/components/art-prg/GroupRepChecklist";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import {
  FaBookOpen,
  FaPalette,
  FaLaptopCode
} from "react-icons/fa";
import { GiMountainClimbing } from "react-icons/gi";

export interface ProjectId {
  projectId: Id<'projects'>
}

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
        <div className="mt-2 flex w-full justify-between">
          <BurgerMenu projectId={projectId} categories={categories} tasks={tasks} reps={reps}/>

          <div className="flex gap-3">
            <div className="flex gap-2">
              <ProjectButton
                icon={<FaPalette />}
                active={projectId === artProjectId}
                onClick={() => changeProject(artProjectId)}
              />

              <ProjectButton
                icon={<GiMountainClimbing />}
                active={projectId === climbingProjectId}
                onClick={() => changeProject(climbingProjectId)}
              />

              <ProjectButton
                icon={<FaBookOpen />}
                active={projectId === scholarProjectId}
                onClick={() => changeProject(scholarProjectId)}
              />

              <ProjectButton
                icon={<FaLaptopCode />}
                active={projectId === engineerProjectId}
                onClick={() => changeProject(engineerProjectId)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-5 gap-5 lg:mx-40 lg:flex">
        <div className="lg:w-[30%] mb-2">
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

import clsx from "clsx";
import { BurgerMenu } from "~/components/art-prg/utils/BurgerMenu";

type ProjectButtonProps = {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

export function ProjectButton({
  icon,
  active = false,
  onClick,
}: ProjectButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group relative overflow-hidden min-w-10 rounded-lg border px-3 py-2 transition-all duration-300",
        "bg-linear-to-b from-[#1b2027] via-[#171c22] to-[#111418]",
        active
          ? "border-amber-400 shadow-[0_0_18px_rgba(255,190,70,.35)]"
          : "border-[#3c4654] hover:border-amber-500 hover:shadow-[0_0_14px_rgba(255,190,70,.15)]"
      )} >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-black/20" />
      <div
        className={clsx(
          "absolute left-0 top-0 h-0.5 w-full transition-opacity",
          active
            ? "bg-linear-to-r from-amber-700 via-yellow-300 to-amber-700"
            : "opacity-0 group-hover:opacity-100 bg-linear-to-r from-amber-700 via-yellow-300 to-amber-700"
        )} />

      <div className="relative text-sm flex items-center gap-3">
        {icon}
      </div>
    </button>
  );
}