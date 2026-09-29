import { Mail } from 'lucide-react'
import Modal from '../../Modal.jsx'

export default function CustomerDetailsModal({ customer, onClose, onEdit }) {
  if (!customer) return null

  return (
    <Modal
      title="Customer Details"
      onClose={onClose}
      size="md"
      headerVariant="white"
      actions={(
        <>
          <button className="btn btn-outline" onClick={onEdit}>Edit Customer Profile</button>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </>
      )}
    >
      <div className="flex-between mb-16">
        <div className="cell-avatar">
          <span className="avatar-chip round" style={{ width: 46, height: 46, fontSize: 15 }}>{customer.initials}</span>
          <div>
            <div className="cell-primary" style={{ fontSize: 16 }}>{customer.name}</div>
            <div className="cell-sub">{customer.company}</div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm"><Mail size={13} /> Contact</button>
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '1.3fr 1fr', marginBottom: 16 }}>
        <div style={{ background: '#F6F8FA', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
          <div className="section-sub mb-16" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Contact Information</div>
          <div className="cell-sub" style={{ marginBottom: 6 }}>Email Address</div>
          <div className="cell-primary" style={{ fontSize: 13, marginBottom: 10 }}>{customer.email}</div>
          <div className="cell-sub" style={{ marginBottom: 6 }}>Phone Number</div>
          <div className="cell-primary" style={{ fontSize: 13 }}>{customer.phone}</div>
        </div>
        <div>
          <div className="stat-card" style={{ marginBottom: 10 }}>
            <div className="section-sub">Total Orders</div>
            <div className="cell-primary" style={{ fontSize: 18 }}>{customer.orders}</div>
          </div>
          <div className="stat-card">
            <div className="section-sub">Total Spend</div>
            <div className="cell-primary" style={{ fontSize: 18, color: 'var(--color-primary)' }}>{customer.spend}</div>
          </div>
        </div>
      </div>

      <div className="section-sub mb-16" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Recent Orders</div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Project Name</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(customer.recent_orders || []).map((order) => (
              <tr key={order.transaction_id}>
                <td className="cell-primary" style={{ color: 'var(--color-primary)' }}>#{order.transaction_id}</td>
                <td>{order.product_name}</td>
                <td className="text-secondary">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</td>
                <td>{order.status}</td>
              </tr>
            ))}
            {!customer.recent_orders?.length && <tr><td colSpan={4} className="text-secondary" style={{ textAlign: 'center', padding: 16 }}>No orders recorded.</td></tr>}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}
