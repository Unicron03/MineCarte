import type { Server, Socket } from "socket.io";
import { sendGameState } from "../functions/gameLogic";

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

    // --- Application de l'équipement ---
    if (!targetMob.equipment) targetMob.equipment = [];
    targetMob.equipment.push(card);
    
    // Exemple : Si l'équipement donne des PV
    if (card.pv_durability) {
        targetMob.pv_durability = (targetMob.pv_durability || 0) + card.pv_durability;
    }
    // Vous pouvez ajouter ici d'autres effets (attaque, etc.)

    // --- Finalisation ---
    // Retirer la carte de la main et consommer l'énergie
    player.hand.splice(cardIndex, 1);
    player.energie -= card.cost;
    player.pendingEquipment = null;

    io.to(roomId).emit("log", `${player.username || "Joueur"} a équipé ${targetMob.name} avec ${card.name}.`);
    sendGameState(io, rooms, roomId);
  });
}