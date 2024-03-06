import { z } from 'zod'
// Tree-shakeable import
import isHexColor from 'validator/lib/isHexColor.js'

export const zHexColor = z.string().refine(isHexColor as any, {
  message: "Arg isn't hex color",
})

export const zEncodedHexColor = zHexColor.transform((color) => {
  return parseInt(color.substring(1), 16)
})
