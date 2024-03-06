import { ProcessItemAttachment } from '@prisma/client'

export type ProcessItemAttachmentIndexAndCalculatedOffsetUpdate = Pick<
  ProcessItemAttachment,
  'Id' | 'CalculatedItemOffsetInMinutes' | 'Index'
>
