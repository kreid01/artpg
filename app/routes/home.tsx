import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CategoryTaskTree } from "~/components/art-prg/CategoryTasks";
import { SignIn, useUser } from "@clerk/react-router";
import { XPBar } from "~/components/art-prg/XPBar";
import { Loader } from "~/components/art-prg/utils/Loader";
import { GroupRepChecklist } from "~/components/art-prg/GroupRepChecklist";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { FaArrowLeft } from "react-icons/fa6";
import { getRankImage, useOverallLevels } from "~/constants/levels";
import clsx from "clsx";
import { BurgerMenu } from "~/components/art-prg/utils/BurgerMenu";
import { ProjectCard } from "~/components/art-prg/ProjectCard";

export interface ProjectId {
  projectId: Id<"projects">;
}

export type ProjectSummary = {
  _id: Id<"projects">;
  name: string;
  totalXp: number;
  weeklyGoal?: number;
  weeklyXp: number;
  categoryCount: number;
};

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects">>();
  const projects = useQuery(api.projects.getAllProjects);
  const summaries = useQuery(api.projects.getProjectSummaries) as ProjectSummary[] | undefined;
  const projectId = selectedProjectId;

  const categories = useQuery(api.projects.getByProject, projectId ? { projectId } : "skip");
  const reps = useQuery(api.projects.getAllCompleteReps, projectId ? { projectId } : "skip");
  const tasks = useQuery(api.projects.getTasksByProject, projectId ? { projectId } : "skip");

  const changeProject = (id: Id<"projects">) => {
    setSelectedProjectId((current) => current === id ? undefined : id);
  };

  if (!isLoaded) return <Loader />;
  if (!isSignedIn) return <SignIn />;
  if (!projects || !summaries) return <Loader />;

  if (!projectId) {
    return <AllProjectsDashboard summaries={summaries} onSelect={changeProject} />;
  }

  if (!categories || !reps || !tasks) return <Loader />;

  return (
    <div className="h-screen bg-slate-950 p-4">
      <XPBar
        projectId={projectId}
        actions={
          <>
            <button
              type="button"
              onClick={() => setSelectedProjectId(undefined)}
              aria-label="Back to all projects"
              className=" flex h-8 w-8 items-center justify-center rounded-md border border-[#8d6d2c] bg-linear-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-amber-300 transition-all hover:border-amber-400 hover:text-white hover:shadow-[0_0_15px_rgba(255,190,70,.25)] " >
              <FaArrowLeft /> 
            </button>
            <BurgerMenu projectId={projectId} categories={categories} tasks={tasks} reps={reps} />
          </>
        }
      />

      <div className="mx-5 mt-24 gap-5 lg:mx-40 lg:mt-28 lg:flex">
        <div className="lg:w-[70%] mb-2">
          <CategoryTaskTree reps={reps} tasks={tasks} categories={categories} projectId={projectId} />
        </div>

        <div className="mb-2 lg:w-[30%]">
          <GroupRepChecklist projectId={projectId} />
        </div>
      </div>
    </div>
  );
}

function AllProjectsDashboard({ summaries, onSelect }: { summaries: ProjectSummary[]; onSelect: (id: Id<"projects">) => void }) {
  const totalXp = summaries.reduce(
    (total, project) => total + project.totalXp,
    0
  );
  const weeklyXp = summaries.reduce((total, project) => total + project.weeklyXp, 0);
  const weeklyGoal = summaries.reduce((total, project) => total + (project.weeklyGoal ?? 0), 0);

  const overallLevels = useOverallLevels();

  if (!overallLevels) {
    return <div></div>; 
  }

  const currentLevel =
    [...overallLevels].reverse().find((level) => totalXp >= level.xp) ??
    overallLevels[0];

  const nextLevel = overallLevels.find((level) => level.level === currentLevel.level + 1);

  const rankProgress = nextLevel ? Math.min( 100, Math.round( ((totalXp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100)) : 100;
  const weeklyProgress = weeklyGoal > 0
    ? Math.min(100, Math.round((weeklyXp / weeklyGoal) * 100))
    : 100;

  return (
    <main className="min-h-screen bg-[#0b0f14] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 rounded-2xl border border-[#675226] bg-linear-to-br from-[#202733] via-[#151b23] to-[#0d1117] p-5 shadow-[0_0_30px_rgba(0,0,0,.35)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-400">Life</p>
              <p className="mt-2 text-sm text-slate-400">{totalXp.toLocaleString()} total XP</p>
            </div>
            <img src={getRankImage(currentLevel.level)} alt={`Overall level ${currentLevel.level} rank`} className="h-20 w-20 shrink-0 object-contain drop-shadow-[0_0_14px_rgba(255,215,120,.45)] sm:h-24 sm:w-24" />
          </div>
          <div className="mt-5 border-t border-[#3b434f] pt-4">
            <div className="flex items-end justify-between gap-3">
              <p className="text-lg font-bold text-white">Overall Level {currentLevel.level}</p>
              <p className="text-xs text-slate-400">{nextLevel ? `${rankProgress}% to next level` : "Maximum level"}</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#28313d]">
              <div className="h-full rounded-full bg-linear-to-r from-cyan-800 via-cyan-400 to-cyan-200" style={{ width: `${rankProgress}%` }} />
            </div>
            <div className="mt-5 border-t border-[#3b434f] pt-4">
              <div className="flex items-end justify-between gap-3">
                <p className="text-sm font-semibold text-amber-300">This Week</p>
                <p className="text-xs text-slate-400">
                  {weeklyGoal > 0 ? `${weeklyProgress}% of weekly goal` : "No weekly goal set"}
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#28313d]">
                <div className="h-full rounded-full bg-linear-to-r from-amber-800 via-amber-400 to-amber-200" style={{ width: `${weeklyProgress}%` }} />
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                {weeklyXp.toLocaleString()} / {weeklyGoal.toLocaleString()} XP
              </p>
            </div>
          </div>
        </header>

        <div className="mb-3 flex items-end justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">Project overview</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaries.map((project) => ( <ProjectCard key={project._id} onSelect={onSelect} project={project} />))}
        </div>
      </div>
    </main>
  );
}

type ProjectButtonProps = {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

export function ProjectButton({ icon, active = false, onClick }: ProjectButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group relative min-w-10 overflow-hidden rounded-lg border px-3 py-2 transition-all duration-300",
        "bg-linear-to-b from-[#1b2027] via-[#171c22] to-[#111418]",
        active
          ? "border-amber-400 shadow-[0_0_18px_rgba(255,190,70,.35)]"
          : "border-[#3c4654] hover:border-amber-500 hover:shadow-[0_0_14px_rgba(255,190,70,.15)]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-black/20" />
      <div className={clsx("absolute left-0 top-0 h-0.5 w-full transition-opacity", active ? "bg-linear-to-r from-amber-700 via-yellow-300 to-amber-700" : "bg-linear-to-r from-amber-700 via-yellow-300 to-amber-700 opacity-0 group-hover:opacity-100")} />
      <div className="relative flex items-center gap-3 text-sm">{icon}</div>
    </button>
  );
}
