import React from "react";
import { LeftPanelProps } from "../../interfacePVP";
import DiscardPile from "./DiscardPile";


const StatBadge: React.FC<{ label: string; value: number | string; color: string }> = ({ label, value, color }) => (
  <div className={`flex flex-col items-center justify-center w-12 h-12 bg-gray-800 border-2 ${color} rounded-lg shadow-md`}>
    <span className="text-[10px] text-gray-400 uppercase font-bold">{label}</span>
    <span className="text-sm font-bold text-white">{value}</span>
  </div>
);

const EffectBadge: React.FC<{ effect: string; onClick?: (e: string) => void }> = ({ effect, onClick }) => {
  // Détermination de la couleur de fallback comme dans CardPVP
  let fallbackColor = "#e74c3c"; // Default red
  if (effect === "Esquive") fallbackColor = "#bdc3c7";
  else if (effect === "Invisible") fallbackColor = "#a29bfe";
  else if (effect.startsWith("Burn_")) fallbackColor = "#e67e22";
  else if (effect.startsWith("GoldenApple_")) fallbackColor = "#f1c40f";

  return (
    <div
      className="w-8 h-8 rounded-full border border-white bg-gray-800 overflow-hidden shadow-md cursor-pointer hover:scale-110 transition-transform"
      onClick={() => onClick && onClick(effect)}
      title={effect}
    >
      <img
        src={`/cards/${effect}.png`}
        alt={effect}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).parentElement!.style.backgroundColor = fallbackColor;
        }}
      />
    </div>
  );
};

const LeftPanel: React.FC<LeftPanelProps> = ({ me, opponent, onQuit, onEffectClick }) => {
  return (
    <>
      {/* --- PANNEAU ADVERSAIRE (Haut Gauche) --- */}
      <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 w-64">
        <div className="bg-black/80 backdrop-blur-sm border border-red-500/50 rounded-xl p-3 shadow-xl text-white">
          <div className="flex justify-between items-center mb-2 border-b border-red-500/30 pb-2">
            <h3 className="font-bold text-red-400 uppercase tracking-wider">Adversaire</h3>
          </div>

          <div className="flex justify-around mb-3">
            <StatBadge label="PV" value={opponent?.pv ?? 0} color="border-red-600" />
            <StatBadge label="Énergie" value={opponent?.energie ?? 0} color="border-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 text-center mb-2">
            <div className="bg-gray-800/50 rounded p-1">
              <span className="block font-bold text-white">{opponent?.deck?.length ?? 0}</span>
              Deck
            </div>
            <div className="bg-gray-800/50 rounded p-1">
              <span className="block font-bold text-white">{opponent?.discard?.length ?? 0}</span>
              Défausse
            </div>
          </div>

          {/* Effets Adversaire */}
          {opponent?.effects && opponent.effects.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-[10px] text-gray-400 mb-1">Effets actifs :</p>
              <div className="flex flex-wrap gap-1">
                {opponent.effects.map((effect, idx) => (
                  <EffectBadge key={idx} effect={effect} onClick={onEffectClick} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Défausse Adversaire (En dessous) */}
        <DiscardPile 
            cards={opponent?.discard || []} 
            label="Défausse"
            className="w-24 h-36 mx-auto shadow-xl"
        />
      </div>

      {/* --- PANNEAU JOUEUR (Bas Gauche) --- */}
      <div className="absolute bottom-4 left-4 z-40 flex flex-col gap-2 w-64">
        {/* Défausse Joueur (Au dessus) */}
        <DiscardPile 
            cards={me?.discard || []} 
            label="Ma Défausse"
            className="w-24 h-36 mx-auto shadow-xl"
        />

        <div className="bg-black/80 backdrop-blur-sm border border-green-500/50 rounded-xl p-3 shadow-xl text-white">
          <div className="flex justify-between items-center mb-2 border-b border-green-500/30 pb-2">
            <h3 className="font-bold text-green-400 uppercase tracking-wider">Vous</h3>
            <button
              onClick={onQuit}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1 rounded shadow-md transition-transform hover:scale-105"
            >
              Quitter
            </button>
          </div>

          <div className="flex justify-around mb-3">
            <StatBadge label="PV" value={me?.pv ?? 0} color="border-green-600" />
            <StatBadge label="Énergie" value={me?.energie ?? 0} color="border-yellow-500" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 text-center mb-2">
            <div className="bg-gray-800/50 rounded p-1">
              <span className="block font-bold text-white">{me?.deck?.length ?? 0}</span>
              Deck
            </div>
            <div className="bg-gray-800/50 rounded p-1">
              <span className="block font-bold text-white">{me?.discard?.length ?? 0}</span>
              Défausse
            </div>
          </div>

           {/* Effets Joueur */}
           {me?.effects && me.effects.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-[10px] text-gray-400 mb-1">Vos effets :</p>
              <div className="flex flex-wrap gap-1">
                {me.effects.map((effect, idx) => (
                  <EffectBadge key={idx} effect={effect} onClick={onEffectClick} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default LeftPanel;