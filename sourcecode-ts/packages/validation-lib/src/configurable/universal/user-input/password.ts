import { UniversalConfig } from '../../../config/universal.js'
import { createZPassword } from '../../../primitives/configurable/password.js'

export const createZPasswordSetup = ({ inputValidation }: UniversalConfig) =>
  createZPassword(inputValidation.passwordConstraints)
