"use client";
import React from "react";
import { CardPVPProps } from "../../src/types";
import { actionList } from "../data";

const CardPVP: React.FC<CardPVPProps> = ({
  card,
  clickable = false,
  overrides,
  onTalentClick,
  onAttackClick,
}) => {
  const finalCost = overrides?.cost ?? card.cost ?? 0;
  const finalVie = overrides?.pv_durability ?? card.pv_durability ?? 0;
  const attack1 = actionList.find((a) => a.name === card.attack1);
  const attack2 = actionList.find((a) => a.name === card.attack2);

  const imgSrc = `/card/${card.imageName}.png`;
  return (
    <div className="relative w-[120px] h-[180px] bg-yellow-100 border-2 border-gray-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
      {/* Image */}
      <img
        src={imgSrc}
        alt={card.name}
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-1 bg-black/40 text-white text-[9px] font-mono">
        {/* Nom, coût, PV */}
        <div className="flex justify-between items-center">
          <span className="font-bold truncate">{card.name}</span>
          <div className="flex flex-col items-end text-[8px] leading-tight">
            <span>PV: {finalVie}</span>
            <span>Coût: {finalCost}</span>
          </div>
        </div>

        {/* Talent */}
        {card.talent && (
          <button
            className={`mt-1 px-1 py-[1px] bg-purple-600 rounded text-[8px] ${
              clickable ? "hover:bg-purple-800" : "cursor-default opacity-80"
            }`}
            disabled={!clickable}
            onClick={onTalentClick}
          >
            Talent: {card.talent}
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

