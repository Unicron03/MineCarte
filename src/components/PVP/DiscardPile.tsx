/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import CardPVPHand from "./CardPVPHand";
import { DiscardPileProps } from "../utils/interfacePVP";


const DiscardPile: React.FC<DiscardPileProps> = ({ cards, style, className, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  // On récupère les 3 dernières cartes pour l'effet visuel (la dernière du tableau est au sommet)
  const displayCards = cards.slice(-3);

  return (
    <>
      {/* Représentation visuelle du tas */}
      <div
        style={style}
        className={`relative cursor-pointer hover:scale-105 transition-transform select-none ${className || "w-24 h-36"}`}
        onClick={() => cards.length > 0 && setIsOpen(true)}
        title="Voir la défausse"
      >
        {cards.length === 0 ? (
          <div className="w-full h-full border-2 border-dashed border-gray-600/50 rounded-xl flex items-center justify-center bg-black/20">
            <span className="text-gray-500/50 text-[10px] font-bold uppercase tracking-widest text-center px-1">
              {label || "Défausse"}
            </span>
          </div>
        ) : (
          displayCards.map((card, index) => {
            // Calcul du décalage pour l'effet de tas (vers le haut et la droite)
            // index 0 = carte la plus basse visible
            const offset = index * 3; 
            return (
              <div
                key={index}
                className="absolute inset-0 rounded-xl border border-gray-800 shadow-xl overflow-hidden bg-gray-900"
                style={{
                  transform: `translate(${offset}px, -${offset}px)`,
                  zIndex: index,
                }}
              >
                <img
                  src={`/cards/${card.imageName}/${card.imageName}.png`}
                  alt={card.name}
                  className="w-full h-full object-cover opacity-90"
                  onError={(e) => {
                    e.currentTarget.src = "/cards/default.png";
                    e.currentTarget.onerror = null;
                  }}
                />
              </div>
            );
          })
        )}
        
        {/* Badge compteur */}
        {cards.length > 0 && (
            <div className="absolute -bottom-2 -right-2 z-50 bg-black/80 border border-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                {cards.length}
            </div>
        )}
      </div>

      {/* Modale d'affichage du contenu complet */}
      {isOpen && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-gray-900/90">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-gray-500 rounded-full block"></span>
                {label || "Défausse"} 
                <span className="text-gray-500 text-sm font-normal">({cards.length} cartes)</span>
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-black/40 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
                    {/* On inverse l'ordre pour voir les cartes les plus récemment défaussées en premier */}
                    {[...cards].reverse().map((card, i) => (
                        <CardPVPHand key={i} card={card} className="hover:scale-105 transition-transform duration-200 shadow-lg" hideStats={true} />
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiscardPile;
