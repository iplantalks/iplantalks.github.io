/**
 * Return interest rate
 * @param {number} number_of_periods
 * @param {number} present_value
 * @param {number} future_value
 * @returns
 */
export function rri(number_of_periods: number, present_value: number, future_value: number): number {
  var rri = Math.pow(future_value / present_value, 1 / number_of_periods) - 1
  return rri
}
