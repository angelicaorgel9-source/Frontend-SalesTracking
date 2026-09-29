import { useEffect, useState } from 'react'
import { Download, Plus, Search, Eye, Pencil } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import GeneratePayrollModal from '../../components/admin/modals/GeneratePayrollModal.jsx'
import EditPayrollModal from '../../components/admin/modals/EditPayrollModal.jsx'
import PayrollPreviewModal from '../../components/admin/modals/PayrollPreviewModal.jsx'
import { downloadPdfReport } from '../../utils/pdf.js'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'

const statusBadge = {
  PAID: 'badge-success',
  PENDING: 'badge-warning',
  PROCESSING: 'badge-info',
}

const money = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function formatPeriod(period) {
  if (!period) return ''
  const [year, month] = period.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function toPayrollEntry(record) {
  return {
    recordId: record.id,
    id: record.employee_username,
    employeeId: record.employee_id,
    name: record.employee_name,
    branch: record.branch || 'Unassigned',
    position: record.position,
    period: formatPeriod(record.period),
    periodValue: record.period,
    earnings: record.earnings || [],
    deductionItems: record.deductions || [],
    gross: money(record.gross_total),
    deductions: `-${money(record.deduction_total)}`,
    net: money(record.net_total),
    status: record.status,
  }
}

export default function Payroll() {
  const { showToast } = useToast()
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [branchFilter, setBranchFilter] = useState('All Branches')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [search, setSearch] = useState('')

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerate, setShowGenerate] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [previewEntry, setPreviewEntry] = useState(null)

  const refreshPayroll = async () => {
    try {
      const records = await api.getAdminPayroll()
      setEntries((records || []).map(toPayrollEntry))
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshPayroll()
  }, [])

  const filteredEntries = entries.filter((entry) => (
    (!month || entry.periodValue === month)
    && (branchFilter === 'All Branches' || entry.branch === branchFilter)
    && (statusFilter === 'All Statuses' || entry.status === statusFilter)
    && (!search || entry.name.toLowerCase().includes(search.toLowerCase()) || entry.id.toLowerCase().includes(search.toLowerCase()))
  ))

  const handleDownloadPayroll = () => {
    downloadPdfReport({
      filename: 'payroll-report.pdf',
      heading: 'Payroll Report',
      subheading: `Period: ${month}  •  Branch: ${branchFilter}  •  Status: ${statusFilter}`,
      columns: ['Employee ID', 'Name', 'Branch', 'Position', 'Gross', 'Deductions', 'Net', 'Status'],
      rows: filteredEntries.map((p) => [p.id, p.name, p.branch, p.position, p.gross, p.deductions, p.net, p.status]),
    })
    showToast('Payroll report downloaded', 'success')
  }

  const handleGenerate = async ({ scope, employeeSearch, period }) => {
    try {
      const records = await api.generatePayroll({
        scope,
        employee: employeeSearch,
        period: period || month,
      })
      await refreshPayroll()
      setShowGenerate(false)
      showToast(`${records.length} payroll record${records.length === 1 ? '' : 's'} ready for editing`, 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleSaveEdit = async (updated) => {
    try {
      const saved = await api.updateAdminPayroll(updated.recordId, {
        earnings: updated.earnings,
        deductions: updated.deductionItems,
        status: updated.status,
      })
      const savedEntry = toPayrollEntry(saved)
      setEntries((previous) => previous.map((entry) => (entry.recordId === savedEntry.recordId ? savedEntry : entry)))
      setEditEntry(null)
      showToast('Payroll details saved', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const employeeCount = new Set(entries.map((entry) => entry.employeeId)).size
  const pendingCount = entries.filter((entry) => entry.status === 'PENDING').length
  const netTotal = entries.reduce((sum, entry) => sum + Number(entry.net.replace(/[^0-9.-]/g, '')), 0)

  return (
    <AdminLayout
      topbarProps={{
        title: 'Payroll Management',
        rightSlot: (
          <>
            <button className="btn btn-outline btn-sm" onClick={handleDownloadPayroll}><Download /> Download Payroll</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowGenerate(true)}><Plus /> Generate Payroll</button>
          </>
        ),
      }}
    >
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard label="Employees in Payroll" value={String(employeeCount)} />
        <StatCard label="Payroll Generated" value={entries[0]?.period || 'None'} />
        <StatCard label="Pending Payroll" value={String(pendingCount)} />
        <StatCard label="Total Net Payroll" value={money(netTotal)} />
      </div>

      <div className="card card-pad mb-16">
        <div className="two-col" style={{ gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'end', gap: 12 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Month &amp; Year</label>
            <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Branch Code</label>
            <select className="input" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
              <option>All Branches</option>
              <option>MJP-001</option>
              <option>MJP-002</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Payroll Status</label>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Employee Search</label>
            <div className="input-icon-wrap">
              <Search />
              <input className="input" placeholder="ID or Name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-row gap-8">
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => showToast('Filters applied', 'info')}>Search</button>
            <button className="btn btn-outline" onClick={() => { setMonth(new Date().toISOString().slice(0, 7)); setBranchFilter('All Branches'); setStatusFilter('All Statuses'); setSearch('') }}>Reset</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Branch</th>
                <th>Position</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((p) => (
                  <tr key={p.id} className="row-clickable" onClick={() => setPreviewEntry(p)}>
                    <td className="cell-primary" style={{ color: 'var(--color-primary)' }}>{p.id}</td>
                    <td className="cell-primary">{p.name}</td>
                    <td className="text-secondary">{p.branch}</td>
                    <td className="text-secondary">{p.position}</td>
                    <td>{p.gross}</td>
                    <td style={{ color: 'var(--color-danger)' }}>{p.deductions}</td>
                    <td className="cell-primary">{p.net}</td>
                    <td><span className={`badge ${statusBadge[p.status]}`}>{p.status}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex-row gap-8">
                        <button className="icon-btn" style={{ border: 'none' }} onClick={() => setPreviewEntry(p)}><Eye size={15} /></button>
                        <button className="icon-btn" style={{ border: 'none' }} onClick={() => setEditEntry(p)}><Pencil size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && filteredEntries.length === 0 && (
                <tr><td colSpan={9} className="text-secondary" style={{ textAlign: 'center', padding: 24 }}>No payroll records match this period and filter.</td></tr>
              )}
              {loading && <tr><td colSpan={9} className="text-secondary" style={{ textAlign: 'center', padding: 24 }}>Loading payroll records...</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card-pad flex-between">
          <span className="section-sub">Showing {filteredEntries.length} payroll record{filteredEntries.length === 1 ? '' : 's'}</span>
          <div className="pagination">
            <button className="page-nav">Prev</button>
            <button className="page-num active">1</button>
            <button className="page-num">2</button>
            <button className="page-num">3</button>
            <span className="section-sub">...</span>
            <button className="page-num">29</button>
            <button className="page-nav">Next</button>
          </div>
        </div>
      </div>

      {showGenerate && (
        <GeneratePayrollModal onClose={() => setShowGenerate(false)} onGenerate={handleGenerate} initialPeriod={month} />
      )}

      {editEntry && (
        <EditPayrollModal entry={editEntry} onClose={() => setEditEntry(null)} onSave={handleSaveEdit} />
      )}

      {previewEntry && (
        <PayrollPreviewModal entry={previewEntry} onClose={() => setPreviewEntry(null)} />
      )}
    </AdminLayout>
  )
}
