import { Server, Socket } from "socket.io";
import { CombatState, Player, Action, InGameCard } from "../../typesPvp";
import { actionList } from "../../data";
import { sendGameState, checkVictory, drawCard as drawCardLogic } from "../functions/gameLogic";
import { AttackOneMob, heal, AttackAllMobs, attackEsquive, damageAndDie, voleEnergie, attackDirectPlayer } from "../functions/cartes/attackFunction";
import { drawCard} from "../functions/cartes/talentFunction";
import { checkVillageGuardian } from "../functions/testEffectFonctions";

// Récupère l'action dans actionList grace a son nom
function getActionByName(name: string): Action | undefined {
  return actionList.find(
    (a) => a.name.toLowerCase() === name.toLowerCase()
  );
}

function executeAction( state: CombatState, action: Action, attacker: InGameCard, target: InGameCard | null, player: Player, opponent: Player): { killed?: boolean } | void | null {

  // Vérification de l'énergie
  if (player.energie < action.cost) {
    state.log.push(`Pas assez d'énergie pour ${action.name}`);
    return null;
  }

  // Je retire l'énergie au jouer
  player.energie -= action.cost;

  // J'execute l'action
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
      // Si damage est 0 (ex: Téléportation), on pioche 1 carte par défaut
      drawCard(state, player, action.damage || 1);
      return;

    case "applyEffect":
      // applyEffect(state, player, action); 
      return;
   }
}

// Fonction utilitaire pour finaliser l'attaque (logs, vérification victoire, envoi état)
function finalizeAttack(
  io: Server, 
  rooms: Map<string, any>, 
  roomId: string, 
  room: any,
  result: any, 
  state: CombatState, 
  opponent: Player, 
  target: InGameCard | null, 
  targetIndex: number | null, 
  action: Action
) {
  // Gestion de la mort d'une carte (seulement si c'est une attaque ciblée sur un mob adverse)
  // Note: AttackAllMobs gère ses propres morts en interne.
  if (result?.killed && target && targetIndex !== null && action.function !== "heal") { 
    opponent.discard.push(target);
    opponent.board.splice(targetIndex, 1);
    state.log.push(`${target.name} est détruite !`);

    // Vérification des synergies passives (ex: Si le Villageois meurt, le Golem perd son buff)
    // Note: On vérifie pour les deux joueurs car la mort d'un mob peut affecter l'autre (si on implémente des effets inverses)
    checkVillageGuardian(opponent, io, roomId);
  }

  // Si c'est une attaque de zone (AttackAllMobs), des mobs ont pu mourir sans déclencher le bloc ci-dessus.
  if (action.function === "AttackAllMobs") {
    checkVillageGuardian(opponent, io, roomId);
  }

  // Gestion de la défaite du joueur (qui peut arriver sur une attaque directe ou AOE si pas de mobs)
  if (result?.killed && !target && action.function !== "heal") { 
    state.log.push(`Le joueur est vaincu !`);
  }

  state.log.forEach((msg) => io.to(roomId).emit("log", msg));
  sendGameState(io, rooms, roomId);
  checkVictory(io, room, rooms);
}

export function attackSocket(io: Server, socket: Socket, rooms: Map<string, any>) {

  // 1. Demande d'attaque (Initiation)
  socket.on("requestAttack", ({ roomId, attackerIndex, attackName }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex((p: Player) => p.id === socket.id);
    if (playerIndex === -1) return;
    const player = room.players[playerIndex];
    const opponent = room.players[playerIndex === 0 ? 1 : 0];

    const attacker = player.board[attackerIndex];
    if (!attacker) return;

    if (attacker.hasAttacked) {
      socket.emit("log", "Ce mob a déjà attaqué ce tour-ci !");
      return;
    }

    const action = getActionByName(attackName);
    if (!action) {
      socket.emit("log", `Action inconnue : ${attackName}`);
      return;
    }

    // --- Gestion du ciblage ---

    // Cas 1 : Soin -> Demander une cible alliée
    if (action.function === "heal") {
      socket.emit("selectAllyTarget", { attackerIndex, attackName });
      return;
    }

    // Cas 2 : Attaque ciblée -> Demander une cible ennemie
    if (action.function === "AttackOneMob" || action.function === "attackEsquive" || action.function === "damageAndDie" || action.function === "voleEnergie") {
      // On ne demande de cibler que s'il y a des mobs en face
      const hasMobs = opponent.board.some((c: InGameCard) => c.category === "mob");

      if (hasMobs) {
        socket.emit("selectEnemyTarget", { attackerIndex, attackName });
        return;
      }
    }

    // Cas 3 : Attaque de zone ou sans cible (ex: DrawCard) -> Exécution immédiate
    const state: CombatState = { log: [] };
    const result = executeAction(state, action, attacker, null, player, opponent);
    
    if (result !== null) {
      attacker.hasAttacked = true;
    }
    finalizeAttack(io, rooms, roomId, room, result, state, opponent, null, null, action);
  });

  // 2. Exécution de l'attaque (Confirmation avec cible)
  socket.on("attack", ({ roomId, attackerIndex, attackName, targetIndex }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex((p: Player) => p.id === socket.id);
    if (playerIndex === -1) return;
    const player = room.players[playerIndex];
    const opponent = room.players[playerIndex === 0 ? 1 : 0];

    const attacker = player.board[attackerIndex];
    if (!attacker) return;

    if (attacker.hasAttacked) {
      socket.emit("log", "Ce mob a déjà attaqué ce tour-ci !");
      return;
    }

    const action = getActionByName(attackName);
    if (!action) return;

    // Déterminer la cible en fonction du type d'action
    let target: InGameCard | null = null;
    if (action.function === "heal") {
      // Pour le soin, on cible nos propres mobs
      target = targetIndex !== null && player.board[targetIndex] ? player.board[targetIndex] : null;
    } else {
      // Pour l'attaque, on cible les mobs adverses
      target = targetIndex !== null && opponent.board[targetIndex] ? opponent.board[targetIndex] : null;
    }

    const state: CombatState = { log: [] };
    const result = executeAction(state, action, attacker, target, player, opponent);
    
    if (result !== null) {
      attacker.hasAttacked = true;
    }
    finalizeAttack(io, rooms, roomId, room, result, state, opponent, target, targetIndex, action);
  });

}
