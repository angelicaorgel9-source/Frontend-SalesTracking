import { useState } from 'react'
import { User } from 'lucide-react'
import Modal from '../../Modal.jsx'

const positions = ['Pre-press Technician', 'Senior Print Technician', 'Editor', 'Admin', 'Employee', 'Production Lead']

export default function ChangePositionModal({ user, onClose, onSave }) {
  const [newPosition, setNewPosition] = useState('')

  return (
    <Modal
      title="Change Position"
      onClose={onClose}
      headerVariant="white"
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!newPosition} onClick={() => onSave(newPosition)}>Update Position</button>
        </>
      )}
    >
      <div className="person-strip">
        <span className="avatar-chip round"><User size={14} /></span>
        <div>
          <div className="cell-primary">{user?.name || 'John Doe'}</div>
          <div className="cell-sub">ID: {user?.code || 'EMP-8492'}</div>
        </div>
      </div>

      <div className="field">
        <label>Current Position</label>
        <input className="input" value={user?.role || 'Employee'} disabled style={{ background: '#F6F8FA' }} />
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>New Position</label>
        <select className="input" value={newPosition} onChange={(e) => setNewPosition(e.target.value)}>
          <option value="">Select new position...</option>
          {positions.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
    </Modal>
  )
}
