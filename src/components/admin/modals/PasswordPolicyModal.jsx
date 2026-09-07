import { useState, useEffect } from 'react'
import { KeyRound } from 'lucide-react'
import Modal from '../../Modal.jsx'

export default function PasswordPolicyModal({ value, onClose, onSave }) {
  const [minLength, setMinLength] = useState(12)
  const [requireUpper, setRequireUpper] = useState(true)
  const [requireNumber, setRequireNumber] = useState(true)
  const [requireSpecial, setRequireSpecial] = useState(true)
  const [expiration, setExpiration] = useState('90 days')

  useEffect(() => {
    if (value) {
      setMinLength(value.minLength ?? 12)
      setRequireUpper(value.requireUpper ?? true)
      setRequireNumber(value.requireNumber ?? true)
      setRequireSpecial(value.requireSpecial ?? true)
      setExpiration(value.expiration ?? '90 days')
    }
  }, [value])

  const handleSave = () => {
    onSave({ minLength, requireUpper, requireNumber, requireSpecial, expiration })
  }

  return (
    <Modal
      title="Password Policy Settings"
      subtitle="Configure global password requirements"
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </>
      )}
    >
      <div className="field">
        <label>Minimum Password Length</label>
        <input type="number" className="input" min={6} value={minLength} onChange={(e) => setMinLength(Number(e.target.value))} />
      </div>

      <div className="field">
        <label>Require Uppercase Letter</label>
        <div style={{ marginTop: 8 }}>
          <button className={`btn ${requireUpper ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRequireUpper((v) => !v)}>{requireUpper ? 'On' : 'Off'}</button>
        </div>
      </div>

      <div className="field">
        <label>Require Number</label>
        <div style={{ marginTop: 8 }}>
          <button className={`btn ${requireNumber ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRequireNumber((v) => !v)}>{requireNumber ? 'On' : 'Off'}</button>
        </div>
      </div>

      <div className="field">
        <label>Require Special Character</label>
        <div style={{ marginTop: 8 }}>
          <button className={`btn ${requireSpecial ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRequireSpecial((v) => !v)}>{requireSpecial ? 'On' : 'Off'}</button>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Password Expiration</label>
        <select className="input" value={expiration} onChange={(e) => setExpiration(e.target.value)}>
          <option>30 days</option>
          <option>60 days</option>
          <option>90 days</option>
          <option>Never</option>
        </select>
      </div>
    </Modal>
  )
}
