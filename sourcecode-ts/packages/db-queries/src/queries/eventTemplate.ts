import { prisma } from '@calendar-from-cli/prisma'
import { calculatePaginationArgs } from '../utils/pagination.js'
import { UpsertEventTemplateInput } from '../types/input/eventTemplate.js'

export const findEventTemplateByAlias = async (alias: string) => {
  return prisma.eventTemplate.findUnique({
    where: {
      Alias: alias,
    },
  })
}

export const listAllEventTemplates = async () => {
  return prisma.eventTemplate.findMany()
}

export const listEventTemplates = async (page: number, pageSize: number = 20) => {
  return prisma.eventTemplate.findMany(calculatePaginationArgs(page, pageSize))
}

// Note - native prisma upsert, for some reasons increments Id (serial attribute)
export const upsertEventTemplate = async (alias: string, fields: UpsertEventTemplateInput, metadata?: any) => {
  const now = new Date()
  const eventTemplateFound = !!(await findEventTemplateByAlias(alias))
  if (eventTemplateFound) {
    return prisma.eventTemplate.update({
      where: {
        Alias: alias,
      },
      data: {
        ...fields,
        Metadata: metadata,
        UpdatedAt: now,
      },
    })
  }
  return prisma.eventTemplate.create({
    data: {
      ...fields,
      Alias: alias,
      CreatedAt: now,
      Metadata: metadata,
      UpdatedAt: now,
    },
  })
}

export const removeEventTemplate = async (alias: string) => {
  return prisma.eventTemplate.delete({
    where: {
      Alias: alias,
    },
  })
}
