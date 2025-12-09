import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

// Construire dynamiquement DATABASE_URL en utilisant DATABASE_HOST (pour Docker vs local)
const databaseHost = process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost'
const databaseUrl = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${databaseHost}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`

const connectionString = databaseUrl

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }