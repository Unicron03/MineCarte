"use client";

import { useState, useEffect } from "react";
import { Card, backCard } from "@/types";
import AtroposCard from "./cards/AtroposCard";
import { Button } from "@/shadcn/ui/button";
import Link from "next/link";
import CardPopupDetails from "./card-popup-details";
import ConfettiSides from "./particles/confetti-sides";
import Confetti from "./particles/confetti";

interface CardOpeningDisplayProps {
    drawnCards: Card[];
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
            console.log("test");
            if (drawnCards[currentCardIndex].rarity === 4) setIsAnimationActive(true);
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
        newFlipped[index] = true; // Cards can only be flipped once
        setFlipped(newFlipped);
        
        if (isAnimationActive) {
            await new Promise(resolve => setTimeout(resolve, 550)); // Wait for flip animation
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
                            key={card.id}
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
                                key={card.id}
                                className={`flip-card ${flipped[index] ? 'is-flipped' : ''}`}
                                onClick={() => !flipped[index] && handleFlip(index)}
                            >
                                <div className="flip-card-inner">
                                    <div className="flip-card-front">
                                        <AtroposCard isPulsating={isAnimationActive ? true : false} card={backCard} />
                                    </div>
                                    <div className="flip-card-back" onClick={handleCardClick}>
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
                        {drawnCards.map((card) => (
                            <div key={card.id} className="">
                                <CardPopupDetails undescovered={false} card={card} />
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
