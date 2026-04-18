import { getAuth } from "@clerk/react-router/ssr.server";
import type { Route } from "./+types/home";
import { CategoryTaskTree } from "~/components/art-prg/CategoryTasks";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  return {
    isSignedIn: !!userId,
  };
}

export default function Home() {
  return (
    <>
    <CategoryTaskTree/>
    </>
  );
}
