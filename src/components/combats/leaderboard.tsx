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
        <div className="glass-nav after:!rounded-2xl !rounded-2xl flex flex-col items-center justify-start w-full h-full p-6 overflow-auto">
            <h2 className="text-4xl font-bold mb-6">🏆 Classement</h2>
            
            {isLoading ? (
                <p className="text-lg text-gray-400">Chargement du classement...</p>
            ) : players.length === 0 ? (
                <p className="text-lg text-gray-400">Aucun joueur dans ce classement</p>
            ) : (
                <ul className="w-full px-4">
                    {players.map((player, index) => (
                        <li
                            key={player.id}
                            className={`flex justify-between items-center bg-white/10 backdrop-blur-md rounded-xl p-3 mb-3 hover:bg-white/20 transition-all ${
                                player.id === userId ? "border-2 border-yellow-400" : ""
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-xl w-8">
                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                                </span>
                                <div className="flex flex-col">
                                    <span className="font-medium">{player.name}</span>
                                    <span className="text-xs text-gray-400">
                                        {player.victories}V - {player.defeats}D
                                    </span>
                                </div>
                            </div>
                            <span className="font-semibold text-yellow-400">
                                {player.points} pts
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}