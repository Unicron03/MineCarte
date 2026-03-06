"use client";

import { useEffect, useState } from "react";
import { GameMode } from "../../../generated/prisma/enums";
import { useCurrentUser } from "@/app/hooks/use-current-user";

type Player = {
    id: string;
    name: string;
    points: number;
    victories: number;
    defeats: number;
    nbParty: number;
};

export default function Leaderboard({ gameMode }: { gameMode: GameMode }) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userId } = useCurrentUser();
    
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/leaderboard?mode=${gameMode}`);
                
                if (!res.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }
                
                const data = await res.json();
                setPlayers(data);
            } catch (err) {
                console.error("Erreur lors du chargement du leaderboard :", err);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchLeaderboard();
    }, [gameMode]);
    
    return (
        <div className="w-full h-full overflow-auto">
            {isLoading ? (
                <div className="flex items-center justify-center h-32">
                    <p className="text-lg text-gray-400">Chargement du classement...</p>
                </div>
            ) : players.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                    <p className="text-lg text-gray-400">Aucun joueur dans ce classement</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {players.map((player, index) => (
                        <div
                            key={player.id}
                            className={`relative p-3 rounded-xl transition-all hover:scale-[1.02] gradient-border ${
                                player.id === userId 
                                    ? "shadow-lg" 
                                    : ""
                            }`}
                            style={{
                                background: player.id === userId ? 'rgba(142, 251, 123, 0.2)' : 'transparent',
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl w-10 text-center font-bold text-white">
                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm">
                                            👤
                                        </div>
                                        <span className="font-medium text-lg text-green-400">{player.name}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-bold text-lg">{player.victories} victoires</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}