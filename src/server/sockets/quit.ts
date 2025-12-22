import { Server, Socket } from "socket.io";

export function quitSocket(io: Server, socket: Socket, rooms: Map<string, any>) {


  socket.on("quit", ({ roomId }) => {
    const state = rooms.get(roomId);
    if (!state) return;
    const quitter = state.players.find((p: any) => p.id === socket.id);
    const opponent = state.players.find((p: any) => p.id !== socket.id);
    if (opponent) {
      io.to(opponent.id).emit("victory", { reason: "opponent_quit" });
      io.to(opponent.id).emit("log", "Votre adversaire a quitté. Vous avez gagné !");
    }
    rooms.delete(roomId);
  });
}