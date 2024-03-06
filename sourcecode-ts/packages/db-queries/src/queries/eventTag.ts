import { prisma } from '@calendar-from-cli/prisma'
import { UpsertEventTagInput } from '../types/input/eventTag.js'
import { calculatePaginationArgs } from '../utils/pagination.js'

export const findEventTagByAlias = async (alias: string) => {
  return prisma.eventTag.findUnique({
    where: {
      Alias: alias,
    },
  })
}

export const listEventTags = async (page: number, pageSize: number = 20) => {
  return prisma.eventTag.findMany(calculatePaginationArgs(page, pageSize))
}

export const listAllEventTags = async () => {
  return prisma.eventTag.findMany()
}

export const listEventTagsByAliases = async (aliases: string[]) => {
  const foundEventTags = await prisma.eventTag.findMany({
    where: {
      Alias: {
        in: aliases,
      },
    },
  })
  const foundAliases = foundEventTags.map(({ Alias }) => Alias)
  const foundAliasesSet = new Set(foundAliases)
  return {
    foundEventTags,
    notFoundAliases: aliases.filter((alias) => !foundAliasesSet.has(alias)),
  }
}

// Note - native prisma upsert, for some reasons increments Id (serial attribute)
export const upsertEventTag = async (alias: string, fields: UpsertEventTagInput) => {
  const now = new Date()
  const eventTagFound = !!(await findEventTagByAlias(alias))
  if (eventTagFound) {
    return prisma.eventTag.update({
      where: {
        Alias: alias,
      },
      data: {
        ...fields,
        UpdatedAt: now,
      },
    })
  }
  return prisma.eventTag.create({
    data: {
      ...fields,
      CreatedAt: now,
      UpdatedAt: now,
      Alias: alias,
    },
  })
}

export const removeEventTag = async (alias: string) => {
  return prisma.eventTag.delete({
    where: {
      Alias: alias,
    },
  })
}
