import React from "react";
import { PlayerHandProps } from "../../interfacePVP";
import CardPVPHand from "./CardPVPHand";


const PlayerHand: React.FC<PlayerHandProps> = ({ hand, onPlayCard, isMyTurn, selectionMode }) => {
  const totalCards = hand.length;
  // Angle total de l'arc (en degrés)
  const arcAngle = 40; 
  // Calcul de l'angle de départ pour centrer l'arc
  const startAngle = -arcAngle / 2;
  // Incrément d'angle entre chaque carte
  const angleStep = totalCards > 1 ? arcAngle / (totalCards - 1) : 0;

  return (
    <div className="relative w-full h-[180px] flex justify-center items-end z-20 pointer-events-none">
      {/* Conteneur centré pour les cartes */}
      <div className="relative w-[600px] h-full flex justify-center items-end">
        {hand.map((card, index) => {
          // Calcul de la rotation et de la position
          const rotate = totalCards === 1 ? 0 : startAngle + index * angleStep;
          // Décalage vertical pour suivre la courbe de l'arc (les cartes aux extrémités sont plus basses)
          const translateY = Math.abs(rotate) * 1.5; 
          // Décalage horizontal pour espacer les cartes
          const translateX = (index - (totalCards - 1) / 2) * 60;

          const canPlay = isMyTurn && selectionMode === 'none';

          return (
            <div
              key={index}
              className="absolute transition-all duration-300 ease-out origin-bottom pointer-events-auto group"
              style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`,
                zIndex: index,
                bottom: '0px',
              }}
            >
              {/* Wrapper pour l'effet de survol qui annule la rotation et agrandit */}
              <div className={`transition-transform duration-200 group-hover:-translate-y-24 group-hover:scale-125 group-hover:rotate-0 group-hover:z-50 ${canPlay ? "cursor-pointer" : "cursor-default grayscale-[0.3]"}`}>
                <CardPVPHand
                  card={card}
                  onClick={() => canPlay && onPlayCard(index)}
                  className={canPlay ? "hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:border-blue-400" : ""}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerHand;
