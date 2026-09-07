import { Printer, Download } from 'lucide-react'
import Modal from '../../Modal.jsx'
import { downloadPdfReport } from '../../../utils/pdf.js'

function parseMoney(str) {
  return Number(String(str).replace(/[^0-9.-]/g, '')) || 0
}

export default function PayrollPreviewModal({ entry, onClose }) {
  if (!entry) return null

  const gross = parseMoney(entry.gross)
  const deductions = Math.abs(parseMoney(entry.deductions))
  const net = parseMoney(entry.net)

  const handleDownload = () => {
    downloadPdfReport({
      filename: `Payroll-${entry.id}.pdf`,
      heading: `Payroll Summary — ${entry.name}`,
      subheading: `Branch: ${entry.branch}  •  Position: ${entry.position}  •  Status: ${entry.status}`,
      columns: ['Item', 'Amount'],
      rows: [
        ['Basic Salary', entry.gross],
        ['Total Deductions', entry.deductions],
        ['Net Salary', entry.net],
      ],
    })
  }

  return (
    <Modal
      title="Employee Payroll Summary"
      subtitle="View the payroll computation and salary breakdown for the selected employee."
      onClose={onClose}
      headerVariant="white"
      actions={(
        <>
          <button className="btn btn-outline" onClick={() => window.print()}><Printer size={14} /> Print Payroll</button>
          <button className="btn btn-outline" onClick={handleDownload}><Download size={14} /> Download PDF</button>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </>
      )}
    >
      <div className="two-col mb-16" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <div className="section-sub">Employee Name</div>
          <div className="cell-primary">{entry.name}</div>
        </div>
        <div>
          <div className="section-sub">Payroll Period</div>
          <div className="cell-primary">{entry.period || 'August 2026'}</div>
        </div>
        <div>
          <div className="section-sub">Employee ID</div>
          <div className="cell-primary">{entry.id}</div>
        </div>
        <div>
          <div className="section-sub">Payroll Status</div>
          <span className="badge badge-success">{entry.status}</span>
        </div>
        <div>
          <div className="section-sub">Branch Assignment</div>
          <div className="cell-primary">{entry.branch}</div>
        </div>
        <div>
          <div className="section-sub">Position / Role</div>
          <div className="cell-primary">{entry.position}</div>
        </div>
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}>
        <div>
          <div className="section-title mb-16" style={{ fontSize: 13 }}>Earnings</div>
          <div className="flex-between mb-16" style={{ fontSize: 12.5 }}><span className="text-secondary">Basic Salary</span><span className="cell-primary">{entry.gross}</span></div>
        </div>
        <div>
          <div className="section-title mb-16" style={{ fontSize: 13, color: 'var(--color-danger)' }}>Deductions</div>
          <div className="flex-between mb-16" style={{ fontSize: 12.5 }}><span className="text-secondary">Total Deductions</span><span style={{ color: 'var(--color-danger)' }}>{entry.deductions}</span></div>
        </div>
      </div>

      <div style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
        <div className="flex-between mb-16">
          <span className="text-secondary" style={{ fontSize: 12.5 }}>Gross Salary</span>
          <span className="cell-primary">₱{gross.toLocaleString()}.00</span>
        </div>
        <div className="flex-between mb-16">
          <span className="text-secondary" style={{ fontSize: 12.5 }}>Total Deductions</span>
          <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>-₱{deductions.toLocaleString()}.00</span>
        </div>
        <div className="flex-between">
          <span className="cell-primary">Net Salary</span>
          <span className="cell-primary" style={{ color: 'var(--color-primary)', fontSize: 17 }}>₱{net.toLocaleString()}.00</span>
        </div>
      </div>
    </Modal>
  )
}
