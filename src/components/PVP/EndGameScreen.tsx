import React from "react";
import { EndGameScreenProps } from "../utils/interfacePVP";

const EndGameScreen: React.FC<EndGameScreenProps> = ({ result, onQuit, data }) => {
    const text =
        result === "win"
            ? "Vous avez gagné !"
            : result === "lose"
            ? "Vous avez perdu..."
            : "Égalité";

    let rewardText = "";
    if (result === "win") {
        // Le gain net pour le joueur est de 100 points (150 pour la victoire - 50 pour la défaite initiale)
        const netPointsWin = 100;
        const keysWon = data?.keysChange ?? 2;
        rewardText = `+${netPointsWin} points et ${keysWon} clés`;
    } else if (result === "lose") {
        // Affiche le changement de points réel, qui peut être 0 si le joueur était déjà à 0 point.
        const pointsLost = data?.pointsChange ?? -50;
        rewardText = `${pointsLost > 0 ? '+' : ''}${pointsLost} points`;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center text-white z-50">
            <h1 className="text-4xl font-bold mb-6">{text}</h1>

            {rewardText && (
                <p className="text-2xl mb-6">{rewardText}</p>
            )}

            <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-xl"
                onClick={onQuit}
            >
                Quitter la partie
            </button>
        </div>
    );
};

export default EndGameScreen;