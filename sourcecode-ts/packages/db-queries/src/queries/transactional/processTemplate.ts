import { PrismaClientReusableInTransactions } from '@calendar-from-cli/prisma'
import { UpsertProcessTemplateInput, UpsertProcessTemplateItemInput } from '../../types/input/processTemplate.js'

export const findProcessTemplateByAlias = async (pc: PrismaClientReusableInTransactions, alias: string) => {
  return pc.processTemplate.findUnique({
    include: {
      ProcessTemplateItem: {
        include: {
          EventTemplate: true,
        },
        orderBy: {
          Index: 'asc',
        },
      },
    },
    where: {
      Alias: alias,
    },
  })
}

export const removeProcessTemplateOrThrow = async (pc: PrismaClientReusableInTransactions, alias: string) => {
  const processTemplate = await pc.processTemplate.findUniqueOrThrow({
    where: {
      Alias: alias,
    },
  })
  await pc.processTemplateItem.deleteMany({
    where: {
      ProcessTemplateId: processTemplate.Id,
    },
  })
  await pc.processTemplate.delete({
    where: {
      Id: processTemplate.Id,
    },
  })
}

const checkProcessTemplateItemEventTemplatesAppearInSameOrder = (
  sortedInputProcessTemplateItems: UpsertProcessTemplateItemInput[],
  sortedProcessTemplateItemsInDb: NonNullable<
    Awaited<ReturnType<typeof findProcessTemplateByAlias>>
  >['ProcessTemplateItem'],
) =>
  sortedInputProcessTemplateItems.length === sortedProcessTemplateItemsInDb.length &&
  sortedInputProcessTemplateItems.every(
    ({ EventTemplateId }, arrayIndex) => EventTemplateId === sortedProcessTemplateItemsInDb[arrayIndex].EventTemplateId,
  )

export const upsertProcessTemplate = async (
  pc: PrismaClientReusableInTransactions,
  alias: string,
  processTemplateFields: UpsertProcessTemplateInput,
  processTemplateItems: UpsertProcessTemplateItemInput[],
) => {
  const processTemplateItemSortedByIndex = [...processTemplateItems].sort((a, b) => a.Index - b.Index)
  const now = new Date()
  const processTemplateInDb = await findProcessTemplateByAlias(pc, alias)
  let processTemplateId = processTemplateInDb?.Id
  const processTemplateItemsInDb = processTemplateInDb?.ProcessTemplateItem ?? []
  if (!processTemplateId) {
    const createResult = await pc.processTemplate.create({
      data: {
        ...processTemplateFields,
        Alias: alias,
        CreatedAt: now,
        UpdatedAt: now,
      },
    })
    processTemplateId = createResult.Id
  } else {
    await pc.processTemplate.update({
      where: {
        Alias: alias,
      },
      data: {
        ...processTemplateFields,
        UpdatedAt: now,
      },
    })
  }
  if (
    !checkProcessTemplateItemEventTemplatesAppearInSameOrder(processTemplateItemSortedByIndex, processTemplateItemsInDb)
  ) {
    await pc.processTemplateItem.deleteMany({
      where: {
        ProcessTemplateId: processTemplateId,
      },
    })
    await pc.processTemplateItem.createMany({
      data: processTemplateItems.map(({ Index, ItemOffset, EventTemplateId }) => ({
        Index,
        ItemOffset: ItemOffset as any,
        EventTemplateId,
        ProcessTemplateId: processTemplateId!,
      })),
    })
  } else {
    await Promise.all(
      processTemplateItemsInDb.map(({ Id }, arrayIndex) =>
        pc.processTemplateItem.update({
          where: {
            Id,
          },
          data: {
            ItemOffset: processTemplateItemSortedByIndex[arrayIndex].ItemOffset as any,
          },
        }),
      ),
    )
  }
  return findProcessTemplateByAlias(pc, alias)
}
