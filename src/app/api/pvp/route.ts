import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    // --- Gestion de l'ID Utilisateur ---
    // Par défaut, on utilise l'ID 2 (John) pour le développement
    let userId = 2;

    // Si le paramètre est un nombre entier valide (et pas un UUID qui commence par un chiffre)
    if (userIdParam && /^\d+$/.test(userIdParam)) {
        userId = parseInt(userIdParam, 10);
    }

    console.log(`[API PVP] Recherche de deck pour UserID: ${userId} (Param reçu: ${userIdParam})`);

    try {
        // 1. Essayer de récupérer le deck ACTIF de l'utilisateur
        let deck = await prisma.decks.findFirst({
            where: {
                user_id: userId,
                is_active: true,
            },
            include: {
                deck_cards: {
                    include: {
                        card: true,
                    },
                },
            },
        });

        // 2. Fallback : Si aucun deck actif, prendre le premier deck de l'utilisateur
        if (!deck) {
            console.log(`[API PVP] Aucun deck actif pour UserID ${userId}. Recherche d'un deck quelconque...`);
            deck = await prisma.decks.findFirst({
                where: { user_id: userId },
                include: {
                    deck_cards: {
                        include: {
                            card: true,
                        },
                    },
                },
            });
        }

        // 3. Fallback ultime : Prendre le premier deck de la base de données (pour le débug)
        if (!deck) {
            console.log(`[API PVP] Aucun deck trouvé pour UserID ${userId}. Recherche d'un deck global...`);
            deck = await prisma.decks.findFirst({
                include: {
                    deck_cards: {
                        include: {
                            card: true,
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
        
        // --- Affichage du contenu du deck ---
        if (deck.deck_cards && deck.deck_cards.length > 0) {
            console.log("[API PVP] Contenu du deck :");
            deck.deck_cards.forEach((dc) => {
                console.log(` - ${dc.quantity}x ${dc.card.name} (Coût: ${dc.card.cost})`);
            });
        } else {
            console.log("[API PVP] Ce deck est vide.");
        }

        return NextResponse.json(deck);

    } catch (error) {
        console.error("[API PVP] Erreur serveur:", error);
        return NextResponse.json({ error: "Erreur interne serveur" }, { status: 500 });
    }
}