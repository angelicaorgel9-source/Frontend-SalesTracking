import { useState } from 'react'
import { Search, Info, FileBarChart2 } from 'lucide-react'
import Modal from '../../Modal.jsx'

export default function GeneratePayrollModal({ onClose, onGenerate }) {
  const [scope, setScope] = useState('all')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [period, setPeriod] = useState('')

  const handleGenerate = () => {
    onGenerate({ scope, employeeSearch, period })
  }

  return (
    <Modal
      title="Generate Payroll"
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleGenerate}>
            <FileBarChart2 size={15} /> Generate Payroll
          </button>
        </>
      )}
    >
      <div className="field">
        <label>Select Scope</label>
        <div className="flex-row gap-12" style={{ marginTop: 6 }}>
          <label className="flex-row gap-8 text-secondary" style={{ fontSize: 13 }}>
            <input type="radio" name="scope" checked={scope === 'all'} onChange={() => setScope('all')} />
            All Employees
          </label>
          <label className="flex-row gap-8 text-secondary" style={{ fontSize: 13 }}>
            <input type="radio" name="scope" checked={scope === 'specific'} onChange={() => setScope('specific')} />
            Specific Employee
          </label>
        </div>
      </div>

      <div className="field">
        <label>Search Employee</label>
        <div className="input-icon-wrap">
          <Search />
          <input
            className="input"
            placeholder="Enter name or ID..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            disabled={scope === 'all'}
            style={scope === 'all' ? { background: '#F6F8FA', color: 'var(--color-text-secondary)' } : undefined}
          />
        </div>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Payroll Period</label>
        <input className="input" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </div>

      <div className="info-note" style={{ marginTop: 16, marginBottom: 0 }}>
        <Info />
        Payroll will be calculated based on active salary rates and current attendance records for the selected period.
      </div>
    </Modal>
  )
}
