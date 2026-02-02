"use client";

import Image from "next/image";
import { useState } from "react";
import CardOpeningDisplay from "./cards/CardOpeningDisplay";
import { Prisma } from "../../generated/prisma/client";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { toast } from "react-toastify";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shadcn/ui/alert-dialog";

type DrawnCard = Prisma.cardsGetPayload<Record<string, never>> & { 
    isNew: boolean;
    quantity: number;
    favorite: boolean;
};

export default function Chest({ 
    onOpeningChange,
    isAvailable,
    userKeys,
    onKeysUpdate,
    onEndingTirage,
}: {
    onOpeningChange: (isOpen: boolean) => void;
    isAvailable: boolean;
    userKeys: number;
    onKeysUpdate: () => void;
    onEndingTirage: () => void;
}) {
    const [isAnimated, setIsAnimated] = useState(false);
    const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showKeyDialog, setShowKeyDialog] = useState(false);
    const [keysNeeded, setKeysNeeded] = useState(0);
    const { userId, isLoading } = useCurrentUser();

    const drawCardsFromAPI = async (useKeys: boolean = false): Promise<DrawnCard[]> => {
        if (!userId) {
            toast.error("Erreur : utilisateur non connecté");
            return [];
        }

        setIsDrawing(true);
        
        try {
            const response = await fetch('/api/cards/draw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount: 5, useKeys })
            });

            const data = await response.json();

            if (!response.ok) {
                // Si le coffre n'est pas disponible et qu'on peut utiliser des clés
                if (response.status === 429 && data.canUseKeys && !useKeys) {
                    console.log("Proposition d'utilisation des clés" + data.canUseKeys + data.keysNeeded);
                    setKeysNeeded(data.keysNeeded);
                    setShowKeyDialog(true);
                    return [];
                }

                throw new Error(data.error || 'Erreur lors du tirage de cartes');
            }

            // Mettre à jour les clés après utilisation
            onKeysUpdate();
            
            return data.cards as DrawnCard[];
        } catch (error) {
            console.error("Erreur lors du tirage:", error);
            toast.error(error instanceof Error ? error.message : "Erreur lors du tirage de cartes", {
                progressClassName: "fancy-progress-bar",
                closeOnClick: true,
                autoClose: 5000,
                theme: localStorage.getItem("theme") || "light"
            });
            return [];
        } finally {
            setIsDrawing(false);
        }
    };

    const handleChestClick = async () => {
        if (isLoading || !userId) {
            toast.error("Chargement en cours...", {
                progressClassName: "fancy-progress-bar",
                closeOnClick: true,
                autoClose: 3000,
                theme: localStorage.getItem("theme") || "light"
            });
            return;
        }

        if (isDrawing) return;

        setIsAnimated(true);

        const newDrawnCards = await drawCardsFromAPI(false);
        
        if (newDrawnCards.length > 0) {
            setDrawnCards(newDrawnCards);
            setIsDialogOpen(true);
            onOpeningChange(true);
        } else {
            setIsAnimated(false);
        }
    };

    const handleUseKeys = async () => {
        setShowKeyDialog(false);
        setIsAnimated(true);

        const newDrawnCards = await drawCardsFromAPI(true);
        
        if (newDrawnCards.length > 0) {
            setDrawnCards(newDrawnCards);
            setIsDialogOpen(true);
            onOpeningChange(true);
        } else {
            setIsAnimated(false);
        }
    };

    const handleCloseCardOpening = () => {
        setIsDialogOpen(false);
        setDrawnCards([]);
        setIsAnimated(false);
        onOpeningChange(false);
        onEndingTirage();
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
                    ${isAvailable && !isLoading ? "animate-coffre cursor-pointer" : "cursor-pointer"}
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

            {/* Dialog pour proposer l'utilisation des clés */}
            <AlertDialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Utiliser des clés ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Le coffre n&apos;est pas encore disponible. Voulez-vous utiliser <strong>{keysNeeded} clé(s)</strong> pour l&apos;ouvrir maintenant ?
                            <br />
                            <br />
                            Vous avez actuellement <strong>{userKeys} clé(s)</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUseKeys}>
                            Utiliser {keysNeeded} clé(s)
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {isDialogOpen && drawnCards.length > 0 && (
                <CardOpeningDisplay drawnCards={drawnCards} onClose={handleCloseCardOpening} />
            )}
        </div>
    );
}