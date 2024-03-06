import inquirer from 'inquirer'

type OptionalPromptOpts<DefaultValueT> = {
  defaultValue: DefaultValueT
  message: string
}

export const optionalPrompt = async <T, DefaultValueT = undefined>(
  innerPrompt: () => Promise<T>,
  optionalPromptOpts?: OptionalPromptOpts<DefaultValueT>,
): Promise<T | DefaultValueT> => {
  const message = optionalPromptOpts?.message ?? 'Do you want to run optional prompt?'
  const defaultValue = optionalPromptOpts?.defaultValue as DefaultValueT
  const { yesno } = await inquirer.prompt<{ yesno: boolean }>([
    {
      type: 'confirm',
      name: 'yesno',
      message: message,
    },
  ])
  if (yesno) {
    return innerPrompt()
  }
  return defaultValue
}
