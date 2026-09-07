import { useState } from 'react'
import { Download, Plus, Minus, User } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout.jsx'
import { myPayslip } from '../../data/employeeMockData.js'
import { downloadPdfReport } from '../../utils/pdf.js'
import { useToast } from '../../context/ToastContext.jsx'

const peso = (n) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Payroll() {
  const { showToast } = useToast()
  const [day, setDay] = useState('')
  const [monthNum, setMonthNum] = useState('')
  const [year, setYear] = useState('')

  const totalEarnings = myPayslip.earnings.reduce((sum, e) => sum + e.amount, 0)
  const totalDeductions = myPayslip.deductions.reduce((sum, e) => sum + e.amount, 0)
  const netSalary = totalEarnings - totalDeductions

  const handleDownload = () => {
    downloadPdfReport({
      filename: `Payslip-${myPayslip.employeeId}.pdf`,
      heading: `Payslip — ${myPayslip.employeeName}`,
      subheading: `ID: ${myPayslip.employeeId}  •  Period: ${myPayslip.period}  •  Status: ${myPayslip.status}`,
      columns: ['Item', 'Amount'],
      rows: [
        ...myPayslip.earnings.map((e) => [e.label, peso(e.amount)]),
        ['Total Earnings', peso(totalEarnings)],
        ...myPayslip.deductions.map((d) => [d.label, `-${peso(d.amount)}`]),
        ['Total Deductions', `-${peso(totalDeductions)}`],
        ['NET SALARY', peso(netSalary)],
      ],
    })
    showToast('Payslip downloaded', 'success')
  }

  return (
    <EmployeeLayout topbarProps={{ title: 'My Payroll' }}>
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>My Payroll</h1>
          <div className="section-sub">View your payroll summary and salary details.</div>
        </div>
        <div className="flex-row gap-8" style={{ alignItems: 'end' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Enter Date</label>
            <div className="flex-row gap-8">
              <input className="input" placeholder="DD" style={{ width: 64 }} value={day} onChange={(e) => setDay(e.target.value)} maxLength={2} />
              <input className="input" placeholder="MM" style={{ width: 64 }} value={monthNum} onChange={(e) => setMonthNum(e.target.value)} maxLength={2} />
              <input className="input" placeholder="YYYY" style={{ width: 84 }} value={year} onChange={(e) => setYear(e.target.value)} maxLength={4} />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="flex-between mb-20" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="flex-row gap-12">
            <span className="stat-icon" style={{ width: 44, height: 44 }}>
              <User size={20} />
            </span>
            <div>
              <div className="cell-primary" style={{ fontSize: 16 }}>{myPayslip.employeeName}</div>
              <div className="cell-sub">ID: {myPayslip.employeeId}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success" style={{ marginBottom: 4, display: 'inline-block' }}>{myPayslip.status}</span>
            <div className="cell-sub">Period: {myPayslip.period}</div>
          </div>
        </div>

        <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <div className="flex-row gap-8 mb-16" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              <Plus size={15} /> Earnings
            </div>
            {myPayslip.earnings.map((e) => (
              <div key={e.label} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid #EFEFEF' }}>
                <span className="text-secondary" style={{ fontSize: 13 }}>{e.label}</span>
                <span className="cell-primary">{peso(e.amount)}</span>
              </div>
            ))}
            <div className="flex-between" style={{ padding: '10px 0', marginTop: 4 }}>
              <span className="cell-primary">Total Earnings</span>
              <span className="cell-primary" style={{ color: 'var(--color-primary)' }}>{peso(totalEarnings)}</span>
            </div>
          </div>

          <div>
            <div className="flex-row gap-8 mb-16" style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
              <Minus size={15} /> Deductions
            </div>
            {myPayslip.deductions.map((d) => (
              <div key={d.label} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid #EFEFEF' }}>
                <span className="text-secondary" style={{ fontSize: 13 }}>{d.label}</span>
                <span className="cell-primary">{peso(d.amount)}</span>
              </div>
            ))}
            <div className="flex-between" style={{ padding: '10px 0', marginTop: 4 }}>
              <span className="cell-primary">Total Deductions</span>
              <span className="cell-primary" style={{ color: 'var(--color-danger)' }}>{peso(totalDeductions)}</span>
            </div>
          </div>
        </div>

        <div
          className="flex-between"
          style={{
            background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-sm)',
            padding: '18px 22px', marginBottom: 20,
          }}
        >
          <span style={{ fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', fontSize: 13 }}>Net Salary</span>
          <span style={{ fontWeight: 800, fontSize: 22 }}>{peso(netSalary)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>
    </EmployeeLayout>
  )
}
