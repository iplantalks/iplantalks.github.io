export const colors = ['55, 162, 235', '255, 99, 132', '76, 191, 192', '254, 159, 64', '154, 102, 255', '255, 205, 86']

// export const inflation = [
//   { year: 1998, value: 20 },
//   { year: 1999, value: 19.2 },
//   { year: 2000, value: 25.8 },
//   { year: 2001, value: 6.1 },
//   { year: 2002, value: -0.6 },
//   { year: 2003, value: 8.2 },
//   { year: 2004, value: 12.3 },
//   { year: 2005, value: 10.3 },
//   { year: 2006, value: 11.6 },
//   { year: 2007, value: 16.6 },
//   { year: 2008, value: 22.3 },
//   { year: 2009, value: 12.3 },
//   { year: 2010, value: 9.1 },
//   { year: 2011, value: 4.6 },
//   { year: 2012, value: -0.2 },
//   { year: 2013, value: 0.5 },
//   { year: 2014, value: 24.9 },
//   { year: 2015, value: 43.3 },
//   { year: 2016, value: 12.4 },
//   { year: 2017, value: 13.7 },
//   { year: 2018, value: 9.8 },
//   { year: 2019, value: 4.1 },
//   { year: 2020, value: 5 },
//   { year: 2021, value: 10 },
//   { year: 2022, value: 26.6 },
//   { year: 2023, value: 3.8 },
//   { year: 2024, value: 3.8 },
// ]

// export const exchange_rate = [
//   { year: 1997, value: 1.89 },
//   { year: 1998, value: 2.44 },
//   { year: 1999, value: 4.13 },
//   { year: 2000, value: 5.44 },
//   { year: 2001, value: 5.37 },
//   { year: 2002, value: 5.32 },
//   { year: 2003, value: 5.33 },
//   { year: 2004, value: 5.31 },
//   { year: 2005, value: 5.12 },
//   { year: 2006, value: 5.05 },
//   { year: 2007, value: 5.05 },
//   { year: 2008, value: 5.26 },
//   { year: 2009, value: 7.79 },
//   { year: 2010, value: 7.93 },
//   { year: 2011, value: 7.94 },
//   { year: 2012, value: 7.99 },
//   { year: 2013, value: 7.99 },
//   { year: 2014, value: 10.95 },
//   { year: 2015, value: 23.44 },
//   { year: 2016, value: 26.2 },
//   { year: 2017, value: 26.98 },
//   { year: 2018, value: 26.54 },
//   { year: 2019, value: 27.25 },
//   { year: 2020, value: 28.06 },
//   { year: 2021, value: 27.89 },
//   { year: 2022, value: 29.25 },
//   { year: 2023, value: 36.57 },
//   { year: 2024, value: 42 },
// ]

// export const cash_usd = exchange_rate
//   .map(({ year, value }) => {
//     const prev = exchange_rate.find((x) => x.year === year - 1)?.value || 1
//     const change = ((value - prev) / prev) * 100
//     return { year, value: change }
//   })
//   .slice(1)

// export const deposit_uah = [
//   { year: 1998, value: 40.0 },
//   { year: 1999, value: 49.2 },
//   { year: 2000, value: 31.8 },
//   { year: 2001, value: 20.3 },
//   { year: 2002, value: 22.5 },
//   { year: 2003, value: 15.5 },
//   { year: 2004, value: 16.4 },
//   { year: 2005, value: 15.5 },
//   { year: 2006, value: 14.7 },
//   { year: 2007, value: 14.5 },
//   { year: 2008, value: 10.7 },
//   { year: 2009, value: 20.0 },
//   { year: 2010, value: 17.0 },
//   { year: 2011, value: 14.4 },
//   { year: 2012, value: 16.25 },
//   { year: 2013, value: 17.7 },
//   { year: 2014, value: 16.56 },
//   { year: 2015, value: 16.72 },
//   { year: 2016, value: 16.13 },
//   { year: 2017, value: 13.17 },
//   { year: 2018, value: 11.38 },
//   { year: 2019, value: 12.5 },
//   { year: 2020, value: 9.54 },
//   { year: 2021, value: 6.79 },
//   { year: 2022, value: 7.04 },
//   { year: 2023, value: 11.22 },
//   { year: 2024, value: 10.55 },
// ]

// export const deposit_usd_orig = [
//   { year: 1998, value: 6.8 },
//   { year: 1999, value: 6.8 },
//   { year: 2000, value: 6.8 },
//   { year: 2001, value: 6.0 },
//   { year: 2002, value: 8.4 },
//   { year: 2003, value: 8.4 },
//   { year: 2004, value: 10.5 },
//   { year: 2005, value: 10.6 },
//   { year: 2006, value: 10.1 },
//   { year: 2007, value: 9.8 },
//   { year: 2008, value: 10.1 },
//   { year: 2009, value: 13.3 },
//   { year: 2010, value: 11.6 },
//   { year: 2011, value: 7.8 },
//   { year: 2012, value: 7.48 },
//   { year: 2013, value: 6.76 },
//   { year: 2014, value: 7.08 },
//   { year: 2015, value: 7.24 },
//   { year: 2016, value: 5.46 },
//   { year: 2017, value: 3.9 },
//   { year: 2018, value: 2.69 },
//   { year: 2019, value: 2.74 },
//   { year: 2020, value: 0.96 },
//   { year: 2021, value: 0.81 },
//   { year: 2022, value: 0.64 },
//   { year: 2023, value: 0.67 },
//   { year: 2024, value: 2.74 },
// ]

// export const deposit_usd = deposit_usd_orig.map(({ year, value }) => {
//   const er = cash_usd.find((x) => x.year === year)?.value || 0
//   const val = ((1 + value / 100) * (1 + er / 100) - 1) * 100 // тут должна быть формула ((1 + deposit_usd) * (1 + cash_usd) - 1)
//   return { year, value: val }
// })

// export const ovdp_uah = [
//   { year: 2009, value: 12.21 },
//   { year: 2010, value: 10.4 },
//   { year: 2011, value: 9.2 },
//   { year: 2012, value: 12.9 },
//   { year: 2013, value: 13.1 },
//   { year: 2014, value: 14 },
//   { year: 2015, value: 13.1 },
//   { year: 2016, value: 9.2 },
//   { year: 2017, value: 10.5 },
//   { year: 2018, value: 17.8 },
//   { year: 2019, value: 16.9 },
//   { year: 2020, value: 10.2 },
//   { year: 2021, value: 11.3 },
//   { year: 2022, value: 18.3 },
//   { year: 2023, value: 19 },
//   { year: 2024, value: 13.1 },
// ]

// export const ovdp_usd_orig = [
//   { year: 2011, value: 8.92 },
//   { year: 2012, value: 8.92 },
//   { year: 2013, value: 7.63 },
//   { year: 2014, value: 5.8 },
//   { year: 2015, value: 8.74 },
//   { year: 2016, value: 7.29 },
//   { year: 2017, value: 4.8 },
//   { year: 2018, value: 5.97 },
//   { year: 2019, value: 5.88 },
//   { year: 2020, value: 3.38 },
//   { year: 2021, value: 3.75 },
//   { year: 2022, value: 3.98 },
//   { year: 2023, value: 4.71 },
//   { year: 2024, value: 4.71 },
// ]

// export const ovdp_usd = ovdp_usd_orig.map(({ year, value }) => {
//   const er = cash_usd.find((x) => x.year === year)?.value || 0
//   const val = ((1 + value / 100) * (1 + er / 100) - 1) * 100 // тут должна быть формула ((1 + deposit_usd) * (1 + cash_usd) - 1)
//   return { year, value: val }
// })

// export const spy_orig = [
//   { year: 1998, value: 28.34 },
//   { year: 1999, value: 20.89 },
//   { year: 2000, value: -9.03 },
//   { year: 2001, value: -11.85 },
//   { year: 2002, value: -21.97 },
//   { year: 2003, value: 28.36 },
//   { year: 2004, value: 10.74 },
//   { year: 2005, value: 4.83 },
//   { year: 2006, value: 15.61 },
//   { year: 2007, value: 5.48 },
//   { year: 2008, value: -36.55 },
//   { year: 2009, value: 25.94 },
//   { year: 2010, value: 14.82 },
//   { year: 2011, value: 2.1 },
//   { year: 2012, value: 15.89 },
//   { year: 2013, value: 32.15 },
//   { year: 2014, value: 13.52 },
//   { year: 2015, value: 1.38 },
//   { year: 2016, value: 11.77 },
//   { year: 2017, value: 21.61 },
//   { year: 2018, value: -4.23 },
//   { year: 2019, value: 31.21 },
//   { year: 2020, value: 18.02 },
//   { year: 2021, value: 28.47 },
//   { year: 2022, value: -18.01 },
//   { year: 2023, value: 24.29 },
//   { year: 2024, value: 12.7 },
// ]

// export const spy = spy_orig.map(({ year, value }) => {
//   const er = cash_usd.find((x) => x.year === year)?.value || 0
//   const val = ((1 + value / 100) * (1 + er / 100) - 1) * 100 // тут должна быть формула ((1 + deposit_usd) * (1 + cash_usd) - 1)
//   return { year, value: val }
// })

// export const useData = (): Record<string, Array<{ year: number; value: number }>> => {
//   return { cash_usd, deposit_uah, deposit_usd, ovdp_uah, ovdp_usd, spy }
// }
