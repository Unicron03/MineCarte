import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs';
import path from 'path';

type SeedActions = Awaited<ReturnType<typeof actions>>;

export async function loadCardImages(cardName: string) {
    const basePath = path.join(process.cwd(), 'public', 'cards', cardName);
    
    async function fileExists(file: string): Promise<boolean> {
        try {
            await fs.access(path.join(basePath, file));
            return true;
        } catch {
            return false;
        }
    }
    
    const mainExists = await fileExists('front.png');
    const backgroundExists = await fileExists('back.png');
    const thirdExists = await fileExists('mid.png');
    
    if (!mainExists || !backgroundExists) {
        return loadCardImages('default');
    }
    
    return {
        main_img: `/cards/${cardName}/front.png`,
        background_img: `/cards/${cardName}/back.png`,
        third_img: thirdExists ? `/cards/${cardName}/mid.png` : null,
    };
}

async function actions() {
    const skeleton_attack1 = await prisma.actions.create({
        data: {
            name: "Flèche rapide",
            description: "Inflige 10 PV à un mob adverse.",
            damage: 10,
            cost: 1,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const skeleton_attack2 = await prisma.actions.create({
        data: {
            name: "Tir de précision",
            description: "Inglige 8 PV à l'adversaire.",
            damage: 8,
            cost: 2,
            function_name: "attackDirectPlayer"
        },
    });

    const dragon_talent = await prisma.actions.create({
        data: {
            name: "Croissance légendaire",
            description: "Un oeuf de dragon doit doit être présent sur votre plateau pour poser cette carte.",
            autoActivate: true,
            function_name: "defaultFunction"
        },
    });

    const dragon_attack1 = await prisma.actions.create({
        data: {
            name: "Souffle de dragon",
            description: "Inflige 35 PV à chaque mob adverse.",
            damage: 35,
            cost: 4,
            function_name: "AttackAllMobs"
        },
    });

    const dragon_attack2 = await prisma.actions.create({
        data: {
            name: "Plonger dévastratrice",
            description: "Inflige 70 PV à un mob adverse.",
            damage: 70,
            cost: 6,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const enderman_talent = await prisma.actions.create({
        data: {
            name: "Récupération d'élément",
            description: "Permet de piocher aléatoirement une carte de votre pioche à chaque tour. Cette carte ira dans votre main.",
            function_name: "drawCard"
        },
    });

    const enderman_attack1 = await prisma.actions.create({
        data: {
            name: "Coup d'ombre",
            description: "Inflige 10 PV à chaque mob adverse.",
            damage: 10,
            cost: 2,
            function_name: "AttackAllMobs"
        },
    });

    const enderman_attack2 = await prisma.actions.create({
        data: {
            name: "Téléportation furtive",
            description: "Inflige 30 PV à un mob adverse & A une chance d'esquiver tous les dégâts d'une attaque lors du prochain tour.",
            damage: 30,
            cost: 3,
            function_name: "attackEsquive",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const creeper_talent = await prisma.actions.create({
        data: {
            name: "Pression psychologique",
            description: "Si le Creeper meurt d'une attaque de l'adversaire, il inflige 15 PV à chaque mob adverse et 5 PV à l'adversaire.",
            autoActivate: true,
            function_name: "pressionPsychologique"
        },
    });

    const creeper_attack1 = await prisma.actions.create({
        data: {
            name: "Explosion",
            description: "Inflige 60 PV et meurt instantanément après l'attaque.",
            damage: 60,
            cost: 4,
            function_name: "damageAndDie",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const golem_talent = await prisma.actions.create({
        data: {
            name: "Gardien du village",
            description: "Si un villageois est présent sur votre plateau, les attaques du golem sont multipliées par 2.",
            autoActivate: true,
            function_name: "passive"
        },
    });

    const golem_attack1 = await prisma.actions.create({
        data: {
            name: "Coup de poing de fer",
            description: "Inflige 25 PV à un mob adverse.",
            damage: 25,
            cost: 3,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const golem_attack2 = await prisma.actions.create({
        data: {
            name: "Bon gros tank",
            description: "Lors du prochain tour, réduis les dégâts subis sur cette carte de 30%.",
            cost: 2,
            function_name: "applyTankEffect"
        },
    });

    const villager_attack1 = await prisma.actions.create({
        data: {
            name: "Entraide",
            description: "Inflige 5 PV à un mob adverse pour chaque villageois présent sur le plateau (le votre et celui de votre adversaire).",
            damage: 5,
            cost: 1,
            function_name: "defaultFunction",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const villager_attack2 = await prisma.actions.create({
        data: {
            name: "Appel à un ami",
            description: "Si une carte Golem est présent dans vos 5 prochaines cartes à piocher, vous récupérez cette carte dans votre main.",
            cost: 2,
            function_name: "defaultFunction"
        },
    });

    const zombie_attack1 = await prisma.actions.create({
        data: {
            name: "Morsure",
            description: "Inflige 10 PV à un mob adverse.",
            damage: 10,
            cost: 1,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const zombie_attack2 = await prisma.actions.create({
        data: {
            name: "Affamé",
            description: "Inflige 5 PV à un mob adverse & Retire 1 RedStone à l'adversaire.",
            cost: 2,
            function_name: "voleEnergie",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const axolotl_attack1 = await prisma.actions.create({
        data: {
            name: "Morsure aquatique",
            description: "Inflige 5 PV à un mob adverse.",
            damage: 5,
            cost: 1,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const axolotl_attack2 = await prisma.actions.create({
        data: {
            name: "Appel du banc",
            description: "Soigne un mob allié au choix de 10 PV.",
            damage: 10,
            cost: 1,
            function_name: "heal",
            requiresTarget: true,
            targetType: "ally"
        },
    });

    const turtle_talent = await prisma.actions.create({
        data: {
            name: "Carapace protectrice",
            description: "Lors du prochain tour, réduit les dégâts de la première attaque adverse de 50%.",
            autoActivate: true,
            function_name: "applyCarapaceEffect"
        },
    });

    const turtle_attack1 = await prisma.actions.create({
        data: {
            name: "Tortue géniale",
            description: "Lors du prochain tour, si la Tortue meurt d'une attaque, le joueur ne prend pas les dégâts superflus.",
            cost: 2,
            function_name: "applyTortueGenialeEffect"
        },
    });

    const blaze_talent = await prisma.actions.create({
        data: {
            name: "Flammes perpétuelles",
            description: "Si ce Blaze vient de lancer une attaque, il a 50% de chance d'envoyer une boule de feu infligeant 5 PV à l'adversaire.",
            autoActivate: true,
            function_name: "defaultFunction"
        },
    });

    const blaze_attack1 = await prisma.actions.create({
        data: {
            name: "Boule de feu",
            description: "Inflige 10 PV à tous les mobs adverses.",
            damage: 10,
            cost: 1,
            function_name: "AttackAllMobs"
        },
    });

    const spider_talent = await prisma.actions.create({
        data: {
            name: "Ralentissement calculé",
            description: "Retire 1 RedStone à l'adversaire.",
            autoActivate: true,
            function_name: "removeEnergyFromOpponent"
        },
    });

    const spider_attack1 = await prisma.actions.create({
        data: {
            name: "Morsure",
            description: "Inflige 10 PV à un mob adverse.",
            damage: 10,
            cost: 1,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const warden_talent = await prisma.actions.create({
        data: {
            name: "Détection sonore",
            description: "Si un talent adverse est activé, le mob actionneur prend 10 PV.",
            autoActivate: true,
            function_name: "soundDetection"
        },
    });

    const warden_attack1 = await prisma.actions.create({
        data: {
            name: "Réveil brutal",
            description: "Inflige 25 PV à chaque mob adverse.",
            damage: 25,
            cost: 4,
            function_name: "AttackAllMobs"
        },
    });

    const warden_attack2 = await prisma.actions.create({
        data: {
            name: "Hurlement Sombre",
            description: "Inflige 40 PV à un mob adverse et l'étourdit au prochain tour.",
            damage: 40,
            cost: 4,
            function_name: "hurlementSombre",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const guardian_talent = await prisma.actions.create({
        data: {
            name: "Lien éternel",
            description: "Si 2 Gardien sont présents sur votre plateau, votre santé ne peut pas descendre en dessous de 10 PV après une attaque.",
            autoActivate: true,
            function_name: "defaultFunction"
        },
    });

    const guardian_attack1 = await prisma.actions.create({
        data: {
            name: "Attaque furtive",
            description: "Inflige 15 PV à un mob adverse.",
            damage: 15,
            cost: 1,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const guardian_attack2 = await prisma.actions.create({
        data: {
            name: "Rayon laser",
            description: "Inflige 60 PV à un mob adverse.",
            damage: 60,
            cost: 5,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const witch_talent = await prisma.actions.create({
        data: {
            name: "Enchantement puissant",
            description: "Se rajoute 5 PV (même au-delà de sa vie).",
            autoActivate: true,
            function_name: "enchantementPuissant"
        },
    });

    const witch_attack1 = await prisma.actions.create({
        data: {
            name: "Potion de soin",
            description: "Vous soigne de 10 PV maximum.",
            damage: 10,
            cost: 2,
            function_name: "heal",
            requiresTarget: true,
            targetType: "ally"
        },
    });

    const witch_attack2 = await prisma.actions.create({
        data: {
            name: "Potion explosive",
            description: "Inflige 20 PV à un mob adverse.",
            damage: 20,
            cost: 2,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const ghast_talent = await prisma.actions.create({
        data: {
            name: "Retour à l'envoyeur",
            description: "Une fois lancé, l'attaque du Ghast à 25% de chance de revenir sur lui-même.",
            autoActivate: true,
            function_name: "checkRetourALEnvoyeur"
        },
    });

    const ghast_attack1 = await prisma.actions.create({
        data: {
            name: "Boule de feu",
            description: "Inflige 40 PV à un mob adverse.",
            damage: 40,
            cost: 2,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const wither_talent = await prisma.actions.create({
        data: {
            name: "Explosion noire",
            description: "Une fois que le Wither atteint 30% de ses PV, les dégâts de ses attaques sont multipliés par 2.",
            autoActivate: true,
            function_name: "checkWitherExplosionNoire"
        },
    });

    const wither_attack1 = await prisma.actions.create({
        data: {
            name: "Tête explosive",
            description: "Inflige 25 PV à chaque mob adverse.",
            damage: 25,
            cost: 3,
            function_name: "AttackAllMobs"
        },
    });

    const wither_attack2 = await prisma.actions.create({
        data: {
            name: "Tempête du Nether",
            description: "Inflige 45 dégâts à un mob adverse.",
            damage: 45,
            cost: 4,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const snowgolem_attack1 = await prisma.actions.create({
        data: {
            name: "Boule de neige",
            description: "Inflige 5 PV à chaque mob adverse.",
            damage: 5,
            cost: 0,
            function_name: "AttackAllMobs"
        },
    });

    const squid_talent = await prisma.actions.create({
        data: {
            name: "Encre noire",
            description: "La première attaque du prochain tour de votre adversaire sera attribué aléatoirement à l'un de vos mobs.",
            autoActivate: true,
            function_name: "encreNoire"
        },
    });

    const cat_talent = await prisma.actions.create({
        data: {
            name: "Peur viscérale",
            description: "Défausse aléatoirement un Creeper sur le plateau de votre adversaire.",
            autoActivate: true,
            function_name: "defaultFunction"
        },
    });

    const cat_attack1 = await prisma.actions.create({
        data: {
            name: "Coup de griffe",
            description: "Inflige aléatoirement entre 5 et 15 PV à un mob adverse.",
            damage: Math.floor(Math.random() * (15 - 5 + 1)) + 5, // (syntaxe : max - min)
            cost: 1,
            function_name: "AttackOneMob",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const shulker_talent = await prisma.actions.create({
        data: {
            name: "Lévitation",
            description: "Mélange une carte de la main de l'adversaire dans son deck.",
            function_name: "passive"
        },
    });

    const shulker_attack1 = await prisma.actions.create({
        data: {
            name: "Projectile de l'End",
            description: "Inflige 10 PV à un mob aléatoire du plateau de l'adversaire & Inflige 10 PV à l'adversaire.",
            damage: 10,
            cost: 2,
            function_name: "defaultFunction",
        },
    });

    const shulker_attack2 = await prisma.actions.create({
        data: {
            name: "Protection dimensionnelle",
            description: "Réduit de 50% toutes les attaques adverses du prochain tour de votre adversaire.",
            damage: 0,
            cost: 5,
            function_name: "defaultFunction",
        },
    });

    const egg_talent = await prisma.actions.create({
        data: {
            name: "Exigence légendaire",
            description: "Si un Ender dragon est posé sur votre plateau, on défausse automatiquement cette carte.",
            autoActivate: true,
            function_name: "defaultFunction"
        },
    });

    // --- ARTEFACTS & EQUIPEMENTS ---
    const craftingtable_effect = await prisma.actions.create({
        data: {
            name: "Table de craft",
            description: "Réduit le coût de la prochaine carte de 3.",
            damage: 3,
            cost: 1,
            function_name: "applyEffect"
        },
    });

    const anvil_effect = await prisma.actions.create({
        data: {
            name: "Enclume",
            description: "Récupère un équipement de la défausse (si disponible en surplus).",
            cost: 1,
            function_name: "anvilEffect"
        },
    });

    const armor_effect = await prisma.actions.create({
        data: {
            name: "Armure",
            description: "Permet de protégé le mob rattaché en soustrayant 10 dégâts à chaque attaque.",
            cost: 2,
            function_name: "armure"
        },
    });

    const potion_effect = await prisma.actions.create({
        data: {
            name: "Soin",
            description: "Soigne 10 PV à un mob",
            damage: 10,
            cost: 2,
            function_name: "heal",
            requiresTarget: true
        },
    });

    const potion_regen_effect = await prisma.actions.create({
        data: {
            name: "Potion",
            description: "Soigne le mob rattaché de 10 PV à chaque tour.",
            damage: 10,
            cost: 2,
            function_name: "potionRegen"
        },
    });

    const potion_player_effect = await prisma.actions.create({
        data: {
            name: "Lit",
            description: "Soigne votre joueur de 25 dégâts.",
            damage: 25,
            cost: 2,
            function_name: "healPlayer"
        },
    });

    const book_effect = await prisma.actions.create({
        data: {
            name: "Livre",
            description: "Pioche 2 cartes.",
            damage: 2,
            cost: 1,
            function_name: "drawCardsEffect"
        },
    });

    const tnt_effect = await prisma.actions.create({
        data: {
            name: "TNT",
            description: "Inflige 30 dégâts à une carte ennemie.",
            damage: 30,
            cost: 2,
            function_name: "applyArtifactDamage",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const ironingot_effect = await prisma.actions.create({
        data: {
            name: "Lingot de fer",
            description: "Soigne 20 PV d'un Golem allié.",
            damage: 20,
            cost: 1,
            function_name: "healGolem",
            requiresTarget: true,
            targetType: "ally"
        },
    });

    const endcrsystal_effect = await prisma.actions.create({
        data: {
            name: "End Crystal",
            description: "Réduit de moitié la vie d'un mob adverse. (L'armure ne fonctionne pas)",
            cost: 2,
            function_name: "halveLifeEffect",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const enderpearl_effect = await prisma.actions.create({
        data: {
            name: "Ender Pearl",
            description: "Défausse une carte de votre plateau.",
            cost: 2,
            function_name: "discardOwnCard",
            requiresTarget: true,
            targetType: "ally"
        },
    });

    const fishingrod_effect = await prisma.actions.create({
        data: {
            name: "Canne à pêche",
            description: "75% de chance de voler 2 énergies, 25% de chance d'en donner 2.",
            cost: 1,
            function_name: "fishingRodEffect"
        },
    });

    const invisibility_effect = await prisma.actions.create({
        data: {
            name: "Potion d'invisibilité",
            description: "Rend un mob invisible. Il ne peut pas être attaqué par l'adversaire au prochain tour.",
            cost: 1,
            function_name: "giveInvisibleEffect",
            requiresTarget: true,
            targetType: "ally"
        },
    });

    const lava_effect = await prisma.actions.create({
        data: {
            name: "Seau de lave",
            description: "Applique un malus de brûlure à une carte ennemie : elle perd 10 PV à chaque tour pendant 3 tours.",
            damage: 10,
            cost: 2,
            function_name: "applyBurnEffect",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const goldenapple_effect = await prisma.actions.create({
        data: {
            name: "Pomme dorée",
            description: "Soigne 10 PV et augmente les dégâts de 10 pendant 3 tours.",
            damage: 10,
            cost: 2,
            function_name: "applyGoldenAppleEffect",
            requiresTarget: true,
            targetType: "ally"
        },
    });

    const enchanttable_effect = await prisma.actions.create({
        data: {
            name: "Table d'enchantement",
            description: "Pendant ce tour, tous les équipements coûtent 1 énergie.",
            cost: 2,
            function_name: "applyEnchantmentTableEffect"
        },
    });

    const endportal_effect = await prisma.actions.create({
        data: {
            name: "Portail de l’End",
            description: "Soigne 30 PV d'un Enderman, Shulker ou Ender Dragon.",
            damage: 30,
            cost: 2,
            function_name: "healEndCreature",
            requiresTarget: true,
            targetType: "ally"
        },
    });

    const bell_effect = await prisma.actions.create({
        data: {
            name: "Cloche",
            description: "Si le Warden ciblé a moins de 50% de sa vie, ses attaques coûtent 1 au prochain tour.",
            cost: 2,
            function_name: "applyBellEffect",
            requiresTarget: true,
            targetType: "ally"
        },
    });

    const levitation_effect = await prisma.actions.create({
        data: {
            name: "Lévitation",
            description: "Mélange une carte de la main de l'adversaire dans son deck.",
            function_name: "levitation",
            autoActivate: true
        },
    });

    const sword_effect = await prisma.actions.create({
        data: {
            name: "Épée",
            description: "Après une attaque, inflige 5 PV à chaque mob adverse.",
            function_name: "swordEffect",
            autoActivate: true
        },
    });

    const pickaxe_effect = await prisma.actions.create({
        data: {
            name: "Pioche",
            description: "Au début du tour, pioche une carte supplémentaire.",
            function_name: "pickaxeEffect",
            autoActivate: true
        },
    });

    const shield_effect = await prisma.actions.create({
        data: {
            name: "Bouclier",
            description: "Si le mob rattaché subit des attaques, inflige 10 PV au mob attaquant.",
            function_name: "shieldEffect",
            autoActivate: true
        },
    });

    const elytra_effect = await prisma.actions.create({
        data: {
            name: "Elitra",
            description: "Si le mob rattaché meurt, il est déposé dans votre main.",
            function_name: "elytraEffect",
            autoActivate: true
        },
    });

    const totem_effect = await prisma.actions.create({
        data: {
            name: "Totem",
            description: "Si le mob meurt, il survit avec 5 PV et le Totem est détruit.",
            function_name: "totemEffect",
            autoActivate: true
        },
    });

    const bow_effect = await prisma.actions.create({
        data: {
            name: "Arc",
            description: "Ajoute 10 dégâts aux attaques. Sur attaque de zone, cible un seul ennemi aléatoire.",
            function_name: "bowEffect",
            autoActivate: true
        },
    });

    const speedboots_effect = await prisma.actions.create({
        data: {
            name: "Botte célérité",
            description: "Réduit le coût des attaques du mob de 1.",
            function_name: "speedBootsEffect",
            autoActivate: true
        },
    });

    const dodge_effect = await prisma.actions.create({
        data: {
            name: "Esquive",
            description: "45% de chance d'éviter les dégâts d'une attaque.",
            function_name: "passive",
            autoActivate: true
        },
    });

    const invisible_effect = await prisma.actions.create({
        data: {
            name: "Invisible",
            description: "Ne peut pas être ciblé par une attaque adverse.",
            function_name: "passive",
            autoActivate: true
        },
    });

    const stun_effect = await prisma.actions.create({
        data: {
            name: "Stun",
            description: "Étourdi : Ne peut pas attaquer ce tour-ci.",
            function_name: "passive",
            autoActivate: true
        },
    });

    return {
        skeleton_attack1, skeleton_attack2,
        dragon_talent, dragon_attack1, dragon_attack2,
        enderman_talent, enderman_attack1, enderman_attack2,
        creeper_talent, creeper_attack1,
        golem_talent, golem_attack1, golem_attack2,
        villager_attack1, villager_attack2,
        zombie_attack1, zombie_attack2,
        axolotl_attack1, axolotl_attack2,
        turtle_talent, turtle_attack1,
        blaze_talent, blaze_attack1,
        spider_talent, spider_attack1,
        warden_talent, warden_attack1, warden_attack2,
        guardian_talent, guardian_attack1, guardian_attack2,
        witch_talent, witch_attack1, witch_attack2,
        ghast_talent, ghast_attack1,
        wither_talent, wither_attack1, wither_attack2,
        snowgolem_attack1,
        squid_talent,
        cat_talent, cat_attack1,
        shulker_talent, shulker_attack1, shulker_attack2,
        egg_talent,
        // Artefacts & équipements
        craftingtable_effect,
        anvil_effect,
        armor_effect,
        potion_effect,
        potion_regen_effect,
        potion_player_effect,
        book_effect,
        tnt_effect,
        ironingot_effect,
        endcrsystal_effect,
        enderpearl_effect,
        fishingrod_effect,
        invisibility_effect,
        lava_effect,
        goldenapple_effect,
        enchanttable_effect,
        endportal_effect,
        bell_effect,
        levitation_effect,
        sword_effect,
        pickaxe_effect,
        shield_effect,
        elytra_effect,
        totem_effect,
        bow_effect,
        speedboots_effect,
        dodge_effect,
        invisible_effect,
        stun_effect
    };
}

async function cards(actions: SeedActions) {
    const card_skeleton = await prisma.cards.upsert({
        where: { id: 1, name: 'Squelette' },
        update: {},
        create: {
            id: 1,
            name: 'Squelette',
            description: 'Ses os grincent, mais ses flèches frappent toujours juste.',
            pv_durability: 25,
            cost: 1,
            attack1: actions.skeleton_attack1.id,
            attack2: actions.skeleton_attack2.id,
            ...(await loadCardImages('skeleton')),
            folder_name: 'skeleton'
        }
    })

    const card_dragon = await prisma.cards.upsert({
        where: { id: 2, name: 'Ender dragon' },
        update: {},
        create: {
            id: 2,
            name: 'Ender dragon',
            description: "Né dans les ténèbres de l'end, il tombera devant les plus courageux.",
            rarity: 3,
            pv_durability: 100,
            cost: 10,
            talent: actions.dragon_talent.id,
            attack1: actions.dragon_attack1.id,
            attack2: actions.dragon_attack2.id,
            ...(await loadCardImages('dragon')),
            folder_name: 'dragon'
        }
    })

    const card_enderman = await prisma.cards.upsert({
        where: { id: 3, name: 'Enderman' },
        update: {},
        create: {
            id: 3,
            name: 'Enderman',
            description: "Oser croiser son regard, et il vous plongera dans un cauchemar infini.",
            rarity: 2,
            pv_durability: 60,
            cost: 5,
            talent: actions.enderman_talent.id,
            attack1: actions.enderman_attack1.id,
            attack2: actions.enderman_attack2.id,
            ...(await loadCardImages('enderman')),
            folder_name: 'enderman'
        }
    })

    const card_creeper = await prisma.cards.upsert({
        where: { id: 4, name: 'Creeper' },
        update: {},
        create: {
            id: 4,
            name: 'Creeper',
            description: "Mettez-le sous pression et vous en subirez les conséquences.",
            rarity: 2,
            pv_durability: 35,
            cost: 3,
            talent: actions.creeper_talent.id,
            attack1: actions.creeper_attack1.id,
            ...(await loadCardImages('creeper')),
            folder_name: 'creeper'
        }
    })

    const card_golem = await prisma.cards.upsert({
        where: { id: 5, name: 'Golem' },
        update: {},
        create: {
            id: 5,
            name: 'Golem',
            description: "Protecteur des innocents, sa force brute est la terreur des ennemis.",
            rarity: 2,
            pv_durability: 70,
            cost: 4,
            talent: actions.golem_talent.id,
            attack1: actions.golem_attack1.id,
            attack2: actions.golem_attack2.id,
            ...(await loadCardImages('golem')),
            folder_name: 'golem'
        }
    })

    const card_villager = await prisma.cards.upsert({
        where: { id: 6, name: 'Villageois' },
        update: {},
        create: {
            id: 6,
            name: 'Villageois',
            description: "Paisible marchand, il survit en troquant plutôt qu'en combattant.",
            pv_durability: 20,
            cost: 1,
            attack1: actions.villager_attack1.id,
            attack2: actions.villager_attack2.id,
            ...(await loadCardImages('villager')),
            folder_name: 'villager'
        }
    })

    const card_zombie = await prisma.cards.upsert({
        where: { id: 7, name: 'Zombie' },
        update: {},
        create: {
            id: 7,
            name: 'Zombie',
            description: "Sans cerveau mais toujours affamé.",
            pv_durability: 25,
            cost: 1,
            attack1: actions.zombie_attack1.id,
            attack2: actions.zombie_attack2.id,
            ...(await loadCardImages('zombie')),
            folder_name: 'zombie'
        }
    })

    const card_axolotl = await prisma.cards.upsert({
        where: { id: 8, name: 'Axolotl' },
        update: {},
        create: {
            id: 8,
            name: 'Axolotl',
            description: "Petit, mignon, mais surprenant dans la bataille.",
            pv_durability: 10,
            cost: 0,
            attack1: actions.axolotl_attack1.id,
            attack2: actions.axolotl_attack2.id,
            ...(await loadCardImages('axolotl')),
            folder_name: 'axolotl'
        }
    })

    const card_turtle = await prisma.cards.upsert({
        where: { id: 9, name: 'Tortue' },
        update: {},
        create: {
            id: 9,
            name: 'Tortue',
            description: "Lente mais résistance, elle endure le temps et les combats.",
            pv_durability: 50,
            cost: 3,
            talent: actions.turtle_talent.id,
            attack1: actions.turtle_attack1.id,
            ...(await loadCardImages('turtle')),
            folder_name: 'turtle'
        }
    })

    const card_blaze = await prisma.cards.upsert({
        where: { id: 10, name: 'Blaze' },
        update: {},
        create: {
            id: 10,
            name: 'Blaze',
            description: "Maître des flammes du Nether, il embrase tout sur son passage.",
            pv_durability: 30,
            cost: 2,
            talent: actions.blaze_talent.id,
            attack1: actions.blaze_attack1.id,
            ...(await loadCardImages('blaze')),
            folder_name: 'blaze'
        }
    })

    const card_spider = await prisma.cards.upsert({
        where: { id: 11, name: 'Araignée' },
        update: {},
        create: {
            id: 11,
            name: 'Araignée',
            description: "Elle sort de vos cauchemars pour vous hanter dans la vraie vie.",
            pv_durability: 20,
            cost: 0,
            talent: actions.spider_talent.id,
            attack1: actions.spider_attack1.id,
            ...(await loadCardImages('spider')),
            folder_name: 'spider'
        }
    })

    const card_warden = await prisma.cards.upsert({
        where: { id: 12, name: 'Warden' },
        update: {},
        create: {
            id: 12,
            name: 'Warden',
            description: "Même aveugle il ressent chaque mouvement...",
            rarity: 3,
            pv_durability: 80,
            cost: 8,
            talent: actions.warden_talent.id,
            attack1: actions.warden_attack1.id,
            attack2: actions.warden_attack2.id,
            ...(await loadCardImages('warden')),
            folder_name: 'warden'
        }
    })

    const card_guardian = await prisma.cards.upsert({
        where: { id: 13, name: 'Guardian' },
        update: {},
        create: {
            id: 13,
            name: 'Gardien',
            description: "Dans les profondeurs il règne en maître silencieux.",
            pv_durability: 40,
            cost: 5,
            talent: actions.guardian_talent.id,
            attack1: actions.guardian_attack1.id,
            attack2: actions.guardian_attack2.id,
            ...(await loadCardImages('guardian')),
            folder_name: 'guardian'
        }
    })

    const card_witch = await prisma.cards.upsert({
        where: { id: 14, name: 'Sorcière' },
        update: {},
        create: {
            id: 14,
            name: 'Sorcière',
            description: "Ses breuvages sont aussi mortels qu'imprévisibles.",
            rarity: 2,
            pv_durability: 30,
            cost: 3,
            talent: actions.witch_talent.id,
            attack1: actions.witch_attack1.id,
            attack2: actions.witch_attack2.id,
            ...(await loadCardImages('witch')),
            folder_name: 'witch'
        }
    })

    const card_ghast = await prisma.cards.upsert({
        where: { id: 15, name: 'Ghast' },
        update: {},
        create: {
            id: 15,
            name: 'Ghast',
            description: "Ses pleurs résonnent dans le Nether.",
            pv_durability: 45,
            cost: 2,
            talent: actions.ghast_talent.id,
            attack1: actions.ghast_attack1.id,
            ...(await loadCardImages('ghast')),
            folder_name: 'ghast'
        }
    })

    const card_wither = await prisma.cards.upsert({
        where: { id: 16, name: 'Wither' },
        update: {},
        create: {
            id: 16,
            name: 'Wither',
            description: "Né de la mort, il ne vit que pour tout détruire.",
            rarity: 2,
            pv_durability: 80,
            cost: 9,
            talent: actions.wither_talent.id,
            attack1: actions.wither_attack1.id,
            attack2: actions.wither_attack2.id,
            ...(await loadCardImages('wither')),
            folder_name: 'wither'
        }
    })

    const card_snowgolem = await prisma.cards.upsert({
        where: { id: 17, name: 'Golem de neige' },
        update: {},
        create: {
            id: 17,
            name: 'Golem de neige',
            description: "Créé pour défendre avec légèreté.",
            pv_durability: 20,
            cost: 0,
            attack1: actions.snowgolem_attack1.id,
            ...(await loadCardImages('snowgolem')),
            folder_name: 'snowgolem'
        }
    })

    const card_squid = await prisma.cards.upsert({
        where: { id: 18, name: 'Poulpe' },
        update: {},
        create: {
            id: 18,
            name: 'Poulpe',
            description: "Paisible créature des océans.",
            pv_durability: 20,
            cost: 0,
            attack1: actions.squid_talent.id,
            ...(await loadCardImages('squid')),
            folder_name: 'squid'
        }
    })

    const card_cat = await prisma.cards.upsert({
        where: { id: 19, name: 'Chat' },
        update: {},
        create: {
            id: 19,
            name: 'Chat',
            description: "Sous ses airs CHATrmants...",
            pv_durability: 15,
            cost: 0,
            attack1: actions.cat_talent.id,
            attack2: actions.cat_attack1.id,
            ...(await loadCardImages('cat')),
            folder_name: 'cat'
        }
    })

    const card_egg = await prisma.cards.upsert({
        where: { id: 20, name: 'Oeuf de dragon' },
        update: {},
        create: {
            id: 20,
            name: 'Oeuf de dragon',
            description: "Un oeuf mystique...",
            pv_durability: 5,
            cost: 0,
            attack1: actions.egg_talent.id,
            ...(await loadCardImages('egg')),
            folder_name: 'egg'
        }
    })

    const card_shulker = await prisma.cards.upsert({
        where: { id: 21, name: 'Shulker' },
        update: {},
        create: {
            id: 21,
            name: 'Shulker',
            description: "Caché dans sa boîte.",
            pv_durability: 5,
            cost: 0,
            talent: actions.shulker_talent.id,
            attack1: actions.shulker_attack1.id,
            attack2: actions.shulker_attack2.id,
            ...(await loadCardImages('shulker')),
            folder_name: 'shulker'
        }
    })

    const card_sword = await prisma.cards.upsert({
        where: { id: 22, name: 'Épée' },
        update: {},
        create: {
            id: 22,
            name: 'Épée',
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.sword_effect.id,
            ...(await loadCardImages('sword')),
            folder_name: 'sword'
        }
    })

    const card_pickaxe = await prisma.cards.upsert({
        where: { id: 23, name: 'Pioche' },
        update: {},
        create: {
            id: 23,
            name: 'Pioche',
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.pickaxe_effect.id,
            ...(await loadCardImages('pickaxe')),
            folder_name: 'pickaxe'
        }
    })

    const card_bow = await prisma.cards.upsert({
        where: { id: 24, name: 'Arc' },
        update: {},
        create: {
            id: 24,
            name: 'Arc',
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.bow_effect.id,
            ...(await loadCardImages('bow')),
            folder_name: 'bow'
        }
    })
}

async function main() {
    // await prisma.actions.deleteMany({})
    // await prisma.cards.deleteMany({})
    // await prisma.user.deleteMany({})

    const acts = await actions();
    await cards(acts);
}

main()
.then(async () => {
    await prisma.$disconnect()
})
.catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})