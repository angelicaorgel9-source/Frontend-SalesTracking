import { useState } from 'react'
import { Save } from 'lucide-react'
import Modal from '../../Modal.jsx'

export default function NewClientModal({ onClose, onSave }) {
  const [form, setForm] = useState({ fullName: '', contact: '', email: '', address: '' })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    if (!form.fullName.trim()) return
    onSave(form)
  }

  return (
    <Modal
      title="New Client"
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Save Client
          </button>
        </>
      )}
    >
      <div className="field">
        <label>Full name</label>
        <input className="input" placeholder="Juan Dela Cruz" value={form.fullName} onChange={update('fullName')} />
      </div>
      <div className="field">
        <label>Contact Number</label>
        <input className="input" placeholder="0912 345 6789" value={form.contact} onChange={update('contact')} />
      </div>
      <div className="field">
        <label>Email Address</label>
        <input className="input" type="email" placeholder="client@email.com" value={form.email} onChange={update('email')} />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Delivery Address</label>
        <input className="input" placeholder="Street, City, Province" value={form.address} onChange={update('address')} />
      </div>
    </Modal>
  )
}
