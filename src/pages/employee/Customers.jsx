import { useState, useMemo } from 'react'
import { Users, UserPlus2, Package, UserX, Download, Plus, Search, Pencil, Ban, CheckCircle2 } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import ActionMenu from '../../components/ActionMenu.jsx'
import CustomerDetailsModal from '../../components/employee/modals/CustomerDetailsModal.jsx'
import EditCustomerModal from '../../components/employee/modals/EditCustomerModal.jsx'
import NewClientModal from '../../components/employee/modals/NewClientModal.jsx'
import { customerRegistry as seedRegistry } from '../../data/employeeMockData.js'
import { useToast } from '../../context/ToastContext.jsx'
import { downloadCsv } from '../../utils/csv.js'

const tabs = ['All', 'Active', 'Inactive']

export default function Customers() {
  const { showToast } = useToast()
  const [registry, setRegistry] = useState(seedRegistry)
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')

  const [viewCustomer, setViewCustomer] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)
  const [showNewClient, setShowNewClient] = useState(false)

  const totalCustomers = registry.length
  const activeCount = registry.filter((c) => c.status === 'Active').length
  const inactiveCount = registry.filter((c) => c.status === 'Inactive').length
  const avgOrders = (registry.reduce((sum, c) => sum + c.orders, 0) / (registry.length || 1)).toFixed(1)

  const filtered = useMemo(() => registry.filter((c) => {
    const tabMatch = tab === 'All' || c.status === tab
    const q = search.trim().toLowerCase()
    const searchMatch = !q
      || c.name.toLowerCase().includes(q)
      || c.company.toLowerCase().includes(q)
      || c.email.toLowerCase().includes(q)
    return tabMatch && searchMatch
  }), [registry, tab, search])

  const handleSaveEdit = (form) => {
    setRegistry((prev) => prev.map((c) => (c.id === editCustomer.id ? {
      ...c,
      name: form.contact,
      company: form.company,
      email: form.email,
      phone: form.phone,
      status: form.status === 'Inactive' ? 'Inactive' : 'Active',
    } : c)))
    setEditCustomer(null)
    showToast('Customer profile updated', 'success')
  }

  const handleSaveNewClient = (form) => {
    const nextId = Math.max(0, ...registry.map((c) => c.id)) + 1
    const initials = form.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'NC'
    setRegistry((prev) => [{
      id: nextId,
      initials,
      name: form.fullName,
      company: form.address || 'Walk-in Client',
      email: form.email,
      phone: form.contact,
      orders: 0,
      spend: '₱0',
      spendLabel: 'Total Spend',
      lastDate: '—',
      lastNote: 'New client',
      status: 'Active',
    }, ...prev])
    setShowNewClient(false)
    showToast('New client added successfully', 'success')
  }

  const toggleBlock = (customer) => {
    const nextStatus = customer.status === 'Active' ? 'Inactive' : 'Active'
    setRegistry((prev) => prev.map((c) => (c.id === customer.id ? { ...c, status: nextStatus } : c)))
    showToast(nextStatus === 'Inactive' ? `${customer.name} has been blocked` : `${customer.name} has been reactivated`, nextStatus === 'Inactive' ? 'error' : 'success')
  }

  const handleExportCsv = () => {
    downloadCsv({
      filename: 'customers.csv',
      columns: ['Name', 'Company', 'Email', 'Phone', 'Total Orders', 'Total Spend', 'Last Transaction', 'Status'],
      rows: filtered.map((c) => [c.name, c.company, c.email, c.phone, c.orders, c.spend, c.lastDate, c.status]),
    })
    showToast('Customer list exported', 'success')
  }

  return (
    <EmployeeLayout topbarProps={{ title: 'Customer Management' }}>
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Customer Management</h1>
        <div className="flex-row gap-8">
          <button className="btn btn-outline btn-sm" onClick={handleExportCsv}><Download size={14} /> Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewClient(true)}><Plus size={14} /> Add New Customer</button>
        </div>
      </div>

      <div className="stat-grid mb-20" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="clickable" onClick={() => setTab('All')}>
          <StatCard icon={Users} label="Total Customers" value={String(totalCustomers)} sub="↑ +12% from last month" subDirection="up" />
        </div>
        <div className="clickable" onClick={() => setTab('Active')}>
          <StatCard icon={UserPlus2} label="Active This Month" value={String(activeCount)} sub="+6% engagement" subDirection="up" />
        </div>
        <div className="clickable" onClick={() => showToast(`Average ${avgOrders} orders per customer`, 'info')}>
          <StatCard icon={Package} label="Orders Per Customer" value={`Avg. ${avgOrders}`} />
        </div>
        <div className="clickable" onClick={() => setTab('Inactive')}>
          <StatCard icon={UserX} label="Inactive (90d+)" value={String(inactiveCount)} sub="-2%" subDirection="down" />
        </div>
      </div>

      <div className="card">
        <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 10 }}>
          <div className="flex-row gap-8">
            {tabs.map((t) => (
              <button key={t} className={`chip-filter${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="input-icon-wrap" style={{ maxWidth: 280 }}>
            <Search />
            <input
              className="input"
              placeholder="Search customers, companies, or order IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Company</th>
                <th>Total Orders</th>
                <th>Last Order Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="row-clickable" onClick={() => setViewCustomer(c)}>
                  <td>
                    <div className="cell-avatar">
                      <span className="avatar-chip round">{c.initials}</span>
                      <div>
                        <div className="cell-primary">{c.name}</div>
                        <div className="cell-sub">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-secondary">{c.company}</td>
                  <td>
                    <div className="cell-primary">{c.orders}</div>
                    <div className="cell-sub" style={{ color: 'var(--color-primary)' }}>{c.spend}</div>
                  </td>
                  <td className="text-secondary">{c.lastDate}</td>
                  <td>
                    <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{c.status}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex-row gap-8">
                      <button className="btn btn-outline btn-sm" onClick={() => setEditCustomer(c)}><Pencil size={13} /> Edit</button>
                      <ActionMenu
                        items={[
                          { label: 'View Details', icon: Users, onClick: () => setViewCustomer(c) },
                          c.status === 'Active'
                            ? { label: 'Block Customer', icon: Ban, danger: true, onClick: () => toggleBlock(c) }
                            : { label: 'Unblock Customer', icon: CheckCircle2, onClick: () => toggleBlock(c) },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-secondary" style={{ textAlign: 'center', padding: 24 }}>No customers match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-pad flex-between">
          <span className="section-sub">Showing 1-{filtered.length} of {filtered.length} customers</span>
          <div className="pagination">
            <button className="page-nav">Previous</button>
            <button className="page-num active">1</button>
            <button className="page-nav">Next</button>
          </div>
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

      {showNewClient && (
        <NewClientModal onClose={() => setShowNewClient(false)} onSave={handleSaveNewClient} />
      )}
    </EmployeeLayout>
  )
}
