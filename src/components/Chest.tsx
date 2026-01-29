"use client";

import Image from "next/image";
import { useState } from "react";
import CardOpeningDisplay from "./cards/CardOpeningDisplay";
import { Prisma } from "../../generated/prisma/client";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { toast } from "react-toastify";

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
    const { userId, isLoading } = useCurrentUser();

    const drawCardsFromAPI = async (): Promise<DrawnCard[]> => {
        if (!userId) {
            alert("Erreur : utilisateur non connecté");
            return [];
        }

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
        if (isLoading || !userId) { // Vérifie isLoading ET userId
            alert("Chargement en cours...");
            return;
        }

        if (!isAvailable) {
            toast.error(`Le coffre n'est pas encore disponible ! Revenez à ${timeNextChest.getHours()}h${timeNextChest.getMinutes().toString().padStart(2, '0')}m${timeNextChest.getSeconds().toString().padStart(2, '0')}s`, {
                progressClassName: "fancy-progress-bar",
                closeOnClick: true,
                autoClose: 10000,
                theme: localStorage.getItem("theme") || "light"
            });
            return;
        }

        if (isDrawing) return;

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
                    ${isAvailable && !isLoading ? "animate-coffre cursor-pointer" : "cursor-not-allowed"}
                    ${isDrawing || isLoading ? "opacity-50 cursor-wait" : ""}
                    ${!isAvailable ? "opacity-50 grayscale" : ""}
                `}
                onClick={handleChestClick}
            />

            {(isDrawing || isLoading) && (
                <p className="text-center text-xl font-bold animate-pulse">
                    {isLoading ? "Chargement..." : "Tirage en cours..."}
                </p>
            )}

            {isDialogOpen && drawnCards.length > 0 && (
                <CardOpeningDisplay drawnCards={drawnCards} onClose={handleCloseCardOpening} />
            )}
        </div>
    );
}