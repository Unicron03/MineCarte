"use client";

import Link from "next/link";
import Leaderboard from "@/components/combats/leaderboard";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
} from "@/shadcn/ui/dialog";
import { Button } from "@/shadcn/ui/button";
import DeckVisualiser from "../deck/DeckVisualiser";
import Image from "next/image";
import Lighting from "../particles/Lighting";
import { Prisma, GameMode } from "../../../generated/prisma/client";
import { defaultNbCardsPerDeck } from "@/components/utils/types";
import { toast } from "react-toastify";

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
    gameMode,
    isFullButton,
    cardName
}: { 
    btnName?: string, 
    modeName?: string, 
    bg?: string, 
    link: string,
    activeDeck: DeckWithCards | null,
    userStats: UserStats | null,
    gameMode: GameMode,
    isFullButton?: boolean,
    cardName?: string
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
            toast.error(`Votre deck n'est pas complet ! Il contient ${totalCards}/${defaultNbCardsPerDeck} cartes. Complétez-le avant de combattre.`, {
                progressClassName: "fancy-progress-bar",
                closeOnClick: true,
                autoClose: 10000,
                theme: localStorage.getItem("theme") || "light"
            });
            return;
        }
    };

    // Calcul des victoires et défaites
    const nbParty = userStats?.nb_party || 0;
    const nbVictories = userStats?.victories || 0;
    const nbDefeats = userStats?.defeats || 0;
    const winRate = nbParty > 0 ? (nbVictories / nbParty) * 100 : 0;

    // Gradients selon le mode de combat
    const getTextGradient = (mode: string) => {
        switch(mode?.toLowerCase()) {
            case '1v ia':
                return 'bg-gradient-to-r from-[#98AEFF] to-[#646464] bg-clip-text text-transparent';
            case '1v1':
                return 'bg-gradient-to-r from-[#E8E2F1] to-[#D89CEE] bg-clip-text text-transparent';
            case 'donjon':
                return 'bg-gradient-to-r from-[#FFD6B4] to-[#F98F18] bg-clip-text text-transparent';
            case 'vagues':
                return 'bg-gradient-to-r from-[#B9FBDA] to-[#5B96A1] bg-clip-text text-transparent';
            default:
                return 'bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent';
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {isFullButton ? (
                    <button className="absolute inset-0 z-10 w-full h-full flex items-center justify-start pl-20 py-4 rounded-3xl hover:scale-[1.02] transition-transform duration-200 group overflow-visible">
                        <span className={`text-7xl font-alfa-slab filter drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[3px_3px_6px_rgba(0,0,0,0.7)] transition-all duration-200 whitespace-nowrap ${getTextGradient(cardName || '')}`} style={{lineHeight: '1.1', display: 'block'}}>
                            {cardName}
                        </span>
                    </button>
                ) : (
                    <Button className="combat-button glass-nav h-fit text-black dark:text-white text-2xl font-alfa-slab">{btnName}</Button>
                )}
            </DialogTrigger>

            <DialogContent className="w-3/4 !max-w-screen h-3/4 !max-h-screen lg:max-w-screen-lg flex flex-col border border-gray-800 rounded-2xl overflow-hidden p-8" style={{backgroundColor: 'rgb(41, 41, 41)'}}>
                <DialogTitle className="sr-only">Lancement du mode {modeName || cardName}</DialogTitle>
                <div className="flex gap-8 h-full">
                    {/* Classement*/}
                    <div className="w-1/2 h-full">
                        <div className="h-full p-6 rounded-2xl" style={{backgroundColor: '#161616'}}>
                            <h2 className="text-3xl font-bold mb-6 text-green-400">Classement</h2>
                            <div className="h-full overflow-hidden">
                                <Leaderboard gameMode={gameMode} />
                            </div>
                        </div>
                    </div>

                    <div className="w-1/2 h-full flex flex-col gap-6">
                        {/* Stats */}
                        <div className="h-1/2 p-6 rounded-2xl" style={{backgroundColor: '#161616'}}>
                            <h3 className="text-3xl font-bold text-white mb-4">Stats perso</h3>
                            <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="text-center">
                                    <div className="text-white text-lg mb-1">Victoires :</div>
                                    <div className="text-3xl font-bold text-green-400">{nbVictories}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-white text-lg mb-1">Défaites :</div>
                                    <div className="text-3xl font-bold text-red-400">{nbDefeats}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-white text-lg mb-1">Taux de victoire :</div>
                                    <div className="text-3xl font-bold text-blue-400">{winRate.toFixed(0)} %</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-white text-lg mb-1">Nombre de matchs joués :</div>
                                    <div className="text-3xl font-bold text-purple-400">{nbParty}</div>
                                </div>
                            </div>
                        </div>

                        <div className="h-1/2 flex gap-6">
                            {/* Deck  */}
                            <div className="w-1/2 h-full">
                                { activeDeck && activeDeck.deck_cards ? (
                                    <div className="h-full">
                                        <DeckVisualiser deckName={activeDeck.name || "Deck 1"} deckCards={activeDeck.deck_cards} />
                                    </div>
                                ) : (
                                    <div className="border-2 rounded-2xl p-4 h-full flex flex-col items-center justify-center" style={{backgroundColor: '#161616', borderColor: '#8EFB7B'}}>
                                        <div className="w-16 h-20 bg-blue-600 rounded border-2 border-yellow-400 mb-2 flex items-center justify-center">
                                            <span className="text-yellow-400 text-2xl">⚔️</span>
                                        </div>
                                        <div className="text-white font-bold">Deck 1</div>
                                    </div>
                                )}
                            </div>

                            {/* Bouton */}
                            <div className="w-1/2 h-full flex items-center justify-center">
                                <Link 
                                    href={"combats/" + link} 
                                    className="relative flex flex-col items-center justify-center w-full h-5/6 rounded-2xl border-2 shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden max-w-xs"
                                    style={{
                                        background: 'linear-gradient(135deg, #0E4600, #8EFB7B, #63D92B, #0E4600)',
                                        borderColor: '#8EFB7B'
                                    }}
                                    onClick={handleLaunchCombat}
                                >
                              
                                    <Lighting />
                                    
                                    {/* Contenu du bouton */}
                                    <div className="relative z-10 text-center p-6">
                                        <div className="text-3xl font-alfa-slab font-bold mb-2 bg-gradient-to-r from-[#1E1E1E] to-[#848484] bg-clip-text text-transparent">Lancer le</div>
                                        <div className="text-3xl font-alfa-slab font-bold mb-3 bg-gradient-to-r from-[#1E1E1E] to-[#848484] bg-clip-text text-transparent">Combat !</div>
                                        <div className="relative text-4xl font-alfa-slab font-bold">
                                             <div className="absolute inset-0 text-4xl font-alfa-slab font-bold text-gray-800" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7), -1px -1px 3px rgba(0,0,0,0.7), 1px -1px 3px rgba(0,0,0,0.7), -1px 1px 3px rgba(0,0,0,0.7), 0px 0px 6px rgba(0,0,0,0.5)'}}>
                                                {cardName || modeName}
                                            </div>
                                            <div className="relative bg-gradient-to-r from-[#D4A041] to-[#F7D14E] bg-clip-text text-transparent">
                                                {cardName || modeName}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}