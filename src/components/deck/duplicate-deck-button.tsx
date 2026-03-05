"use client";

import { DropdownMenuItem } from "@/shadcn/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DuplicateDeckButton({ 
    userId, 
    deckId,
}: { 
    userId: string; 
    deckId: number;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleDuplicate = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/decks/duplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, deckId })
            });

            const data = await response.json();

            if (response.ok) {
                router.refresh();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Erreur lors de la duplication du deck:", error);
            alert("Erreur lors de la duplication du deck");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenuItem 
            onClick={handleDuplicate}
            disabled={isLoading}
            className="cursor-pointer"
        >
            {isLoading ? "Duplication..." : "Dupliquer"}
        </DropdownMenuItem>
    );
}