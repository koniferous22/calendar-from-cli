import { prisma } from '@calendar-from-cli/prisma'
import { calculatePaginationArgs } from '../utils/pagination.js'
import { transactional } from './index.js'
import { UpsertProcessTemplateInput, UpsertProcessTemplateItemInput } from '../types/input/processTemplate.js'

export const listProcessTemplates = async (page: number, pageSize: number = 20) => {
  return prisma.processTemplate.findMany({
    ...calculatePaginationArgs(page, pageSize),
    include: {
      ProcessTemplateItem: true,
    },
  })
}

export const listAllProcessTemplates = async () => {
  return prisma.processTemplate.findMany({
    include: {
      ProcessTemplateItem: true,
    },
  })
}

export const findProcessTemplateByAlias = async (alias: string) =>
  transactional.findProcessTemplateByAlias(prisma, alias)

export const removeProcessTemplateOrThrow = async (alias: string) =>
  transactional.removeProcessTemplateOrThrow(prisma, alias)

export const upsertProcessTemplate = async (
  alias: string,
  processTemplateFields: UpsertProcessTemplateInput,
  processTemplateItems: UpsertProcessTemplateItemInput[],
) => transactional.upsertProcessTemplate(prisma, alias, processTemplateFields, processTemplateItems)
