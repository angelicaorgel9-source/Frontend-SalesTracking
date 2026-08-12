import Modal from '../../Modal.jsx'

const statusBadge = {
  warning: 'badge-warning',
  danger: 'badge-danger',
  success: 'badge-success',
  neutral: 'badge-neutral',
}

export default function ViewOrderModal({ order, onClose }) {
  if (!order) return null

  return (
    <Modal
      title={`#${order.id}`}
      onClose={onClose}
      headerVariant="white"
      actions={(
        <button className="btn btn-danger-outline" onClick={onClose} style={{ width: '100%' }}>Close</button>
      )}
    >
      <div className="section-sub mb-16" style={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Order Details</div>
      <div className="flex-between" style={{ background: '#F6F8FA', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 18 }}>
        <div>
          <div className="cell-primary">{order.project}</div>
          <div className="cell-sub">Qty: {order.quantity || '—'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="section-sub">Due Date</div>
          <div className="cell-primary" style={{ color: 'var(--color-danger)', fontSize: 12.5 }}>{order.dueDate || order.minutesAgo}</div>
        </div>
      </div>

      <div className="section-sub mb-16" style={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Assigned To</div>
      <div className="cell-avatar mb-16">
        <span className="avatar-chip round">{order.initials}</span>
        <div>
          <div className="cell-primary">{order.customer}</div>
          <div className="cell-sub">{order.email}</div>
        </div>
      </div>

      <div className="section-sub mb-16" style={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Current Status</div>
      <span className={`badge ${statusBadge[order.statusType] || 'badge-neutral'}`}>{order.status}</span>
    </Modal>
  )
}
