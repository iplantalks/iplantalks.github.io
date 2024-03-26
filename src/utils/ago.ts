export function ago(date: Date): string {
  let difference = (new Date().getTime() - date.getTime()) / 1000

  const periods = [
    ['секунду', 'секурнди', 'секунд'],
    ['хвилину', 'хвилини', 'хвилин'],
    ['годину', 'години', 'годин'],
    ['день', 'дня', 'днів'],
    ['тиждень', 'тижні', 'тижнів'],
    ['місяць', 'місяця', 'місяців'],
    ['рік', 'роки', 'років'],
  ]

  const lengths = [60, 60, 24, 7, 4.35, 12, 10]

  for (var i = 0; difference >= lengths[i]; i++) {
    difference = difference / lengths[i]
  }

  difference = Math.round(difference)

  const cases = [2, 0, 1, 1, 1, 2]
  const text = periods[i][difference % 100 > 4 && difference % 100 < 20 ? 2 : cases[Math.min(difference % 10, 5)]]
  return difference + ' ' + text // + ' тому'
}
