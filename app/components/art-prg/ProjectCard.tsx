import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { getRankImage, useProjectLevels } from "~/constants/levels";
import type { ProjectSummary } from "~/routes/home";

interface ProjectCardProps {
    project: ProjectSummary 
    onSelect: (id: Id<"projects">) => void
}

export const ProjectCard:React.FC<ProjectCardProps> = ({project, onSelect}) => {
    const projectLevels = useProjectLevels(project._id);
    const weeklyXp = useQuery(api.projects.getWeeklyXpByProject, {projectId: project._id})

    if (!projectLevels) return null;

    const currentLevel =
    [...projectLevels].reverse().find(
        (level) => project.totalXp >= level.xp
    ) ?? projectLevels[0];

    const nextLevel = projectLevels.find((level) => level.level === currentLevel.level + 1);

    const progress = nextLevel ? Math.min( 100, Math.round( ((project.totalXp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100)) : 100;
    const weeklyProgress = project.weeklyGoal && project.weeklyGoal > 0 ? Math.min(100, Math.round(((weeklyXp ?? 0) / project.weeklyGoal) * 100)) : 100;

    return (
            <button
            key={project._id}
            type="button"
            onClick={() => onSelect(project._id)}
            className="rounded-2xl border border-[#303a47] bg-[#121820] p-3 text-left transition-all hover:border-amber-500 hover:bg-[#171e27] hover:shadow-[0_0_18px_rgba(255,190,70,.12)] focus:outline-none focus:ring-2 focus:ring-amber-400 sm:p-4"
            >
            <div className="flex items-start justify-between gap-1">
                <p className="truncate text-sm font-semibold text-slate-100">{project.name}</p>
                <img src={getRankImage(currentLevel.level)} alt="" aria-hidden="true" className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11" />
            </div>
            <p className="mt-3 text-xs font-medium text-amber-300">Level {currentLevel.level}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#28313d]">
                <div className="h-full rounded-full bg-linear-to-r from-cyan-800 to-cyan-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">{project.totalXp.toLocaleString()} XP</p>
            <p className="mt-3 text-xs font-medium text-amber-300">This Week</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#28313d]">
                <div className="h-full rounded-full bg-linear-to-r from-amber-50-800 to-amber-300" style={{ width: `${weeklyProgress}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">{weeklyXp}/{project.weeklyGoal?.toLocaleString()} XP</p>
            </button>
        );
}