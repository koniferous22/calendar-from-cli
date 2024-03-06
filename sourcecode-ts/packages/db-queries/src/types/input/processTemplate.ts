import { ProcessTemplate, ProcessTemplateItem } from '@prisma/client'

export type UpsertProcessTemplateInput = Omit<
  ProcessTemplate,
  'Id' | 'Alias' | 'CreatedAt' | 'UpdatedAt' | 'Notifications'
>

export type UpsertProcessTemplateItemInput = Omit<ProcessTemplateItem, 'Id' | 'ProcessTemplateId'>
