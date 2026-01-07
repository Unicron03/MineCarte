import { deleteDeck, getUserDecks } from "@/prisma/requests";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { userId, deckId, isActive } = await request.json();
        
        if (!userId || !deckId) {
            return NextResponse.json({ error: "User ID and Deck ID required" }, { status: 400 });
        }
        
        // Vérifier si le deck est équipé
        if (isActive) {
            return NextResponse.json({ error: "Vous ne pouvez pas supprimer un deck équipé. Déséquipez-le d'abord." }, { status: 400 });
        }
        
        // Vérifier combien de decks l'utilisateur possède
        const userDecks = await getUserDecks(userId);
        
        if (userDecks.length <= 1) {
            return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre dernier deck" }, { status: 400 });
        }
        
        await deleteDeck(userId, deckId);
        
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error deleting deck:", error);
        return NextResponse.json({ error: "Failed to delete deck" }, { status: 500 });
    }
}