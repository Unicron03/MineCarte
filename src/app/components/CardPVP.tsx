"use client";
import React from "react";
import { cardList, actionList } from "../../types";


type CardProps = {
  name: string;
  cost?: number;
  vie?: number;
  clickable?: boolean;
  onTalentClick?: () => void;
  onAttackClick?: (attackName: string) => void;
};

const CardPVP: React.FC<CardProps> = ({
  name,
  cost,
  vie,
  clickable = false,
  onTalentClick,
  onAttackClick,
}) => {
  const cardData = cardList.find((c) => c.name === name);
  if (!cardData)
    return (
      <div className="w-20 h-28 bg-gray-700 text-white flex items-center justify-center text-xs rounded">
        Carte inconnue
      </div>
    );

  // Valeurs par défaut si non fournies
  const finalVie = vie ?? cardData.baseVie ?? 0;
  const finalCost = cost ?? cardData.baseCost ?? 0;

  // Récupération des attaques à partir de la liste des actions
  const attack1 = actionList.find((a) => a.name === cardData.attack1);
  const attack2 = actionList.find((a) => a.name === cardData.attack2);

  const imgSrc = `/card/${cardData.imageName}.png`;

  return (
    <div className="relative w-[120px] h-[180px] bg-yellow-100 border-2 border-gray-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
      {/* Image */}
      <img
        src={imgSrc}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-1 bg-black/40 text-white text-[9px] font-mono">
        {/* Nom, coût, PV */}
        <div className="flex justify-between items-center">
          <span className="font-bold truncate">{name}</span>
          <div className="flex flex-col items-end text-[8px] leading-tight">
            <span>PV: {finalVie}</span>
            <span>cout: {finalCost}</span>
          </div>
        </div>

        {/* Talent */}
        {cardData.talent && (
          <button
            className={`mt-1 px-1 py-[1px] bg-purple-600 rounded text-[8px] ${
              clickable ? "hover:bg-purple-800" : "cursor-default opacity-80"
            }`}
            disabled={!clickable}
            onClick={onTalentClick}
          >
            Talent: {cardData.talent}
          </button>
        )}

        {/* Attaques */}
        <div className="flex flex-col gap-1 mt-1">
          {attack1 && (
            <button
              className={`px-1 py-[1px] bg-red-600 rounded text-[8px] text-left ${
                clickable ? "hover:bg-red-800" : "cursor-default opacity-80"
              }`}
              disabled={!clickable}
              onClick={() => clickable && onAttackClick?.(attack1.name)}
            >
              {attack1.name} ({attack1.damage} dmg / coût: {attack1.cost})
              <br />
              <span className="text-[7px] opacity-80">{attack1.description}</span>
            </button>
          )}
          {attack2 && (
            <button
              className={`px-1 py-[1px] bg-blue-600 rounded text-[8px] text-left ${
                clickable ? "hover:bg-blue-800" : "cursor-default opacity-80"
              }`}
              disabled={!clickable}
              onClick={() => clickable && onAttackClick?.(attack2.name)}
            >
              {attack2.name} ({attack2.damage} dmg / coût: {attack2.cost})
              <br />
              <span className="text-[7px] opacity-80">{attack2.description}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardPVP;
export { actionList };
