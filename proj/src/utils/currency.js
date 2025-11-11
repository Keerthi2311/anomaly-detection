const SYMBOLS = {
  USD: '$',
  INR: 'Rs',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  CHF: 'CHF',
  CNY: '¥',
}

export const getCurrencySymbol = (code) => {
  if (!code) return '$'
  const upper = String(code).toUpperCase()
  return SYMBOLS[upper] || upper
}

export const formatCurrency = (
  amount,
  code,
  {
    withSign = false,
    signType,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = {}
) => {
  const numeric = Number(amount)
  const safeValue = Number.isFinite(numeric) ? numeric : 0
  const symbolRaw = getCurrencySymbol(code)
  const symbol = symbolRaw.length > 1 && !symbolRaw.endsWith(' ')
    ? `${symbolRaw} `
    : symbolRaw

  let sign = ''
  if (withSign) {
    if (signType === 'credit') sign = '+'
    else if (signType === 'debit') sign = '-'
  }

  const formatted = Math.abs(safeValue).toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  })

  return `${sign}${symbol}${formatted}`
}

export const buildIncomeOptions = (currencyCode) => {
  const upper = currencyCode ? currencyCode.toUpperCase() : 'USD'
  const symbolRaw = getCurrencySymbol(upper)
  const symbol = symbolRaw.length > 1 && !symbolRaw.endsWith(' ')
    ? `${symbolRaw} `
    : symbolRaw

  const bands = [
    { value: '0-25000', min: 0, max: 25000 },
    { value: '25001-50000', min: 25001, max: 50000 },
    { value: '50001-100000', min: 50001, max: 100000 },
    { value: '100001-200000', min: 100001, max: 200000 },
    { value: '200001+', min: 200001, max: null },
  ]

  return bands.map((band) => {
    const min = band.min.toLocaleString()
    const max = band.max ? band.max.toLocaleString() : null
    const text = max
      ? `${symbol}${min} - ${symbol}${max}`
      : `${symbol}${min}+`
    return { value: band.value, text }
  })
}

export default {
  getCurrencySymbol,
  formatCurrency,
  buildIncomeOptions,
}

