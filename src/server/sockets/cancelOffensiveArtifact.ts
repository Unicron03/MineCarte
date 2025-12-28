import { Server, Socket } from "socket.io";
import { GameState } from "../../typesPvp";
import { sendGameState } from "../functions/gameLogic";

export function cancelOffensiveArtifactSocket(
  io: Server,
  socket: Socket,
  rooms: Map<string, GameState>
) {
  socket.on("cancelOffensiveArtifact", () => {
    let roomId = "";
    let playerIndex = -1;

    for (const [rId, state] of rooms.entries()) {
      const idx = state.players.findIndex((p) => p.id === socket.id);
      if (idx !== -1) {
        roomId = rId;
        playerIndex = idx;
        break;
      }
    }

    if (!roomId || playerIndex === -1) return;
    const state = rooms.get(roomId);
    if (!state) return;

    const player = state.players[playerIndex];
    player.pendingOffensiveArtifact = undefined;
    
    io.to(socket.id).emit("log", "Action annulée.");
    // On ne renvoie pas forcément tout le state si rien n'a changé visuellement à part le log, 
    // mais pour être sûr que le client est synchro :
    sendGameState(io, rooms, roomId);
  });
}
