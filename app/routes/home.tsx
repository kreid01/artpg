import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CategoryTaskTree } from "~/components/art-prg/CategoryTasks";
import { SignIn, useUser } from "@clerk/react-router";
import { XPBar } from "~/components/art-prg/XPBar";
import { Loader } from "~/components/art-prg/Loader";
import { AddCustomRepButton } from "~/components/art-prg/AddCustomRepButton";
import { StatChartButton } from "~/components/art-prg/StatChartButton";
import { RepChecklist } from "~/components/art-prg/RepChecklist";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const categories = useQuery(api.projects.getAllCategories);
  const projects = useQuery(api.projects.getAllProjects);

  const projectId = projects?.[0]?._id;
  const tasks = useQuery(
    api.projects.getTasksByProject,
    projectId ? { projectId } : "skip"
  );

  if (!isLoaded) return <Loader/> 
  if (!isSignedIn) return <SignIn />;

  if (!categories || !projects || !tasks || !projectId) return <div><Loader/></div>;

  if (projects.length === 0) return <div><Loader/></div>;
  console.log({ categories, projects, tasks, projectId });


  return (
    <div className="p-4 bg-slate-950 h-screen" >
        <XPBar/>
        <div className="flex justify-between mx-20 lg:mx-40 mt-20 text-white mb-5">
        <h1 className="text-2xl">Magisterium</h1>
        <div className="flex gap-2">
          <StatChartButton/>
          <AddCustomRepButton projectId={projectId}/>
        </div>
      </div>
      <div className="lg:flex gap-5 mx-20 lg:mx-40">
        <div className=" lg:w-[30%]">
          <RepChecklist/>
        </div>
        <div className="lg:w-[70%]">
          <CategoryTaskTree tasks={tasks} categories={categories} projectId={projectId}/>
        </div>
      </div>
    </div>
  );
}