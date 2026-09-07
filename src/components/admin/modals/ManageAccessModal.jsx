import { useState } from 'react'
import { Package, ShoppingCart, Eye, Settings as SettingsIcon, Save } from 'lucide-react'
import Modal from '../../Modal.jsx'
import ConfirmPasswordModal from './ConfirmPasswordModal.jsx'

const defaultAccess = [
  { key: 'inventory', label: 'Inventory Access', desc: 'View and update stock levels for printing materials.', icon: Package, checked: true },
  { key: 'orders', label: 'Order Management', desc: 'Process incoming print orders and update status.', icon: ShoppingCart, checked: true },
  { key: 'payroll', label: 'Payroll Access', desc: 'Manage employee compensation and billing records.', icon: Eye, checked: false },
  { key: 'system', label: 'System Settings', desc: 'Configure global print shop settings and integrations.', icon: SettingsIcon, checked: false },
]

export default function ManageAccessModal({ user, onClose, onSave }) {
  const [access, setAccess] = useState(defaultAccess)
  const [showConfirm, setShowConfirm] = useState(false)

  const toggle = (key) => {
    setAccess((prev) => prev.map((a) => (a.key === key ? { ...a, checked: !a.checked } : a)))
  }

  return (
    <>
      <Modal
      title="Edit User Permission"
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => setShowConfirm(true)}>
            <Save size={15} /> Save Changes
          </button>
        </>
      )}
    >
      <div className="person-strip">
        <span className="avatar-chip round"><SettingsIcon size={14} /></span>
        <div style={{ flex: 1 }}>
          <div className="cell-primary">{user?.name || 'Alex Mercer'}</div>
          <div className="cell-sub">ID: {user?.id || 'EMP-8492'}</div>
        </div>
        <span className="badge badge-neutral">Staff</span>
      </div>

      <div className="section-title mb-16" style={{ fontSize: 13.5, color: 'var(--color-primary)' }}>Access Control</div>

      {access.map((a) => (
        <label key={a.key} className="perm-row">
          <input type="checkbox" checked={a.checked} onChange={() => toggle(a.key)} />
          <div style={{ flex: 1 }}>
            <div className="perm-title">{a.label}</div>
            <div className="perm-desc">{a.desc}</div>
          </div>
          <a.icon size={16} className="perm-row-icon" />
        </label>
      ))}
      </Modal>
      {showConfirm && (
        <ConfirmPasswordModal
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false)
            onSave(access)
          }}
        />
      )}
    </>
  )
}
