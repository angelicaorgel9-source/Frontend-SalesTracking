import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Sparkles } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import CustomerDetailsModal from '../../components/admin/modals/CustomerDetailsModal.jsx'
import EditCustomerModal from '../../components/admin/modals/EditCustomerModal.jsx'
import { customerRegistry as seedRegistry, customerGrowthTrend } from '../../data/adminMockData.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function Customers() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const maxVal = Math.max(...customerGrowthTrend.map((d) => d.value))
  const [registry, setRegistry] = useState(seedRegistry)

  const [viewCustomer, setViewCustomer] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)

  const handleSaveEdit = (form) => {
    setRegistry((prev) => prev.map((c) => (c.id === editCustomer.id ? {
      ...c,
      name: form.contact,
      company: form.company,
      email: form.email,
      phone: form.phone,
    } : c)))
    setEditCustomer(null)
    showToast('Customer profile updated', 'success')
  }

  return (
    <AdminLayout topbarProps={{ title: 'Customer Management' }}>
      <h1 className="page-title">Customer Management</h1>

      <div className="three-col mb-20">
        <div className="clickable" onClick={() => showToast('1,284 total customers', 'info')}>
          <StatCard icon={Users} label="Total Customers" value="1,284" sub="↑ +12% from last month" subDirection="up" />
        </div>
        <div className="clickable" onClick={() => showToast('432 customers active this month', 'info')}>
          <StatCard icon={Sparkles} label="Active This Month" value="432" sub="High engagement level" />
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/analytics')}>
          <div className="stat-card-label mb-16">New Customer Growth</div>
          <div className="flex-between">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 46, flex: 1 }}>
              {customerGrowthTrend.map((d, i) => (
                <div
                  key={d.label}
                  style={{
                    flex: 1,
                    height: `${(d.value / maxVal) * 100}%`,
                    borderRadius: 4,
                    background: i === 3 ? 'var(--color-primary)' : 'var(--color-secondary)',
                  }}
                />
              ))}
            </div>
            <div style={{ textAlign: 'right', marginLeft: 12 }}>
              <div className="stat-card-value" style={{ fontSize: 20 }}>64</div>
              <div className="section-sub">Onboarded this week</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="section-title">Customer Registry</span>
          <div className="flex-row gap-8">
            <span className="chip-filter active">All Clients (1,284)</span>
            <span className="chip-filter">Filter: Status</span>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Info</th>
                <th>Total Orders</th>
                <th>Last Transaction</th>
              </tr>
            </thead>
            <tbody>
              {registry.map((c) => (
                <tr key={c.id} className="row-clickable" onClick={() => setViewCustomer(c)}>
                  <td>
                    <div className="cell-avatar">
                      <span className="avatar-chip round">{c.initials}</span>
                      <div>
                        <div className="cell-primary">{c.name}</div>
                        <div className="cell-sub">{c.company}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-secondary">{c.email}</div>
                    <div className="cell-sub">{c.phone}</div>
                  </td>
                  <td>
                    <div className="cell-primary">{c.orders} Orders</div>
                    <div className="cell-sub" style={{ color: 'var(--color-primary)' }}>{c.spend} {c.spendLabel}</div>
                  </td>
                  <td>
                    <div className="text-secondary">{c.lastDate}</div>
                    <div className="cell-sub">{c.lastNote}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewCustomer && (
        <CustomerDetailsModal
          customer={viewCustomer}
          onClose={() => setViewCustomer(null)}
          onEdit={() => { setEditCustomer(viewCustomer); setViewCustomer(null) }}
        />
      )}

      {editCustomer && (
        <EditCustomerModal
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
          onSave={handleSaveEdit}
        />
      )}
    </AdminLayout>
  )
}
