import Image from "next/image";
import DialogPreFight from "./DialogPreFight";
import { getActiveDeck, getUserStatsForMode } from "@/prisma/requests";
import { userId } from "@/types";
import { GameMode } from "../../../generated/prisma/client";

export const dynamic = 'force-dynamic';

type Action = {
    label: string,
    link: string,
    modeName: string,
    modeEnum: GameMode
}

export default async function FightCard({ bg, name, isComing, actions } : { bg?: string, name?: string, isComing?: boolean, actions?: Action[] }) {
    const activeDeck = await getActiveDeck(userId);

    return (
        <main className="glass-nav w-full h-full !rounded-2xl after:!rounded-2xl p-4 relative">
            {
                isComing && (
                    <div className="absolute inset-0 flex justify-center items-center">
                        <span className="text-black dark:text-white text-5xl font-bold transform rotate-20 whitespace-nowrap">Bientôt disponible</span>
                    </div>
                ) || (
                    <div className="flex flex-col h-full">
                        <header className="flex justify-center">
                            <span className="text-black dark:text-white text-4xl font-bold">{name}</span>
                        </header>

                        <div className="flex-1"></div>

                        <footer className="flex justify-around">
                            {actions ? actions.map(async (action, index) => {
                                const userStats = await getUserStatsForMode(userId, action.modeEnum);

                                return (
                                    <DialogPreFight key={index} btnName={action.label} modeName={action.modeName} bg={bg} link={action.link} activeDeck={activeDeck} userStats={userStats} gameMode={action.modeEnum} />
                                );
                            }) : <></>}
                        </footer>
                    </div>
                )
            }

            {
                !isComing && (
                    <Image unoptimized className="absolute top-0 left-0 w-full h-full object-cover !rounded-2xl -z-10" src={"/img/" + bg + ".gif"} alt="Bannière combat" width={1920} height={1080} />
                ) || (
                    <Image className="absolute top-0 left-0 w-full h-full object-cover !rounded-2xl -z-10" src={"/img/construction.jpg"} alt="En construction" width={1920} height={1080} />
                )
            }
        </main>
    )
}