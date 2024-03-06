import { EventTemplate } from '@prisma/client'

export type UpsertEventTemplateInput = Omit<EventTemplate, 'Id' | 'Alias' | 'Metadata' | 'CreatedAt' | 'UpdatedAt'>
