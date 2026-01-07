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
            function: 1
        },
    });

    const skeleton_attack2 = await prisma.actions.create({
        data: {
            name: "Tir de précision",
            description: "Inglige 8 PV à l'adversaire.",
            damage: 8,
            cost: 2,
            function: 2
        },
    });

    const dragon_talent = await prisma.actions.create({
        data: {
            name: "Croissance légendaire",
            description: "Un oeuf de dragon doit doit être présent sur votre plateau pour poser cette carte.",
            autoActivate: true,
            function: 4
        },
    });

    const dragon_attack1 = await prisma.actions.create({
        data: {
            name: "Souffle de dragon",
            description: "Inflige 35 PV à chaque mob adverse.",
            damage: 35,
            cost: 4,
            function: 3
        },
    });

    const dragon_attack2 = await prisma.actions.create({
        data: {
            name: "Plonger dévastratrice",
            description: "Inflige 70 PV à un mob adverse.",
            damage: 70,
            cost: 6,
            function: 1
        },
    });

    const enderman_talent = await prisma.actions.create({
        data: {
            name: "Récupération d'élément",
            description: "Permet de piocher aléatoirement une carte de votre pioche à chaque tour. Cette carte ira dans votre main.",
            function: 5
        },
    });

    const enderman_attack1 = await prisma.actions.create({
        data: {
            name: "Coup d'ombre",
            description: "Inflige 10 PV à chaque mob adverse.",
            damage: 10,
            cost: 2,
            function: 3
        },
    });

    const enderman_attack2 = await prisma.actions.create({
        data: {
            name: "Téléportation furtive",
            description: "Inflige 30 PV à un mob adverse & A une chance d'esquiver tous les dégâts d'une attaque lors du prochain tour.",
            damage: 30,
            cost: 3,
            function: 3
        },
    });

    const creeper_talent = await prisma.actions.create({
        data: {
            name: "Pression psychologique",
            description: "Si le Creeper meurt d'une attaque de l'adversaire, il inflige 15 PV à chaque mob adverse et 5 PV à l'adversaire.",
            autoActivate: true,
            function: 7
        },
    });

    const creeper_attack1 = await prisma.actions.create({
        data: {
            name: "Explosion",
            description: "Inflige 60 PV et meurt instantanément après l'attaque.",
            damage: 60,
            cost: 4,
            function: 8
        },
    });

    const golem_talent = await prisma.actions.create({
        data: {
            name: "Gardien du village",
            description: "Si un villageois est présent sur votre plateau, les attaques du golem sont multipliées par 2.",
            autoActivate: true,
            function: 9
        },
    });

    const golem_attack1 = await prisma.actions.create({
        data: {
            name: "Coup de poing de fer",
            description: "Inflige 25 PV à un mob adverse.",
            damage: 25,
            cost: 3,
            function: 1
        },
    });

    const golem_attack2 = await prisma.actions.create({
        data: {
            name: "Bon gros tank",
            description: "Lors du prochain tour, réduis les dégâts subis sur cette carte de 30%.",
            cost: 2,
            function: 10
        },
    });

    const villager_attack1 = await prisma.actions.create({
        data: {
            name: "Entraide",
            description: "Inflige 5 PV à un mob adverse pour chaque villageois présent sur le plateau (le votre et celui de votre adversaire).",
            damage: 5,
            cost: 1,
            function: 11
        },
    });

    const villager_attack2 = await prisma.actions.create({
        data: {
            name: "Appel à un ami",
            description: "Si une carte Golem est présent dans vos 5 prochaines cartes à piocher, vous récupérez cette carte dans votre main.",
            cost: 2,
            function: 12
        },
    });

    const zombie_attack1 = await prisma.actions.create({
        data: {
            name: "Morsure",
            description: "Inflige 10 PV à un mob adverse.",
            damage: 10,
            cost: 1,
            function: 1
        },
    });

    const zombie_attack2 = await prisma.actions.create({
        data: {
            name: "Affamé",
            description: "Inflige 5 PV à un mob adverse & Retire 1 RedStone à l'adversaire.",
            cost: 2,
            function: 13
        },
    });

    const axolotl_attack1 = await prisma.actions.create({
        data: {
            name: "Morsure aquatique",
            description: "Inflige 5 PV à un mob adverse.",
            damage: 5,
            cost: 1,
            function: 1
        },
    });

    const axolotl_attack2 = await prisma.actions.create({
        data: {
            name: "Appel du banc",
            description: "Soigne un mob allié au choix de 10 PV.",
            damage: 10,
            cost: 1,
            function: 13
        },
    });

    const turtle_talent = await prisma.actions.create({
        data: {
            name: "Carapace protectrice",
            description: "Lors du prochain tour, réduit les dégâts de la première attaque adverse de 50%.",
            function: 15
        },
    });

    const turtle_attack1 = await prisma.actions.create({
        data: {
            name: "Tortue géniale",
            description: "Lors du prochain tour, si la Tortue meurt d'une attaque, le joueur ne prend pas les dégâts superflus.",
            cost: 2,
            function: 16
        },
    });

    const blaze_talent = await prisma.actions.create({
        data: {
            name: "Flammes perpétuelles",
            description: "Si ce Blaze vient de lancer une attaque, il a 50% de chance d'envoyer une boule de feu infligeant 5 PV à l'adversaire.",
            autoActivate: true,
            function: 17
        },
    });

    const blaze_attack1 = await prisma.actions.create({
        data: {
            name: "Boule de feu",
            description: "Inflige 10 PV à tous les mobs adverses.",
            damage: 10,
            cost: 1,
            function: 3
        },
    });

    const spider_talent = await prisma.actions.create({
        data: {
            name: "Ralentissement calculé",
            description: "Retire 1 RedStone à l'adversaire.",
            function: 18
        },
    });

    const spider_attack1 = await prisma.actions.create({
        data: {
            name: "Morsure",
            description: "Inflige 10 PV à un mob adverse.",
            damage: 10,
            cost: 1,
            function: 1
        },
    });

    const warden_talent = await prisma.actions.create({
        data: {
            name: "Détection sonore",
            description: "Si un talent adverse est activé, le mob actionneur prend 10 PV.",
            function: 19
        },
    });

    const warden_attack1 = await prisma.actions.create({
        data: {
            name: "Réveil brutal",
            description: "Inflige 25 PV à chaque mob adverse.",
            damage: 25,
            cost: 4,
            function: 3
        },
    });

    const warden_attack2 = await prisma.actions.create({
        data: {
            name: "Hurlement Sombre",
            description: "Inflige 40 PV à un mob adverse et l'étourdit au prochain tour.",
            damage: 40,
            cost: 4,
            function: 20
        },
    });

    const guardian_talent = await prisma.actions.create({
        data: {
            name: "Lien éternel",
            description: "Si 2 Gardien sont présents sur votre plateau, votre santé ne peut pas descendre en dessous de 10 PV après une attaque.",
            autoActivate: true,
            function: 21
        },
    });

    const guardian_attack1 = await prisma.actions.create({
        data: {
            name: "Attaque furtive",
            description: "Inflige 15 PV à un mob adverse.",
            damage: 15,
            cost: 1,
            function: 1
        },
    });

    const guardian_attack2 = await prisma.actions.create({
        data: {
            name: "Rayon laser",
            description: "Inflige 60 PV à un mob adverse.",
            damage: 60,
            cost: 5,
            function: 1
        },
    });

    const witch_talent = await prisma.actions.create({
        data: {
            name: "Enchantement puissant",
            description: "Se rajoute 5 PV (même au-delà de sa vie).",
            function: 22
        },
    });

    const witch_attack1 = await prisma.actions.create({
        data: {
            name: "Potion de soin",
            description: "Vous soigne de 10 PV maximum.",
            damage: 10,
            cost: 2,
            function: 23
        },
    });

    const witch_attack2 = await prisma.actions.create({
        data: {
            name: "Potion explosive",
            description: "Inflige 20 PV à un mob adverse.",
            damage: 20,
            cost: 2,
            function: 1
        },
    });

    const ghast_talent = await prisma.actions.create({
        data: {
            name: "Retour à l'envoyeur",
            description: "Une fois lancé, l'attaque du Ghast à 25% de chance de revenir sur lui-même.",
            autoActivate: true,
            function: 22
        },
    });

    const ghast_attack1 = await prisma.actions.create({
        data: {
            name: "Boule de feu",
            description: "Inflige 40 PV à un mob adverse.",
            damage: 40,
            cost: 2,
            function: 1
        },
    });

    const wither_talent = await prisma.actions.create({
        data: {
            name: "Explosion noire",
            description: "Une fois que le Wither atteint 30% de ses PV, les dégâts de ses attaques sont multipliés par 2.",
            autoActivate: true,
            function: 22
        },
    });

    const wither_attack1 = await prisma.actions.create({
        data: {
            name: "Tête explosive",
            description: "Inflige 25 PV à chaque mob adverse.",
            damage: 25,
            cost: 3,
            function: 3
        },
    });

    const wither_attack2 = await prisma.actions.create({
        data: {
            name: "Tempête du Nether",
            description: "Inflige 45 dégâts à un mob adverse.",
            damage: 45,
            cost: 4,
            function: 1
        },
    });

    const snowgolem_attack1 = await prisma.actions.create({
        data: {
            name: "Boule de neige",
            description: "Inflige 5 PV à chaque mob adverse.",
            damage: 5,
            cost: 0,
            function: 3
        },
    });

    const squid_talent = await prisma.actions.create({
        data: {
            name: "Encre noire",
            description: "La première attaque du prochain tour de votre adversaire sera attribué aléatoirement à l'un de vos mobs.",
            function: 26
        },
    });

    const cat_talent = await prisma.actions.create({
        data: {
            name: "Peur viscérale",
            description: "Défausse aléatoirement un Creeper sur le plateau de votre adversaire.",
            function: 22
        },
    });

    const cat_attack1 = await prisma.actions.create({
        data: {
            name: "Coup de griffe",
            description: "Inflige aléatoirement entre 5 et 15 PV à un mob adverse.",
            damage: Math.floor(Math.random() * (15 - 5 + 1)) + 5, // (syntaxe : max - min)
            cost: 1,
            function: 1
        },
    });

    const egg_talent = await prisma.actions.create({
        data: {
            name: "Exigence légendaire",
            description: "Si un Ender dragon est posé sur votre plateau, on défausse automatiquement cette carte.",
            autoActivate: true,
            function: 28
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
        egg_talent
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
            ...(await loadCardImages('skeleton'))
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
            ...(await loadCardImages('dragon'))
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
            ...(await loadCardImages('enderman'))
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
            ...(await loadCardImages('creeper'))
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
            ...(await loadCardImages('golem'))
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
            ...(await loadCardImages('villager'))
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
            ...(await loadCardImages('zombie'))
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
            ...(await loadCardImages('axolotl'))
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
            ...(await loadCardImages('turtle'))
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
            ...(await loadCardImages('blaze'))
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
            ...(await loadCardImages('spider'))
        }
    })

    const card_warden = await prisma.cards.upsert({
        where: { id: 12, name: 'Warden' },
        update: {},
        create: {
            id: 12,
            name: 'Warden',
            description: "Même aveugle il ressent chaque mouvement... Ayez le malheur de le réveiller et il vous traquera jusqu'à la mort.",
            rarity: 3,
            pv_durability: 80,
            cost: 8,
            talent: actions.warden_talent.id,
            attack1: actions.warden_attack1.id,
            attack2: actions.warden_attack2.id,
            ...(await loadCardImages('warden'))
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
            ...(await loadCardImages('guardian'))
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
            ...(await loadCardImages('witch'))
        }
    })

    const card_ghast = await prisma.cards.upsert({
        where: { id: 15, name: 'Ghast' },
        update: {},
        create: {
            id: 15,
            name: 'Ghast',
            description: "Ses pleurs résonnent dans le Nether, suivis de flammes dévastatrices.",
            pv_durability: 45,
            cost: 2,
            talent: actions.ghast_talent.id,
            attack1: actions.ghast_attack1.id,
            ...(await loadCardImages('ghast'))
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
            ...(await loadCardImages('wither'))
        }
    })

    const card_snowgolem = await prisma.cards.upsert({
        where: { id: 17, name: 'Golem de neige' },
        update: {},
        create: {
            id: 17,
            name: 'Golem de neige',
            description: "Créé pour défendre avec légèreté, il combat avec un coeur de glace.",
            pv_durability: 20,
            cost: 0,
            attack1: actions.snowgolem_attack1.id,
            ...(await loadCardImages('snowgolem'))
        }
    })

    const card_squid = await prisma.cards.upsert({
        where: { id: 18, name: 'Poulpe' },
        update: {},
        create: {
            id: 18,
            name: 'Poulpe',
            description: "Paisible créature des océans, mais dangereuse quand elle se sent piégée.",
            pv_durability: 20,
            cost: 0,
            attack1: actions.squid_talent.id,
            ...(await loadCardImages('squid'))
        }
    })

    const card_cat = await prisma.cards.upsert({
        where: { id: 19, name: 'Chat' },
        update: {},
        create: {
            id: 19,
            name: 'Chat',
            description: "Sous ses airs CHATrmants, se glisse un véritable démon ! MIAAAAAOUUUUU, pennez garde à Miche-Miche.",
            pv_durability: 15,
            cost: 0,
            attack1: actions.cat_talent.id,
            attack2: actions.cat_attack1.id,
            ...(await loadCardImages('cat'))
        }
    })

    const card_egg = await prisma.cards.upsert({
        where: { id: 20, name: 'Oeuf de dragon' },
        update: {},
        create: {
            id: 20,
            name: 'Oeuf de dragon',
            description: "Un oeuf mystique qui, selon la légende, se transformerait en une créature vengeresse.",
            pv_durability: 5,
            cost: 0,
            attack1: actions.egg_talent.id,
            ...(await loadCardImages('egg'))
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