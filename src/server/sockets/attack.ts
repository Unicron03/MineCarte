import { Server, Socket } from "socket.io";
import { CombatState, Player, Action, InGameCard } from "../../typesPvp";
import { actionList } from "../../data";
import { sendGameState, checkVictory, checkVillageGuardian, handleMobDeath } from "../functions/gameLogic";
import { AttackOneMob, heal, AttackAllMobs, attackEsquive, damageAndDie, voleEnergie, attackDirectPlayer } from "../functions/cartes/attackFunction";
import { drawCard} from "../functions/cartes/talentFunction";
import { hasInvisibility } from "../functions/testEffectFonctions";

// Récupère l'action dans actionList grace a son nom
function getActionByName(name: string): Action | undefined {
    return actionList.find(
        (a) => a.name.toLowerCase() === name.toLowerCase()
    );
}

// Fonction principale pour exécuter une action d'attaque ou de soin
function executeAction( state: CombatState, action: Action, attacker: InGameCard, target: InGameCard | null, player: Player, opponent: Player): { killed?: boolean } | void | null {

    let finalCost = action.cost;

    // --- Vérification de l'effet Cloche ---
    if (attacker.category === "mob" && attacker.effects?.some(e => e.startsWith("BellDiscount_"))) {
        finalCost = 1;
        state.log.push(`${attacker.name} attaque à coût réduit grâce à la Cloche !`);
    }

    // --- Vérification de l'énergie ---
    if (player.energie < finalCost) {
        state.log.push(`Pas assez d'énergie pour ${action.name}`);
        return null;
    }

    // --- Retirer l'énergie au joueur ---
    player.energie -= finalCost;

    // --- Executer l'action ---
    switch (action.function) {
        case "AttackOneMob":
            if (!action.damage) return;
            return AttackOneMob(state, attacker, target, action.damage, opponent);

        case "attackEsquive":
            if (!action.damage) return;
            return attackEsquive(state, attacker, target, action.damage, opponent);

        case "damageAndDie":
            if (!action.damage) return;
            return damageAndDie(state, attacker, target, action.damage, player, opponent);

        case "voleEnergie":
            if (!action.damage) return;
            return voleEnergie(state, attacker, target, action.damage, opponent);

        case "attackDirectPlayer":
            if (!action.damage) return;
            return attackDirectPlayer(state, attacker, action.damage, opponent);

        case "AttackAllMobs":
            if (!action.damage) return;
            return AttackAllMobs(state, attacker, action.damage, opponent);

        case "heal":
            if (!action.damage) return;
            if (target) {
                heal(state, target, action.damage);
            }
            return;
    
        case "drawCard": 

            // Si damage est 0, on pioche 1 carte par défaut
            drawCard(state, player, action.damage || 1);
            return;
    }
}

// Fonction utilitaire pour finaliser l'attaque
function finalizeAttack(io: Server,  rooms: Map<string, any>,  roomId: string,  room: any, result: any,  state: CombatState,  opponent: Player,  target: InGameCard | null,  targetIndex: number | null,  action: Action) {
  
    // Gestion de la mort d'une carte (attaque cible unique)
    if (result?.killed && target && targetIndex !== null && action.function !== "heal") { 
        handleMobDeath(io, roomId, opponent, targetIndex, state.log);
    }

    // Si c'est une attaque de zone
    if (action.function === "AttackAllMobs") {

        // On vérifie la présence du Gardien du Village
        checkVillageGuardian(opponent, io, roomId); 
    }

    // Gestion de la défaite du joueur
    if (result?.killed && !target && action.function !== "heal") { 
        state.log.push(`Le joueur est vaincu !`);
    }

    state.log.forEach((msg) => io.to(roomId).emit("log", msg));
    sendGameState(io, rooms, roomId);
    checkVictory(io, room, rooms);
}

export function attackSocket(io: Server, socket: Socket, rooms: Map<string, any>) {

    // --- Demande d'attaque ---
    socket.on("requestAttack", ({ roomId, attackerIndex, attackName }) => {
      
        // --- Récupération de la room et des joueurs ---
        const room = rooms.get(roomId);
        if (!room) return;

        const playerIndex = room.players.findIndex((p: Player) => p.id === socket.id);
        if (playerIndex === -1) return;
        const player = room.players[playerIndex];
        const opponent = room.players[playerIndex === 0 ? 1 : 0];

        // --- Récupération de l'attaquant ---
        const attacker = player.board[attackerIndex];
        if (!attacker) return;

        if (attacker.hasAttacked) {
            socket.emit("log", "Ce mob a déjà attaqué ce tour-ci !");
            return;
        }

        // --- Récupération de l'action ---
        const action = getActionByName(attackName);
        if (!action) {
            socket.emit("log", `Action inconnue : ${attackName}`);
            return;
        }

        // --- Soin -> Demander une cible alliée ---
        if (action.function === "heal") {

            // --- Demander une cible alliée ---
            socket.emit("selectAllyTarget", { attackerIndex, attackName });
            return;
        }

        // --- Attaque ciblée -> Demander une cible ennemie ---
        if (action.function === "AttackOneMob" || action.function === "attackEsquive" || action.function === "damageAndDie" || action.function === "voleEnergie") {
          
            // --- Vérifier la présence de cibles valides ---
            const hasMobs = opponent.board.some((c: InGameCard) => c.category === "mob" && !hasInvisibility(c));

            if (hasMobs) {
                // --- Demander une cible ennemie ---
                socket.emit("selectEnemyTarget", { attackerIndex, attackName });
                return;
            }
        }

        // --- Attaque de zone ou sans cible -> Exécution immédiate ---
        const state: CombatState = { log: [] };
        const result = executeAction(state, action, attacker, null, player, opponent);
        
        if (result !== null) {
            attacker.hasAttacked = true;
        }

        // --- Finalisation de l'attaque ---
        finalizeAttack(io, rooms, roomId, room, result, state, opponent, null, null, action);
    });

    // Exécution de l'attaque après sélection de la cible
    socket.on("attack", ({ roomId, attackerIndex, attackName, targetIndex }) => {
      
        // --- Récupération de la room et des joueurs ---
        const room = rooms.get(roomId);
        if (!room) return;

        const playerIndex = room.players.findIndex((p: Player) => p.id === socket.id);
        if (playerIndex === -1) return;
        const player = room.players[playerIndex];
        const opponent = room.players[playerIndex === 0 ? 1 : 0];

        // --- Récupération de l'attaquant ---
        const attacker = player.board[attackerIndex];
        if (!attacker) return;

        if (attacker.hasAttacked) {
            socket.emit("log", "Ce mob a déjà attaqué ce tour-ci !");
            return;
        }

        // --- Récupération de l'action ---
        const action = getActionByName(attackName);
        if (!action) return;

        // --- Déterminer la cible en fonction du type d'action ---
        let target: InGameCard | null = null;
        if (action.function === "heal") {

            // --- Pour le soin, cibler les mobs du joueur ---
            target = targetIndex !== null && player.board[targetIndex] ? player.board[targetIndex] : null;
        } else {

            // --- Pour l'attaque, cibler les mobs adverses ---
            target = targetIndex !== null && opponent.board[targetIndex] ? opponent.board[targetIndex] : null;
            if (target && hasInvisibility(target)) {
                socket.emit("log", "Impossible d'attaquer une cible invisible !");
                return;
            }
        }

        // --- Exécution de l'attaque ---
        const state: CombatState = { log: [] };
        const result = executeAction(state, action, attacker, target, player, opponent);
        
        if (result !== null) {
            attacker.hasAttacked = true;
        }

        // --- Finalisation de l'attaque ---
        finalizeAttack(io, rooms, roomId, room, result, state, opponent, target, targetIndex, action);
    });

}
