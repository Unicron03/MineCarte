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

async function main() {
    await users();
    await collection();
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