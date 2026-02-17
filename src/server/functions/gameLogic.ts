import { Server, Socket } from "socket.io";
import type { InGameCard, Player, GameState } from "../../components/utils/typesPvp";
import { getActionList } from "../../../server";
import { applyCraftTableEffect, handleBurnEffect, handleGoldenAppleEffect, checkAndTriggerWarden } from "./testEffectFonctions";
import { healPlayer, drawCardsEffect, fishingRodEffect, applyEnchantmentTableEffect, anvilEffect, checkAnvilCondition } from "./cartes/artefactFunction";
import { detachEquipment, applyPotionRegen, applyPickaxeEffect, hasElytra } from "./cartes/equipementFunction";
import { removeEnergyFromOpponent, applyCarapaceEffect, pressionPsychologique, checkWitherExplosionNoire, enchantementPuissant, levitation, encreNoire } from "./cartes/talentFunction";
import { appliquerResultatMatch } from "./gestionVictoire";


// --- Piocher une carte ---
export function drawCard(player: Player) {
    const card = player.deck.shift();
    if (!card) {
        console.warn("drawCard: deck vide");
        return;
    }
    player.hand.push(card);
}

// --- Jouer une carte ---
export function playCard(io: Server, roomId: string, player: Player, card: InGameCard, opponent: Player) {
  
    // --- Validation de base ---
    if (!card) return { success: false, msg: "Carte invalide." };

    // --- Utiliser l'index pour trouver et retirer la carte ---
    const cardIndex = player.hand.findIndex((c) => c.uuid === card.uuid);
    if (cardIndex === -1) return { success: false, msg: "Carte non trouvée en main." };
    
    // --- Récupérer la carte réelle ---
    const found = player.hand[cardIndex];

    // --- Calcul du coût ---
    let finalCost = found.cost;
    
    // Clon ge la carte pour éviter les problèmes de référence partagée
    const cardToPlay = JSON.parse(JSON.stringify(found));

    // --- Gestion des équipements ---
    if (found.category === "equipement") {
        return { success: false, msg: "L'action pour équiper est invalide ici." };
    }

    // --- Gestion des artefacts ---
    if (found.category === "artefact") {

        // --- Calcul du coût avec effets (table de craft) ---
        finalCost = applyCraftTableEffect(player, found, io, roomId, false); 

        if (player.energie < finalCost) {
            return { success: false, msg: "Pas assez d'énergie." };
        }

        // --- Vérification spécifique pour l'Enclume avant de consommer les ressources ---
        if (found.name === "Enclume") {
            const check = checkAnvilCondition(player);
            if (!check.valid) {
                return { success: false, msg: check.msg || "Impossible de jouer l'Enclume." };
            }
        }

        // --- Application réelle de l'effet ---
        applyCraftTableEffect(player, found, io, roomId, true);

        if (found.effet) {
            const action = getActionList().find(a => a.name === found.effet);
            if (action) {
                if (action.function === "healPlayer") {
                    const combatState = { log: [] as string[] };

                    // --- Soigner le joueur ---
                    healPlayer(combatState, player, action.damage);
                    combatState.log.forEach((msg: string) => io.to(roomId).emit("log", msg));
                } else if (action.function === "drawCardsEffect") {
                    const combatState = { log: [] as string[] };

                    // --- Piocher des cartes ---
                    drawCardsEffect(combatState, player, action.damage);
                    combatState.log.forEach((msg: string) => io.to(roomId).emit("log", msg));
                } else if (action.function === "fishingRodEffect") {
                    const combatState = { log: [] as string[] };

                    // --- Effet de la canne à pêche ---
                    fishingRodEffect(combatState, player, opponent);
                    combatState.log.forEach((msg: string) => io.to(roomId).emit("log", msg));
                } else if (action.function === "applyEnchantmentTableEffect") {

                    // --- Effet de la Table d'enchantement ---
                    applyEnchantmentTableEffect(io, roomId, player, action.name);
                } else if (action.function === "anvilEffect") {

                    // --- Effet de l'Enclume ---
                    anvilEffect(io, roomId, player, action.name);
                } else {

                    // --- Gestion des autres effets ---
                    if (!player.effects) player.effects = [];
                    player.effects.push(action.name);
                    io.to(roomId).emit("log", `[Effet] ${player.id} active ${action.name}.`);
                }
            }
        }

        // --- L'artefact est consommé et va dans la défausse ---
        player.discard.push(cardToPlay);

        // --- On retire la carte de la main ---
        player.hand.splice(cardIndex, 1);

        // --- On paie le coût de l'artefact ---
        player.energie -= finalCost;
        return { success: true, msg: `Vous avez joué ${found.name}`, update: true };
    }

    // --- On vérifie les effets actifs (table de craft) ---
    finalCost = applyCraftTableEffect(player, found, io, roomId, false);

    if (player.energie < finalCost) {
        return { success: false, msg: "Pas assez d'énergie." };
    }
    // --- Application réelle de l'effet ---
    applyCraftTableEffect(player, found, io, roomId, true);
    player.energie -= finalCost;

    // --- Placement sur le plateau ---
    if (found.category === "mob") {
        player.board.push(cardToPlay);

        // --- Vérification des synergies (Golem et Villageois) ---
        checkVillageGuardian(player, io, roomId, opponent);

        // --- Talent Araignée (Ralentissement calculé) ---
        // S'active immédiatement à la pose
        if (found.talent === "Ralentissement calculé") {
             removeEnergyFromOpponent(io, roomId, player, opponent, cardToPlay);
        }

        // --- Talent Tortue (Carapace Protectrice) ---
        // S'active immédiatement à la pose
        if (found.talent === "Carapace Protectrice") {
             applyCarapaceEffect(io, roomId, player, opponent, cardToPlay);
        }

        // --- Talent Wither (Explosion noire) ---
        // Vérification à la pose (peu probable d'être < 30% mais cohérent)
        if (found.talent === "Explosion noire") {
             checkWitherExplosionNoire(io, roomId, player, opponent, cardToPlay);
        }

        // --- Talent Sorcière (Enchantement puissant) ---
        // S'active immédiatement à la pose
        if (found.talent === "Enchantement puissant") {
             enchantementPuissant(io, roomId, player, opponent, cardToPlay);
        }

        // --- Talent Shulker (Lévitation) ---
        // S'active immédiatement à la pose
        if (found.talent === "Lévitation") {
             levitation(io, roomId, player, opponent, cardToPlay);
        }

        // --- Talent Poulpe (Encre Noire) ---
        // S'active immédiatement à la pose
        if (found.talent === "Encre Noire") {
             encreNoire(io, roomId, player, opponent, cardToPlay);
        }

        // --- DÉTECTION SONORE (WARDEN) ---
        // Si le mob joué a un talent auto-actif (ex: Golem), cela déclenche le Warden adverse
        const action = getActionList().find(a => a.name === found.talent);
        // Exception pour le Gast : Son talent "Retour à l'envoyeur" est passif mais ne se déclenche qu'à l'attaque, pas à la pose
        if (action && action.autoActivate && found.talent !== "Retour à l'envoyeur") {
             checkAndTriggerWarden(io, roomId, player, opponent, cardToPlay);
        }
    } else if (found.category === "equipement") {
        // --- Déjà gérée dans playCardSocket ---
    } else {
        return { success: false, msg: `Catégorie de carte non reconnue pour l'action.`};
    }

    // --- Retirer de la main du joueur ---
    player.hand.splice(cardIndex, 1);
    
    return { success: true, msg: `Vous avez joué ${found.name}` };
}

// --- Jouer un équipement ---
export function playEquipment(io: Server, roomId: string, player: Player, card: InGameCard, targetMob: InGameCard) {
  
    // --- Validation de base ---
    const cardIndex = player.hand.findIndex((c) => c.uuid === card.uuid);
    if (cardIndex === -1) return { success: false, msg: "Carte non trouvée en main." };
    
    const found = player.hand[cardIndex];
    if (found.category !== "equipement") return { success: false, msg: "Ce n'est pas un équipement." };
    if (targetMob.category !== "mob") return { success: false, msg: "Cible invalide." };

    // --- Calcul du coût ---
    const finalCost = applyCraftTableEffect(player, found, io, roomId, false);

    // --- Vérification énergie ---
    if (player.energie < finalCost) {
        return { success: false, msg: "Pas assez d'énergie." };
    }

    // --- Paiement et Consommation de l'effet ---
    applyCraftTableEffect(player, found, io, roomId, true);
    player.energie -= finalCost;

    // --- Application de l'équipement ---
    const equipmentCard = JSON.parse(JSON.stringify(found));
    if (!targetMob.equipment) targetMob.equipment = [];
    targetMob.equipment.push(equipmentCard);

    // --- Retrait de la main ---
    player.hand.splice(cardIndex, 1);

    io.to(roomId).emit("log", `${player.id} équipe ${found.name} sur ${targetMob.name}`);
    return { success: true, msg: `Équipement placé`, update: true };
}

// --- Terminer le tour ---
export async function endTurn(
    io: Server, 
    rooms: Map<string, GameState>, 
    state: GameState, 
    userToRoom: Map<string, { roomId: string; playerIndex: number }>
) {

    // --- Récupérer le joueur qui termine son tour ---
    const playerEnding = state.players[state.turnIndex];

    // --- Effets de FIN de tour ---
    const combatStateEnd = { log: [] as string[] };
    for (let i = playerEnding.board.length - 1; i >= 0; i--) {
        const card = playerEnding.board[i];
        if (!card || card.category !== 'mob' || !card.effects) continue;

        // --- gestion de la golden apple ---
        handleGoldenAppleEffect(combatStateEnd, playerEnding, i);

        // --- Gestion de l'effet Cloche ---
        const bellEffectIndex = card.effects.findIndex((e: string) => e.startsWith("BellDiscount_"));
        if (bellEffectIndex !== -1) {
            const effect = card.effects[bellEffectIndex];
            const duration = parseInt(effect.split("_")[1]);

            if (duration <= 1) {
                // Le tour est terminé, on retire l'effet
                card.effects.splice(bellEffectIndex, 1);
                combatStateEnd.log.push(`L'effet de la Cloche sur ${card.name} se dissipe.`);
            } else {
                // On décrémente la durée (pour des effets futurs plus longs)
                card.effects[bellEffectIndex] = `BellDiscount_${duration - 1}`;
            }
        }

        // --- Gestion de l'effet Stun ---
        const stunIndex = card.effects.findIndex((e: string) => e.startsWith("Stun_"));
        if (stunIndex !== -1) {
            const effect = card.effects[stunIndex];
            const duration = parseInt(effect.split("_")[1]);

            if (duration <= 1) {
                card.effects.splice(stunIndex, 1);
                combatStateEnd.log.push(`${card.name} n'est plus étourdi.`);
            } else {
                card.effects[stunIndex] = `Stun_${duration - 1}`;
            }
        }
    }
    combatStateEnd.log.forEach((msg: string) => io.to(state.roomId).emit("log", msg));

    // --- Changement de joueur ---
    state.turnIndex = (state.turnIndex + 1) % 2;
    const current = state.players[state.turnIndex];

    // --- Effets de DÉBUT de tour (ex: Brûlure, Potion) ---
    const combatStateStart = { log: [] as string[] };
    
    for (let i = current.board.length - 1; i >= 0; i--) {
        const card = current.board[i];

        // --- gestion de la brûlure ---
        handleBurnEffect(io, state.roomId, combatStateStart, current, i);

        // Si la carte a été retirée (morte), l'index i pointe soit vers undefined, soit vers une autre carte
        if (current.board[i] !== card) continue;

        // --- DÉTECTION SONORE (WARDEN) ---
        // Si le Golem a son talent actif (DoubleDamage), le Warden réagit à chaque début de tour
        if (card.name === "Golem" && card.effects?.includes("DoubleDamage")) {
            const opponent = state.players.find((p: Player) => p.id !== current.id);
            if (opponent) {
                checkAndTriggerWarden(io, state.roomId, current, opponent, card);
            }
        }

        if (card.category === "mob") {
            // --- Talent Araignée (Ralentissement calculé) ---
            // S'active à chaque début de tour
            if (card.talent === "Ralentissement calculé") {
                const opponent = state.players.find((p: Player) => p.id !== current.id);
                if (opponent) {
                    removeEnergyFromOpponent(io, state.roomId, current, opponent, card);
                    checkAndTriggerWarden(io, state.roomId, current, opponent, card);
                }
            }

            // --- Talent Tortue (Carapace Protectrice) ---
            // S'active à chaque début de tour
            if (card.talent === "Carapace Protectrice") {
                const opponent = state.players.find((p: Player) => p.id !== current.id);
                if (opponent) {
                    applyCarapaceEffect(io, state.roomId, current, opponent, card);
                    checkAndTriggerWarden(io, state.roomId, current, opponent, card);
                }
            }

            // --- Talent Wither (Explosion noire) ---
            // Vérification à chaque début de tour
            if (card.talent === "Explosion noire") {
                const opponent = state.players.find((p: Player) => p.id !== current.id);
                if (opponent) {
                    checkWitherExplosionNoire(io, state.roomId, current, opponent, card);
                }
            }

            // --- Talent Sorcière (Enchantement puissant) ---
            // S'active à chaque début de tour
            if (card.talent === "Enchantement puissant") {
                const opponent = state.players.find((p: Player) => p.id !== current.id);
                if (opponent) {
                    enchantementPuissant(io, state.roomId, current, opponent, card);
                    checkAndTriggerWarden(io, state.roomId, current, opponent, card);
                }
            }

            // --- Talent Shulker (Lévitation) ---
            // S'active à chaque début de tour
            if (card.talent === "Lévitation") {
                const opponent = state.players.find((p: Player) => p.id !== current.id);
                if (opponent) {
                    levitation(io, state.roomId, current, opponent, card);
                    checkAndTriggerWarden(io, state.roomId, current, opponent, card);
                }
            }

            // --- Talent Poulpe (Encre Noire) ---
            // S'active à chaque début de tour
            if (card.talent === "Encre Noire") {
                const opponent = state.players.find((p: Player) => p.id !== current.id);
                if (opponent) {
                    encreNoire(io, state.roomId, current, opponent, card);
                    checkAndTriggerWarden(io, state.roomId, current, opponent, card);
                }
            }
        }
    }

    // --- appliquer la régénération de la potion ---
    applyPotionRegen(combatStateStart, current);
    
    // --- appliquer l'effet de la pioche ---
    applyPickaxeEffect(combatStateStart, current);
    
    combatStateStart.log.forEach((msg: string) => io.to(state.roomId).emit("log", msg));

    // --- Réinitialiser le statut d'attaque des mobs du joueur qui commence son tour ---
    current.board.forEach((card: InGameCard) => {
        card.hasAttacked = false;
        card.hasUsedTalent = false;

        // --- Retirer l'effet Esquive et Invisible au début du tour du propriétaire ---
        if (card.category === "mob" && card.effects) {
            const index = card.effects.indexOf("Esquive");
            if (index !== -1) {
                card.effects.splice(index, 1);
            }
            const indexInvisible = card.effects.indexOf("Invisible");
            if (indexInvisible !== -1) {
                card.effects.splice(indexInvisible, 1);
            }
        }

        // --- Retirer l'effet Table d'enchantement à la fin du tour ---
        if (current.effects && current.effects.includes("Table d'enchantement")) {
            current.effects = current.effects.filter((e: string) => e !== "Table d'enchantement");
        }
    });

    // --- Indiquer que le joueur commence un nouveau tour ---
    if (current.turnCount === undefined) current.turnCount = 0;
    current.turnCount++;

    // --- Appliquer le gain d'énergie correctement ---
    const isSecondPlayer = state.turnIndex === 1;
    const { gain } = applyEnergyGain(current, isSecondPlayer);

    // --- Pioche et envoi d'état ---
    drawCard(current);
    io.to(state.roomId).emit("log",`Tour de ${current.id} → +${gain} énergie (total: ${current.energie})`);
    sendGameState(io, rooms, state.roomId);
    if (await checkVictory(io, state, rooms, userToRoom)) return;
}

// --- Envoyer l'état du jeu ---
export function sendGameState(io: Server, rooms: Map<string, GameState>, roomId: string) {
  
    // --- Récupération de l'état du jeu ---
    const state = rooms.get(roomId);
    if (!state) return;

    // Envoyer un état du jeu adapté à chaque joueur
    for (const player of state.players) {

        // --- Récupérer l'adversaire ---
        const opponent = state.players.find((p: Player) => p.id !== player.id);

        // --- Construction de l'état visible ---
        const visibleState = {
            selfId: player.id,
            roomId: state.roomId,
            turnIndex: state.turnIndex,
            players: [
                {
                  id: player.id,
                  energie: player.energie,
                  deck: player.deck,
                  hand: player.hand,
                  board: player.board,
                  discard: player.discard,
                  pv: player.pv,
                  effects: player.effects,
                },
                opponent
                  ? {
                      id: opponent.id,
                      energie: opponent.energie,
                      deck: new Array(opponent.deck.length).fill({ hidden: true }),
                      hand: new Array(opponent.hand.length).fill({ hidden: true }),
                      board: opponent.board,
                      discard: opponent.discard,
                      pv: opponent.pv,
                      effects: opponent.effects,
                    }
                  : null,
            ].filter((p) => p !== null),
        };
        
        io.to(player.id).emit("updateState", visibleState);
    }
}

// --- Gérer le matchmaking ---
export function handleMatchmaking(
    io: Server, 
    socket: Socket, 
    rooms: Map<string, GameState>, 
    waitingPlayer: { socketId: string; token: string; userId?: string; deck: InGameCard[] } | null, 
    genToken: () => string, 
    createPlayer: (socketId: string, deck: InGameCard[], token: string, userId?: string) => Player,
    currentDeck: InGameCard[],
    currentUserId: string | undefined,
    sendGameState: (io: Server, rooms: Map<string, GameState>, roomId: string) => void, 
    applyEnergyGain: (player: Player, isSecondPlayer: boolean) => { gain: number; before: number; after: number }
): { socketId: string; token: string; userId?: string; deck: InGameCard[] } | null {
  
    // --- Si un joueur attend déjà ---
    if (waitingPlayer) {
        // Empêcher de jouer contre soi-même (même socket)
        if (waitingPlayer.socketId === socket.id) {
            return waitingPlayer;
        }

        // --- Vérifier la connexion du joueur en attente ---
        const waitingSock = io.sockets.sockets.get(waitingPlayer.socketId);
        if (waitingSock && waitingSock.connected) {
            const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

            socket.join(roomId);
            waitingSock.join(roomId);

            // --- Génération des tokens ---
            const token1 = waitingPlayer.token;
            const token2 = genToken();

            // --- Création des joueurs ---
            const p1 = createPlayer(waitingPlayer.socketId, waitingPlayer.deck, token1, waitingPlayer.userId);
            const p2 = createPlayer(socket.id, currentDeck, token2, (socket as unknown as { userId: string }).userId);

            // Appliquer la "défaite initiale" aux deux joueurs.
            // Cela sert de "coût d'entrée" et garantit que la partie est comptabilisée.
            // Le gagnant sera compensé. Cela évite les décomptes multiples lors des rafraîchissements.
            appliquerResultatMatch(p1.userId, false);
            appliquerResultatMatch(p2.userId, false);

            // --- Joueur 1 commence le premier tour ---
            p1.turnCount = 1;
            p2.turnCount = 0;

            // --- Appliquer le gain d'énergie initial ---
            applyEnergyGain(p1, false);

            // --- Création de l'état de la room ---
            const state = { roomId, players: [p1, p2], turnIndex: 0 };

            // --- Enregistrement de la room ---
            rooms.set(roomId, state);

            // Info room et token
            io.to(p1.id).emit("roomInfo", { roomId, token: token1 });
            io.to(p2.id).emit("roomInfo", { roomId, token: token2 });

            io.to(roomId).emit("gameStart");

            // J1 commence son tour
            io.to(p1.id).emit("yourTurn");
            io.to(p2.id).emit("opponentTurn"); 

            // envoyer état après énergie initiale
            sendGameState(io, rooms, roomId);

            console.log(` Room créée: ${roomId}`);
            return null;
        } else {

            // --- Le joueur en attente s'est déconnecté ---
            const newWaiting = { socketId: socket.id, token: genToken(), userId: currentUserId, deck: currentDeck };
            socket.emit("waiting");
            console.log(` Nouveau joueur en attente: ${socket.id} (user: ${currentUserId})`);
            return newWaiting;
        }
    // --- Sinon, mettre le joueur actuel en attente ---
    } else {
        const newWaiting = { socketId: socket.id, token: genToken(), userId: currentUserId, deck: currentDeck };
        socket.emit("waiting");
        console.log(` Joueur en attente: ${socket.id} (user: ${currentUserId})`);
        return newWaiting;
    }
}

// --- Gestion du gain d'énergie par tour ---
export function applyEnergyGain(player: Player, isSecondPlayer: boolean) {

    // --- Validation ---
    if (!player) throw new Error("applyEnergyGain: player manquant");
    if (player.turnCount === undefined) player.turnCount = 0;
    if (player.energie === undefined) player.energie = 0;

    // --- Calcul du gain ---
    const baseStart = isSecondPlayer ? 2 : 1; 

    // --- Formule de gain d'énergie ---
    const gain = Math.min(baseStart + Math.max(0, player.turnCount - 1) * 2, 5);

    const before = player.energie;
    player.energie = Math.min(player.energie + gain, 20);

    return { gain, before, after: player.energie };
}

// --- Vérification de la victoire ---
export async function checkVictory(
    io: Server, 
    roomState: GameState, 
    rooms: Map<string, GameState>,
    userToRoom: Map<string, { roomId: string; playerIndex: number }>
) {
    
    // --- Vérification des points de vie ---
    const [p1, p2] = roomState.players;

    // --- Cas de match nul ---
    if (p1.pv <= 0 && p2.pv <= 0) {
        io.to(roomState.roomId).emit("draw");
        rooms.delete(roomState.roomId);
        roomState.players.forEach(p => { if (p.userId) userToRoom.delete(p.userId); });
        return true;
    }

    // --- Cas de victoire J2 ---
    if (p1.pv <= 0) {
        // J2 gagne
        const result = await appliquerResultatMatch(p2.userId, true);
        
        io.to(p1.id).emit("defeat", { reason: "pv_zero", pointsChange: -50 });
        io.to(p2.id).emit("victory", { reason: "enemy_zero", ...result });
        rooms.delete(roomState.roomId);
        roomState.players.forEach(p => { if (p.userId) userToRoom.delete(p.userId); });
        return true;
    }

    // --- Cas de victoire J1 ---
    if (p2.pv <= 0) {
        // J1 gagne
        const result = await appliquerResultatMatch(p1.userId, true);
        
        io.to(p2.id).emit("defeat", { reason: "pv_zero", pointsChange: -50 });
        io.to(p1.id).emit("victory", { reason: "enemy_zero", ...result });
        rooms.delete(roomState.roomId);
        roomState.players.forEach(p => { if (p.userId) userToRoom.delete(p.userId); });
        return true;
    }

    return false;
}

// Vérifie la synergie Golem et Villageois
export function checkVillageGuardian(player: Player, io: Server, roomId: string, opponent?: Player): void {

    // --- Vérification de la présence du Villageois ---
    const hasVillager = player.board.some((c) => c.name === "Villageois");

    // --- Application/Déploiement du buff sur les Golems ---
    const golems = player.board.filter((c) => c.name === "Golem");

    // --- Appliquer ou retirer le buff ---
    golems.forEach((golem) => {

        // --- Initialisation des effets si nécessaire ---
        if (!golem.effects) golem.effects = [];
        const hasBuff = golem.effects.includes("DoubleDamage");

        // --- Appliquer le buff si un Villageois est présent et le buff n'est pas déjà appliqué ---
        if (hasVillager && !hasBuff) {
            golem.effects.push("DoubleDamage");
            io.to(roomId).emit("log", `${golem.name} s'enrage grâce à la présence d'un Villageois ! (Dégâts x2)`);
            
            // --- DÉTECTION SONORE (WARDEN) ---
            // Si le Golem gagne son effet, le Warden réagit immédiatement
            if (opponent) {
                checkAndTriggerWarden(io, roomId, player, opponent, golem);
            }

        // --- Retirer le buff si aucun Villageois n'est présent mais le buff est actif ---
        } else if (!hasVillager && hasBuff) {
            golem.effects = golem.effects.filter((e: string) => e !== "DoubleDamage");
            io.to(roomId).emit("log", `${golem.name} se calme (Plus de Villageois à protéger).`);
        }
    });
}

// Gère la mort d'un mob (détachement équipement, défausse, logs, synergies)
export function handleMobDeath(io: Server, roomId: string, player: Player, mobIndex: number, logArray: string[], killer?: Player) {
    const mob = player.board[mobIndex];
    if (!mob) return;

    // Vérification de l'effet Elitra avant de détacher les équipements
    const saveToHand = hasElytra(mob);

    detachEquipment(player, mob);

    if (saveToHand) {
        // Réinitialisation du mob avant retour en main
        if (mob.max_pv) mob.pv_durability = mob.max_pv;
        mob.effects = [];
        mob.hasAttacked = false;
        mob.hasUsedTalent = false;

        player.hand.push(mob);
        logArray.push(`[Elitra] ${mob.name} s'envole et retourne dans votre main !`);
    } else {
        player.discard.push(mob);
        logArray.push(`${mob.name} est mort !`);
    }
    
    player.board.splice(mobIndex, 1);

    // --- Talent Creeper : Pression Psychologique ---
    // S'active seulement si tué par un adversaire (killer présent et ID différent)
    if (mob.category === "mob" && mob.talent === "Pression Psychologique" && killer && killer.id !== player.id) {
        pressionPsychologique(io, roomId, player, killer);
    }

    checkVillageGuardian(player, io, roomId);
}