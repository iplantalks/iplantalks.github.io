const format = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format

/**
 * Return formatted string using intl
 * @param {number} number
 */
export function currency(number: number): string {
  return format(number)
}

/**
 * bank.gov.ua expects date in format YYYYMMDD
 */
export function getDateShortString(date: Date): string {
  return date.toISOString().split('T').shift()!.replaceAll('-', '')
}

/**
 * Round a number to a specified decimal place
 * @param number number to round
 * @param decimal decimal place to round to
 * @returns number rounded to specified decimal place
 */
export function round(number: number, decimal = 2): number {
  return Math.round(number * Math.pow(10, decimal)) / Math.pow(10, decimal)
}
