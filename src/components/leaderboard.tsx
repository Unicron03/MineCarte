"use client";

import { useEffect, useState } from "react";

export default function Leaderboard() {
    const [players, setPlayers] = useState([]);
    
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch("/api/leaderboard");
                const data = await res.json();
                setPlayers(data);
            } catch (err) {
                console.error("Erreur lors du chargement du leaderboard :", err);
            }
        };
        
        fetchLeaderboard();
    }, []);
    
    return (
        <div className="glass-nav after:!rounded-2xl !rounded-2xl flex flex-col items-center justify-start w-full h-full p-6 overflow-auto">
            <h2 className="text-4xl font-bold mb-6">🏆 Classement</h2>
            
            {players.length === 0 ? (
                <p className="text-lg text-gray-400">Chargement du classement...</p>
            ) : (
                <ul className="w-full max-w-md">
                    {players.map((player: { id: number; name: string; points: number }, index: number) => (
                        <li
                            key={player.id}
                            className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-xl p-3 mb-2 hover:bg-white/20 transition-all"
                        >
                            <span className="font-medium">
                                {index + 1}. {player.name}
                            </span>
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
