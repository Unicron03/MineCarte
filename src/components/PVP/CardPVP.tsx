import React from "react";
import { CardPVPProps } from "../../interfacePVP";
import { actionList } from "../../data";

const CardPVP: React.FC<CardPVPProps> = ({ card, clickable = false, isPlayer = false, overrides, onTalentClick, onAttackClick, onClick, onEffectClick, onEquipmentClick}) => {
    const finalCost = overrides?.cost ?? card.cost ?? 0;
    
    const isMob = card.category === "mob";
    const finalVie = isMob ? (overrides?.pv_durability ?? card.pv_durability ?? 0) : undefined;
    const attack1 = isMob ? actionList.find((a) => a.name === card.attack1) : undefined;
    const attack2 = isMob ? actionList.find((a) => a.name === card.attack2) : undefined;
    
    // L'effet est dans la propriété effet pour les Artefacts/Équipements, et talent pour les Mobs
    const effetOuTalent = isMob ? card.talent : card.effet;
    
    // Récupérer la définition du talent pour vérifier s'il est autoActivate
    const talentAction = isMob && card.talent ? actionList.find((a) => a.name === card.talent) : undefined;
    const isAutoActivate = talentAction?.autoActivate === true;

    // Gestion indépendante des clics
    // Le talent est utilisable si c'est notre tour, que c'est un mob, qu'il n'a pas servi ET qu'il n'est pas automatique
    const canUseTalent = isMob && clickable && !card.hasUsedTalent && !isAutoActivate;
    
    // L'attaque est possible si c'est notre tour (clickable) et que le mob n'a pas encore attaqué
    const canAttack = clickable && !card.hasAttacked;

    // Déterminer la couleur de la bordure
    let borderColor = "border-gray-600";
    if (card.category === "mob") borderColor = "border-red-600";
    else if (card.category === "artefact") borderColor = "border-yellow-500";
    else if (card.category === "equipement") borderColor = "border-blue-500";
    
    const imgSrc = `/cards/${card.imageName}.png`;
    
    const pvColor = isPlayer ? "bg-green-600" : "bg-red-600";

    return (
        <div 
            className={`relative w-40 h-60 bg-gray-900 rounded-xl border-2 ${borderColor} shadow-2xl flex flex-col overflow-hidden select-none ${clickable && onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
            onClick={clickable && onClick ? onClick : undefined}
        >
            {/* Image de fond */}
            <img
                src={imgSrc}
                alt={card.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            />

            {/* En-tete : Cout et PV */}
            <div className="relative z-10 flex justify-between items-start p-2">
                {/* Nom de la carte centré */}
                <div className="absolute top-3 left-0 w-full flex justify-center px-10 pointer-events-none">
                    <div className="bg-black/70 border border-white/20 rounded px-2 py-0.5 text-center truncate">
                        <span className="text-white font-bold text-[10px] uppercase tracking-wide block">{card.name}</span>
                    </div>
                </div>

                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-md z-20">
                    <span className="text-white font-bold text-lg">{finalCost}</span>
                </div>
                {isMob && finalVie !== undefined && (
                    <div className={`w-8 h-8 ${pvColor} rounded-full flex items-center justify-center border-2 border-white shadow-md z-20`}>
                        <span className="text-white font-bold text-sm">{finalVie}</span>
                    </div>
                )}
            </div>

            {/* Affichage des Equipements (En haut a droite, sous les PV) */}
            {card.equipment && card.equipment.length > 0 && (
                <div className="absolute top-11 right-2 z-20 flex flex-col gap-1">
                    {card.equipment.map((equip, index) => (
                        <div 
                            key={index}
                            title={equip.name}
                            className={`w-6 h-6 rounded-full border border-blue-400 bg-gray-800 overflow-hidden shadow-md ${onEquipmentClick ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEquipmentClick) onEquipmentClick(equip);
                          }}
                        >
                            <img 
                                src={`/cards/${equip.imageName}.png`} 
                                alt={equip.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.style.backgroundColor = "#3498db";
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Zone de description (Boutons d'action) */}
            <div className="relative z-10 h-28 mt-auto mx-2 mb-2 bg-black/80 border border-white/10 rounded p-2 overflow-y-auto flex flex-col gap-2 scrollbar-thin scrollbar-thumb-gray-500/40 scrollbar-track-transparent">
                {/* Talent / Effet */}
                {effetOuTalent && (
                    <button
                        className={`w-full px-2 py-1 rounded text-[10px] text-left border border-purple-500/30 ${
                            canUseTalent
                                ? "bg-purple-900/80 hover:bg-purple-800 text-purple-100"
                                : "bg-purple-900/40 text-purple-300/60 cursor-default"
                        } ${isAutoActivate ? "italic" : ""}`}
                        disabled={!canUseTalent}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isMob && onTalentClick) onTalentClick();
                        }}
                    >
                        <span className="font-bold block border-b border-purple-500/30 pb-0.5 mb-0.5">
                            {isMob ? (isAutoActivate ? "Passif" : "Talent") : "Effet"}
                        </span>
                        {effetOuTalent}
                    </button>
                )}

                {/* Attaques (Mobs uniquement) */}
                {isMob && (
                    <>
                        {attack1 && (
                            <button
                                className={`w-full px-2 py-1 rounded text-[10px] text-left border border-red-500/30 ${
                                    canAttack
                                        ? "bg-red-900/80 hover:bg-red-800 text-red-100"
                                        : "bg-red-900/40 text-red-300/60 cursor-default"
                                }`}
                                disabled={!canAttack}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (canAttack) onAttackClick?.(attack1.name);
                                }}
                            >
                                <span className="font-bold block border-b border-red-500/30 pb-0.5 mb-0.5">
                                    {attack1.name} <span className="text-white/80">({attack1.damage} dmg | Coût: {attack1.cost})</span>
                                </span>
                                <span className="opacity-80 italic">{attack1.description}</span>
                            </button>
                        )}
                        {attack2 && (
                            <button
                                className={`w-full px-2 py-1 rounded text-[10px] text-left border border-blue-500/30 ${
                                    canAttack
                                        ? "bg-blue-900/80 hover:bg-blue-800 text-blue-100"
                                        : "bg-blue-900/40 text-blue-300/60 cursor-default"
                                }`}
                                disabled={!canAttack}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (canAttack) onAttackClick?.(attack2.name);
                                }}
                            >
                                <span className="font-bold block border-b border-blue-500/30 pb-0.5 mb-0.5">
                                    {attack2.name} <span className="text-white/80">({attack2.damage} dmg | Coût: {attack2.cost})</span>
                                </span>
                                <span className="opacity-80 italic">{attack2.description}</span>
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Affichage des Effets (En bas a gauche) */}
            {card.effects && card.effects.length > 0 && (
                <div className="absolute bottom-2 left-2 z-20 flex flex-row flex-wrap gap-1 max-w-[80%]">
                    {card.effects.map((effect, index) => (
                        <div 
                            key={index}
                            title={effect}
                            className={`w-6 h-6 rounded-full border border-white bg-gray-800 overflow-hidden shadow-md ${onEffectClick ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEffectClick) onEffectClick(effect);
                            }}
                        >
                          <img 
                              src={`/cards/${effect}.png`} 
                              alt={effect}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.style.backgroundColor = effect === "Esquive" ? "#bdc3c7" : effect === "Invisible" ? "#a29bfe" : effect.startsWith("Burn_") ? "#e67e22" : effect.startsWith("GoldenApple_") ? "#f1c40f" : "#e74c3c";
                              }}
                          />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CardPVP;
