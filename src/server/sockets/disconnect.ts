import { Server, Socket } from "socket.io";
import { GameState, Player } from "../../typesPvp";

// Gère la déconnexion d'un joueur
export function disconnectSocket(io: Server, socket: Socket, rooms: Map<string, GameState>, userToRoom: Map<string, { roomId: string; playerIndex: number }>, checkAndClearWaitingPlayer: () => void) {

    socket.on("disconnect", () => {
        console.log("DISCONNECT:", socket.id);

        // --- Recherche du joueur dans les rooms ---
        for (const [roomId, state] of rooms.entries()) {
            const playerIndex = state.players.findIndex((p: Player) => p.id === socket.id);
            
            // Si le joueur est trouvé dans cette room
            if (playerIndex !== -1) {

                // --- Marquer la déconnexion ---
                const player = state.players[playerIndex];
                player._disconnectedAt = Date.now();

                // --- Notification de la déconnexion ---
                if (player.userId) {
                    userToRoom.set(player.userId, { roomId, playerIndex });
                } else if ((socket as unknown as { userId: string }).userId) {
                    userToRoom.set((socket as unknown as { userId: string }).userId, { roomId, playerIndex });
                }

                // --- Informer l'autre joueur ---
                const opponent = state.players.find((p: Player) => p.id !== socket.id);
                if (opponent) io.to(opponent.id).emit("log", "Votre adversaire est déconnecté...");
                return;
            }
        }
        
        // --- Retirer de la file d'attente si présent ---
        checkAndClearWaitingPlayer();
    });
}
