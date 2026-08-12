import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Modal from '../../Modal.jsx'
import { useToast } from '../../../context/ToastContext.jsx'
import { customerPassword } from '../../../data/customerMockData.js'

export default function ChangePasswordModal({ onClose }) {
  const { showToast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSave = () => {
    const nextErrors = {}
    if (!currentPassword) nextErrors.currentPassword = 'Enter current password.'
    if (!newPassword) nextErrors.newPassword = 'Enter a new password.'
    if (!confirmPassword) nextErrors.confirmPassword = 'Confirm new password.'
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'New passwords do not match.'
    }
    if (newPassword && newPassword.length < 6) {
      nextErrors.newPassword = 'Password must be at least 6 characters.'
    }
    if (currentPassword && currentPassword !== customerPassword) {
      nextErrors.currentPassword = 'Current password is incorrect.'
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    showToast('Password successfully updated.', 'success')
    onClose()
  }

  return (
    <Modal
      title="Change Password"
      subtitle="Update the password for your account"
      onClose={onClose}
      headerVariant="white"
      actions={(
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </>
      )}
    >
      <div className="field">
        <label>Current Password</label>
        <div className="input-icon-wrap">
          <input
            type={showCurrent ? 'text' : 'password'}
            className="input"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Enter current password"
          />
          <span className="toggle-visibility" onClick={() => setShowCurrent((v) => !v)}>
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </span>
        </div>
        {errors.currentPassword && <div className="section-sub" style={{ color: 'var(--color-danger)', marginTop: 6 }}>{errors.currentPassword}</div>}
      </div>

      <div className="field">
        <label>New Password</label>
        <div className="input-icon-wrap">
          <input
            type={showNew ? 'text' : 'password'}
            className="input"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter new password"
          />
          <span className="toggle-visibility" onClick={() => setShowNew((v) => !v)}>
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </span>
        </div>
        {errors.newPassword && <div className="section-sub" style={{ color: 'var(--color-danger)', marginTop: 6 }}>{errors.newPassword}</div>}
      </div>

      <div className="field">
        <label>Confirm New Password</label>
        <div className="input-icon-wrap">
          <input
            type={showConfirm ? 'text' : 'password'}
            className="input"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
          />
          <span className="toggle-visibility" onClick={() => setShowConfirm((v) => !v)}>
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </span>
        </div>
        {errors.confirmPassword && <div className="section-sub" style={{ color: 'var(--color-danger)', marginTop: 6 }}>{errors.confirmPassword}</div>}
      </div>
    </Modal>
  )
}
