import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import Modal from '../../Modal.jsx'

export default function SessionSecurityModal({ value, onClose, onSave }) {
  const [autoLogout, setAutoLogout] = useState(true)
  const [timeout, setTimeoutValue] = useState('30 minutes')
  const [maxAttempts, setMaxAttempts] = useState(5)
  const [lockoutDuration, setLockoutDuration] = useState('15 minutes')

  useEffect(() => {
    if (value) {
      setAutoLogout(value.autoLogout ?? true)
      setTimeoutValue(value.timeout ?? '30 minutes')
      setMaxAttempts(value.maxAttempts ?? 5)
      setLockoutDuration(value.lockoutDuration ?? '15 minutes')
    }
  }, [value])

  const handleSave = () => {
    onSave({ autoLogout, timeout, maxAttempts, lockoutDuration })
  }

  return (
    <Modal
      title="Session Security Settings"
      subtitle="Configure session timeout and lockout policies"
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </>
      )}
    >
      <div className="field">
        <label>Automatic Logout</label>
        <div style={{ marginTop: 8 }}>
          <button className={`btn ${autoLogout ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAutoLogout((v) => !v)}>{autoLogout ? 'On' : 'Off'}</button>
        </div>
      </div>

      <div className="field">
        <label>Session Timeout</label>
        <select className="input" value={timeout} onChange={(e) => setTimeoutValue(e.target.value)}>
          <option>15 minutes</option>
          <option>30 minutes</option>
          <option>60 minutes</option>
          <option>120 minutes</option>
        </select>
      </div>

      <div className="field">
        <label>Maximum Login Attempts</label>
        <input type="number" className="input" min={1} value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} />
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Lockout Duration</label>
        <select className="input" value={lockoutDuration} onChange={(e) => setLockoutDuration(e.target.value)}>
          <option>5 minutes</option>
          <option>15 minutes</option>
          <option>30 minutes</option>
        </select>
      </div>
    </Modal>
  )
}
