import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function users() {
    // Créer Alice via Better Auth
    await auth.api.signUpEmail({
        body: {
            email: 'alice@prisma.io',
            password: 'azertyuiop',
            name: 'Alice',
        }
    });

    // Mettre à jour Alice avec l'ID personnalisé et emailVerified
    const alice = await prisma.user.findUnique({ where: { email: 'alice@prisma.io' } });
    if (alice) {
        await prisma.user.update({
            where: { id: alice.id },
            data: { 
                emailVerified: true,
                timeNextChest: new Date(),
            }
        });
        // Mettre à jour l'ID si nécessaire (optionnel)
        // await prisma.user.update({ where: { id: alice.id }, data: { id: 'user-alice-1' } });
    }

    // Créer John via Better Auth
    await auth.api.signUpEmail({
        body: {
            email: 'john.doe@prisma.io',
            password: 'azertyuiop',
            name: 'JohnMCLF',
        }
    });

    const john = await prisma.user.findUnique({ where: { email: 'john.doe@prisma.io' } });
    if (john) {
        await prisma.user.update({
            where: { id: john.id },
            data: { 
                emailVerified: true,
                timeNextChest: new Date(),
            }
        });
    }

    // Créer EVDP via Better Auth
    await auth.api.signUpEmail({
        body: {
            email: 'enzo@gmail.com',
            password: 'azertyuiop',
            name: 'evdp',
        }
    });

    const evdp = await prisma.user.findUnique({ where: { email: 'enzo@gmail.com' } });
    if (evdp) {
        await prisma.user.update({
            where: { id: evdp.id },
            data: { 
                emailVerified: true,
                timeNextChest: new Date(),
            }
        });
    }

    console.log('✅ Users created');
}

async function collection() {
    // Récupérer les IDs réels des utilisateurs
    const alice = await prisma.user.findUnique({ where: { email: 'alice@prisma.io' } });
    const john = await prisma.user.findUnique({ where: { email: 'john.doe@prisma.io' } });
    const evdp = await prisma.user.findUnique({ where: { email: 'enzo@gmail.com' } });

    if (!alice || !john || !evdp) {
        throw new Error('Users not found');
    }

    await prisma.collection.createMany({
        data: [
            { user_id: alice.id, card_id: 2, favorite: true },
            { user_id: alice.id, card_id: 3 },
            { user_id: alice.id, card_id: 4 },
            { user_id: alice.id, card_id: 5, favorite: true },
        ]
    });

    await prisma.collection.createMany({
        data: [
            { user_id: john.id, card_id: 3 },
            { user_id: john.id, card_id: 4 },
            { user_id: john.id, card_id: 1, favorite: true },
            { user_id: john.id, card_id: 8 },
            { user_id: john.id, card_id: 9, favorite: true },
            { user_id: john.id, card_id: 10, favorite: true },
            { user_id: john.id, card_id: 11 },
            { user_id: john.id, card_id: 12 },
        ]
    });

    // Récupérer toutes les cartes existantes
    const allCards = await prisma.cards.findMany({ select: { id: true } });

    // Créer la collection complète pour EVDP
    await prisma.collection.createMany({
        data: allCards.map(card => ({
            user_id: evdp.id,
            card_id: card.id,
            favorite: false,
        }))
    });

    console.log('✅ Collections created');
}

async function userStats() {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@prisma.io' } });
    const john = await prisma.user.findUnique({ where: { email: 'john.doe@prisma.io' } });
    const evdp = await prisma.user.findUnique({ where: { email: 'enzo@gmail.com' } });

    if (!alice || !john || !evdp) {
        throw new Error('Users not found');
    }

    await prisma.game_stats.createMany({
        data: [
            {
                user_id: alice.id,
                game_mode: 'ONE_V_ONE',
                nb_party: 10,
                victories: 7,
                defeats: 3,
                points: 1500,
            },
            {
                user_id: alice.id,
                game_mode: 'IA_V_ONE',
                nb_party: 5,
                victories: 5,
                defeats: 0,
                points: 1000,
            },
            {
                user_id: alice.id,
                game_mode: 'DONJON',
                nb_party: 2,
                victories: 1,
                defeats: 1,
                points: 800,
            },
        ]
    });

    await prisma.game_stats.createMany({
        data: [
            {
                user_id: john.id,
                game_mode: 'ONE_V_ONE',
                nb_party: 25,
                victories: 18,
                defeats: 7,
                points: 2300,
            },
            {
                user_id: john.id,
                game_mode: 'IA_V_ONE',
                nb_party: 12,
                victories: 1,
                defeats: 8,
                points: 1800,
            },
            {
                user_id: john.id,
                game_mode: 'DONJON',
                nb_party: 5,
                victories: 4,
                defeats: 1,
                points: 1200,
            },
        ]
    });

    await prisma.game_stats.createMany({
        data: [
            {
                user_id: evdp.id,
                game_mode: 'ONE_V_ONE',
                nb_party: 0,
                victories: 0,
                defeats: 0,
                points: 0,
            },
            {
                user_id: evdp.id,
                game_mode: 'IA_V_ONE',
                nb_party: 0,
                victories: 0,
                defeats: 0,
                points: 0,
            },
            {
                user_id: evdp.id,
                game_mode: 'DONJON',
                nb_party: 0,
                victories: 0,
                defeats: 0,
                points: 0,
            },
            {
                user_id: evdp.id,
                game_mode: 'VAGUES',
                nb_party: 0,
                victories: 0,
                defeats: 0,
                points: 0,
            },
        ]
    });

    console.log('✅ Game stats created');
}

async function decks() {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@prisma.io' } });
    const john = await prisma.user.findUnique({ where: { email: 'john.doe@prisma.io' } });
    const evdp = await prisma.user.findUnique({ where: { email: 'enzo@gmail.com' } });

    if (!alice || !john || !evdp) {
        throw new Error('Users not found');
    }

    await prisma.decks.create({
        data: {
            user_id: alice.id,
            name: "Mon premier deck",
            is_active: true,
            deck_cards: {
                create: [
                    { card_id: 2, quantity: 1 },
                    { card_id: 3, quantity: 1 },
                    { card_id: 4, quantity: 1 },
                ]
            }
        }
    });

    await prisma.decks.create({
        data: {
            user_id: alice.id,
            name: "Deck secondaire",
            is_active: false,
            deck_cards: {
                create: [
                    { card_id: 5, quantity: 1 },
                    { card_id: 6, quantity: 1 },
                ]
            }
        }
    });

    await prisma.decks.create({
        data: {
            user_id: john.id,
            name: "Deck de John",
            is_active: true,
            deck_cards: {
                create: [
                    { card_id: 1, quantity: 1 },
                    { card_id: 8, quantity: 2 },
                    { card_id: 9, quantity: 1 },
                    { card_id: 10, quantity: 1 },
                    { card_id: 11, quantity: 1 },
                ]
            }
        }
    });

    await prisma.decks.create({
        data: {
            user_id: evdp.id,
            name: "Deck EVDP",
            is_active: true,
            deck_cards: {
                create: [
                    { card_id: 1, quantity: 1 },
                    { card_id: 2, quantity: 1 },
                    { card_id: 3, quantity: 1 },
                ]
            }
        }
    });

    console.log('✅ Decks created');
}

async function main() {
    console.log('🌱 Starting seed...');
    
    // Nettoyer les données existantes dans l'ordre inverse des dépendances
    await prisma.deck_cards.deleteMany({});
    await prisma.decks.deleteMany({});
    await prisma.collection.deleteMany({});
    await prisma.game_stats.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('🗑️  Cleaned existing data');

    await users();
    await collection();
    await userStats();
    await decks();

    console.log('✨ Seed completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })