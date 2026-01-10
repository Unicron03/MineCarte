import { Server, Socket } from "socket.io";

// Gère la déconnexion d'un joueur
export function quitSocket(io: Server, socket: Socket, rooms: Map<string, any>) {

    // --- Réception de la déconnexion ---
    socket.on("quit", ({ roomId }) => {
        const state = rooms.get(roomId);
        if (!state) return;


        // --- Notification de la victoire à l'adversaire ---
        const opponent = state.players.find((p: any) => p.id !== socket.id);
        if (opponent) {
            io.to(opponent.id).emit("victory", { reason: "opponent_quit" });
            io.to(opponent.id).emit("log", "Votre adversaire a quitté. Vous avez gagné !");
        }

        // --- Suppression de la room ---
        rooms.delete(roomId);
    });
}