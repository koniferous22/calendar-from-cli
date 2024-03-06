import inquirer from 'inquirer'
import fuzzy from 'fuzzy'

type FuzzySelectOpts<ObjectT, OutputT> = {
  getValue: (obj: ObjectT) => OutputT
  getFuzzyIndex: (obj: ObjectT) => string
  getDescription: (obj: ObjectT) => string | undefined
  defaultDescription: string
  messages: {
    fuzzySelectMessage: string
  }
}

const fuzzySearchPreprocess = <T, OutputT>(
  choices: T[],
  { getValue, getFuzzyIndex, getDescription, defaultDescription }: FuzzySelectOpts<T, OutputT>,
): { value: OutputT; name: string; description: string }[] =>
  choices.map((choice) => ({
    value: getValue(choice),
    name: getFuzzyIndex(choice),
    description: getDescription(choice) ?? defaultDescription,
  }))

export const fuzzySelect = <T, OutputT = T>(choices: T[], opts: FuzzySelectOpts<T, OutputT>) => {
  const preprocessedChoices = fuzzySearchPreprocess(choices, opts)
  return inquirer.prompt<{ choice: OutputT }>([
    {
      type: 'autocomplete',
      name: 'choice',
      message: opts.messages.fuzzySelectMessage,
      source: (_: string[], input?: string) => {
        return new Promise((resolve) => {
          const fuzzyResult = fuzzy.filter(input ?? '', preprocessedChoices, {
            extract(input) {
              return input.name
            },
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
