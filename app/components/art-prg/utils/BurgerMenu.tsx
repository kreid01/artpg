import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HiBars3 } from "react-icons/hi2";
import { AddCustomRepButton } from "../AddCustomRepButton";
import { XPChartButton } from "../charts/XPChartButton";
import { StatChartButton } from "../charts/StatChartButton";
import { RewardTrackButton } from "../RewardTrackButton";
import { AddJournalEntryButton } from "../JournalEntryButton";

interface BurgerMenuProps {
    projectId: any
}

export const BurgerMenu:React.FC<BurgerMenuProps> = ({projectId}) => {
    return (
        <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
            <button className=" flex h-10 w-10 items-center justify-center rounded-md border border-[#8d6d2c] bg-linear-to-b from-[#1d232b] via-[#171c22] to-[#101419] text-amber-300 transition-all hover:border-amber-400 hover:text-white hover:shadow-[0_0_15px_rgba(255,190,70,.25)] " >
            <HiBars3 size={24} />
            </button>

        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
           <DropdownMenu.Content
                side="left"
                align="start"
                sideOffset={10}
                alignOffset={-5}
                className=" z-50 min-w-48 overflow-hidden rounded-xl border border-[#8d6d2c] bg-linear-to-b from-[#1d232b] via-[#171c22] to-[#101419] p-2 shadow-[0_10px_40px_rgba(0,0,0,.65)] animate-in fade-in-0 zoom-in-95 data-[side=left]:slide-in-from-right-4 data-[side=right]:slide-in-from-left-4 data-[side=top]:slide-in-from-bottom-4 data-[side=bottom]:slide-in-from-top-4 duration-200 " > 
            <div className="flex gap-3 text-white">
                <DropdownMenu.Item asChild>
                    <AddJournalEntryButton/>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                    <AddCustomRepButton projectId={projectId} />
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                    <XPChartButton projectId={projectId} />
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                    <StatChartButton projectId={projectId} />
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                    <RewardTrackButton projectId={projectId} />
                </DropdownMenu.Item>
            </div>
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}