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
          {onEdit && <button className="btn btn-outline" onClick={onEdit}>Edit Customer Profile</button>}
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
        <a className="btn btn-primary btn-sm" href={`mailto:${customer.email}`}><Mail size={13} /> Contact</a>
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

      <div className="section-sub">{customer.orders ? `${customer.orders} recorded orders · latest ${customer.lastDate}` : 'No orders recorded.'}</div>
    </Modal>
  )
}
