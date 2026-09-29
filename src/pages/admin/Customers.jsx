import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Sparkles, Pencil } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import ActionMenu from '../../components/ActionMenu.jsx'
import CustomerDetailsModal from '../../components/admin/modals/CustomerDetailsModal.jsx'
import EditCustomerModal from '../../components/admin/modals/EditCustomerModal.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'

const money = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function mapCustomer(customer) {
  return {
    ...customer,
    name: customer.name || customer.username,
    company: 'Customer account',
    initials: (customer.name || customer.username || 'C').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    orders: Number(customer.orders || 0),
    spend: money(customer.spend),
    spendLabel: 'Total Spend',
    status: customer.is_active ? 'Active' : 'Inactive',
    lastDate: customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'No orders yet',
    lastNote: customer.orders ? `${customer.orders} recorded order(s)` : 'No orders yet',
  }
}

export default function Customers() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [registry, setRegistry] = useState([])
  const [viewCustomer, setViewCustomer] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)

  const refreshCustomers = () => api.getAdminCustomers().then((records) => setRegistry(records.map(mapCustomer)))

  useEffect(() => {
    refreshCustomers().catch((error) => showToast(error.message, 'error'))
  }, [showToast])

  const activeCount = registry.filter((customer) => customer.is_active).length
  const currentMonthCount = registry.filter((customer) => {
    const created = new Date(customer.created_at)
    const now = new Date()
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
  }).length
  const weeklyGrowth = Array.from({ length: 4 }, (_, index) => {
    const end = new Date()
    end.setDate(end.getDate() - (3 - index) * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    return registry.filter((customer) => {
      const created = new Date(customer.created_at)
      return created >= start && created <= end
    }).length
  })
  const maxGrowth = Math.max(1, ...weeklyGrowth)

  const handleSaveEdit = async (form) => {
    try {
      const saved = await api.updateAdminCustomer(editCustomer.id, {
        name: form.contact,
        email: form.email,
        phone: form.phone,
        is_active: form.status !== 'Inactive',
      })
      setRegistry((previous) => previous.map((customer) => customer.id === saved.id ? mapCustomer({ ...customer, ...saved }) : customer))
      setEditCustomer(null)
      showToast('Customer profile updated', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <AdminLayout topbarProps={{ title: 'Customer Management' }}>
      <h1 className="page-title">Customer Management</h1>

      <div className="three-col mb-20">
        <StatCard icon={Users} label="Total Customers" value={String(registry.length)} />
        <StatCard icon={Sparkles} label="Active Customers" value={String(activeCount)} />
        <div className="stat-card clickable" onClick={() => navigate('/analytics')}>
          <div className="stat-card-label mb-16">New Customers This Month</div>
          <div className="flex-between">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 46, flex: 1 }}>
              {weeklyGrowth.map((count, index) => <div key={index} style={{ flex: 1, height: `${(count / maxGrowth) * 100}%`, minHeight: 2, borderRadius: 4, background: 'var(--color-primary)' }} />)}
            </div>
            <div style={{ textAlign: 'right', marginLeft: 12 }}><div className="stat-card-value" style={{ fontSize: 20 }}>{currentMonthCount}</div><div className="section-sub">Registrations</div></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="section-title">Customer Registry · {registry.length}</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Contact Info</th><th>Total Orders</th><th>Status</th><th>Last Transaction</th><th>Actions</th></tr></thead>
            <tbody>
              {registry.map((customer) => <tr key={customer.id} className="row-clickable" onClick={() => setViewCustomer(customer)}>
                <td><div className="cell-avatar"><span className="avatar-chip round">{customer.initials}</span><div><div className="cell-primary">{customer.name}</div><div className="cell-sub">{customer.username}</div></div></div></td>
                <td><div className="text-secondary">{customer.email}</div><div className="cell-sub">{customer.phone}</div></td>
                <td><div className="cell-primary">{customer.orders} Orders</div><div className="cell-sub" style={{ color: 'var(--color-primary)' }}>{customer.spend} {customer.spendLabel}</div></td>
                <td><span className={`badge ${customer.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{customer.status}</span></td>
                <td><div className="text-secondary">{customer.lastDate}</div><div className="cell-sub">{customer.lastNote}</div></td>
                <td onClick={(event) => event.stopPropagation()}><ActionMenu items={[{ label: 'View Details', icon: Users, onClick: () => setViewCustomer(customer) }, { label: 'Edit Customer', icon: Pencil, onClick: () => setEditCustomer(customer) }]} /></td>
              </tr>)}
              {!registry.length && <tr><td colSpan={6} className="text-secondary" style={{ textAlign: 'center', padding: 24 }}>No customer accounts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {viewCustomer && <CustomerDetailsModal customer={viewCustomer} onClose={() => setViewCustomer(null)} onEdit={() => { setEditCustomer(viewCustomer); setViewCustomer(null) }} />}
      {editCustomer && <EditCustomerModal customer={editCustomer} onClose={() => setEditCustomer(null)} onSave={handleSaveEdit} />}
    </AdminLayout>
  )
}