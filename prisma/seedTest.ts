import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function users() {
    // Hasher les mots de passe
    const hashedPassword = await bcrypt.hash('root', 10);

    const alice = await prisma.user.create({
        data: {
            id: 'user-alice-1',
            email: 'alice@prisma.io',
            name: 'Alice',
            emailVerified: true,
            timeNextChest: new Date(),
        },
    });

    // Créer le compte avec mot de passe pour Alice
    await prisma.account.create({
        data: {
            id: 'account-alice-1',
            accountId: 'alice@prisma.io',
            providerId: 'credential',
            userId: alice.id,
            password: hashedPassword,
        }
    });

    const john = await prisma.user.create({
        data: {
            id: 'user-john-2',
            email: 'john.doe@prisma.io',
            name: 'JohnMCLF',
            emailVerified: true,
            timeNextChest: new Date(),
        },
    });

    // Créer le compte avec mot de passe pour John
    await prisma.account.create({
        data: {
            id: 'account-john-2',
            accountId: 'john.doe@prisma.io',
            providerId: 'credential',
            userId: john.id,
            password: hashedPassword,
        }
    });

    console.log('✅ Users created');
}

async function collection() {
    const collectionAlice = await prisma.collection.createMany({
        data: [
            { user_id: 'user-alice-1', card_id: 2, favorite: true },
            { user_id: 'user-alice-1', card_id: 3 },
            { user_id: 'user-alice-1', card_id: 4 },
            { user_id: 'user-alice-1', card_id: 5, favorite: true },
        ]
    });

    const collectionJohn = await prisma.collection.createMany({
        data: [
            { user_id: 'user-john-2', card_id: 3 },
            { user_id: 'user-john-2', card_id: 4 },
            { user_id: 'user-john-2', card_id: 1, favorite: true },
            { user_id: 'user-john-2', card_id: 8 },
            { user_id: 'user-john-2', card_id: 9, favorite: true },
            { user_id: 'user-john-2', card_id: 10, favorite: true },
            { user_id: 'user-john-2', card_id: 11 },
            { user_id: 'user-john-2', card_id: 12 },
        ]
    });

    console.log('✅ Collections created');
}

async function userStats() {
    const userStatsAlice = await prisma.game_stats.createMany({
        data: [
            {
                user_id: 'user-alice-1',
                game_mode: 'ONE_V_ONE',
                nb_party: 10,
                victories: 7,
                defeats: 3,
                points: 1500,
            },
            {
                user_id: 'user-alice-1',
                game_mode: 'IA_V_ONE',
                nb_party: 5,
                victories: 5,
                defeats: 0,
                points: 1000,
            },
            {
                user_id: 'user-alice-1',
                game_mode: 'DONJON',
                nb_party: 2,
                victories: 1,
                defeats: 1,
                points: 800,
            },
        ]
    });

    const userStatsJohn = await prisma.game_stats.createMany({
        data: [
            {
                user_id: 'user-john-2',
                game_mode: 'ONE_V_ONE',
                nb_party: 25,
                victories: 18,
                defeats: 7,
                points: 2300,
            },
            {
                user_id: 'user-john-2',
                game_mode: 'IA_V_ONE',
                nb_party: 12,
                victories: 1,
                defeats: 8,
                points: 1800,
            },
            {
                user_id: 'user-john-2',
                game_mode: 'DONJON',
                nb_party: 5,
                victories: 4,
                defeats: 1,
                points: 1200,
            },
        ]
    });

    console.log('✅ Game stats created');
}

async function decks() {
    const deckAlice1 = await prisma.decks.create({
        data: {
            user_id: 'user-alice-1',
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

    const deckAlice2 = await prisma.decks.create({
        data: {
            user_id: 'user-alice-1',
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

    const deckJohn1 = await prisma.decks.create({
        data: {
            user_id: 'user-john-2',
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