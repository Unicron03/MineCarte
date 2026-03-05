import React from "react";
import { GameLogsProps } from "../utils/interfacePVP";

const GameLogs: React.FC<GameLogsProps> = ({ logs }) => {
    return (
        <div className="absolute top-2 right-2 w-64 h-48 bg-black/70 p-2 rounded-lg text-white text-xs overflow-y-auto font-mono">
            {logs.map((l, i) => (
                <p key={i}>{l}</p>
            ))}
        </div>
    );
};

export default GameLogs;
