import { useState } from 'react'
import { Lock } from 'lucide-react'
import Modal from '../../Modal.jsx'
import { api } from '../../../utils/api.js'

export default function ConfirmPasswordModal({ onClose, onConfirm }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await api.verifyPassword(password)
      onConfirm()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
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
          <button className="btn btn-primary" onClick={handleConfirm} disabled={saving}>Confirm</button>
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
