import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, UserPlus, Plus, Download, Users, Pencil } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import NewClientModal from '../../components/admin/modals/NewClientModal.jsx'
import CustomerDetailsModal from '../../components/admin/modals/CustomerDetailsModal.jsx'
import EditCustomerModal from '../../components/admin/modals/EditCustomerModal.jsx'
import CredentialsModal from '../../components/CredentialsModal.jsx'
import ActionMenu from '../../components/ActionMenu.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { downloadCsv } from '../../utils/csv.js'
import { api } from '../../utils/api.js'

const money = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : 'No orders yet'

function mapCustomer(customer) {
  return {
    ...customer,
    initials: (customer.name || customer.username || 'C').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    contact: customer.name || customer.username,
    company: 'Customer account',
    orders: Number(customer.orders || 0),
    ltv: money(customer.spend),
    spend: money(customer.spend),
    status: customer.is_active ? 'Active' : 'Inactive',
    lastOrder: formatDate(customer.last_order),
    lastDate: formatDate(customer.last_order),
    lastNote: customer.orders ? `${customer.orders} recorded order(s)` : 'No orders yet',
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [customers, setCustomers] = useState([])
  const [showNewClient, setShowNewClient] = useState(false)
  const [credentials, setCredentials] = useState(null)
  const [viewCustomer, setViewCustomer] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)

  const refreshCustomers = async () => {
    const records = await api.getAdminCustomers()
    setCustomers(records.map(mapCustomer))
  }

  useEffect(() => {
    refreshCustomers().catch((error) => showToast(error.message, 'error'))
  }, [showToast])

  const totalSpend = customers.reduce((sum, customer) => sum + Number(customer.spend || 0), 0)
  const averageSpend = customers.length ? totalSpend / customers.length : 0
  const activeCount = customers.filter((customer) => customer.is_active).length
  const growth = Array.from({ length: 4 }, (_, index) => {
    const end = new Date()
    end.setDate(end.getDate() - (3 - index) * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    return {
      label: start.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: customers.filter((customer) => {
        const created = new Date(customer.created_at)
        return created >= start && created <= end
      }).length,
    }
  })
  const maxGrowth = Math.max(1, ...growth.map((item) => item.value))

  const handleSaveClient = async (form) => {
    const username = `customer-${crypto.randomUUID().slice(0, 10)}`
    const password = crypto.randomUUID()
    try {
      await api.createAdminCustomer({
        username,
        password,
        email: form.email.trim(),
        name: form.fullName.trim(),
        phone: form.contact.trim(),
      })
      await refreshCustomers()
      setShowNewClient(false)
      setCredentials({ username, password, title: 'Customer Account Credentials', description: 'Share these credentials with the customer through your verified contact channel.' })
      showToast('Customer account created', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleSaveEdit = async (form) => {
    try {
      const saved = await api.updateAdminCustomer(editCustomer.id, {
        name: form.contact,
        email: form.email,
        phone: form.phone,
        is_active: form.status !== 'Inactive',
      })
      setCustomers((previous) => previous.map((customer) => customer.id === saved.id ? mapCustomer({ ...customer, ...saved }) : customer))
      setEditCustomer(null)
      showToast('Customer profile updated', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <AdminLayout topbarProps={{
      searchPlaceholder: 'Search customer database...',
      rightSlot: <button className="btn btn-primary btn-sm" onClick={() => setShowNewClient(true)}><Plus /> New Customer</button>,
    }}>
      <h1 className="page-title">Customer Database</h1>

      <div className="three-col admin-dashboard-stats mb-20">
        <div className="card card-pad clickable admin-stat-growth" onClick={() => navigate('/customers')}>
          <div className="flex-between mb-16"><div><div className="section-title">New Customers</div><div className="section-sub">Registrations over the last four weeks</div></div></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }}>
            {growth.map((item) => <div key={item.label} title={`${item.label}: ${item.value}`} style={{ flex: 1, height: `${(item.value / maxGrowth) * 100}%`, minHeight: 2, borderRadius: 4, background: 'var(--color-primary)' }} />)}
          </div>
          <div className="section-sub" style={{ marginTop: 8 }}>{growth.map((item) => item.label).join(' · ')}</div>
        </div>

        <div className="stat-card admin-stat-fixed clickable" onClick={() => navigate('/analytics')}>
          <div className="stat-card-top"><span className="stat-card-label">Average Customer Spend</span><span className="stat-icon"><TrendingUp /></span></div>
          <div className="stat-card-value">{money(averageSpend)}</div>
          <div className="stat-card-sub">Based on recorded orders</div>
        </div>

        <div className="stat-card admin-stat-fixed clickable" onClick={() => navigate('/customers')}>
          <div className="stat-card-top"><span className="stat-card-label">Active Customers</span><span className="stat-icon"><UserPlus /></span></div>
          <div className="stat-card-value">{activeCount}</div>
          <div className="stat-card-sub">Of {customers.length} registered accounts</div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="section-title">Customer Directory</span>
          <button className="icon-btn" title="Export customers" onClick={() => downloadCsv({ filename: 'customers.csv', columns: ['Name', 'Email', 'Phone', 'Orders', 'Spend', 'Status'], rows: customers.map((customer) => [customer.name, customer.email, customer.phone, customer.orders, customer.spend, customer.status]) })}><Download /></button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Status</th><th>Contact</th><th>Lifetime Spend</th><th>Last Order</th><th>Actions</th></tr></thead>
            <tbody>
              {customers.map((customer) => <tr key={customer.id}>
                <td><div className="cell-avatar"><span className="avatar-chip">{customer.initials}</span><div><div className="cell-primary">{customer.name || customer.username}</div><div className="cell-sub">{customer.username}</div></div></div></td>
                <td><span className={`badge ${customer.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{customer.status}</span></td>
                <td><div>{customer.email}</div><div className="cell-sub">{customer.phone}</div></td>
                <td className="cell-primary">{customer.ltv}</td>
                <td className="text-secondary">{customer.lastOrder}</td>
                <td><ActionMenu items={[{ label: 'View Details', icon: Users, onClick: () => setViewCustomer(customer) }, { label: 'Edit Customer', icon: Pencil, onClick: () => setEditCustomer(customer) }]} /></td>
              </tr>)}
              {!customers.length && <tr><td colSpan={6} className="text-secondary" style={{ textAlign: 'center', padding: 24 }}>No customer accounts yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card-pad"><span className="section-sub">{customers.length} registered customer{customers.length === 1 ? '' : 's'}</span></div>
      </div>

      {showNewClient && <NewClientModal onClose={() => setShowNewClient(false)} onSave={handleSaveClient} />}
      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} onSave={() => setCredentials(null)} />
      {viewCustomer && <CustomerDetailsModal customer={viewCustomer} onClose={() => setViewCustomer(null)} onEdit={() => { setEditCustomer(viewCustomer); setViewCustomer(null) }} />}
      {editCustomer && <EditCustomerModal customer={editCustomer} onClose={() => setEditCustomer(null)} onSave={handleSaveEdit} />}
    </AdminLayout>
  )
}