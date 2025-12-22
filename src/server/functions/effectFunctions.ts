import { Server } from "socket.io";
import type { Player, InGameCard } from "../../typesPvp"; 

// --- Identifiants d'Effets Temporaires ---
// Utilisés dans player.effects pour les bonus durant le tour
export const EFFECT_IDS = {
    CRAFT_TABLE_COST_RED_3: "CRAFT_TABLE_COST_RED_3",
};

// --- Contexte pour les fonctions d'effets ---
// Permet d'accéder à l'état de la partie et à l'objet socket.io pour l'envoi de logs
type EffectContext = {
    io: Server;
    roomId: string;
    currentPlayer: Player;
    opponentPlayer: Player; // Non utilisé pour l'instant, mais bonne pratique de l'inclure
};

/**
 * Fonction utilitaire pour envoyer un log à la room
 */
function log(context: EffectContext, msg: string) {
    context.io.to(context.roomId).emit("log", msg);
}


// --- Fonctions d'Effets d'Artefacts ---

/**
 * Table de craft (Coût: 1)
 * Effet : Réduit le coût de la prochaine carte posée de 3 ce tour.
 */
export function craftTableEffect(context: EffectContext) {
    const { currentPlayer } = context;
    if (!currentPlayer.effects) currentPlayer.effects = [];
    
    // Ajoute l'effet au tableau pour qu'il soit consommé par la prochaine carte jouée
    currentPlayer.effects.push(EFFECT_IDS.CRAFT_TABLE_COST_RED_3);
    
    log(context, `[Artefact] Table de craft activée. La prochaine carte coûte -3 ce tour.`);
}


/**
 * Enclume (Coût: 1)
 * Effet : Récupère un équipement de votre défausse et la transfère dans votre main.
 */
export function anvilEffect(context: EffectContext) {
    const { currentPlayer } = context;
    
    // Cherche le premier équipement dans la défausse
    const equipmentIndex = currentPlayer.discard.findIndex(c => c.category === "equipement");
    
    if (equipmentIndex === -1) {
        log(context, `[Artefact] Enclume n'a trouvé aucun équipement dans la défausse.`);
        return;
    }

    // Transfert de la carte de la défausse à la main
    const [equipment] = currentPlayer.discard.splice(equipmentIndex, 1);
    currentPlayer.hand.push(equipment);
    
    log(context, `[Artefact] Enclume a récupéré la carte Équipement "${equipment.name}" dans la main.`);
}


// --- Carte des fonctions d'effets ---
// Assurez-vous que les clés de cet objet correspondent exactement à la chaîne de caractères
// que vous mettez dans la propriété `effet` de vos cartes Artefact.
export const artefactEffects: {  [key: string]: (context: EffectContext) => void } = {
    "Table de craft": craftTableEffect, 
    "Enclume": anvilEffect, 
};