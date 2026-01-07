import React from "react";
import { TurnIndicatorProps } from "../../interfacePVP";


const TurnIndicator: React.FC<TurnIndicatorProps> = ({ isMyTurn }) => {
    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none">
            <div
                className={`px-10 py-3 rounded-xl border-2 shadow-2xl font-black text-xl uppercase tracking-widest transition-all duration-500 transform ${
                    isMyTurn
                        ? "bg-green-900/90 border-green-400 text-green-100 shadow-[0_0_25px_rgba(74,222,128,0.6)] scale-110"
                        : "bg-red-900/90 border-red-500 text-red-100 shadow-[0_0_25px_rgba(248,113,113,0.6)] scale-100 opacity-90"
                }`}
            >
                {isMyTurn ? "À votre tour" : "Au tour de votre Adversaire"}
            </div>
        </div>
    );
};

export default TurnIndicator;
