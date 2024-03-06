import inquirer from 'inquirer'

export const selectEnumPrompt = <ChoiceT>(
  choices: readonly { name: string; value: ChoiceT }[],
  message: string | null,
): Promise<{ choice: ChoiceT }> => {
  const defaultMessage = 'Choose option'
  return inquirer.prompt<{ choice: ChoiceT }>([
    {
      type: 'list',
      name: 'choice',
      message: `${message ?? defaultMessage}:`,
      choices: choices as any,
    },
  ])
}
