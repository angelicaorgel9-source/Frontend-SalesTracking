import { useState } from 'react'
import { Lock } from 'lucide-react'
import Modal from '../../Modal.jsx'
import { adminPassword } from '../../../data/adminMockData.js'

export default function ConfirmPasswordModal({ onClose, onConfirm }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (password === adminPassword) {
      onConfirm()
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <Modal
      title="Confirm Admin Password"
      subtitle="Please enter your admin password to confirm this action"
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm}>Confirm</button>
        </>
      )}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="stat-icon"><Lock /></div>
        <div style={{ flex: 1 }}>
          <div className="field">
            <label>Admin Password</label>
            <input type="password" className="input" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} />
          </div>
          {error && <div style={{ color: 'var(--color-danger)', marginTop: 8 }}>{error}</div>}
        </div>
      </div>
    </Modal>
  )
}
