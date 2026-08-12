import { useState } from 'react'
import Modal from '../../Modal.jsx'

const statusStages = [
  { key: 'Preparing', dot: 'var(--color-warning)' },
  { key: 'In Production', dot: 'var(--color-info)' },
  { key: 'Completed', dot: 'var(--color-success)' },
]

function defaultStage(order) {
  if (order?.statusType === 'success') return 'Completed'
  if (order?.statusType === 'danger') return 'In Production'
  return 'Preparing'
}

export default function EditOrderStatusModal({ order, onClose, onSave }) {
  const [newStatus, setNewStatus] = useState(defaultStage(order))
  const [note, setNote] = useState('')

  if (!order) return null

  const currentStage = defaultStage(order)

  const handleSave = () => {
    onSave({ ...order, stage: newStatus, note })
  }

  return (
    <Modal
      title="Edit Order Status"
      subtitle={`Order #${order.id} • ${order.customer}`}
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </>
      )}
    >
      <div className="section-sub mb-16" style={{ fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Order Details</div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr 1fr', background: '#F6F8FA', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 18 }}>
        <div>
          <div className="section-sub">Item</div>
          <div className="cell-primary" style={{ fontSize: 13 }}>{order.project}</div>
        </div>
        <div>
          <div className="section-sub">Quantity</div>
          <div className="cell-primary" style={{ fontSize: 13 }}>{order.quantity || '—'}</div>
        </div>
        <div>
          <div className="section-sub">Due Date</div>
          <div className="cell-primary" style={{ fontSize: 13 }}>{order.dueDate || order.minutesAgo || '—'}</div>
        </div>
      </div>

      <div className="field">
        <label>Current Status:</label>
        <div>
          <span className="badge badge-warning" style={{ marginTop: 4, display: 'inline-flex' }}>{currentStage}</span>
        </div>
      </div>

      <div className="field">
        <label>New Status</label>
        <div className="three-col" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {statusStages.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setNewStatus(s.key)}
              className="card"
              style={{
                padding: '10px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                borderColor: newStatus === s.key ? 'var(--color-primary)' : 'var(--color-border)',
                background: newStatus === s.key ? 'var(--color-secondary)' : '#fff',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
              {s.key}
            </button>
          ))}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Internal Note (Optional)</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Add any relevant notes regarding this status change..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>
    </Modal>
  )
}
