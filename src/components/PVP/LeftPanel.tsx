import React from "react";
import { Player } from "../../typesPvp";

interface LeftPanelProps {
  me: Player | null;
  opponent: Player | null;
  onQuit: () => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ me, opponent, onQuit }) => {
  return (
    <div className="w-64 bg-black/70 text-white rounded-lg p-4 text-sm h-[90vh] overflow-y-auto border border-gray-600">
      <button
        onClick={onQuit}
        className="mb-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >
        Quitter
      </button>
      <h3 className="text-lg font-bold mb-2 text-yellow-400">Informations</h3>
      <div className="mb-4">
        <h4 className="font-semibold text-green-400 mb-1">Vous</h4>
        <p>Énergie : {me?.energie ?? 0}</p>
        <p>Cartes dans le deck : {me?.deck?.length ?? 0}</p>
        <p>Cartes en main : {me?.hand?.length ?? 0}</p>
        <p>Cartes dans la défausse : {me?.discard?.length ?? 0}</p>
        <p>Cartes sur le plateau : {me?.board?.length ?? 0}</p>
        <p>PV : {me?.pv ?? 0}</p>
        <p>
          Effect :{" "}
          {me?.effects && me.effects.length > 0
            ? me.effects.join(", ")
            : "Aucun"}
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-red-400 mb-1">Adversaire</h4>
        <p>Énergie : {opponent?.energie ?? 0}</p>
        <p>Cartes dans le deck : {opponent?.deck?.length ?? 0}</p>
        <p>Cartes en main : {opponent?.hand?.length ?? 0}</p>
        <p>Cartes dans la défausse : {opponent?.discard?.length ?? 0}</p>
        <p>Cartes sur le plateau : {opponent?.board?.length ?? 0}</p>
        <p>PV : {opponent?.pv ?? 0}</p>
        <p>
          Effect :{" "}
          {opponent?.effects && opponent.effects.length > 0
            ? opponent.effects.join(", ")
            : "Aucun"}
        </p>
      </div>
    </div>
  );
};

export default LeftPanel;
