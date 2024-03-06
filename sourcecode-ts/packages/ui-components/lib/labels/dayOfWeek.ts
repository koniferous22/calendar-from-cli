export const formatDayOfWeek = (dayOfWeek: number) => {
  switch (dayOfWeek) {
    case 0:
      return 'Sunday'
    case 1:
      return 'Monday'
    case 2:
      return 'Tuesday'
    case 3:
      return 'Wednesday'
    case 4:
      return 'Thursday'
    case 5:
      return 'Friday'
    case 6:
      return 'Saturday'
  }
}

export const formatOneLetterDayOfWeek = (dayOfWeek: number) => {
  switch (dayOfWeek) {
    case 0:
    case 6:
      return 'S'
    case 1:
      return 'M'
    case 2:
    case 4:
      return 'T'
    case 3:
      return 'W'
    case 5:
      return 'F'
  }
}
