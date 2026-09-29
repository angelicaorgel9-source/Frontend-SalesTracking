import { useEffect, useState } from 'react'
import { Search, X, AlertTriangle } from 'lucide-react'
import { api } from '../../../utils/api.js'

const statusBadge = {
  Queued: 'badge-neutral',
  'In Progress': 'badge-warning',
  Review: 'badge-info',
  Completed: 'badge-success',
}

const tabs = ['All Status', 'Queued', 'In Progress']

export default function FullQueueModal({ onClose, onViewOrder }) {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('All Status')
  const [page, setPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    api.getOrders().then((records) => setOrders(records.map((order) => ({
      id: order.transaction_id,
      customer: order.customer_name,
      details: (order.items || []).map((item) => item.product_name).join(', '),
      status: { PLACED: 'Queued', DESIGNING: 'In Progress', PRINTING: 'In Progress', READY: 'Review', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }[order.status] || order.status,
      priority: order.status === 'DESIGNING' || order.status === 'PRINTING' ? 'urgent' : 'up',
    })))).catch(() => setOrders([]))
  }, [])

  const filtered = orders.filter((o) => {
    const tabMatch = tab === 'All Status' || o.status === tab
    const searchMatch = !search
      || o.id.toLowerCase().includes(search.toLowerCase())
      || o.customer.toLowerCase().includes(search.toLowerCase())
    return tabMatch && searchMatch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Full Production Queue</h3>
            <p>All active items in the production workshop</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div className="input-icon-wrap" style={{ flex: 1, minWidth: 200 }}>
              <Search />
              <input
                className="input"
                placeholder="Search Order ID or Customer"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <div className="flex-row gap-8">
              {tabs.map((t) => (
                <button
                  key={t}
                  className={`chip-filter${tab === t ? ' active' : ''}`}
                  onClick={() => { setTab(t); setPage(1) }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer / Details</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((o) => (
                  <tr key={o.id} className="row-clickable" onClick={() => onViewOrder && onViewOrder(o)}>
                    <td className="cell-primary" style={{ color: 'var(--color-primary)' }}>{o.id}</td>
                    <td>
                      <div className="cell-primary">{o.customer}</div>
                      <div className="cell-sub">{o.details}</div>
                    </td>
                    <td><span className={`badge ${statusBadge[o.status] || 'badge-neutral'}`}>{o.status}</span></td>
                    <td>{o.priority === 'urgent' && <AlertTriangle size={14} color="var(--color-danger)" />}{o.priority === 'up' && <span style={{ color: 'var(--color-primary)' }}>▲</span>}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); onViewOrder && onViewOrder(o) }}>View</button>
                    </td>
                  </tr>
                ))}
                {pageItems.length === 0 && (
                  <tr><td colSpan={5} className="text-secondary" style={{ textAlign: 'center', padding: 20 }}>No matching jobs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex-between" style={{ marginTop: 12 }}>
            <span className="section-sub">Showing {pageItems.length ? (page - 1) * pageSize + 1 : 0}-{(page - 1) * pageSize + pageItems.length} of {filtered.length} jobs</span>
            <div className="flex-row gap-8">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
              <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
