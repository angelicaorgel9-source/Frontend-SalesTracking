import { LogOut } from 'lucide-react'
import Modal from '../../Modal.jsx'

export default function LogOutModal({ onClose, onConfirm }) {
  return (
    <Modal
      title={(
        <span className="flex-row gap-10">
          <span style={{
            width: 34, height: 34, borderRadius: 9, background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
          >
            <LogOut size={16} />
          </span>
          Log Out
        </span>
      )}
      subtitle="MJ Prints Admin Portal"
      onClose={onClose}
      headerVariant="white"
      actions={(
        <>
          <button className="btn btn-primary" onClick={onClose}>Cancel</button>
          <button
            className="btn"
            onClick={onConfirm}
            style={{ background: 'var(--color-danger)', color: '#fff' }}
          >
            Log Out
          </button>
        </>
      )}
    >
      <p className="text-secondary" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
        Are you sure you want to log out of your account? Any unsaved changes to active purchase orders or customer records may be lost.
      </p>
    </Modal>
  )
}
