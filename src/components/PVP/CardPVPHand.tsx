import React from "react";
import { InGameCard } from "../../typesPvp";
import { actionList } from "../../data";

interface CardPVPHandProps {
  card: InGameCard;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const CardPVPHand: React.FC<CardPVPHandProps> = ({ card, onClick, style, className }) => {
  const isMob = card.category === "mob";
  
  // Récupération des données complètes des actions
  const attack1Data = isMob ? actionList.find((a) => a.name === card.attack1) : undefined;
  const attack2Data = isMob ? actionList.find((a) => a.name === card.attack2) : undefined;
  const talentName = isMob ? card.talent : card.effet;
  const talentData = talentName ? actionList.find((a) => a.name === talentName) : undefined;

  // Couleurs de bordure selon la catégorie
  let borderColor = "border-gray-600";
  if (card.category === "mob") borderColor = "border-red-600";
  else if (card.category === "artefact") borderColor = "border-yellow-500";
  else if (card.category === "equipement") borderColor = "border-blue-500";

  const imgSrc = `/card/${card.imageName}.png`;

  return (
    <div
      style={style}
      onClick={onClick}
      className={`relative w-40 h-60 bg-gray-900 rounded-xl border-2 ${borderColor} shadow-2xl overflow-hidden flex flex-col select-none ${className || ""}`}
    >
      {/* Image de fond */}
      <img
        src={imgSrc}
        alt={card.name}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* En-tête : Coût et PV */}
      <div className="relative z-10 flex justify-between items-start p-2">
        {/* Nom de la carte centré */}
        <div className="absolute top-3 left-0 w-full flex justify-center px-10 pointer-events-none">
          <div className="bg-black/70 border border-white/20 rounded px-2 py-0.5 text-center truncate">
            <span className="text-white font-bold text-[10px] uppercase tracking-wide block">
              {card.name}
            </span>
          </div>
        </div>

        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-md z-20">
          <span className="text-white font-bold text-lg">{card.cost}</span>
        </div>
        {isMob && card.pv_durability !== undefined && (
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-md z-20">
            <span className="text-white font-bold text-sm">{card.pv_durability}</span>
          </div>
        )}
      </div>

      {/* Zone de description (Attaques / Talents) */}
      <div className="relative z-10 flex-1 mt-2 mx-2 mb-2 bg-black/80 border border-white/10 rounded p-2 overflow-hidden flex flex-col gap-2">
        
        {/* Talent / Effet */}
        {talentName && (
          <div className="text-xs text-purple-300">
            <span className="font-bold block border-b border-purple-500/30 pb-0.5 mb-0.5">
              {isMob ? "Talent" : "Effet"}: {talentName}
            </span>
            <p className="text-[9px] text-gray-300 leading-tight">{talentData?.description || "Aucune description"}</p>
          </div>
        )}

        {/* Attaques (Mobs uniquement) */}
        {isMob && (
          <>
            {attack1Data && (
              <div className="text-xs text-red-300">
                <span className="font-bold block"> {attack1Data.name} <span className="text-white">({attack1Data.damage} dmg | Coût: {attack1Data.cost})</span></span>
              </div>
            )}
            {attack2Data && (
              <div className="text-xs text-blue-300">
                <span className="font-bold block"> {attack2Data.name} <span className="text-white">({attack2Data.damage} dmg | Coût: {attack2Data.cost})</span></span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardPVPHand;
