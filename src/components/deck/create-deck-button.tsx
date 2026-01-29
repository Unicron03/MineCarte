"use client";

import { Button } from "@/shadcn/ui/button";
import { useRouter } from "next/navigation";

export default function CreateDeckButton({ userId }: { userId: string }) {
    const router = useRouter();

    const handleCreateDeck = async () => {
        try {
            const response = await fetch('/api/decks/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();

            if (response.ok) {
                router.refresh(); // Recharge la page pour afficher le nouveau deck
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Erreur lors de la création du deck:", error);
        }
    };

    return (
        <Button onClick={handleCreateDeck}>
            Créer un nouveau deck
        </Button>
    );
}