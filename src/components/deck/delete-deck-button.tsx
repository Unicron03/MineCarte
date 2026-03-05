"use client";

import { DropdownMenuItem } from "@/shadcn/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function DeleteDeckButton({ 
    userId, 
    deckId,
    deckName,
    isActive
}: { 
    userId: string; 
    deckId: number;
    deckName: string | null;
    isActive: boolean;
}) {
    const router = useRouter();

    const handleDelete = async () => {
        if (isActive) {
            alert("Vous ne pouvez pas supprimer un deck équipé. Déséquipez-le d'abord.");
            return;
        }

        const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer le deck "${deckName || 'Deck n°' + deckId}" ?`);
        
        if (!confirmed) return;

        try {
            const response = await fetch('/api/decks/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, deckId, isActive })
            });

            const data = await response.json();

            if (response.ok) {
                router.refresh();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du deck:", error);
            alert("Erreur lors de la suppression du deck");
        }
    };

    return (
        <DropdownMenuItem 
            onClick={handleDelete} 
            className={isActive ? "text-gray-400 cursor-not-allowed" : "text-red-600 focus:text-red-600 cursor-pointer"}
            disabled={isActive}
        >
            Supprimer
        </DropdownMenuItem>
    );
}