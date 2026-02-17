import { Server } from "socket.io";
import { Player, CombatState, InGameCard } from "../../../components/utils/typesPvp";
import { handleMobDeath } from "../gameLogic";
import { detachEquipment } from "./equipementFunction";

// Pioche une ou plusieurs cartes
export function drawCard(state: CombatState, player: Player, count: number): void {

    // Nombre de cartes effectivement piochées
    let drawn = 0;

    // Pioche les cartes
    for (let i = 0; i < count; i++) {
        if (player.deck.length === 0) break;
        player.hand.push(player.deck.shift()!);
        drawn++;
    }

    state.log.push(`${player.id} pioche ${drawn} carte(s)`);
}

// Passif: Si un talent adverse est activé, le mob actionneur prend 10 PV.
export function soundDetection(io: Server, roomId: string, wardenOwner: Player, opponent: Player, activatorCard: InGameCard): void {
    if (!activatorCard || activatorCard.pv_durability === undefined) return;

    const damage = 10;
    activatorCard.pv_durability -= damage;

    io.to(roomId).emit("log", `Le Warden détecte des vibrations !`);
    io.to(roomId).emit("log", `${activatorCard.name} subit ${damage} dégâts par Détection Sonore.`);

    // Vérification si le mob qui a activé le talent meurt des dégâts du Warden
    if (activatorCard.pv_durability <= 0) {
        // On doit trouver l'index de la carte dans le board de l'adversaire pour gérer sa mort
        const cardIndex = opponent.board.findIndex(c => c.uuid === activatorCard.uuid);
        if (cardIndex !== -1) {
            const log: string[] = [];
            handleMobDeath(io, roomId, opponent, cardIndex, log, wardenOwner);
            log.forEach(l => io.to(roomId).emit("log", l));
        }
    }
}

// Retire de l'énergie à l'adversaire
export function removeEnergyFromOpponent(io: Server, roomId: string, player: Player, opponent: Player, card: InGameCard): void {
    const amount = 1;
    if (opponent.energie > 0) {
        opponent.energie = Math.max(0, opponent.energie - amount);
        io.to(roomId).emit("log", `${card.name} utilise Ralentissement calculé et retire ${amount} énergie à l'adversaire.`);
    } else {
        io.to(roomId).emit("log", `${card.name} tente de retirer de l'énergie, mais l'adversaire est déjà à 0.`);
    }
}

// Talent Tortue : Applique l'effet de protection
export function applyCarapaceEffect(io: Server, roomId: string, player: Player, opponent: Player, card: InGameCard): void {
    if (!card.effects) card.effects = [];
    
    // On ajoute l'effet s'il n'est pas déjà présent
    if (!card.effects.includes("CarapaceProtectrice")) {
        card.effects.push("CarapaceProtectrice");
        io.to(roomId).emit("log", `${card.name} rentre dans sa carapace (Protection 50% prochaine attaque).`);
    }
}

// Talent Creeper : Pression Psychologique (Deathrattle)
export function pressionPsychologique(io: Server, roomId: string, deadCreeperOwner: Player, killerOpponent: Player): void {
    io.to(roomId).emit("log", `Pression Psychologique ! Le Creeper explose en mourant !`);

    // Inflige 5 PV au joueur adverse
    killerOpponent.pv -= 5;
    io.to(roomId).emit("log", `Le joueur adverse subit 5 dégâts.`);

    // Inflige 15 PV à chaque mob adverse
    killerOpponent.board.forEach((card) => {
        if (card.category === "mob" && card.pv_durability !== undefined) {
            card.pv_durability -= 15;
            // Note: On ne gère pas la mort en chaîne ici pour simplifier, ou on pourrait appeler handleMobDeath récursivement
            // mais attention aux boucles infinies si deux Creepers se tuent mutuellement.
            // Pour l'instant, on laisse le jeu nettoyer les morts au prochain check ou action.
        }
    });
    io.to(roomId).emit("log", `Tous les mobs adverses subissent 15 dégâts.`);
}

// Talent Wither : Explosion noire (Enrage < 30% PV)
export function checkWitherExplosionNoire(io: Server, roomId: string, player: Player, opponent: Player, card: InGameCard): void {
    if (card.pv_durability === undefined) return;
    
    // Initialisation max_pv si absent (pour le calcul du %)
    const maxPv = card.max_pv || card.pv_durability;
    const threshold = maxPv * 0.3;

    if (!card.effects) card.effects = [];

    // Si PV <= 30% et pas encore enragé
    if (card.pv_durability <= threshold) {
        if (!card.effects.includes("WitherEnrage")) {
            card.effects.push("WitherEnrage");
            io.to(roomId).emit("log", ` ${card.name} entre en phase d'Explosion Noire ! Dégâts doublés !`);
        }

        // Déclenchement du Warden adverse (copie de la logique pour éviter dépendance circulaire avec testEffectFonctions)
        const warden = opponent.board.find(c => c.category === "mob" && c.name === "Warden" && c.talent === "Détection Sonore");
        if (warden) {
            soundDetection(io, roomId, opponent, player, card);
        }
    } else {
        // Si soigné au-dessus de 30%, on retire l'effet
        if (card.effects.includes("WitherEnrage")) {
            card.effects = card.effects.filter(e => e !== "WitherEnrage");
            io.to(roomId).emit("log", `${card.name} se calme (PV > 30%).`);
        }
    }
}

// Talent Sorcière : Enchantement puissant (Gain de PV infini)
export function enchantementPuissant(io: Server, roomId: string, player: Player, opponent: Player, card: InGameCard): void {
    if (card.pv_durability === undefined) return;
    const healAmount = 5;
    card.pv_durability += healAmount;
    io.to(roomId).emit("log", `${card.name} utilise Enchantement puissant et gagne ${healAmount} PV (PV actuels: ${card.pv_durability}).`);
}

// Talent Shulker : Lévitation (Mélange une carte adverse dans le deck)
export function levitation(io: Server, roomId: string, player: Player, opponent: Player, card: InGameCard): void {
    if (opponent.hand.length === 0) {
        io.to(roomId).emit("log", `${card.name} utilise Levitation, mais la main de l'adversaire est vide.`);
        return;
    }

    const randomIndex = Math.floor(Math.random() * opponent.hand.length);
    const removedCard = opponent.hand.splice(randomIndex, 1)[0];

    // Insertion aléatoire dans le deck
    const randomDeckIndex = Math.floor(Math.random() * (opponent.deck.length + 1));
    opponent.deck.splice(randomDeckIndex, 0, removedCard);

    io.to(roomId).emit("log", `${card.name} utilise Levitation : ${removedCard.name} retourne dans le deck de l'adversaire.`);
}

// Talent Gast : Retour à l'envoyeur (25% de chance de s'auto-attaquer)
export function checkRetourALEnvoyeur(io: Server, roomId: string, attacker: InGameCard, player: Player, opponent: Player): boolean {
    
    // Le talent est sollicité à chaque attaque, donc le Warden adverse réagit (s'il est présent)
    const warden = opponent.board.find(c => c.category === "mob" && c.name === "Warden" && c.talent === "Détection Sonore");
    if (warden) {
        soundDetection(io, roomId, opponent, player, attacker);
    }

    // 25% de chance
    if (Math.random() < 0.25) {
        io.to(roomId).emit("log", `Retour à l'envoyeur ! Le talent de ${attacker.name} s'active et l'attaque se retourne contre lui !`);
        return true; // L'attaque est redirigée
    }
    
    return false; // L'attaque continue normalement
}

// Talent Poulpe : Encre Noire (Redirection de la prochaine attaque)
export function encreNoire(io: Server, roomId: string, player: Player, opponent: Player, card: InGameCard): void {
    if (!player.effects) player.effects = [];
    
    if (!player.effects.includes("EncreNoire")) {
        player.effects.push("EncreNoire");
        io.to(roomId).emit("log", `${card.name} crache de l'Encre Noire ! La prochaine attaque adverse sera redirigée.`);
    }
}

// Talent Chat : Peur viscérale (Défausse un Creeper adverse)
export function peurViscerale(io: Server, roomId: string, player: Player, opponent: Player, card: InGameCard): boolean {
    
    // Recherche des Creepers sur le plateau adverse
    const creeperIndices = opponent.board
        .map((c, index) => (c.category === "mob" && c.name === "Creeper") ? index : -1)
        .filter(index => index !== -1);

    if (creeperIndices.length > 0) {
        // Sélection aléatoire d'un Creeper
        const randomIndex = Math.floor(Math.random() * creeperIndices.length);
        const targetIndex = creeperIndices[randomIndex];
        const targetCreeper = opponent.board[targetIndex];

        // Gestion des équipements (détachement avant défausse pour ne pas les perdre)
        detachEquipment(opponent, targetCreeper);

        // Retrait du plateau et ajout à la défausse
        opponent.board.splice(targetIndex, 1);
        opponent.discard.push(targetCreeper);

        io.to(roomId).emit("log", `Peur viscérale ! ${card.name} effraie ${targetCreeper.name} qui s'enfuit du plateau !`);
        return true;
    } else {
        io.to(roomId).emit("log", `Peur viscérale ! ${card.name} cherche un Creeper à effrayer, mais n'en trouve pas.`);
        return false;
    }
}

// Met à jour l'effet visuel Lien Éternel sur le joueur (Appelé lors de la pose de carte ou mort de mob)
export function updateGuardianEffect(state: CombatState, player: Player): void {
    const guardians = player.board.filter(c => c.category === "mob" && c.name === "Gardien" && (c.pv_durability ?? 0) > 0);
    const effectName = "LienEternel";

    if (!player.effects) player.effects = [];

    if (guardians.length >= 2) {
        // Ajout de l'effet visuel s'il n'est pas présent
        if (!player.effects.includes(effectName)) {
            player.effects.push(effectName);
            state.log.push(`[Lien éternel] Protection active : Vos PV ne descendront pas sous 10.`);
        }
    } else {
        // Retrait de l'effet visuel si la condition n'est plus remplie
        const index = player.effects.indexOf(effectName);
        if (index !== -1) {
            player.effects.splice(index, 1);
            state.log.push(`[Lien éternel] Protection désactivée (moins de 2 Gardiens).`);
        }
    }
}

// Calcule les dégâts finaux après application de la protection du Gardien
export function applyGuardianProtection(state: CombatState, player: Player, damage: number): number {
    let finalDamage = damage;

    if (player.effects?.includes("LienEternel")) {
        if (player.pv > 10 && player.pv - finalDamage < 10) {
            finalDamage = player.pv - 10;
            state.log.push(`[Lien éternel] Protection activée ! Les Gardiens maintiennent vos PV à 10.`);
        } else if (player.pv <= 10) {
            finalDamage = 0;
            state.log.push(`[Lien éternel] Protection activée ! Les Gardiens empêchent vos PV de descendre davantage.`);
        }
    }
    return finalDamage;
}

// Vérifie si la condition de Croissance légendaire est remplie (Présence d'un Œuf)
export function checkLegendaryGrowth(player: Player, card: InGameCard): boolean {
    if (card.category === "mob" && (card.name === "Ender Dragon" || card.talent === "Croissance légendaire")) {
        // Vérification robuste : accepte "Œuf de dragon", "Oeuf de dragon" ou "Œuf d'Ender Dragon"
        return player.board.some(c => c.name === "Œuf de dragon" || c.name === "Oeuf de dragon" || c.name === "Œuf d'Ender Dragon");
    }
    return true;
}

// Applique Exigence légendaire (Sacrifice de l'Œuf lors de l'arrivée du Dragon)
export function applyLegendaryRequirement(io: Server, roomId: string, player: Player): void {
    // On cherche l'index avec la même logique robuste pour être sûr de trouver la carte à sacrifier
    const eggIndex = player.board.findIndex(c => c.name === "Œuf de dragon" || c.name === "Oeuf de dragon" || c.name === "Œuf d'Ender Dragon");
    if (eggIndex !== -1) {
        const egg = player.board[eggIndex];
        detachEquipment(player, egg);
        player.board.splice(eggIndex, 1);
        player.discard.push(egg);
        io.to(roomId).emit("log", `[Exigence légendaire] L'Œuf de dragon éclot et laisse place à la créature légendaire !`);
    }
}

// Talent Blaze : Flammes Perpétuelles (50% chance d'infliger 5 dégâts à l'adversaire après une attaque)
export function checkFlammesPerpetuelles(io: Server, roomId: string, attacker: InGameCard, opponent: Player): void {
    if (attacker.category === "mob" && (attacker.name === "Blaze" || attacker.talent === "Flammes perpétuelles")) {
        if (Math.random() < 0.5) {
            const damage = 5;
            // On utilise un state temporaire pour réutiliser la logique de protection (Gardien)
            const tempState: CombatState = { log: [] };
            
            const finalDamage = applyGuardianProtection(tempState, opponent, damage);
            opponent.pv -= finalDamage;
            
            io.to(roomId).emit("log", `[Flammes Perpétuelles] Le Blaze crache une boule de feu bonus !`);
            // Envoi des logs de protection éventuels
            tempState.log.forEach(msg => io.to(roomId).emit("log", msg));
            io.to(roomId).emit("log", `L'adversaire perd ${finalDamage} PV.`);
        }
    }
}