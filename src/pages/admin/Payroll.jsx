import { useState } from 'react'
import { Download, Plus, Search, Eye, Pencil } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import { payrollEntries as seedEntries } from '../../data/adminMockData.js'
import GeneratePayrollModal from '../../components/admin/modals/GeneratePayrollModal.jsx'
import EditPayrollModal from '../../components/admin/modals/EditPayrollModal.jsx'
import PayrollPreviewModal from '../../components/admin/modals/PayrollPreviewModal.jsx'
import { downloadPdfReport } from '../../utils/pdf.js'
import { useToast } from '../../context/ToastContext.jsx'

const statusBadge = {
  PAID: 'badge-success',
  PENDING: 'badge-warning',
  PROCESSING: 'badge-info',
}

export default function Payroll() {
  const { showToast } = useToast()
  const [month, setMonth] = useState('November 2023')
  const [branchFilter, setBranchFilter] = useState('All Branches')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [search, setSearch] = useState('')

  const [entries, setEntries] = useState(seedEntries)
  const [showGenerate, setShowGenerate] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [previewEntry, setPreviewEntry] = useState(null)

  const handleDownloadPayroll = () => {
    downloadPdfReport({
      filename: 'payroll-report.pdf',
      heading: 'Payroll Report',
      subheading: `Period: ${month}  •  Branch: ${branchFilter}  •  Status: ${statusFilter}`,
      columns: ['Employee ID', 'Name', 'Branch', 'Position', 'Gross', 'Deductions', 'Net', 'Status'],
      rows: entries.map((p) => [p.id, p.name, p.branch, p.position, p.gross, p.deductions, p.net, p.status]),
    })
    showToast('Payroll report downloaded', 'success')
  }

  const handleGenerate = () => {
    setShowGenerate(false)
    showToast('Payroll generated successfully', 'success')
  }

  const handleSaveEdit = (updated) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    setEditEntry(null)
    showToast('Payroll details updated', 'success')
  }

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
        <StatCard label="Total Employees" value="142" />
        <StatCard label="Payroll Generated" value="Nov 2023" />
        <StatCard label="Pending Payroll" value="3" />
        <StatCard label="Total Payroll Amount" value="₱1,245,000" />
      </div>

      <div className="card card-pad mb-16">
        <div className="two-col" style={{ gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'end', gap: 12 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Month &amp; Year</label>
            <input className="input" type="text" value={month} onChange={(e) => setMonth(e.target.value)} />
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
              <option>Paid</option>
              <option>Pending</option>
              <option>Processing</option>
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
            <button className="btn btn-outline" onClick={() => { setMonth('November 2023'); setBranchFilter('All Branches'); setStatusFilter('All Statuses'); setSearch('') }}>Reset</button>
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
              {entries
                .filter((p) => (search ? (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())) : true))
                .map((p) => (
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
                        {p.status !== 'PAID' && (
                          <button className="icon-btn" style={{ border: 'none' }} onClick={() => setEditEntry(p)}><Pencil size={15} /></button>
                        )}
                        {p.status === 'PAID' && (
                          <button
                            className="icon-btn"
                            style={{ border: 'none' }}
                            onClick={() => {
                              downloadPdfReport({
                                filename: `Payroll-${p.id}.pdf`,
                                heading: `Payroll Summary — ${p.name}`,
                                subheading: `Branch: ${p.branch}  •  Position: ${p.position}  •  Status: ${p.status}`,
                                columns: ['Item', 'Amount'],
                                rows: [['Gross Salary', p.gross], ['Deductions', p.deductions], ['Net Salary', p.net]],
                              })
                              showToast('Payslip downloaded', 'success')
                            }}
                          >
                            <Download size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="card-pad flex-between">
          <span className="section-sub">Showing 1 to 5 of 142 entries</span>
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
        <GeneratePayrollModal onClose={() => setShowGenerate(false)} onGenerate={handleGenerate} />
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
