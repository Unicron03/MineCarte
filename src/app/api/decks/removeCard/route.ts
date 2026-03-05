import { removeCardFromDeck } from "@/prisma/requests";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { deckId, cardId } = await request.json();
        
        if (!deckId || !cardId) {
            return NextResponse.json({ error: "Deck ID and Card ID required" }, { status: 400 });
        }
        
        const result = await removeCardFromDeck(deckId, cardId);
        
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error removing card from deck:", error);
        return NextResponse.json({ error: "Failed to remove card" }, { status: 500 });
    }
}