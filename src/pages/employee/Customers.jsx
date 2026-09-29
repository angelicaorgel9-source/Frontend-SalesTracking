import { useState, useMemo, useEffect } from 'react'
import { Users, UserPlus2, Package, UserX, Download, Search } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import ActionMenu from '../../components/ActionMenu.jsx'
import CustomerDetailsModal from '../../components/employee/modals/CustomerDetailsModal.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { downloadCsv } from '../../utils/csv.js'
import { api } from '../../utils/api.js'

const tabs = ['All', 'Active', 'Inactive']

export default function Customers() {
  const { showToast } = useToast()
  const [registry, setRegistry] = useState([])
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')

  const [viewCustomer, setViewCustomer] = useState(null)

  useEffect(() => {
    let isActive = true
    const refreshCustomers = async () => {
      try {
        const data = await api.getEmployeeCustomers()
        if (!isActive) return
        const refreshed = (data || []).map((customer) => ({
          ...customer,
          initials: (customer.name || 'NC').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
          company: customer.company || 'Walk-in Client',
          orders: Number(customer.orders || 0),
          spend: customer.spend || '₱0.00',
          lastDate: customer.lastDate || '—',
          status: customer.status === 'Inactive' ? 'Inactive' : 'Active',
        }))
        setRegistry(refreshed)
      } catch {
        // Keep the last successful result visible if the API is temporarily unavailable.
      }
    }

    refreshCustomers()
    const refreshInterval = window.setInterval(refreshCustomers, 15000)
    return () => {
      isActive = false
      window.clearInterval(refreshInterval)
    }
  }, [])

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
        </div>
      </div>

      <div className="stat-grid mb-20" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="clickable" onClick={() => setTab('All')}>
          <StatCard icon={Users} label="Total Customers" value={String(totalCustomers)} />
        </div>
        <div className="clickable" onClick={() => setTab('Active')}>
          <StatCard icon={UserPlus2} label="Active Accounts" value={String(activeCount)} />
        </div>
        <div className="clickable" onClick={() => showToast(`Average ${avgOrders} orders per customer`, 'info')}>
          <StatCard icon={Package} label="Orders Per Customer" value={`Avg. ${avgOrders}`} />
        </div>
        <div className="clickable" onClick={() => setTab('Inactive')}>
          <StatCard icon={UserX} label="Inactive Accounts" value={String(inactiveCount)} />
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
                <th>Email</th>
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
                  <td className="text-secondary">{c.email}</td>
                  <td>
                    <div className="cell-primary">{c.orders}</div>
                    <div className="cell-sub" style={{ color: 'var(--color-primary)' }}>{c.spend}</div>
                  </td>
                  <td className="text-secondary">{c.lastDate}</td>
                  <td>
                    <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{c.status}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex-row gap-8 row-actions-cell">
                      <ActionMenu items={[{ label: 'View Details', icon: Users, onClick: () => setViewCustomer(c) }]} />
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

    </EmployeeLayout>
  )
}
