/* eslint-disable @next/next/no-img-element */
import React from "react";
import { EffectDetailsModalProps } from "../utils/interfacePVP";


const EffectDetailsModal: React.FC<EffectDetailsModalProps> = ({isOpen, onClose, title, description, imageName, type,}) => {
  if (!isOpen) return null;

  // Couleur de bordure selon le type
  const borderColor =
    type === "effect"
      ? "border-purple-500"
      : type === "equipment"
      ? "border-blue-500"
      : "border-yellow-500";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`relative w-full max-w-sm bg-gray-900 text-white rounded-xl border-2 ${borderColor} shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200`}
      >
        {/* Header */}
        <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
          <h3 className="font-bold text-lg tracking-wide text-yellow-400">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl font-bold px-2"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-4">
          {imageName && (
            <div className="w-20 h-20 rounded-full border-4 border-gray-700 bg-gray-800 overflow-hidden shadow-inner">
              <img 
                src={`/cards/${imageName}/all.png`} 
                alt={title} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.src = "/cards/default.png";
                  e.currentTarget.onerror = null;
                }}
              />
            </div>
          )}
          
          <p className="text-center text-gray-300 text-sm leading-relaxed italic">
            {description || "Aucune description disponible."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EffectDetailsModal;
