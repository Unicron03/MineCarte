import type { Server, Socket } from "socket.io";
import { sendGameState, playEquipment } from "../functions/gameLogic";

export function selectTargetForEquipmentSocket(io: Server, socket: Socket, rooms: Map<string, any>) {
  socket.on("selectTargetForEquipment", ({ targetIndex }) => {
    const roomId = [...socket.rooms].find((r) => r !== socket.id);
    if (!roomId) return;

    const state = rooms.get(roomId);
    if (!state) return;

    const player = state.players.find((p: any) => p.id === socket.id);
    if (!player || !player.pendingEquipment) return;

    const cardIndex = player.pendingEquipment.cardIndex;
    const card = player.hand[cardIndex];
    const targetMob = player.board[targetIndex];

    if (!card || !targetMob) {
        player.pendingEquipment = null;
        return;
    }

    // Utilisation de la fonction centralisée qui gère les effets (Table de craft, etc.)
    const result = playEquipment(io, roomId, player, card, targetMob);

    if (result.success) {
        player.pendingEquipment = null;
        sendGameState(io, rooms, roomId);
    } else {
        // En cas d'erreur (pas assez d'énergie, etc.), on annule juste l'état d'attente
        player.pendingEquipment = null;
    }
  });
}