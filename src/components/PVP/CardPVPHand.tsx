import React from "react";
import { actionList } from "../../data";
import { CardPVPHandProps } from "../../interfacePVP";


const CardPVPHand: React.FC<CardPVPHandProps> = ({ card, onClick, style, className, hideStats }) => {
  const isMob = card.category === "mob";
  
  // Récupération des données complètes des actions
  const attack1Data = isMob ? actionList.find((a) => a.name === card.attack1) : undefined;
  const attack2Data = isMob ? actionList.find((a) => a.name === card.attack2) : undefined;
  const talentName = isMob ? card.talent : card.effet;
  const talentData = talentName ? actionList.find((a) => a.name === talentName) : undefined;
  const isAutoActivate = talentData?.autoActivate === true;

  // Couleurs de bordure selon la catégorie
  let borderColor = "border-gray-600";
  if (card.category === "mob") borderColor = "border-red-600";
  else if (card.category === "artefact") borderColor = "border-yellow-500";
  else if (card.category === "equipement") borderColor = "border-blue-500";

  const imgSrc = `/cards/${card.imageName}.png`;

  return (
    <div
      style={style}
      onClick={onClick}
      className={`relative w-40 h-60 bg-gray-900 rounded-xl border-2 ${borderColor} shadow-2xl flex flex-col overflow-hidden select-none ${className || ""}`}
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
        {isMob && card.pv_durability !== undefined && !hideStats && (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center border-2 border-white shadow-md z-20">
            <span className="text-white font-bold text-sm">{card.pv_durability}</span>
          </div>
        )}
      </div>

      {/* Zone de description (Attaques / Talents) - Style identique à CardPVP */}
      <div className="relative z-10 h-28 mt-auto mx-2 mb-2 bg-black/80 border border-white/10 rounded p-2 overflow-y-auto flex flex-col gap-2 scrollbar-thin scrollbar-thumb-gray-500/40 scrollbar-track-transparent">
        
        {/* Talent / Effet */}
        {talentName && (
          <div className={`w-full px-2 py-1 rounded text-[10px] text-left border border-purple-500/30 bg-purple-900/60 text-purple-100 ${isAutoActivate ? "italic" : ""}`}>
            <span className="font-bold block border-b border-purple-500/30 pb-0.5 mb-0.5">
              {isMob ? (isAutoActivate ? "Passif" : "Talent") : "Effet"}
            </span>
            {talentName}
          </div>
        )}

        {/* Attaques (Mobs uniquement) */}
        {isMob && (
          <>
            {attack1Data && (
              <div className="w-full px-2 py-1 rounded text-[10px] text-left border border-red-500/30 bg-red-900/60 text-red-100">
                <span className="font-bold block border-b border-red-500/30 pb-0.5 mb-0.5">
                  {attack1Data.name} <span className="text-white/80">({attack1Data.damage} dmg | Coût: {attack1Data.cost})</span>
                </span>
                <span className="opacity-80 italic">{attack1Data.description}</span>
              </div>
            )}
            {attack2Data && (
              <div className="w-full px-2 py-1 rounded text-[10px] text-left border border-blue-500/30 bg-blue-900/60 text-blue-100">
                <span className="font-bold block border-b border-blue-500/30 pb-0.5 mb-0.5">
                  {attack2Data.name} <span className="text-white/80">({attack2Data.damage} dmg | Coût: {attack2Data.cost})</span>
                </span>
                <span className="opacity-80 italic">{attack2Data.description}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardPVPHand;
