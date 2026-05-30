import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import * as Toast from "@radix-ui/react-toast";
import type { Id } from "convex/_generated/dataModel";

type Game = {
  _id: Id<"games">;
  name: string;
  cost: number;
  pot: number;
};

export function Games() {
  const games = useQuery(api.projects.getGames) ?? [];

  return (
    <div className="space-y-2">
      {games.map(game => (
        <GameRow key={game._id} game={game} />
      ))}
    </div>
  );
}

function GameRow({ game }: { game: Game }) {
  const addToPot = useMutation(api.projects.addToPot);
  const [openToast, setOpenToast] = useState(false);
  const [toastData, setToastData] = useState<{ title: string; description?: string } | null>(null);

  const progress = Math.min(game.pot / game.cost, 1);
  const percent = Math.round(progress * 100);
  const funded = game.pot >= game.cost;

  const handleAdd = async () => {
    try {
      await addToPot({ gameId: game._id });
      setToastData({ title: `£1 added to ${game.name}` });
      setOpenToast(true);
    } catch {
      setToastData({ title: "Error", description: "Failed to add to pot" });
      setOpenToast(true);
    }
  };

  return (
    <>
      <div className="relative rounded border overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-500 bg-emerald-700"
          style={{ width: `${progress * 100}%`, opacity: 0.5 }}
        />
        <div className="flex justify-between items-center relative z-10 px-3 py-2 text-white">
          <span className="font-medium">{game.name}</span>
          <div className="flex items-center gap-3 text-sm">
            <span>
              £{game.pot} / £{game.cost} 
            </span>
            {funded ? (
              <span className="text-emerald-400 font-medium">✓ Funded</span>
            ) : (
              <button
                onClick={handleAdd}
                className="bg-emerald-700 hover:bg-emerald-600 px-2 py-0.5 rounded text-xs"
              >
                + £1
              </button>
            )}
          </div>
        </div>
      </div>

      <Toast.Provider>
        <Toast.Root
          open={openToast}
          onOpenChange={setOpenToast}
          className="fixed bottom-6 right-6 bg-emerald-900 text-white px-4 py-3 rounded-lg shadow-lg border border-emerald-700"
        >
          <Toast.Title className="font-semibold">{toastData?.title}</Toast.Title>
          {toastData?.description && (
            <Toast.Description className="text-sm text-slate-400">
              {toastData.description}
            </Toast.Description>
          )}
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-2 w-[320px] max-w-full z-50" />
      </Toast.Provider>
    </>
  );
}