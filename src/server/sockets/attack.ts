import { Server, Socket } from "socket.io";
import { CombatState, Player, Action, InGameCard, GameState } from "../../components/utils/typesPvp";
import { getActionList } from "../../../server";
import { sendGameState, checkVictory, checkVillageGuardian, handleMobDeath } from "../functions/gameLogic";
import { AttackOneMob, heal, AttackAllMobs, attackEsquive, damageAndDie, voleEnergie, attackDirectPlayer, hurlementSombre, applyTankEffect, AttaqueRandomMobAndPlayer, AttackRandomCat, applyTortueGenialeEffect, applyDimensionalProtection, Entraide } from "../functions/cartes/attackFunction";
import { drawCard, checkRetourALEnvoyeur, updateGuardianEffect, checkFlammesPerpetuelles } from "../functions/cartes/talentFunction";
import { hasInvisibility, isStunned, getAttackCost } from "../functions/testEffectFonctions";

// Récupère l'action dans actionList grace a son nom
function getActionByName(name: string): Action | undefined {
    return getActionList().find(
        (a) => a.name.toLowerCase() === name.toLowerCase()
    );
}

// Fonction principale pour exécuter une action d'attaque ou de soin
function executeAction(io: Server, roomId: string, state: CombatState, action: Action, attacker: InGameCard, target: InGameCard | null, player: Player, opponent: Player): { killed?: boolean; error?: string; msg?: string } | void | null {

    let baseCost = action.cost;

    // --- Vérification de l'effet Cloche ---
    if (attacker.category === "mob" && attacker.effects?.some(e => e.startsWith("BellDiscount_"))) {
        baseCost = 1;
        state.log.push(`${attacker.name} attaque à coût réduit grâce à la Cloche !`);
    }

    // --- Calcul du coût final avec équipements (ex: Botte célérité) ---
    const finalCost = getAttackCost(attacker, baseCost);

    // --- Vérification de l'énergie ---
    if (player.energie < finalCost) {
        return { error: "not_enough_energy", msg: `Pas assez d'énergie pour ${action.name}` };
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
            return AttackAllMobs(io, roomId, state, attacker, action.damage, opponent, player);

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

        case "hurlementSombre":
            if (!action.damage) return;
            return hurlementSombre(state, attacker, target, action.damage, opponent);
            
        case "applyTankEffect":
            return applyTankEffect(state, attacker);

        case "AttaqueRandomMobAndPlayer":
            if (!action.damage) return;
            return AttaqueRandomMobAndPlayer(io, roomId, state, attacker, action.damage, opponent, player);

        case "AttackRandomCat":
            return AttackRandomCat(state, attacker, target, opponent, io, roomId, player);

        case "applyTortueGenialeEffect":
            return applyTortueGenialeEffect(state, attacker);

        case "applyDimensionalProtection":
            return applyDimensionalProtection(state, player);
        
        case "Entraide":
            return Entraide(state, attacker, target, player, opponent, io, roomId);

        case "defaultFunction":
            return { error: "not_implemented", msg: "Cette fonction n'est pas implémentée." };
    }
}

// Fonction utilitaire pour finaliser l'attaque
function finalizeAttack(io: Server,  rooms: Map<string, GameState>,  roomId: string,  room: GameState, result: { killed?: boolean; error?: string; msg?: string } | void | null,  state: CombatState,  targetOwner: Player,  target: InGameCard | null,  targetIndex: number | null,  action: Action, attackerPlayer: Player, userToRoom: Map<string, { roomId: string; playerIndex: number }>) {
  
    // Gestion de la mort d'une carte (attaque cible unique)
    if (result?.killed && target && targetIndex !== null && action.function !== "heal") { 
        handleMobDeath(io, roomId, targetOwner, targetIndex, state.log, attackerPlayer);
        // Mise à jour de l'effet Lien Éternel si un Gardien est mort
        updateGuardianEffect(state, targetOwner);
    }

    // Si c'est une attaque de zone
    if (action.function === "AttackAllMobs") {

        // On vérifie la présence du Gardien du Village
        checkVillageGuardian(targetOwner, io, roomId); 
    }

    // Gestion de la défaite du joueur
    if (result?.killed && !target && action.function !== "heal") { 
        state.log.push(`Le joueur est vaincu !`);
    }

    state.log.forEach((msg) => io.to(roomId).emit("log", msg));
    sendGameState(io, rooms, roomId);
    checkVictory(io, room, rooms, userToRoom);
}

export function attackSocket(io: Server, socket: Socket, rooms: Map<string, GameState>, userToRoom: Map<string, { roomId: string; playerIndex: number }>) {

    // --- Demande d'attaque ---
    socket.on("requestAttack", ({ roomId, attackerIndex, attackName }) => {
      
        // --- Récupération de la room et des joueurs ---
        const room = rooms.get(roomId);
        if (!room) return;

        const playerIndex = room.players.findIndex((p: Player) => p.id === socket.id);
        if (playerIndex === -1) return;

        // --- Vérifier que c'est bien le tour du joueur ---
        if (room.turnIndex !== playerIndex) {
            socket.emit("log", "Ce n'est pas votre tour !");
            return;
        }


        // --- Vérifier que c'est bien le tour du joueur ---
        if (room.turnIndex !== playerIndex) {
            socket.emit("log", "Ce n'est pas votre tour !");
            return;
        }

        const player = room.players[playerIndex];
        const opponent = room.players[playerIndex === 0 ? 1 : 0];

        // --- Récupération de l'attaquant ---
        const attacker = player.board[attackerIndex];
        if (!attacker) return;

        if (attacker.hasAttacked) {
            socket.emit("log", "Ce mob a déjà attaqué ce tour-ci !");
            return;
        }

        // --- Vérifier si le mob est étourdi ---
        if (isStunned(attacker)) {
            socket.emit("log", "Ce mob est étourdi et ne peut pas attaquer !");
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
        if (action.function === "AttackOneMob" || action.function === "attackEsquive" || action.function === "damageAndDie" || action.function === "voleEnergie" || action.function === "hurlementSombre" || action.function === "Entraide") {
          
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
        const result = executeAction(io, roomId, state, action, attacker, null, player, opponent);
        
        if (result && (result as { error?: string; msg?: string }).error) {
            socket.emit("log", (result as { error?: string; msg?: string }).msg);
            return;
        }

        if (result !== null) {
            attacker.hasAttacked = true;
            checkFlammesPerpetuelles(io, roomId, attacker, opponent);
        }

        // --- Finalisation de l'attaque ---
        finalizeAttack(io, rooms, roomId, room, result, state, opponent, null, null, action, player, userToRoom);
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

        // --- Vérifier si le mob est étourdi ---
        if (isStunned(attacker)) {
            socket.emit("log", "Ce mob est étourdi et ne peut pas attaquer !");
            return;
        }

        // --- Récupération de l'action ---
        const action = getActionByName(attackName);
        if (!action) return;

        // --- Déterminer la cible en fonction du type d'action ---
        let target: InGameCard | null = null;
        let targetOwner = opponent; // Par défaut, la cible est à l'adversaire
        let finalTargetIndex = targetIndex;

        if (action.function === "heal") {

            // --- Pour le soin, cibler les mobs du joueur ---
            target = targetIndex !== null && player.board[targetIndex] ? player.board[targetIndex] : null;
            targetOwner = player;
        } else {

            // --- Pour l'attaque, cibler les mobs adverses ---
            target = targetIndex !== null && opponent.board[targetIndex] ? opponent.board[targetIndex] : null;
            if (target && hasInvisibility(target)) {
                socket.emit("log", "Impossible d'attaquer une cible invisible !");
                return;
            }
        }

        // --- Talent Gast : Retour à l'envoyeur ---
        // Si le mob a ce talent, il y a une chance que l'attaque soit redirigée sur lui-même
        if (attacker.category === "mob" && attacker.talent === "Retour à l'envoyeur") {
            const isRedirected = checkRetourALEnvoyeur(io, roomId, attacker, player, opponent);
            if (isRedirected) {
                target = attacker;
                targetOwner = player; // La cible devient le joueur lui-même
                finalTargetIndex = attackerIndex; // L'index devient celui de l'attaquant
            }
        }

        // --- Talent Poulpe : Encre Noire ---
        // Si le joueur ciblé (targetOwner) est sous l'effet Encre Noire, l'attaque est redirigée
        if (targetOwner.effects && targetOwner.effects.includes("EncreNoire")) {
            // On cherche les mobs valides pour la redirection (les mobs du défenseur)
            const validRedirectTargets = targetOwner.board
                .map((c: InGameCard, idx: number) => ({ card: c, index: idx }))
                .filter((item: { card: InGameCard; index: number }) => item.card.category === "mob");

            if (validRedirectTargets.length > 0) {
                // Choix aléatoire
                const randomTarget = validRedirectTargets[Math.floor(Math.random() * validRedirectTargets.length)];
                target = randomTarget.card;
                finalTargetIndex = randomTarget.index;
                
                // Consommation de l'effet
                targetOwner.effects = targetOwner.effects.filter((e: string) => e !== "EncreNoire");
                socket.emit("log", `Encre Noire ! L'attaque est redirigée vers ${target?.name} !`);
            }
        }

        // --- Exécution de l'attaque ---
        const state: CombatState = { log: [] };
        // Note: On passe targetOwner comme "opponent" (le receveur des dégâts excédentaires) pour executeAction
        const result = executeAction(io, roomId, state, action, attacker, target, player, targetOwner);
        
        if (result && (result as { error?: string; msg?: string }).error) {
            socket.emit("log", (result as { error?: string; msg?: string }).msg);
            return;
        }

        if (result !== null) {
            attacker.hasAttacked = true;
            checkFlammesPerpetuelles(io, roomId, attacker, opponent);
        }

        // --- Finalisation de l'attaque ---
        finalizeAttack(io, rooms, roomId, room, result, state, targetOwner, target, finalTargetIndex, action, player, userToRoom);
    });

}
