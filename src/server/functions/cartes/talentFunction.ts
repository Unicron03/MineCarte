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
