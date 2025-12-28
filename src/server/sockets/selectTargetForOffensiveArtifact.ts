import { Server, Socket } from "socket.io";
import { GameState, CombatState } from "../../typesPvp";
import { tntEffect } from "../functions/cartes/artefactFunction";
import { sendGameState } from "../functions/gameLogic";
import { actionList } from "../../data";

export function selectTargetForOffensiveArtifactSocket(
  io: Server,
  socket: Socket,
  rooms: Map<string, GameState>
) {
  socket.on("selectTargetForOffensiveArtifact", ({ targetIndex }) => {
    // 1. Récupération propre de la room (comme selectTargetForEquipment)
    const roomId = [...socket.rooms].find((r) => r !== socket.id);
    if (!roomId) return;

    const state = rooms.get(roomId);
    if (!state) return;

    const player = state.players.find((p) => p.id === socket.id);
    if (!player || !player.pendingOffensiveArtifact) return;

    const opponent = state.players.find((p) => p.id !== player.id);
    if (!opponent) return;

    const cardIndex = player.pendingOffensiveArtifact.cardIndex;
    const card = player.hand[cardIndex];
    const targetMob = opponent.board[targetIndex];

    // Vérification que la carte et la cible existent
    if (!card || !targetMob) {
        player.pendingOffensiveArtifact = undefined;
        return;
    }

    // Identifier l'action associée (TNT par exemple)
    const actionName = card.effects || card.name;
    const actionDef = actionList.find((a) => a.name === actionName);

    if (actionDef && actionDef.function === "tntEffect") {
        // 2. Création du CombatState pour les logs (requis par tntEffect)
        const combatState: CombatState = { log: [] };

        tntEffect(io, roomId, combatState, player, opponent, targetIndex, actionDef.damage);
        
        // Emission des logs
        combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
        
        // Consommer l'énergie et la carte
        player.energie -= (card.cost ?? 0);
        player.hand.splice(cardIndex, 1);
        player.discard.push(card);
    }

    // Reset de l'état
    player.pendingOffensiveArtifact = undefined;

    sendGameState(io, rooms, roomId);
  });
}
