const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const parse = (date: string) => date.split('-').map(Number)

export const long = (date: string): string => {
  const [year, month, day] = parse(date)
  return `${day} ${months[month - 1]} ${year}`
}

export const short = (date: string): string => {
  const [, month, day] = parse(date)
  return `${day} ${months[month - 1].slice(0, 3)}`
}
