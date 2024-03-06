import { z } from 'zod'

export const createZLimitedString = (maxLength: number) => z.string().max(maxLength)
