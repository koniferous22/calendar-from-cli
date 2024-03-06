import { z } from 'zod'
import { UniversalConfig } from '../../config/universal.js'

export const createZPassword = ({
  minPasswordChars,
  shouldContainDigits,
  shouldContainLowercase,
  shouldContainSpecialChars,
  shouldContainUppercase,
  specialChars,
}: UniversalConfig['inputValidation']['passwordConstraints']) => {
  return z
    .string()
    .min(minPasswordChars, {
      message: `Password should be at least ${minPasswordChars} characters long`,
    })
    .superRefine((pwdArg, ctx) => {
      const hasUppercase = /[A-Z]/.test(pwdArg)
      const hasLowercase = /[a-z]/.test(pwdArg)
      const hasDigits = /\d/.test(pwdArg)
      const specialCharsRegex = new RegExp(specialChars.testingRegex)
      const hasSpecialChars = specialCharsRegex.test(pwdArg)
      if (shouldContainUppercase && !hasUppercase) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password should contain at least one uppercase character',
        })
      }
      if (shouldContainLowercase && !hasLowercase) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password should contain at least one lowercase character',
        })
      }
      if (shouldContainDigits && !hasDigits) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password should contain at least one digit',
        })
      }
      if (shouldContainSpecialChars && !hasSpecialChars) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Password should contain at least one special character (any of '${specialChars.characters}')`,
        })
      }
    })
}

export const zAuthFormInput = z.string().min(1)
