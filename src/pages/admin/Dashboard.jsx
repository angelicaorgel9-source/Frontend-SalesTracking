import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, UserPlus, Upload, Plus, Filter, Download } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import { customerDirectory, customerGrowthTrend } from '../../data/adminMockData.js'
import NewClientModal from '../../components/admin/modals/NewClientModal.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import CustomerDetailsModal from '../../components/admin/modals/CustomerDetailsModal.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const statusBadge = {
  Active: 'badge-success',
  Printing: 'badge-danger',
  Pending: 'badge-warning',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const maxVal = Math.max(...customerGrowthTrend.map((d) => d.value))

  const [showNewClient, setShowNewClient] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [importing, setImporting] = useState(false)
  const [viewCustomer, setViewCustomer] = useState(null)

  const handleSaveClient = () => {
    setShowNewClient(false)
    showToast('New client added successfully', 'success')
  }

  const handleConfirmImport = () => {
    setImporting(true)
    setTimeout(() => {
      setImporting(false)
      setShowBulkImport(false)
      const success = Math.random() > 0.2
      showToast(
        success ? 'Client import completed successfully' : 'Client import failed. Please check your file and try again.',
        success ? 'success' : 'error',
      )
    }, 900)
  }

  return (
    <AdminLayout
      topbarProps={{
        searchPlaceholder: 'Search customer database...',
        rightSlot: (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setShowBulkImport(true)}>
              <Upload /> Bulk Import
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNewClient(true)}>
              <Plus /> New Client
            </button>
          </>
        ),
      }}
    >
      <h1 className="page-title">Customer Database</h1>

      <div className="three-col mb-20">
        <div className="card card-pad clickable" onClick={() => navigate('/customers')}>
          <div className="flex-between mb-16">
            <div>
              <div className="section-title">Customer Growth</div>
              <div className="section-sub">New acquisitions vs returning</div>
            </div>
            <span className="chip-filter active">
              Last 30 Days
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }}>
            {customerGrowthTrend.map((d, i) => (
              <div
                key={d.label}
                title={`${d.label}: ${d.value}`}
                style={{
                  flex: 1,
                  height: `${(d.value / maxVal) * 100}%`,
                  borderRadius: 6,
                  background: i === 3 ? 'var(--color-primary)' : 'var(--color-secondary)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/analytics')}>
          <div className="stat-card-top">
            <span className="stat-card-label">Average LTV</span>
            <span className="stat-icon"><TrendingUp /></span>
          </div>
          <div className="stat-card-value">₱4,280</div>
          <div className="stat-card-sub up">↑ 12.5% increase</div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/customers')}>
          <div className="stat-card-top">
            <span className="stat-card-label">Active Clients</span>
            <span className="stat-icon"><UserPlus /></span>
          </div>
          <div className="stat-card-value">1,842</div>
          <div className="stat-card-sub up">↑ 42 this month</div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="section-title">Directory</span>
          <div className="flex-row gap-8">
            <button className="icon-btn" onClick={() => showToast('Filters panel coming soon', 'info')}><Filter /></button>
            <button
              className="icon-btn"
              onClick={() => {
                showToast('Directory exported', 'success')
              }}
            >
              <Download />
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Status</th>
                <th>Contact Person</th>
                <th>Lifetime Value</th>
                <th>Last Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customerDirectory.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="cell-avatar">
                      <span className="avatar-chip">{c.initials}</span>
                      <div>
                        <div className="cell-primary">{c.company}</div>
                        <div className="cell-sub">{c.type}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${statusBadge[c.status] || 'badge-neutral'}`}>{c.status}</span>
                  </td>
                  <td>{c.contact}</td>
                  <td className="cell-primary">{c.ltv}</td>
                  <td className="text-secondary">{c.lastOrder}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setViewCustomer(c)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-pad flex-between">
          <span className="section-sub">Showing 4 of 1,842 customers</span>
          <div className="pagination">
            <button className="page-nav">Previous</button>
            <button className="page-num active">1</button>
            <button className="page-num">2</button>
            <button className="page-num">3</button>
            <button className="page-nav">Next</button>
          </div>
        </div>
      </div>

      {showNewClient && (
        <NewClientModal onClose={() => setShowNewClient(false)} onSave={handleSaveClient} />
      )}

      {showBulkImport && (
        <ConfirmModal
          title="Import All New Clients?"
          onCancel={() => setShowBulkImport(false)}
          onConfirm={handleConfirmImport}
          busy={importing}
        />
      )}

      {viewCustomer && (
        <CustomerDetailsModal
          customer={{
            id: viewCustomer.id,
            initials: viewCustomer.initials,
            name: viewCustomer.contact,
            company: viewCustomer.company,
            email: `${viewCustomer.contact.toLowerCase().replace(/\s+/g, '.')}@${viewCustomer.company.toLowerCase().replace(/\s+/g, '')}.com`,
            phone: '+63 912 345 6789',
            orders: Math.floor(Math.random() * 60) + 5,
            spend: viewCustomer.ltv,
            lastDate: viewCustomer.lastOrder,
            lastNote: 'Recent print order',
          }}
          onClose={() => setViewCustomer(null)}
          onEdit={() => setViewCustomer(null)}
        />
      )}
    </AdminLayout>
  )
}
