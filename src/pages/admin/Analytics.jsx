import { useState } from 'react'
import { Wallet, ClipboardList, Gauge, TrendingUp, ChevronDown, Download } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import { revenueTrend, branchPerformance } from '../../data/adminMockData.js'
import { downloadPdfReport } from '../../utils/pdf.js'
import { useToast } from '../../context/ToastContext.jsx'

const tabs = ['Monthly', 'Quarterly', 'Yearly']
const branchOptions = ['Main Hub - Baliwag', 'Tibag', 'Sabang']

export default function Analytics() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('Monthly')
  const [branch, setBranch] = useState(branchOptions[0])
  const [branchMenuOpen, setBranchMenuOpen] = useState(false)
  const maxVal = Math.max(...revenueTrend.map((d) => d.value))

  const handleExportPdf = () => {
    downloadPdfReport({
      filename: 'branch-performance-report.pdf',
      heading: 'Branch Performance Report',
      subheading: `Scope: ${activeTab}  •  Branch: ${branch}`,
      columns: ['Branch', 'Volume', 'Monthly Revenue', 'Staff Efficiency', 'Status', 'Trend'],
      rows: branchPerformance.map((b) => [b.branch, b.volume, b.revenue, b.efficiency, b.status, `${b.trendDir === 'up' ? '+' : '-'}${b.trend}`]),
    })
    showToast('Full report exported as PDF', 'success')
  }

  return (
    <AdminLayout topbarProps={{ title: 'Admin: Reports & Analytics' }}>
      <div className="flex-between mb-20" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="flex-row gap-8">
          {tabs.map((t) => (
            <button
              key={t}
              className={`chip-filter${activeTab === t ? ' active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="dropdown-wrap">
          <span className="chip-filter" onClick={() => setBranchMenuOpen((v) => !v)}>
            {branch} <ChevronDown size={13} style={{ marginLeft: 4 }} />
          </span>
          {branchMenuOpen && (
            <div className="dropdown-menu" style={{ right: 0, left: 'auto' }}>
              {branchOptions.map((b) => (
                <div
                  key={b}
                  className={`dropdown-item${branch === b ? ' active' : ''}`}
                  onClick={() => { setBranch(b); setBranchMenuOpen(false) }}
                >
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h1 className="page-title" style={{ display: 'none' }}>Reports &amp; Analytics</h1>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="clickable" onClick={() => showToast('Total Revenue: $142,850.00', 'info')}>
          <StatCard icon={Wallet} label="Total Revenue" value="$142,850.00" sub="+12.5%" subDirection="up" />
        </div>
        <div className="clickable" onClick={() => showToast('Total Orders: 1,284', 'info')}>
          <StatCard icon={ClipboardList} label="Total Orders" value="1,284" sub="+8.2%" subDirection="up" />
        </div>
        <div className="clickable" onClick={() => showToast('Production Speed: 1.2 Days average', 'info')}>
          <StatCard icon={Gauge} label="Production Speed" value="1.2 Days" sub="-2.4%" subDirection="down" />
        </div>
        <div className="clickable" onClick={() => showToast('Customer Growth: 94.2%', 'info')}>
          <StatCard icon={TrendingUp} label="Customer Growth" value="94.2%" sub="+18%" subDirection="up" />
        </div>
      </div>

      <div className="card card-pad mb-20">
        <div className="flex-between mb-16">
          <div>
            <div className="section-title">Revenue Trends</div>
            <div className="section-sub">Historical growth across all advertising segments.</div>
          </div>
          <div className="flex-row gap-12">
            <span className="flex-row gap-8 section-sub"><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} /> Actual</span>
            <span className="flex-row gap-8 section-sub"><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-secondary)', display: 'inline-block' }} /> Projected</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160 }}>
          {revenueTrend.map((d) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: 48,
                  height: `${(d.value / maxVal) * 130}px`,
                  borderRadius: 6,
                  background: 'var(--color-primary)',
                }}
              />
              <span className="section-sub">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="section-title">Branch Performance</span>
          <button className="btn btn-outline btn-sm" onClick={handleExportPdf}><Download /> Export Full CSV</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Branch Location</th>
                <th>Volume</th>
                <th>Monthly Revenue</th>
                <th>Staff Efficiency</th>
                <th>Status</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {branchPerformance.map((b) => (
                <tr key={b.branch}>
                  <td className="cell-primary" style={{ color: b.branch === 'Poblacion' ? 'var(--color-success)' : 'var(--color-primary)' }}>{b.branch}</td>
                  <td className="text-secondary">{b.volume}</td>
                  <td className="cell-primary">{b.revenue}</td>
                  <td className="text-secondary">{b.efficiency}</td>
                  <td><span className="badge badge-success">{b.status}</span></td>
                  <td style={{ color: b.trendDir === 'up' ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                    {b.trendDir === 'up' ? '↑' : '↓'} {b.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
