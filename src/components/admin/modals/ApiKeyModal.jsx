import { useState } from 'react'
import { AlertTriangle, Copy, KeyRound } from 'lucide-react'
import Modal from '../../Modal.jsx'

function randomKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let out = 'sk_live_'
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default function ApiKeyModal({ onClose, onSave }) {
  const [label, setLabel] = useState('')
  const [permission, setPermission] = useState('Read Only')
  const [generatedKey, setGeneratedKey] = useState('')

  const handleGenerate = () => {
    if (!generatedKey) {
      setGeneratedKey(randomKey())
      return
    }
    onSave({ label, permission, key: generatedKey })
  }

  const copy = () => {
    if (generatedKey && navigator.clipboard) navigator.clipboard.writeText(generatedKey)
  }

  return (
    <Modal
      title="API Key Configuration"
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleGenerate}>
            <KeyRound size={15} /> {generatedKey ? 'Save Key' : 'Generate Key'}
          </button>
        </>
      )}
    >
      <div className="field">
        <label>API Name/Label</label>
        <input className="input" placeholder="A4 Bond Papers" value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>
      <div className="field">
        <label>Permission Level</label>
        <select className="input" value={permission} onChange={(e) => setPermission(e.target.value)}>
          <option>Read Only</option>
          <option>Read &amp; Write</option>
          <option>Full Access</option>
        </select>
      </div>

      <div className="info-note" style={{ alignItems: 'flex-start' }}>
        <AlertTriangle size={16} />
        <span>For security reasons, your new API key will only be displayed <strong>once</strong>. Please ensure you copy and store it securely immediately after generation.</span>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Generated Key</label>
        <div className="credential-row">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {generatedKey ? generatedKey.replace(/./g, '•').slice(0, 40) : '••••••••••••••••••••••••••••••••••••••••'}
          </span>
          <Copy onClick={copy} />
        </div>
      </div>
    </Modal>
  )
}
