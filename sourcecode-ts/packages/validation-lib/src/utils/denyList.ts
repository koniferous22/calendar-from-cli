import { z } from 'zod'

export const zDenyList = (disallowed: [string, ...string[]]) =>
  z.string().superRefine((val, ctx) => {
    if (disallowed.includes(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Value "${val}" is disallowed`,
      })
    }
  })
