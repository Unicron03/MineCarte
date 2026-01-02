import type { Player, InGameCard, CombatState, EffectContext } from "../../../typesPvp";
import { heal } from "./attackFunction"; 

// --- Identifiants d'Effets Temporaires ---
export const EFFECT_IDS = {
    CRAFT_TABLE_COST_RED_3: "CRAFT_TABLE_COST_RED_3",
};

// Fonction utilitaire pour envoyer un log à la room
function log(context: EffectContext, msg: string) {

    // --- Envoi du message de log à tous les joueurs dans la room ---
    context.io.to(context.roomId).emit("log", msg);
}

// Table de craft : Réduit le coût de la prochaine carte posée de 3 ce tour.
export function craftTableEffect(context: EffectContext) {
    
    // --- Récupération du joueur courant ---
    const { currentPlayer } = context;
    if (!currentPlayer.effects) currentPlayer.effects = [];
    
    // --- Ajoute l'effet au tableau pour qu'il soit consommé par la prochaine carte jouée ---
    currentPlayer.effects.push(EFFECT_IDS.CRAFT_TABLE_COST_RED_3);
    log(context, `[Artefact] Table de craft activée. La prochaine carte coûte -3 ce tour.`);
}

// Détache les équipements d'un mob et les place dans la défausse du joueur
export function detachEquipment(player: Player, mob: InGameCard) {
    if (mob.equipment && mob.equipment.length > 0) {
        player.discard.push(...mob.equipment);
        mob.equipment = [];
    }
}

// Applique l'effet de régénération de la Potion
export function applyPotionRegen(state: CombatState, player: Player): void {

    // --- Parcourt tous les mobs du joueur ---
    player.board.forEach((card) => {

        // --- Vérifie si le mob a une Potion équipée ---
        if (card.category === "mob" && card.equipment) {

            // --- Vérifie la présence de la Potion ---
            const hasPotion = card.equipment.some((eq) => eq.name === "Potion");
            if (hasPotion) {

                // --- Activation de la Potion ---
                state.log.push(`[Potion] La potion s'active sur ${card.name}.`);
                heal(state, card, 10);
            }
        }
    });
}
