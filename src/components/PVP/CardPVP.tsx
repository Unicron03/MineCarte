import React from "react";
import { CardPVPProps } from "../../../src/typesPvp";
import { actionList } from "../../data";

const CardPVP: React.FC<CardPVPProps> = ({
  card,
  clickable = false,
  overrides,
  onTalentClick,
  onAttackClick,
}) => {
  const finalCost = overrides?.cost ?? card.cost ?? 0;
  
  const isMob = card.category === "mob";
  
  const finalVie = isMob ? (overrides?.pv_durability ?? card.pv_durability ?? 0) : undefined;
  
  const attack1 = isMob ? actionList.find((a: { name: string }) => a.name === card.attack1) : undefined;
  const attack2 = isMob ? actionList.find((a: { name: string }) => a.name === card.attack2) : undefined;
  
  // L'effet est dans la propriété effet pour les Artefacts/Équipements, et talent pour les Mobs
  const effetOuTalent = isMob ? card.talent : card.effet;

  // Gestion indépendante des clics (Talent vs Attaque)
  // Le talent est utilisable si c'est notre tour (clickable), que c'est un mob, et qu'il n'a pas encore servi
  const canUseTalent = isMob && clickable && !card.hasUsedTalent;
  
  // L'attaque est possible si c'est notre tour (clickable) et que le mob n'a pas encore attaqué
  const canAttack = clickable && !card.hasAttacked;

  // Déterminer la couleur de la bordure
  let borderColor = "border-gray-800";
  if (card.category === "mob") borderColor = "border-red-500";
  else if (card.category === "artefact") borderColor = "border-yellow-500";
  else if (card.category === "equipement") borderColor = "border-blue-500";
  
  const imgSrc = `/card/${card.imageName}.png`;
  
  return (
    <div className={`relative w-[120px] h-[180px] bg-yellow-100 border-2 ${borderColor} rounded-lg shadow-lg flex flex-col overflow-hidden`}>
      {/* --- Affichage des Effets (En bas à gauche) --- */}
      {card.effects && card.effects.length > 0 && (
        <div className="absolute bottom-2 left-2 z-20 flex flex-row flex-wrap gap-1 max-w-[80%]">
          {card.effects.map((effect, index) => (
            <div 
              key={index}
              title={effect}
              className="w-8 h-8 rounded-full border-2 border-white bg-gray-800 overflow-hidden shadow-md"
            >
              <img 
                src={`/card/${effect}.png`} 
                alt={effect}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.style.backgroundColor = effect === "Esquive" ? "#bdc3c7" : "#e74c3c";
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Image */}
      <img
        src={imgSrc}
        alt={card.name}
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-1 bg-black/40 text-white text-[9px] font-mono">
        {/* Nom, coût, PV */}
        <div className="flex justify-between items-center bg-black/60 p-1 rounded">
          <span className="font-bold text-xs">{card.name}</span>
          <span className="bg-blue-500 px-1 rounded">C: {finalCost}</span>
          {/* PV/Durabilité uniquement pour les Mobs */}
          {isMob && finalVie !== undefined && (
            <span className="bg-red-500 px-1 rounded">PV: {finalVie}</span>
          )}
        </div>

        {/* CONTENU SPÉCIFIQUE À LA CATÉGORIE */}
        <div className="flex-1 overflow-auto mt-1 p-1">
          {/* Affichage du Talent/Effet */}
          {effetOuTalent && (
              <button
                className={`px-1 py-[1px] bg-purple-600 rounded text-[8px] text-left mb-1 w-full ${
                  canUseTalent ? "hover:bg-purple-800" : "cursor-default opacity-80"
                }`}
                disabled={!canUseTalent} // Seuls les Mobs sont cliquables pour le talent, et si pas déjà utilisé
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMob && onTalentClick) onTalentClick();
                }}
              >
                {isMob ? `Talent: ${effetOuTalent}` : `Effet: ${effetOuTalent}`}
              </button>
          )}

          {isMob && (
            // --- Mob ---
            <div className="flex flex-col gap-1">
              {attack1 && (
                <button
                  className={`px-1 py-[1px] bg-red-600 rounded text-[8px] text-left ${
                    canAttack ? "hover:bg-red-800" : "cursor-default opacity-80"
                  }`}
                  disabled={!canAttack}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canAttack) onAttackClick?.(attack1.name);
                  }}
                >
                  {attack1.name} ({attack1.damage} dmg / coût: {attack1.cost})
                  <br />
                  <span className="text-[7px] opacity-80">{attack1.description}</span>
                </button>
              )}
              {attack2 && (
                <button
                  className={`px-1 py-[1px] bg-blue-600 rounded text-[8px] text-left ${
                    canAttack ? "hover:bg-blue-800" : "cursor-default opacity-80"
                  }`}
                  disabled={!canAttack}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canAttack) onAttackClick?.(attack2.name);
                  }}
                >
                  {attack2.name} ({attack2.damage} dmg / coût: {attack2.cost})
                  <br />
                  <span className="text-[7px] opacity-80">{attack2.description}</span>
                </button>
              )}
            </div>
          )}
          
          {!isMob && !effetOuTalent && (
              <p className="text-xs text-center text-gray-400">Aucun effet défini</p>
          )}
        </div>
        
        {/* Catégorie en bas à droite */}
        <span className="self-end bg-gray-800 px-1 rounded text-[7px] opacity-90">
            {card.category.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default CardPVP;
