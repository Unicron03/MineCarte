import { Server, Socket } from "socket.io";
import { endTurn } from "../functions/gameLogic";

// Gère la fin de tour d'un joueur
export function endTurnSocket(io: Server, socket: Socket, rooms: Map<string, any>) {

    // --- Réception de la fin de tour ---
    socket.on("endTurn", ({ roomId }) => {
        const state = rooms.get(roomId);

        // --- Vérification de l'existence de la room ---
        if (!state) return;
        endTurn(io, rooms, state);

        // --- Notification des joueurs ---
        const current = state.players[state.turnIndex];
        const opponent = state.players.find((p: any) => p.id !== current.id);

        // --- Indication du tour aux joueurs ---
        io.to(current.id).emit("yourTurn");
        io.to(opponent.id).emit("opponentTurn");
    });
}