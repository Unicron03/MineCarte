import Image from "next/image";
import DialogPreFight from "../combats/DialogPreFight";
import { getActiveDeck, getUserStatsForMode } from "@/prisma/requests";
import { getCurrentUserId } from "@/lib/get-user";
import { GameMode } from "../../../generated/prisma/client";

export const dynamic = 'force-dynamic';

type Action = {
    label: string,
    link: string,
    modeName: string,
    modeEnum: GameMode,
    bgImage?: string
}

export default async function FightCard({ bg, name, isComing, actions } : { bg?: string, name?: string, isComing?: boolean, actions?: Action[] }) {
    const userId = await getCurrentUserId();
    const activeDeck = await getActiveDeck(userId);


    if (isComing) {
        return (
            <main className="glass-nav w-full h-full !rounded-3xl after:!rounded-3xl relative overflow-hidden">
                <div className="absolute inset-0 flex justify-center items-center z-10">
                    <span className="text-black dark:text-white text-5xl font-bold transform rotate-20 whitespace-nowrap">Bientôt disponible</span>
                </div>
                <Image className="absolute top-0 left-0 w-full h-full object-cover !rounded-3xl" src={"/img/construction.jpg"} alt="En construction" width={1920} height={1080} />
            </main>
        );
    }

    if (actions && actions.length > 0) {
        const action = actions[0]; 
        const userStats = await getUserStatsForMode(userId, action.modeEnum);

        return (
            <main className="w-full h-full relative overflow-hidden !rounded-3xl">
           
                <Image 
                    unoptimized 
                    className="absolute top-0 left-0 w-full h-full object-cover !rounded-3xl" 
                    src={"/img/" + (action.bgImage || bg) + ".jpg"} 
                    alt={`Bannière ${name}`} 
                    width={1920} 
                    height={1080} 
                />
                
              
                <div className="absolute inset-0 !rounded-3xl overflow-hidden">
                    <div 
                        className="absolute inset-0 opacity-80"
                        style={{
                            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            maskImage: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 70%, transparent 80%)',
                            WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 70%, transparent 80%)'
                        }}
                    ></div>
                </div>
                
           
                <DialogPreFight 
                    btnName={action.label} 
                    modeName={action.modeName} 
                    bg={action.bgImage || bg} 
                    link={action.link} 
                    activeDeck={activeDeck} 
                    userStats={userStats} 
                    gameMode={action.modeEnum}
                    isFullButton={true}
                    cardName={name}
                />
            </main>
        );
    }

    // Version par défaut 
    return (
        <main className="glass-nav w-full h-full !rounded-3xl after:!rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 flex justify-center items-center z-10">
                <span className="text-white text-4xl font-alfa-slab">{name}</span>
            </div>
            <Image 
                unoptimized 
                className="absolute top-0 left-0 w-full h-full object-cover !rounded-3xl" 
                src={"/img/" + bg + ".jpg"} 
                alt={`Bannière ${name}`} 
                width={1920} 
                height={1080} 
            />
        </main>
    );
}