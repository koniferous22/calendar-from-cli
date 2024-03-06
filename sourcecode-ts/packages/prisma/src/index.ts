import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export type PrismaClientReusableInTransactions = Parameters<
  Extract<Parameters<typeof prisma.$transaction>[0], Function>
>[0]
