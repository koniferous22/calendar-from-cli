import { ZodTypeAny, z } from 'zod'

export const zSortedNonEmptyArray = <T extends ZodTypeAny>(inner: T) => {
  return z
    .array(inner)
    .nonempty()
    .transform((arr) => [...arr.sort()])
}
