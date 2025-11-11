import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Column,
  Stack,
  Heading,
  Tile,
  Button,
  DatePicker,
  DatePickerInput,
  NumberInput,
  TextInput,
  Select,
  SelectItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react'
import { ArrowLeft } from '@carbon/icons-react'
import { transactionService } from '../services/transactions'
import { getUserTransactions } from '../services/api'
import { formatCurrency, getCurrencySymbol } from '../utils/currency'

const headers = [
  { key: 'id', header: 'Transaction ID' },
  { key: 'timestamp', header: 'Timestamp' },
  { key: 'transaction_type', header: 'Type' },
  { key: 'merchant_name', header: 'Merchant' },
  { key: 'amount', header: 'Amount' },
  { key: 'currency', header: 'Currency' },
  { key: 'balance_after', header: 'Balance After' },
  { key: 'transaction_country', header: 'Country' },
  { key: 'transaction_city', header: 'City' },
  { key: 'device_id', header: 'Device ID' },
  { key: 'channel', header: 'Channel' },
  { key: 'status', header: 'Status' },
]

export default function TransactionHistory() {
  const navigate = useNavigate()
  const [txns, setTxns] = useState([])
  const [filters, setFilters] = useState({
    from: null,
    to: null,
    minAmt: '',
    maxAmt: '',
    merchant: '',
    type: '',
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const serverTxns = await getUserTransactions()
        const normalized = (serverTxns || []).map((t) => ({
          ...t,
          // normalize keys to snake_case used by UI
          transaction_type: t.transaction_type || t.transactionType,
          merchant_name: t.merchant_name || t.merchantName,
          device_id: t.device_id || t.deviceId,
          transaction_country: t.transaction_country || t.transactionCountry,
          transaction_city: t.transaction_city || t.transactionCity,
          balance_after: t.balance_after || t.balanceAfter,
        }))
        if (mounted) {
          setTxns(normalized)
          // cache to localStorage for resilience
          transactionService.saveAll(normalized)
        }
      } catch (e) {
        // fallback to local cache on error
        if (mounted) setTxns(transactionService.getAll())
      }
    })()
    return () => { mounted = false }
  }, [])

  const account = transactionService.getAccount()
  const defaultCurrencyCode = (account?.currency_preference || account?.currency || 'USD').toUpperCase()

  const filtered = useMemo(() => {
    const fromT = filters.from ? new Date(filters.from).getTime() : null
    const toT = filters.to ? new Date(filters.to).getTime() : null
    return txns
      .filter((t) => (fromT ? new Date(t.timestamp).getTime() >= fromT : true))
      .filter((t) => (toT ? new Date(t.timestamp).getTime() <= toT : true))
      .filter((t) => (filters.merchant ? (t.merchant_name || t.merchant_category || '').toLowerCase().includes(filters.merchant.toLowerCase()) : true))
      .filter((t) => (filters.type ? t.transaction_type === filters.type : true))
      .filter((t) => (filters.minAmt !== '' ? Number(t.amount) >= Number(filters.minAmt) : true))
      .filter((t) => (filters.maxAmt !== '' ? Number(t.amount) <= Number(filters.maxAmt) : true))
  }, [txns, filters])

  const withBalance = useMemo(() => {
    const sorted = filtered.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    let runningBalance = Number(account?.balance ?? account?.accountBalance ?? account?.account_balance ?? 0)
    if (!Number.isFinite(runningBalance)) {
      runningBalance = 0
    }

    return sorted.map((t) => {
      const type = (t.transaction_type || '').toLowerCase()
      const amountValue = Number(t.amount ?? 0)
      const safeAmount = Number.isFinite(amountValue) ? amountValue : 0
      const currencyCode = (t.currency || account?.currency_preference || account?.currency || defaultCurrencyCode).toUpperCase()

      let balanceAfterValue = Number(t.balance_after ?? t.balanceAfter)
      if (!Number.isFinite(balanceAfterValue)) {
        balanceAfterValue = runningBalance
      } else {
        runningBalance = balanceAfterValue
      }

      const previousBalance = balanceAfterValue + (type === 'debit' ? safeAmount : -safeAmount)
      if (Number.isFinite(previousBalance)) {
        runningBalance = previousBalance
      }

      return {
        ...t,
        transaction_type: type,
        currencyCode,
        displayAmount: formatCurrency(safeAmount, currencyCode, { withSign: true, signType: type }),
        displayCurrency: `${currencyCode} (${getCurrencySymbol(currencyCode)})`,
        displayBalance: formatCurrency(balanceAfterValue, currencyCode),
      }
    })
  }, [filtered, account?.balance, account?.accountBalance, account?.account_balance, account?.currency, account?.currency_preference, defaultCurrencyCode])

  const renderDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString()
  }

  // removed login/mfa tables; linked to dedicated page instead

  return (
    <div style={{ padding: '2rem 1rem', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Stack gap={4}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button kind="ghost" size="sm" onClick={() => navigate('/dashboard')} renderIcon={ArrowLeft}>
              Back
            </Button>
            <Heading>Transaction History</Heading>
          </div>

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <Grid narrow>
              <Column lg={5} md={4} sm={4}>
                <DatePicker datePickerType="range" onChange={(dates) => setFilters((f) => ({ ...f, from: dates?.[0], to: dates?.[1] }))}>
                  <DatePickerInput id="from" labelText="From" placeholder="mm/dd/yyyy" />
                  <DatePickerInput id="to" labelText="To" placeholder="mm/dd/yyyy" />
                </DatePicker>
              </Column>
              <Column lg={3} md={2} sm={4}>
                <NumberInput id="minAmt" label="Min Amount" value={filters.minAmt} onChange={(e) => setFilters((f) => ({ ...f, minAmt: e.imaginaryTarget?.value || e.target.value }))} />
              </Column>
              <Column lg={3} md={2} sm={4}>
                <NumberInput id="maxAmt" label="Max Amount" value={filters.maxAmt} onChange={(e) => setFilters((f) => ({ ...f, maxAmt: e.imaginaryTarget?.value || e.target.value }))} />
              </Column>
              <Column lg={3} md={2} sm={4}>
                <TextInput id="merchant" labelText="Merchant" value={filters.merchant} onChange={(e) => setFilters((f) => ({ ...f, merchant: e.target.value }))} />
              </Column>
              <Column lg={3} md={2} sm={4}>
                <Select id="type" labelText="Type" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
                  <SelectItem value="" text="All" />
                  <SelectItem value="credit" text="Credit" />
                  <SelectItem value="debit" text="Debit" />
                </Select>
              </Column>
            </Grid>
          </Tile>

          <Tile style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {headers.map((h) => (
                      <TableHeader key={h.key}>{h.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withBalance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headers.length} style={{ textAlign: 'center' }}>
                        No transactions found for the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    withBalance.map((row) => (
                      <TableRow key={row.id || row.timestamp}>
                        <TableCell>{row.id || '—'}</TableCell>
                        <TableCell>{renderDateTime(row.timestamp)}</TableCell>
                        <TableCell>{row.transaction_type ? row.transaction_type.charAt(0).toUpperCase() + row.transaction_type.slice(1) : '—'}</TableCell>
                        <TableCell>{row.merchant_name || row.merchant_category || '—'}</TableCell>
                        <TableCell>{row.displayAmount}</TableCell>
                        <TableCell>{row.displayCurrency}</TableCell>
                        <TableCell>{row.displayBalance}</TableCell>
                        <TableCell>{row.transaction_country || '—'}</TableCell>
                        <TableCell>{row.transaction_city || '—'}</TableCell>
                        <TableCell>{row.device_id || '—'}</TableCell>
                        <TableCell>{(row.channel || '').toUpperCase() || '—'}</TableCell>
                        <TableCell>{(row.status || '').toUpperCase() || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Tile>

        {/* Login insights content moved to dedicated pages; no links here to keep transactions focused */}


        
        </Stack>
      </div>
    </div>
  )
}


