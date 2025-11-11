const TXN_KEY = 'banking_transactions'
const ACCOUNT_KEY = 'banking_account'

export const transactionService = {
  getAll: () => {
    const json = localStorage.getItem(TXN_KEY)
    const arr = json ? JSON.parse(json) : []
    // normalize: ensure merchant_name is present for older entries
    return arr.map((t) => ({ ...t, merchant_name: t.merchant_name || t.merchant_category }))
  },

  saveAll: (txns) => {
    localStorage.setItem(TXN_KEY, JSON.stringify(txns))
  },

  add: (txn) => {
    const txns = transactionService.getAll()
    const next = [txn, ...txns]
    transactionService.saveAll(next)
    return next
  },

  getAccount: () => {
    const json = localStorage.getItem(ACCOUNT_KEY)
    return json ? JSON.parse(json) : { balance: 25430.5, currency: 'USD' }
  },

  setAccount: (account) => {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
  },
}



