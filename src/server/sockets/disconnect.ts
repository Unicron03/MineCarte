import { Server, Socket } from "socket.io";

export function disconnectSocket(io: Server, socket: Socket, rooms: Map<string, any>, userToRoom: Map<string, any>, waitingPlayer: any) {

socket.on("disconnect", () => {
    console.log("DISCONNECT:", socket.id);
    for (const [roomId, state] of rooms.entries()) {
      const playerIndex = state.players.findIndex((p: any) => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = state.players[playerIndex];
        player._disconnectedAt = Date.now();
        if (player.userId) {
          userToRoom.set(player.userId, { roomId, playerIndex });
        } else if ((socket as any).userId) {
          userToRoom.set((socket as any).userId, { roomId, playerIndex });
        }
        const opponent = state.players.find((p: any) => p.id !== socket.id);
        if (opponent) io.to(opponent.id).emit("log", "Votre adversaire est déconnecté...");
        return;
      }
    }
    if (waitingPlayer && waitingPlayer.socketId === socket.id) waitingPlayer = null;
  });
}