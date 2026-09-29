import { useEffect, useState } from 'react'
import { Wallet, ClipboardList, CheckCircle2, TrendingUp, Download } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import { downloadPdfReport } from '../../utils/pdf.js'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'

const periods = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
]
const money = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Analytics() {
  const { showToast } = useToast()
  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState('')
  const [period, setPeriod] = useState('daily')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getBranches()
      .then((items) => {
        setBranches(items)
        if (items.length) setBranchId(String(items[0].id))
      })
      .catch((error) => showToast(error.message, 'error'))
  }, [showToast])

  useEffect(() => {
    if (!branchId) {
      setLoading(false)
      return
    }
    let current = true
    setLoading(true)
    api.getSalesAnalytics(branchId, period)
      .then((data) => { if (current) setReport(data) })
      .catch((error) => { if (current) { setReport(null); showToast(error.message, 'error') } })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [branchId, period, showToast])

  const series = report?.series || []
  const maxValue = Math.max(1, ...series.map((item) => Number(item.sales || 0)))
  const selectedPeriod = periods.find((item) => item.key === period)?.label || period

  const handleExportPdf = () => {
    downloadPdfReport({
      filename: `${report?.branch?.code || 'branch'}-${period}-sales-report.pdf`,
      heading: `${report?.branch?.name || 'Branch'} Sales Report`,
      subheading: `${selectedPeriod} · ${report?.range_start || ''} to ${report?.range_end || ''}`,
      columns: ['Period', 'Orders', 'Sales'],
      rows: series.map((item) => [item.label, item.orders, money(item.sales)]),
    })
    showToast('Sales report exported', 'success')
  }

  return (
    <AdminLayout topbarProps={{ title: 'Sales Analytics' }}>
      <div className="flex-between mb-20" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="flex-row gap-8" role="tablist" aria-label="Sales period">
          {periods.map((item) => (
            <button key={item.key} className={`chip-filter${period === item.key ? ' active' : ''}`} onClick={() => setPeriod(item.key)}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex-row gap-8">
          <select className="input" aria-label="Branch" value={branchId} onChange={(event) => setBranchId(event.target.value)}>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
          <button className="btn btn-outline btn-sm" onClick={handleExportPdf} disabled={!report}><Download /> Export Report</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard icon={Wallet} label={`${selectedPeriod} Sales`} value={money(report?.sales_total)} />
        <StatCard icon={ClipboardList} label="Orders" value={String(report?.order_count || 0)} />
        <StatCard icon={CheckCircle2} label="Completed Orders" value={String(report?.completed_orders || 0)} />
        <StatCard icon={TrendingUp} label="Average Order Value" value={money(report?.average_order_value)} />
      </div>

      <div className="card card-pad mb-20">
        <div className="flex-between mb-16">
          <div>
            <div className="section-title">{report?.branch?.name || 'Branch'} · {selectedPeriod} Sales</div>
            <div className="section-sub">{report?.range_start || ''}{report?.range_end ? ` through ${report.range_end}` : ''}</div>
          </div>
        </div>
        {loading ? <div className="section-sub">Loading sales data...</div> : !branches.length ? <div className="section-sub">No branches configured.</div> : (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', gap: 8, minHeight: 180, overflowX: 'auto' }}>
            {series.map((item) => (
              <div key={item.label} title={`${item.label}: ${money(item.sales)} · ${item.orders} orders`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flex: '1 0 28px', minWidth: 28, height: 180 }}>
                <div style={{ width: '100%', maxWidth: 56, height: `${Math.max(item.sales ? 4 : 0, Number(item.sales || 0) / maxValue * 136)}px`, background: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }} />
                <span className="section-sub" style={{ whiteSpace: 'nowrap', fontSize: 10 }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="section-title">{report?.branch?.name || 'Branch'} Sales Breakdown</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Period</th><th>Order Count</th><th>Sales</th></tr></thead>
            <tbody>
              {series.map((item) => <tr key={item.label}><td className="cell-primary">{item.label}</td><td>{item.orders}</td><td className="cell-primary">{money(item.sales)}</td></tr>)}
              {!series.length && <tr><td colSpan={3} className="text-secondary" style={{ textAlign: 'center', padding: 24 }}>{loading ? 'Loading...' : 'No sales data for this period.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}