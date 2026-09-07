import { useState } from 'react'
import Modal from '../../Modal.jsx'

export default function SelectUserModal({ users, onClose, onSelect }) {
  const [selected, setSelected] = useState(users && users.length ? users[0].key : '')

  return (
    <Modal
      title="Select User"
      subtitle="Choose an employee to manage permissions"
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSelect(users.find((u) => u.key === selected))}>Select</button>
        </>
      )}
    >
      <div className="field">
        <label>User</label>
        <select className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {users.map((u) => (
            <option key={u.key} value={u.key}>{u.name} — {u.key}</option>
          ))}
        </select>
      </div>
    </Modal>
  )
}
