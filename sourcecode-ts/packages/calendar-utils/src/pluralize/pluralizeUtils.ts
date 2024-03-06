export const pluralizeByFlag = (word: string, flag: boolean) => (flag ? `${word}s` : word)
export const pluralizeByCount = (word: string, count: number) => pluralizeByFlag(word, count > 1)
