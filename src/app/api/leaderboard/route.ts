import { NextResponse } from "next/server";
import { getLeaderboard } from "@/prisma/requests";
import { GameMode } from "../../../../generated/prisma/enums";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const gameMode = searchParams.get('mode') as GameMode | null;

        if (!gameMode) {
            return NextResponse.json({ error: "Game mode is required" }, { status: 400 });
        }

        const leaderboard = await getLeaderboard(gameMode, 10);

        // Formater les données pour le frontend
        const formattedLeaderboard = leaderboard.map(player => ({
            id: player.user_id,
            name: player.user.name,
            points: player.points,
            victories: player.victories,
            defeats: player.defeats,
            nbParty: player.nb_party
        }));

        return NextResponse.json(formattedLeaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}