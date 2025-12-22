import type { Server, Socket } from "socket.io";

export function cancelEquipmentSocket(io: Server, socket: Socket, rooms: Map<string, any>) {
  socket.on("cancelEquipment", () => {
    const roomId = [...socket.rooms].find((r) => r !== socket.id);
    if (!roomId) return;

    const state = rooms.get(roomId);
    if (!state) return;

    const player = state.players.find((p: any) => p.id === socket.id);
    if (!player) return;

    // On annule l'action en cours
    if (player.pendingEquipment) {
      player.pendingEquipment = null;
      io.to(socket.id).emit("log", "Équipement annulé.");
    }
  });
}