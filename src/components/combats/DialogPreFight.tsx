"use client";

import Link from "next/link";
import Leaderboard from "@/components/leaderboard";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
} from "@/shadcn/ui/dialog";
import { Button } from "@/shadcn/ui/button";
import DeckVisualiser from "../DeckVisualiser";
import Image from "next/image";
import Lighting from "../particles/Lighting";
import { Prisma, GameMode } from "../../../generated/prisma/client";
import { defaultNbCardsPerDeck } from "@/types";

type DeckWithCards = Prisma.decksGetPayload<{
    include: {
        deck_cards: {
            include: {
                card: true
            }
        }
    }
}>;

type UserStats = Prisma.game_statsGetPayload<Record<string, never>>;

export default function DialogPreFight({ 
    btnName, 
    modeName, 
    bg, 
    link,
    activeDeck,
    userStats,
    gameMode
}: { 
    btnName?: string, 
    modeName?: string, 
    bg?: string, 
    link: string,
    activeDeck: DeckWithCards | null,
    userStats: UserStats | null,
    gameMode: GameMode
}) {
    const handleLaunchCombat = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!activeDeck || !activeDeck.deck_cards) {
            e.preventDefault();
            alert("Vous devez équiper un deck avant de lancer un combat !");
            return;
        }

        const totalCards = activeDeck.deck_cards.reduce((sum, deckCard) => sum + deckCard.quantity, 0);
        
        if (totalCards < defaultNbCardsPerDeck) {
            e.preventDefault();
            alert(`Votre deck n'est pas complet ! Il contient ${totalCards}/${defaultNbCardsPerDeck} cartes. Complétez-le avant de combattre.`);
            return;
        }
    };

    // Calcul des victoires et défaites
    const nbParty = userStats?.nb_party || 0;
    const nbVictories = userStats?.victories || 0;
    const nbDefeats = userStats?.defeats || 0;
    const winRate = nbParty > 0 ? (nbVictories / nbParty) * 100 : 0;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="glass-nav h-fit text-black dark:text-white text-2xl font-bold">{btnName}</Button>
            </DialogTrigger>

            <DialogContent className="w-3/4 !max-w-screen h-3/4 !max-h-screen lg:max-w-screen-lg overflow-auto">
                <DialogHeader>
                    <DialogTitle className="self-center">Lancement du mode : {modeName} !</DialogTitle>
                </DialogHeader>

                <div className="flex gap-8 h-full">
                    <div className="w-1/2 h-full">
                        <Leaderboard gameMode={gameMode} />
                    </div>

                    <div className="w-1/2 h-full flex flex-col gap-8 items-center justify-center">
                        <div className="flex flex-col items-center w-full h-full glass-nav after:!rounded-2xl !rounded-2xl !p-4">
                            <span className="text-2xl font-bold">Stats perso</span>
                            <div className="flex flex-col justify-evenly h-full w-full font-medium">
                                <span>Victoires : {nbVictories}</span>
                                <span>Défaites : {nbDefeats}</span>
                                <span>Taux de victoire : {winRate.toFixed(2)}%</span>
                                <span>Nombre de matchs joués : {nbParty}</span>
                            </div>
                        </div>  

                        <div className="flex gap-8 w-full h-full">
                            { activeDeck && activeDeck.deck_cards ? (
                                <DeckVisualiser deckName={activeDeck.name || "Deck vide"} deckCards={activeDeck.deck_cards} />
                            ) : (
                                <div className="flex items-center justify-center text-xl text-gray-500">
                                    Aucun deck équipé
                                </div>
                            )}

                            <Link 
                                href={"combats/" + link} 
                                className="flex justify-center items-center text-center glass-nav-green after:!rounded-2xl !rounded-2xl !h-full text-2xl font-bold"
                                onClick={handleLaunchCombat}
                            >
                                <span className="mx-6 my-2">Lancer le combat ! {modeName}</span>

                                <Lighting />
                                <Image unoptimized className="absolute top-0 left-0 w-full h-full object-cover !rounded-2xl -z-10" src={"/img/" + bg + ".gif"} alt="Bannière combat" width={1920} height={1080} />
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}