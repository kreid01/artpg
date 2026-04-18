import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CategoryTaskTree } from "~/components/art-prg/CategoryTasks";
import { SignIn, useUser } from "@clerk/react-router";
import { XPBar } from "~/components/art-prg/XPBar";
import { Loader } from "~/components/art-prg/Loader";

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
    <div className="p-4">
      <h1 className="mx-40 text-2xl mt-20 mb-5">Magisterium</h1>
      <XPBar/>
      <CategoryTaskTree tasks={tasks} categories={categories} projectId={projectId}/>
    </div>
  );
}