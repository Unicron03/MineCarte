import { setFavoriteCard } from "@/prisma/requests";
import { getCurrentUserId } from "@/lib/get-user";
import { NextResponse } from "next/server";

export async function GET(
    request: Request, 
    context: { params: Promise<{ slug: string[] }> }
) {
    try {
        const { slug } = await context.params;
        
        // Vérifier qu'on a bien 2 paramètres
        if (!slug || slug.length !== 2) {
            return NextResponse.json(
                { error: "Invalid parameters. Expected: cards/api/setCardFavorite/[cardId]/[favorite]" }, 
                { status: 400 }
            );
        }
        
        const [cardIdStr, favoriteStr] = slug;
        const cardId = parseInt(cardIdStr, 10);
        
        if (isNaN(cardId)) {
            return NextResponse.json({ error: "Invalid cardId supplied" }, { status: 400 });
        }
        
        // Convertir le paramètre favorite en boolean
        const favorite = favoriteStr === 'true' || favoriteStr === '1';
        
        const userId = await getCurrentUserId();
        const result = await setFavoriteCard(cardId, userId, favorite);
        
        if (!result) {
            return NextResponse.json({ error: "Card not found or update failed" }, { status: 404 });
        }
        
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in /api/setFavoriteCard/[...slug]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}