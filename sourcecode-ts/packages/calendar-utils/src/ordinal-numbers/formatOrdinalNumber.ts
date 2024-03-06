export const formatOrdinalNumber = (n: number) => {
  const resolveOrdinalSuffix = (mod100: number) => {
    if (Math.floor(mod100 / 10) === 1) {
      return 'th'
    }
    const mod10 = mod100 % 10
    switch (mod10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  }
  return `${n}${resolveOrdinalSuffix(n % 100)}`
}
