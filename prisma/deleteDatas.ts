import { prisma } from '@/lib/prisma'

async function main() {
    await prisma.user.deleteMany();
    await prisma.cards.deleteMany();
    await prisma.actions.deleteMany();
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