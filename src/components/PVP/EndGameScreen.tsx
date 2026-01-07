import React from "react";
import { EndGameScreenProps } from "../../interfacePVP";

const EndGameScreen: React.FC<EndGameScreenProps> = ({ result, onQuit }) => {
    const text =
        result === "win"
            ? "Vous avez gagné !"
            : result === "lose"
            ? "Vous avez perdu..."
            : "Égalité";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center text-white z-50">
            <h1 className="text-4xl font-bold mb-6">{text}</h1>

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
