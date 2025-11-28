"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, exampleCollectionCards } from "@/types";
import CardOpeningDisplay from "./CardOpeningDisplay";

export default function Chest() {
    const [isAnimated, setIsAnimated] = useState(false);
    const [isOpenable, setIsOpenable] = useState(false);
    const [drawnCards, setDrawnCards] = useState<Card[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const drawCards = () => {
        const shuffled = exampleCollectionCards.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 5);
    };

    const handleChestClick = () => {
        if (isOpenable) {
            const newDrawnCards = drawCards();
            setDrawnCards(newDrawnCards);
            setIsAnimated(true);
            setIsDialogOpen(true);
        } else {
            setIsOpenable(true);
        }
    };

    const handleCloseCardOpening = () => {
        setIsDialogOpen(false);
        setDrawnCards([]);
        setIsAnimated(false);
        setIsOpenable(false);
    };

    return (
        <div>
            <Image
                unoptimized
                src={isAnimated ? "/chest.gif" : "/chest.png"}
                alt="Coffre"
                width={400}
                height={100}
                className={`mb-8 z-9999 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] ${isOpenable ? "animate-coffre" : ""}`}
                onClick={handleChestClick}
            />

            {isDialogOpen && (
                <CardOpeningDisplay drawnCards={drawnCards} onClose={handleCloseCardOpening} />
            )}
        </div>
    );
}
