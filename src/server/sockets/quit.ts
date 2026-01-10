import { Server, Socket } from "socket.io";
import { GameState, Player } from "../../typesPvp";

// Gère la déconnexion d'un joueur
export function quitSocket(io: Server, socket: Socket, rooms: Map<string, GameState>) {

    // --- Réception de la déconnexion ---
    socket.on("quit", ({ roomId }) => {
        const state = rooms.get(roomId);
        if (!state) return;


        // --- Notification de la victoire à l'adversaire ---
        const opponent = state.players.find((p: Player) => p.id !== socket.id);
        if (opponent) {
            io.to(opponent.id).emit("victory", { reason: "opponent_quit" });
            io.to(opponent.id).emit("log", "Votre adversaire a quitté. Vous avez gagné !");
        }

        // --- Suppression de la room ---
        rooms.delete(roomId);
    });
}