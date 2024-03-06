import inquirer from 'inquirer'
import fuzzy from 'fuzzy'

export const fuzzyMultiselectEnumPrompt = <ChoiceT>(
  choices: readonly { name: string; value: ChoiceT }[],
  message: string | null,
): Promise<{ choices: ChoiceT[] }> => {
  const defaultMessage = 'Choose option'
  return inquirer.prompt<{ choices: ChoiceT[] }>([
    {
      type: 'checkbox-plus',
      name: 'choices',
      message: `${message ?? defaultMessage}:`,
      pageSize: 10,
      searchable: true,
      source(_: string[], input?: string) {
        return new Promise((resolve) => {
          const fuzzyResult = fuzzy.filter(input ?? '', choices as { name: string; value: ChoiceT }[], {
            extract: (input) => input.name,
          })
          const data = fuzzyResult.map((element) => {
            return element.original
          })
          resolve(data)
        })
      },
    },
  ])
}
