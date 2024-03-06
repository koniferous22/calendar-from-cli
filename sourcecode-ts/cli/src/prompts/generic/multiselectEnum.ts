import inquirer from 'inquirer'

export const multiselectEnumPrompt = <ChoiceT>(
  choices: readonly { name: string; value: ChoiceT }[],
  message: string | null,
): Promise<{ choices: ChoiceT[] }> => {
  const defaultMessage = 'Choose options'
  return inquirer.prompt<{ choices: ChoiceT[] }>([
    {
      type: 'checkbox',
      name: 'choices',
      message: `${message ?? defaultMessage}:`,
      choices: choices as any,
    },
  ])
}

export const multiselectEnumIntoBooleanMap = async <ChoiceT extends string>(
  choices: readonly { name: string; value: ChoiceT }[],
  message: string | null,
): Promise<Record<ChoiceT, boolean>> => {
  const { choices: selectedChoices } = await multiselectEnumPrompt(choices, message)
  return Object.fromEntries(choices.map(({ value }) => [value as ChoiceT, selectedChoices.includes(value)])) as any
}
