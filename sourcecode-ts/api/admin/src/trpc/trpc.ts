import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'
import { createContext } from './context.js'

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const t = initTRPC.context<typeof createContext>().create({
  errorFormatter: (opts) => {
    const { shape, error } = opts
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.code === 'BAD_REQUEST' && error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})
