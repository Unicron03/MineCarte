import { Server, Socket } from "socket.io";
import { endTurn } from "../functions/gameLogic";


export function endTurnSocket(io: Server, socket: Socket, rooms: Map<string, any>) {

  socket.on("endTurn", ({ roomId }) => {
    const state = rooms.get(roomId);
    if (!state) return;
    endTurn(io, rooms, state);

    const current = state.players[state.turnIndex];
    const opponent = state.players.find((p: any) => p.id !== current.id);

    io.to(current.id).emit("yourTurn");
    io.to(opponent.id).emit("opponentTurn");
  });
}