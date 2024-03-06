import { EventTag } from '@prisma/client'

export type UpsertEventTagInput = Omit<EventTag, 'Id' | 'Alias' | 'CreatedAt' | 'UpdatedAt'>
