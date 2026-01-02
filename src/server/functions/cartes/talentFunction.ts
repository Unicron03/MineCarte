import { Server } from "socket.io";
import { Player, CombatState, InGameCard } from "../../../typesPvp";
import { handleMobDeath } from "../gameLogic";

// Pioche une ou plusieurs cartes
export function drawCard(state: CombatState, player: Player, count: number): void {

    // Nombre de cartes effectivement piochées
    let drawn = 0;

    // Pioche les cartes
    for (let i = 0; i < count; i++) {
        if (player.deck.length === 0) break;
        player.hand.push(player.deck.shift()!);
        drawn++;
    }

    state.log.push(`${player.id} pioche ${drawn} carte(s)`);
}

// Passif: Si un talent adverse est activé, le mob actionneur prend 10 PV.
export function soundDetection(io: Server, roomId: string, wardenOwner: Player, opponent: Player, activatorCard: InGameCard): void {
    if (!activatorCard || activatorCard.pv_durability === undefined) return;

    const damage = 10;
    activatorCard.pv_durability -= damage;

    io.to(roomId).emit("log", `Le Warden détecte des vibrations !`);
    io.to(roomId).emit("log", `${activatorCard.name} subit ${damage} dégâts par Détection Sonore.`);

    // Vérification si le mob qui a activé le talent meurt des dégâts du Warden
    if (activatorCard.pv_durability <= 0) {
        // On doit trouver l'index de la carte dans le board de l'adversaire pour gérer sa mort
        const cardIndex = opponent.board.findIndex(c => c.uuid === activatorCard.uuid);
        if (cardIndex !== -1) {
            const log: string[] = [];
            handleMobDeath(io, roomId, opponent, cardIndex, log);
            log.forEach(l => io.to(roomId).emit("log", l));
        }
    }
}

// Retire de l'énergie à l'adversaire
export function removeEnergyFromOpponent(io: Server, roomId: string, player: Player, opponent: Player, card: InGameCard): void {
    const amount = 1;
    if (opponent.energie > 0) {
        opponent.energie = Math.max(0, opponent.energie - amount);
        io.to(roomId).emit("log", `${card.name} utilise Ralentissement calculé et retire ${amount} énergie à l'adversaire.`);
    } else {
        io.to(roomId).emit("log", `${card.name} tente de retirer de l'énergie, mais l'adversaire est déjà à 0.`);
    }
}

// Talent Tortue : Applique l'effet de protection
export function applyCarapaceEffect(io: Server, roomId: string, player: Player, opponent: Player, card: InGameCard): void {
    if (!card.effects) card.effects = [];
    
    // On ajoute l'effet s'il n'est pas déjà présent
    if (!card.effects.includes("CarapaceProtectrice")) {
        card.effects.push("CarapaceProtectrice");
        io.to(roomId).emit("log", `${card.name} rentre dans sa carapace (Protection 50% prochaine attaque).`);
    }
}
