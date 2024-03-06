import { z } from 'zod'

export const createZEventDuration = (maxDurationMinutes: number) =>
  z.number().positive().max(maxDurationMinutes, `Event duration cannot be more than ${maxDurationMinutes}`)
