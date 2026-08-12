import { X, Copy, Info, Save } from 'lucide-react'

export default function CredentialsModal({ credentials, onClose, onSave }) {
  if (!credentials) return null

  const copy = (text) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Employee Account Credentials</h3>
            <p>The employee account has been generated successfully. Please copy and save the credentials before closing this window.</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="credential-box">
            <div className="credential-label">Username</div>
            <div className="credential-row">
              {credentials.username}
              <Copy onClick={() => copy(credentials.username)} />
            </div>
            <div className="credential-label" style={{ marginTop: 12 }}>Password</div>
            <div className="credential-row">
              {credentials.password}
              <Copy onClick={() => copy(credentials.password)} />
            </div>
          </div>

          <div className="info-note">
            <Info />
            This Credentials are generated automatically. The employee should change the temporary password after their first login.
          </div>

          <div className="modal-actions">
            <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={onSave}>
              <Save size={15} /> Save Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
