"use client";

import { useState, useEffect } from "react";
import { backCard } from "@/types";
import AtroposCard from "./combats/cards/AtroposCard";
import { Button } from "@/shadcn/ui/button";
import Link from "next/link";
import CardPopupDetails from "./card-popup-details";
import ConfettiSides from "./particles/confetti-sides";
import Confetti from "./particles/confetti";
import { Prisma } from "../../generated/prisma/client";

type DrawnCard = Prisma.cardsGetPayload<Record<string, never>> & { 
    isNew: boolean;
    quantity: number;
    favorite: boolean;
};

interface CardOpeningDisplayProps {
    drawnCards: DrawnCard[];
    onClose: () => void;
}

export default function CardOpeningDisplay({ drawnCards, onClose }: CardOpeningDisplayProps) {
    const [flipped, setFlipped] = useState<boolean[]>(Array(drawnCards.length).fill(false));
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAllCards, setShowAllCards] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isAnimationActive, setIsAnimationActive] = useState(false);
    const [canSpawnConfetti, setCanSpawnConfetti] = useState(true);

    useEffect(() => {
        if (currentCardIndex < drawnCards.length) {
            if (drawnCards[currentCardIndex].rarity === 3) setIsAnimationActive(true);
            else setIsAnimationActive(false);
        }
    }, [currentCardIndex, drawnCards]);

    const handleCardClick = () => {
        setShowConfetti(false);

        if (currentCardIndex < drawnCards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        } else {
            setShowAllCards(true);
        }
    };

    const handleFlip = async (index: number) => {
        setCanSpawnConfetti(false);

        const newFlipped = [...flipped];
        newFlipped[index] = true;
        setFlipped(newFlipped);
        
        if (isAnimationActive) {
            await new Promise(resolve => setTimeout(resolve, 550));
            setShowConfetti(true);
        }
    };

    return (
        <div className="fixed inset-0
            bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/img/background_black.png')]
            bg-fixed bg-cover flex flex-col items-center justify-center z-40 p-4"
        >
            {canSpawnConfetti && <Confetti />}
            {showConfetti && <ConfettiSides />}

            {!showAllCards ? (
                <div className="flex flex-col items-center justify-center gap-8">
                    {drawnCards.map((card, index) => (
                        <div
                            key={`${card.id}-${index}`}
                            className={`absolute left-1/2 transition-all duration-500 ease-in-out
                                ${index === currentCardIndex ? 'opacity-100 scale-125 z-10' : 'opacity-0 scale-100 -z-10'}
                                ${index > currentCardIndex ? 'translate-y-50' : ''}
                            `}
                            style={{
                                left: '51.5%',
                                top: '50%',
                                transform: `translate(-51.5%, -50%)${index > currentCardIndex ? ` translateY(${10 * (index - currentCardIndex)}px)` : ''}${index === currentCardIndex ? ' scale(1.25)' : ' scale(1)'}`
                            }}
                        >
                            <div
                                className={`flip-card ${flipped[index] ? 'is-flipped' : ''}`}
                                onClick={() => !flipped[index] && handleFlip(index)}
                            >
                                <div className="flip-card-inner">
                                    <div className="flip-card-front">
                                        <AtroposCard isPulsating={isAnimationActive ? true : false} card={backCard} />
                                    </div>
                                    <div className="flip-card-back" onClick={handleCardClick}>
                                        {card.isNew && (
                                            <div className="absolute right-0 z-50 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg animate-pulse">
                                                NEW
                                            </div>
                                        )}
                                        <AtroposCard card={card} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <span className="absolute top-3/4 font-medium text-2xl text-white">Cartes restantes : {drawnCards.length - currentCardIndex - 1}</span>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full">
                    <span className="text-white text-2xl font-medium mb-8">Cartes obtenues :</span>
                    <div className="flex flex-wrap justify-evenly gap-4 w-full">
                        {drawnCards.map((card, index) => (
                            <div key={`${card.id}-${index}`} className="relative">
                                {card.isNew && (
                                    <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg animate-pulse">
                                        NEW
                                    </div>
                                )}
                                <CardPopupDetails card={card} quantity={card.quantity} undescovered={true} favorite={card.favorite} />
                            </div>
                        ))}
                    </div>
                    <Link href="/home">
                        <Button className="mt-8 px-8 py-4 text-lg" onClick={onClose}>
                            Retour à l&apos;accueil
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}