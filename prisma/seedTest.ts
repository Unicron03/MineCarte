import { prisma } from '@/lib/prisma'

async function users() {
    await prisma.cards.deleteMany({})
    
    const alice = await prisma.user.create({
        data: {
            email: 'alice@prisma.io',
            pseudo: 'Alice',
            password: 'root',
            timeNextChest: new Date(),
        },
    });

    const john = await prisma.user.create({
        data: {
            email: 'john.doe@prisma.io',
            pseudo: 'JohnMCLF',
            password: 'root',
            timeNextChest: new Date(),
        },
    });
}

async function main() {
    await users();
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