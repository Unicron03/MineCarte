import React from 'react';
import { EffectDisplayProps } from '../utils/interfacePVP';

const EffectDisplay: React.FC<EffectDisplayProps> = ({ title, effects, isSelf }) => {
    // Si la liste est vide ou non définie, le composant n'affiche rien.
    if (!effects || effects.length === 0) {
        return null;
    }

    // Définition des classes Tailwind pour la couleur du titre et de la bordure
    const titleColor = isSelf ? "text-green-300" : "text-red-300";
    const borderColor = isSelf ? "border-green-500" : "border-red-500";
    const maxWidthClass = "max-w-lg"; // Ajustez cette valeur si vous voulez que l'affichage soit plus ou moins large

    return (
        // Conteneur principal
        <div className={`w-full mt-2 p-2 border-2 ${borderColor} rounded bg-black/50 ${maxWidthClass} mx-auto text-left`}>
            {/* Titre */}
            <h4 className={`text-sm font-bold ${titleColor} mb-1`}>{title}</h4>
            
            {/* Liste des effets */}
            <ul className="list-disc ml-5 text-xs">
                {effects.map((effect, index) => (
                    <li key={index} className="text-white">
                        {effect}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EffectDisplay;