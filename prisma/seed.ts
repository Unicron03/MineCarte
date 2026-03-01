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
            function_name: "Entraide",
            requiresTarget: true,
            targetType: "enemy"
        },
    });

    const villager_attack2 = await prisma.actions.create({
        data: {
            name: "Appel à un ami",
            description: "Si une carte Golem est présent dans vos 5 prochaines cartes à piocher, vous récupérez cette carte dans votre main.",
            cost: 2,
            function_name: "AppelAUnAmi"
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
            function_name: "peurViscerale"
        },
    });

    const cat_attack1 = await prisma.actions.create({
        data: {
            name: "Coup de griffe",
            description: "Inflige aléatoirement entre 5 et 15 PV à un mob adverse.",
            cost: 1,
            function_name: "AttackRandomCat",
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
            function_name: "AttaqueRandomMobAndPlayer",
        },
    });

    const shulker_attack2 = await prisma.actions.create({
        data: {
            name: "Protection dimensionnelle",
            description: "Réduit de 50% toutes les attaques adverses du prochain tour de votre adversaire.",
            damage: 0,
            cost: 5,
            function_name: "applyDimensionalProtection",
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
    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
        where: { id: 13, name: 'Gardien' },
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    await prisma.cards.upsert({
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

    // ------------------------------------------------------ EQUIPEMENT ------------------------------------------------------

    await prisma.cards.upsert({
        where: { id: 22, name: 'Épée' },
        update: {},
        create: {
            id: 22,
            name: 'Épée',
            description: "Tant que cette carte est rattaché à un mob, elle inflige, après attaque du mob, 5 PV à chaque mob adverse.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.sword_effect.id,
            ...(await loadCardImages('sword')),
            folder_name: 'sword'
        }
    })

    await prisma.cards.upsert({
        where: { id: 23, name: 'Pioche' },
        update: {},
        create: {
            id: 23,
            name: 'Pioche',
            description: "Permet de piocher première carte du dessus de votre deck.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.pickaxe_effect.id,
            ...(await loadCardImages('pickaxe')),
            folder_name: 'pickaxe'
        }
    })

    await prisma.cards.upsert({
        where: { id: 24, name: 'Arc' },
        update: {},
        create: {
            id: 24,
            name: 'Arc',
            description: "Tant que cette carte est rattaché à un mob, elle permet d'ajouter 10 PV aux attaques de celui-ci. Si l'attaque en question est une attaque visant plusieurs mobs adverses, les dégâts de cette équipement vise aléatoirement un des mobs.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.bow_effect.id,
            ...(await loadCardImages('bow')),
            folder_name: 'bow'
        }
    })

    await prisma.cards.upsert({
        where: { id: 25, name: 'Armure' },
        update: {},
        create: {
            id: 25,
            name: 'Armure',
            description: "Permet de protéger le mob rattaché en soustrayant 10 dégâts à chaque attaque.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.armor_effect.id,
            ...(await loadCardImages('armor')),
            folder_name: 'armor'
        }
    })

    await prisma.cards.upsert({
        where: { id: 26, name: 'Bottes de célérité' },
        update: {},
        create: {
            id: 26,
            name: 'Bottes de célérité',
            description: "Si le mob rattaché est attaqué, une attaque au prochain lui coûtera une énergie de moins.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.speedboots_effect.id,
            ...(await loadCardImages('celerity-boots')),
            folder_name: 'celerity-boots'
        }
    })

    await prisma.cards.upsert({
        where: { id: 27, name: 'Elytra' },
        update: {},
        create: {
            id: 27,
            name: 'Elytra',
            description: "Si le mob rattaché meurt, il est déposé dans votre main.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 3,
            attack1: actions.elytra_effect.id,
            ...(await loadCardImages('elytra')),
            folder_name: 'elytra'
        }
    })

    await prisma.cards.upsert({
        where: { id: 28, name: 'Potion de soin' },
        update: {},
        create: {
            id: 28,
            name: 'Potion de soin',
            description: "Soigne le mob rattaché de 10 PV à chaque tour.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.potion_regen_effect.id,
            ...(await loadCardImages('potion-heal')),
            folder_name: 'potion-heal'
        }
    })

    await prisma.cards.upsert({
        where: { id: 29, name: 'Bouclier' },
        update: {},
        create: {
            id: 29,
            name: 'Bouclier',
            description: "Si le mob rattaché subit des attaques d'une attaque, on inflige 10 PV au mob attaquant.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 1,
            attack1: actions.shield_effect.id,
            ...(await loadCardImages('shield')),
            folder_name: 'shield'
        }
    })

    await prisma.cards.upsert({
        where: { id: 30, name: 'Totem' },
        update: {},
        create: {
            id: 30,
            name: 'Totem',
            description: "Si le mob rattaché devait mourir, il conserve 5 PV et l'équipement est défaussé. Le reste des dégâts de l'attaque subie sont aspirés par le totem.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 4,
            attack1: actions.totem_effect.id,
            ...(await loadCardImages('totem')),
            folder_name: 'totem'
        }
    })

    // ------------------------------------------------------ ARTEFACTS ------------------------------------------------------

    await prisma.cards.upsert({
        where: { id: 31, name: 'Enclume' },
        update: {},
        create: {
            id: 31,
            name: 'Enclume',
            description: "Récupère un équipement de votre défausse et le transfère dans votre main.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 1,
            attack1: actions.anvil_effect.id,
            ...(await loadCardImages('anvil')),
            folder_name: 'anvil'
        }
    })

    await prisma.cards.upsert({
        where: { id: 32, name: 'Lit' },
        update: {},
        create: {
            id: 32,
            name: 'Lit',
            description: "Soigne votre joueur de 25 dégâts.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 2,
            attack1: actions.potion_player_effect.id,
            ...(await loadCardImages('bed')),
            folder_name: 'bed'
        }
    })

    await prisma.cards.upsert({
        where: { id: 33, name: 'Cloche' },
        update: {},
        create: {
            id: 33,
            name: 'Cloche',
            description: "Si le Warden a moins de 50% de sa vie, il peut attaquer avec un coût de 1 au prochain tour.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 2,
            attack1: actions.bell_effect.id,
            ...(await loadCardImages('bell')),
            folder_name: 'bell'
        }
    })

    await prisma.cards.upsert({
        where: { id: 34, name: 'Livre' },
        update: {},
        create: {
            id: 34,
            name: 'Livre',
            description: "Pioche les 2 premières cartes du deck.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 1,
            attack1: actions.book_effect.id,
            ...(await loadCardImages('book')),
            folder_name: 'book'
        }
    })

    await prisma.cards.upsert({
        where: { id: 35, name: 'Établi' },
        update: {},
        create: {
            id: 35,
            name: 'Établi',
            description: "Réduit le coût de la future carte posée de 3. Ne fonctionne que sur le tour utilisé.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 1,
            attack1: actions.craftingtable_effect.id,
            ...(await loadCardImages('crafting-table')),
            folder_name: 'crafting-table'
        }
    })

    await prisma.cards.upsert({
        where: { id: 36, name: "Cristal de l'End" },
        update: {},
        create: {
            id: 36,
            name: "Cristal de l'End",
            description: "Réduit de moitié la vie d'un mob adverse au choix.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 2,
            attack1: actions.endcrsystal_effect.id,
            ...(await loadCardImages('crystal')),
            folder_name: 'crystal'
        }
    })

    await prisma.cards.upsert({
        where: { id: 37, name: "Table d'enchantement" },
        update: {},
        create: {
            id: 37,
            name: "Table d'enchantement",
            description: "Pendant ce tour, tous les équipements attachés coûtent 1 RedStone.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 2,
            attack1: actions.enchanttable_effect.id,
            ...(await loadCardImages('enchant-table')),
            folder_name: 'enchant-table'
        }
    })

    await prisma.cards.upsert({
        where: { id: 38, name: 'Canne à pêche' },
        update: {},
        create: {
            id: 38,
            name: 'Canne à pêche',
            description: "Vous avez 75% de chance de voler 2 RedStone maximum à votre adversaire, et 25% de chance de lui en donner 2.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 1,
            attack1: actions.fishingrod_effect.id,
            ...(await loadCardImages('fishing-rod')),
            folder_name: 'fishing-rod'
        }
    })

    await prisma.cards.upsert({
        where: { id: 39, name: 'Pomme dorée' },
        update: {},
        create: {
            id: 39,
            name: 'Pomme dorée',
            description: "Soigne 10 dégâts d'une carte alliée pendant 3 tours & Augmente ses dégâts de 10 PV pendant 3 tours.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.goldenapple_effect.id,
            ...(await loadCardImages('gapple')),
            folder_name: 'gapple'
        }
    })

    await prisma.cards.upsert({
        where: { id: 40, name: 'Lingot de fer' },
        update: {},
        create: {
            id: 40,
            name: 'Lingot de fer',
            description: "Soigne 20 dégâts d'un Golem de votre plateau au choix.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 1,
            attack1: actions.ironingot_effect.id,
            ...(await loadCardImages('iron-ingot')),
            folder_name: 'iron-ingot'
        }
    })

    await prisma.cards.upsert({
        where: { id: 41, name: 'Sceau de lave' },
        update: {},
        create: {
            id: 41,
            name: 'Sceau de lave',
            description: "Applique un malus de 'brûlure' à une carte ennemie : elle perd 10 PV à chaque tour pendant 3 tours.",
            category: 'EQUIPMENT',
            pv_durability: 3,
            cost: 2,
            attack1: actions.lava_effect.id,
            ...(await loadCardImages('lava-bucket')),
            folder_name: 'lava-bucket'
        }
    })

    await prisma.cards.upsert({
        where: { id: 42, name: "Perle de l'End" },
        update: {},
        create: {
            id: 42,
            name: "Perle de l'End",
            description: "Permet de défausser au choix une carte de votre plateau.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 2,
            attack1: actions.enderpearl_effect.id,
            ...(await loadCardImages('pearl')),
            folder_name: 'pearl'
        }
    })

    await prisma.cards.upsert({
        where: { id: 43, name: "Portail de l'End" },
        update: {},
        create: {
            id: 43,
            name: "Portail de l'End",
            description: "Permet de soigner au choix un Enderman, un Shulker ou un Ender Dragon de 30 dégâts.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 2,
            attack1: actions.endportal_effect.id,
            ...(await loadCardImages('end-portal')),
            folder_name: 'end-portal'
        }
    })

    await prisma.cards.upsert({
        where: { id: 44, name: "Potion d'invisibilité" },
        update: {},
        create: {
            id: 44,
            name: "Potion d'invisibilité",
            description: "Choisissez au choix un de vos mobs. Ce mob sera invisible et ne pourra pas être attaqué par votre adversaire lors de son prochain tour.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 1,
            attack1: actions.endportal_effect.id,
            ...(await loadCardImages('potion-invisibility')),
            folder_name: 'potion-invisibility'
        }
    })

    await prisma.cards.upsert({
        where: { id: 45, name: 'TNT' },
        update: {},
        create: {
            id: 45,
            name: 'TNT',
            description: "Choisissez au choix un de vos mobs. Ce mob sera invisible et ne pourra pas être attaqué par votre adversaire lors de son prochain tour.",
            category: 'EQUIPMENT',
            pv_durability: 1,
            cost: 2,
            attack1: actions.tnt_effect.id,
            ...(await loadCardImages('tnt')),
            folder_name: 'tnt'
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