import { useState } from 'react'
import { TrendingUp, TrendingDown, Save } from 'lucide-react'
import Modal from '../../Modal.jsx'

function parseMoney(str) {
  return Number(String(str).replace(/[^0-9.-]/g, '')) || 0
}

export default function EditPayrollModal({ entry, onClose, onSave }) {
  const [earnings, setEarnings] = useState({
    basic: parseMoney(entry?.gross) || 25000,
    overtime: 3500,
    allowances: 1500,
    bonuses: 0,
  })
  const [deductions, setDeductions] = useState({
    sss: 1125,
    philhealth: 500,
    pagibig: 100,
    tax: 2150,
  })

  const updateEarn = (key) => (e) => setEarnings((f) => ({ ...f, [key]: Number(e.target.value) || 0 }))
  const updateDed = (key) => (e) => setDeductions((f) => ({ ...f, [key]: Number(e.target.value) || 0 }))

  const gross = earnings.basic + earnings.overtime + earnings.allowances + earnings.bonuses
  const totalDeductions = deductions.sss + deductions.philhealth + deductions.pagibig + deductions.tax
  const net = gross - totalDeductions

  const handleSave = () => {
    onSave({
      ...entry,
      gross: `₱${gross.toLocaleString()}`,
      deductions: `-₱${totalDeductions.toLocaleString()}`,
      net: `₱${net.toLocaleString()}`,
    })
  }

  return (
    <Modal
      title="Edit Payroll Details"
      subtitle={`${entry?.name || ''} · ID: ${entry?.id || ''} · Branch: ${entry?.branch || ''}`}
      onClose={onClose}
      size="md"
      headerVariant="white"
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Update Payroll
          </button>
        </>
      )}
    >
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <div className="section-title mb-16 flex-row gap-8" style={{ fontSize: 13, color: 'var(--color-primary)' }}>
            <TrendingUp size={14} /> Earnings
          </div>
          <div className="field">
            <label>Basic Salary (₱)</label>
            <input className="input" type="number" value={earnings.basic} onChange={updateEarn('basic')} />
          </div>
          <div className="field">
            <label>Overtime Pay (₱)</label>
            <input className="input" type="number" value={earnings.overtime} onChange={updateEarn('overtime')} />
          </div>
          <div className="field">
            <label>Allowances (₱)</label>
            <input className="input" type="number" value={earnings.allowances} onChange={updateEarn('allowances')} />
          </div>
          <div className="field">
            <label>Bonuses (₱)</label>
            <input className="input" type="number" value={earnings.bonuses} onChange={updateEarn('bonuses')} />
          </div>
        </div>
        <div>
          <div className="section-title mb-16 flex-row gap-8" style={{ fontSize: 13, color: 'var(--color-danger)' }}>
            <TrendingDown size={14} /> Deductions
          </div>
          <div className="field">
            <label>SSS Contribution (₱)</label>
            <input className="input" type="number" value={deductions.sss} onChange={updateDed('sss')} />
          </div>
          <div className="field">
            <label>PhilHealth (₱)</label>
            <input className="input" type="number" value={deductions.philhealth} onChange={updateDed('philhealth')} />
          </div>
          <div className="field">
            <label>Pag-IBIG (₱)</label>
            <input className="input" type="number" value={deductions.pagibig} onChange={updateDed('pagibig')} />
          </div>
          <div className="field">
            <label>Withholding Tax (₱)</label>
            <input className="input" type="number" value={deductions.tax} onChange={updateDed('tax')} />
          </div>
        </div>
      </div>

      <div className="flex-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginTop: 4 }}>
        <div>
          <div className="section-sub">Gross Salary</div>
          <div className="cell-primary">₱{gross.toLocaleString()}.00</div>
        </div>
        <div>
          <div className="section-sub">Total Deductions</div>
          <div className="cell-primary" style={{ color: 'var(--color-danger)' }}>₱{totalDeductions.toLocaleString()}.00</div>
        </div>
        <div>
          <div className="section-sub">Net Salary</div>
          <div className="cell-primary" style={{ color: 'var(--color-primary)', fontSize: 16 }}>₱{net.toLocaleString()}.00</div>
        </div>
      </div>
    </Modal>
  )
}
