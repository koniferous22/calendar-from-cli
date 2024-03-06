import { z } from 'zod'

export const zDescriptionFormat = z.union([z.literal('Plaintext'), z.literal('Markdown')])
