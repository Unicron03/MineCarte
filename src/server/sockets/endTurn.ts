import { Server, Socket } from "socket.io";
import { endTurn } from "../functions/gameLogic";
import { GameState, Player } from "../../components/utils/typesPvp";

// Gère la fin de tour d'un joueur
export function endTurnSocket(io: Server, socket: Socket, rooms: Map<string, GameState>, userToRoom: Map<string, { roomId: string; playerIndex: number }>) {

    // --- Réception de la fin de tour ---
    socket.on("endTurn", ({ roomId }) => {
        const state = rooms.get(roomId);

        // --- Vérification de l'existence de la room ---
        if (!state) return;
        endTurn(io, rooms, state, userToRoom);

        // --- Notification des joueurs ---
        const current = state.players[state.turnIndex];
        const opponent = state.players.find((p: Player) => p.id !== current.id);

        // --- Indication du tour aux joueurs ---
        io.to(current.id).emit("yourTurn");
        if (opponent) io.to(opponent.id).emit("opponentTurn");
    });
}