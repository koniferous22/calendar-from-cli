import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'

export const findEventTemplatesByAliases = async (
  pc: PrismaClientReusableInTransactions,
  eventTemplateAliases: string[],
) => {
  const listResult = await pc.eventTemplate.findMany({
    where: {
      Alias: {
        in: eventTemplateAliases,
      },
    },
  })
  return Object.fromEntries(listResult.map((item) => [item.Alias, item] as const))
}
