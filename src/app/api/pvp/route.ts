import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveDeck, getUserDecks } from "@/prisma/requests";
import { getCurrentUserId } from "@/lib/get-user";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const userId = userIdParam || await getCurrentUserId();

    console.log(`[API PVP] Recherche de deck pour UserID: ${userId} (Param reçu: ${userIdParam})`);

    try {
        let deck = await getActiveDeck(userId);
        if (!deck) {
            console.log(`[API PVP] Aucun deck actif pour UserID ${userId}. Recherche d'un deck quelconque...`);
            deck = await getUserDecks(userId).then(decks => decks[0]);
        }
        if (!deck) {
            console.log(`[API PVP] Aucun deck trouvé pour UserID ${userId}. Recherche d'un deck global...`);
            deck = await prisma.decks.findFirst({
                include: {
                    deck_cards: {
                        include: {
                            card: {
                                include: {
                                    talent_action: true,
                                    attack1_action: true,
                                    attack2_action: true,
                                }
                            },
                        },
                    },
                },
            });
        }

        if (!deck) {
            console.log("[API PVP] Absolument aucun deck trouvé en base.");
            return NextResponse.json({ message: "Aucun deck trouvé en base de données" }, { status: 404 });
        }

        console.log(`[API PVP] Deck trouvé: ${deck.name} (ID: ${deck.id})`);
        
        return NextResponse.json(deck);

    } catch (error) {
        console.error("[API PVP] Erreur serveur:", error);
        return NextResponse.json({ error: "Erreur interne serveur" }, { status: 500 });
    }
}
