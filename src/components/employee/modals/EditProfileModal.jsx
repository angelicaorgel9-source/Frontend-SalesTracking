import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import Modal from '../../Modal.jsx'
import { useEmployeeProfile } from '../../../context/EmployeeProfileContext.jsx'
import { useToast } from '../../../context/ToastContext.jsx'
import { api } from '../../../utils/api.js'

export default function EditProfileModal({ onClose }) {
  const { profile, updateProfile } = useEmployeeProfile()
  const { showToast } = useToast()
  const [name, setName] = useState(profile.name)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSave = async () => {
    const nextErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Full name is required.'
    }

    const passwordEntered = currentPassword || newPassword || confirmPassword
    if (passwordEntered) {
      if (!currentPassword) nextErrors.currentPassword = 'Enter current password.'
      if (!newPassword) nextErrors.newPassword = 'Enter a new password.'
      if (!confirmPassword) nextErrors.confirmPassword = 'Confirm new password.'
      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        nextErrors.confirmPassword = 'New passwords do not match.'
      }
      if (newPassword && newPassword.length < 6) {
        nextErrors.newPassword = 'Password must be at least 6 characters.'
      }
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    try {
      const savedProfile = await api.updateMyProfile({ name: name.trim() })
      updateProfile({ name: savedProfile.name, email: savedProfile.email })
      if (passwordEntered) await api.changePassword(currentPassword, newPassword)
      setErrors({})
      showToast(passwordEntered ? 'Profile and password successfully updated.' : 'Profile updated successfully.', 'success')
      onClose()
    } catch (error) {
      setErrors((previous) => ({ ...previous, currentPassword: error.message }))
    }
  }

  return (
    <Modal
      title="Edit Profile"
      subtitle="Update your profile information"
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
        <label>Full Name</label>
        <input
          className="input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter full name"
        />
        {errors.name && <div className="section-sub" style={{ color: 'var(--color-danger)', marginTop: 6 }}>{errors.name}</div>}
      </div>

      <div className="field" style={{ marginTop: 6 }}>
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

      <div className="field" style={{ marginTop: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={14} /> Email Address
        </label>
        <input className="input" value={profile.email} disabled />
        <div className="section-sub" style={{ marginTop: 6 }}>Email address cannot be changed.</div>
      </div>

      <div className="field">
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={14} /> Role
        </label>
        <input className="input" value={profile.role} disabled />
        <div className="section-sub" style={{ marginTop: 6 }}>Role is managed by an administrator.</div>
      </div>
    </Modal>
  )
}
