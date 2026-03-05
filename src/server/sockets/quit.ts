import { Server, Socket } from "socket.io";
import { GameState, Player } from "../../components/utils/typesPvp";
import { appliquerResultatMatch } from "../functions/gestionVictoire";

// Gère la déconnexion d'un joueur
export function quitSocket(
    io: Server, 
    socket: Socket, 
    rooms: Map<string, GameState>, 
    userToRoom: Map<string, { roomId: string; playerIndex: number }>
) {

    // --- Réception de la déconnexion ---
    socket.on("quit", ({ roomId }) => {
        const state = rooms.get(roomId);
        if (!state) {
            // La room a peut-être déjà été supprimée (ex: l'adversaire a quitté en premier).
            // On envoie quand même un événement de défaite au client pour s'assurer qu'il voit l'écran de fin.
            socket.emit("defeat", { reason: "you_quit", pointsChange: -50 });
            return;
        }

        const quitter = state.players.find((p: Player) => p.id === socket.id);
        const opponent = state.players.find((p: Player) => p.id !== socket.id);

        // Le joueur qui quitte voit l'écran de défaite. Les -50 points ont déjà été appliqués au début du match.
        if (quitter) {
            io.to(quitter.id).emit("defeat", { reason: "you_quit", pointsChange: -50 });
        }

        // L'adversaire reçoit une victoire et la compensation de points/clés.
        if (opponent) {
            appliquerResultatMatch(opponent.userId, true).then((result) => {
                io.to(opponent.id).emit("victory", { reason: "opponent_quit", ...result });
                io.to(opponent.id).emit("log", "Votre adversaire a quitté. Vous avez gagné !");
            });
        }

        // --- Suppression de la room ---
        rooms.delete(roomId);
        state.players.forEach(p => { if (p.userId) userToRoom.delete(p.userId); });
    });
}
