import { addCardToDeck } from "@/prisma/requests";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { deckId, cardId } = await request.json();
        
        if (!deckId || !cardId) {
            return NextResponse.json({ error: "Deck ID and Card ID required" }, { status: 400 });
        }
        
        const result = await addCardToDeck(deckId, cardId);
        
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error adding card to deck:", error);
        return NextResponse.json({ error: "Failed to add card" }, { status: 500 });
    }
}