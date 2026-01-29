"use client";

import { DropdownMenuItem } from "@/shadcn/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EquipDeckButton({ 
    userId, 
    deckId,
    isActive
}: { 
    userId: string; 
    deckId: number;
    isActive: boolean;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleEquip = async () => {
        if (isActive) {
            // Déjà équipé, ne rien faire
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/decks/equip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, deckId })
            });

            if (response.ok) {
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.error);
            }
        } catch (error) {
            console.error("Erreur lors de l'équipement du deck:", error);
            alert("Erreur lors de l'équipement du deck");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenuItem 
            onClick={handleEquip}
            disabled={isActive || isLoading}
            className={isActive ? "text-green-600 font-semibold" : "cursor-pointer"}
        >
            {isActive ? "✓ Équipé" : isLoading ? "Équipement..." : "Équiper"}
        </DropdownMenuItem>
    );
}