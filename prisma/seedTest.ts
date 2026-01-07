import { prisma } from '@/lib/prisma'

async function users() {
    const alice = await prisma.user.create({
        data: {
            id: 1,
            email: 'alice@prisma.io',
            pseudo: 'Alice',
            password: 'root',
            timeNextChest: new Date(),
        },
    });

    const john = await prisma.user.create({
        data: {
            id: 2,
            email: 'john.doe@prisma.io',
            pseudo: 'JohnMCLF',
            password: 'root',
            timeNextChest: new Date(),
        },
    });
}

async function collection() {
    const collectionAlice = await prisma.collection.createMany({
        data: [
            { user_id: 1, card_id: 2, favorite: true },
            { user_id: 1, card_id: 3, },
            { user_id: 1, card_id: 4, },
            { user_id: 1, card_id: 5, favorite: true },
        ]
    });

    const collectionJohn = await prisma.collection.createMany({
        data: [
            { user_id: 2, card_id: 3, },
            { user_id: 2, card_id: 4, },
            { user_id: 2, card_id: 1, favorite: true },
            { user_id: 2, card_id: 8, },
            { user_id: 2, card_id: 9, favorite: true },
            { user_id: 2, card_id: 10, favorite: true },
            { user_id: 2, card_id: 11, },
            { user_id: 2, card_id: 12, },
        ]
    });
}

async function userStats() {
    const userStatsAlice = await prisma.game_stats.createMany({
        data: [
            {
                user_id: 1,
                game_mode: 'ONE_V_ONE',
                nb_party: 10,
                victories: 7,
                defeats: 3,
                points: 1500,
            },        {
                user_id: 1,
                game_mode: 'IA_V_ONE',
                nb_party: 5,
                victories: 5,
                defeats: 0,
                points: 1000,
            },
            {
                user_id: 1,
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
                user_id: 2,
                game_mode: 'ONE_V_ONE',
                nb_party: 25,
                victories: 18,
                defeats: 7,
                points: 2300,
            },
            {
                user_id: 2,
                game_mode: 'IA_V_ONE',
                nb_party: 12,
                victories: 1,
                defeats: 8,
                points: 1800,
            },
            {
                user_id: 2,
                game_mode: 'DONJON',
                nb_party: 5,
                victories: 4,
                defeats: 1,
                points: 1200,
            },
        ]
    });
}

async function decks() {
    const deckAlice1 = await prisma.decks.create({
        data: {
            user_id: 1,
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
            user_id: 1,
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
            user_id: 2,
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
}

async function main() {
    await users();
    await collection();
    await userStats();
    await decks();
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