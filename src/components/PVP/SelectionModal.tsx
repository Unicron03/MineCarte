import React from "react";
import CardPVP from "./CardPVP";
import { SelectionModalProps } from "../utils/interfacePVP";


const SelectionModal: React.FC<SelectionModalProps> = ({isOpen, title, message, targets, onSelect, onCancel, borderColor = "border-gray-500",}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className={`bg-gray-900 border-2 ${borderColor} p-6 rounded-lg text-center max-w-3xl w-full`}>
        <h3 className={`text-2xl font-bold mb-4 ${borderColor.replace("border", "text")}`}>
          {title}
        </h3>
        <p className="text-white mb-6">{message}</p>

        <div className="flex flex-wrap justify-center gap-4 mb-6 max-h-[60vh] overflow-y-auto p-2">
          {targets.map((card) => (
            <div
              key={card.boardIndex}
              onClick={() => onSelect(card.boardIndex)}
              className={`cursor-pointer hover:scale-105 transition-transform border border-gray-600 rounded p-2 bg-black/50 hover:${borderColor}`}
            >
              <CardPVP
                card={card}
                overrides={{ cost: card.cost, pv_durability: card.pv_durability }}
                clickable={false} // On gère le clic via le div parent
              />
            </div>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-bold transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default SelectionModal;