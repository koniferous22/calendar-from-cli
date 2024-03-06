import inquirer from 'inquirer'
import { getConfigurables } from '../../globals/configurables'

const { zPasswordSetup } = getConfigurables().validators.userInput

export const passwordSetupPrompt = async () => {
  return (
    await inquirer.prompt<{ password: string }>([
      {
        type: 'password',
        name: 'password',
        message: 'Enter password',
        mask: '*',
        validate: (input: string) => {
          const result = zPasswordSetup.safeParse(input)
          return result.success || result.error.message
        },
      },
      {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm password',
        mask: '*',
        validate: (input: string, answers: { password: string }) => {
          const { password } = answers
          return input === password || "Passwords don't match"
        },
      },
    ])
  ).password
}
