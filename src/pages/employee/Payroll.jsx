import { useEffect, useState } from 'react'
import { Plus, Minus, User } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function formatPeriod(period) {
  if (!period) return ''
  const [year, month] = period.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function Payroll() {
  const { showToast } = useToast()
  const [payslip, setPayslip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true
    let isInitialRequest = true
    const refreshPayroll = async () => {
      try {
        const records = await api.getMyPayroll()
        if (!isActive) return
        setPayslip(records)
      } catch (error) {
        if (isActive && isInitialRequest) showToast(error.message, 'error')
      } finally {
        if (isActive) setLoading(false)
        isInitialRequest = false
      }
    }

    refreshPayroll()
    const refreshInterval = window.setInterval(refreshPayroll, 5000)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshPayroll()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      isActive = false
      window.clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [showToast])

  const totalEarnings = (payslip?.earnings || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalDeductions = (payslip?.deductions || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const netSalary = totalEarnings - totalDeductions

  return (
    <EmployeeLayout topbarProps={{ title: 'My Payroll' }}>
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>My Payroll</h1>
          <div className="section-sub">View your payroll summary and salary details.</div>
        </div>
      </div>

      {loading ? <div className="card card-pad text-secondary">Loading payroll...</div> : !payslip ? (
        <div className="card card-pad text-secondary">No payroll has been generated for your account yet.</div>
      ) : (
      <div className="card card-pad">
        <div className="flex-between mb-20" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="flex-row gap-12">
            <span className="stat-icon" style={{ width: 44, height: 44 }}>
              <User size={20} />
            </span>
            <div>
              <div className="cell-primary" style={{ fontSize: 16 }}>{payslip.employee_name}</div>
              <div className="cell-sub">ID: {payslip.employee_username}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${payslip.status === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ marginBottom: 4, display: 'inline-block' }}>{payslip.status}</span>
            <div className="cell-sub">Period: {formatPeriod(payslip.period)}</div>
          </div>
        </div>

        <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <div className="flex-row gap-8 mb-16" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              <Plus size={15} /> Earnings
            </div>
            {payslip.earnings.map((item) => (
              <div key={item.label} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid #EFEFEF' }}>
                <span className="text-secondary" style={{ fontSize: 13 }}>{item.label}</span>
                <span className="cell-primary">{peso(item.amount)}</span>
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
            {payslip.deductions.map((item) => (
              <div key={item.label} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid #EFEFEF' }}>
                <span className="text-secondary" style={{ fontSize: 13 }}>{item.label}</span>
                <span className="cell-primary">{peso(item.amount)}</span>
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

      </div>
      )}
    </EmployeeLayout>
  )
}
