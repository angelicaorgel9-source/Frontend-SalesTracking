import { useState } from 'react'
import { User, Save } from 'lucide-react'
import Modal from '../../Modal.jsx'

export default function ChangeStatusModal({ user, onClose, onSave }) {
  const [status, setStatus] = useState(user?.status || 'ACTIVE')
  const [reason, setReason] = useState('')

  return (
    <Modal
      title="Update Employee Status"
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave({ status, reason })}>
            <Save size={15} /> Save Status
          </button>
        </>
      )}
    >
      <div className="person-strip">
        <span className="avatar-chip round"><User size={14} /></span>
        <div>
          <div className="cell-primary">{user?.name || 'Jane Doe'}</div>
          <div className="cell-sub">{user?.role || 'Senior Print Technician'}</div>
        </div>
      </div>

      <div className="field">
        <label>Current Status</label>
        <div className="flex-row gap-8" style={{ fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: user?.status === 'ACTIVE' || !user?.status ? 'var(--color-warning)' : 'var(--color-danger)', display: 'inline-block' }} />
          {user?.status || 'Active'}
        </div>
      </div>

      <div className="field">
        <label>New Status</label>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ACTIVE">Active</option>
          <option value="ON LEAVE">On Leave</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="RESIGNED">Resigned</option>
        </select>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Reason / Note (Optional)</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Enter reason for status change..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>
    </Modal>
  )
}
