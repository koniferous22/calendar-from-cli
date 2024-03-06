import { z } from 'zod'

export const zTransparencyScopeSchema = z.enum(['Public', 'Protected', 'Private'])
