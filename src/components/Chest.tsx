"use client";

import Image from "next/image";
import { useState } from "react";
import CardOpeningDisplay from "./CardOpeningDisplay";
import { Prisma } from "../../generated/prisma/client";
import { userId } from "@/types";

type DrawnCard = Prisma.cardsGetPayload<Record<string, never>> & { 
    isNew: boolean;
    quantity: number;
    favorite: boolean;
};

export default function Chest({ 
    onOpeningChange,
    isAvailable,
    timeNextChest
}: { 
    onOpeningChange: (isOpen: boolean) => void;
    isAvailable: boolean;
    timeNextChest: Date;
}) {
    const [isAnimated, setIsAnimated] = useState(false);
    const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    const drawCardsFromAPI = async (): Promise<DrawnCard[]> => {
        setIsDrawing(true);
        
        try {
            const response = await fetch('/api/cards/draw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount: 5 })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to draw cards');
            }

            const data = await response.json();
            return data.cards as DrawnCard[];
        } catch (error) {
            console.error("Erreur lors du tirage:", error);
            alert(error instanceof Error ? error.message : "Erreur lors du tirage de cartes");
            return [];
        } finally {
            setIsDrawing(false);
        }
    };

    const handleChestClick = async () => {
        if (!isAvailable) {
            alert(`Le coffre n'est pas encore disponible ! Revenez à ${timeNextChest.toLocaleTimeString()}`);
            return;
        }

        if (isDrawing) return;

        // Activer le GIF d'ouverture
        setIsAnimated(true);

        const newDrawnCards = await drawCardsFromAPI();
        
        if (newDrawnCards.length > 0) {
            setDrawnCards(newDrawnCards);
            setIsDialogOpen(true);
            onOpeningChange(true);
        }
    };

    const handleCloseCardOpening = () => {
        setIsDialogOpen(false);
        setDrawnCards([]);
        setIsAnimated(false);
        onOpeningChange(false);
    };

    return (
        <div>
            <Image
                unoptimized
                src={isAnimated ? "/chest.gif" : "/chest.png"}
                alt="Coffre"
                width={400}
                height={100}
                className={`mb-8 z-9999 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] 
                    ${isAvailable ? "animate-coffre cursor-pointer" : "cursor-not-allowed"}
                    ${isDrawing ? "opacity-50 cursor-wait" : ""}
                    ${!isAvailable ? "opacity-50 grayscale" : ""}
                `}
                onClick={handleChestClick}
            />

            {isDrawing && (
                <p className="text-center text-xl font-bold animate-pulse">
                    Tirage en cours...
                </p>
            )}

            {isDialogOpen && drawnCards.length > 0 && (
                <CardOpeningDisplay drawnCards={drawnCards} onClose={handleCloseCardOpening} />
            )}
        </div>
    );
}