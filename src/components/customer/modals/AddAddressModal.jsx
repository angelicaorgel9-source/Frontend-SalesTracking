import { useState } from 'react'
import Modal from '../../Modal.jsx'

export default function AddAddressModal({ onClose, onSave }) {
  const [form, setForm] = useState({ label: 'Home', name: '', address: '', phone: '', primary: false })
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  return (
    <Modal
      title="Add Address"
      subtitle="Save a delivery address for future orders"
      onClose={onClose}
      size="md"
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Save Address</button>
        </>
      )}
    >
      <div className="field">
        <label>Address Label</label>
        <select className="input" value={form.label} onChange={update('label')}>
          <option>Home</option>
          <option>Work</option>
          <option>Other</option>
        </select>
      </div>
      <div className="field">
        <label>Recipient Name</label>
        <input className="input" placeholder="Full name" value={form.name} onChange={update('name')} />
      </div>
      <div className="field">
        <label>Delivery Address</label>
        <textarea className="input" rows="3" placeholder="Street, barangay, city, province" value={form.address} onChange={update('address')} />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Phone Number</label>
        <input className="input" type="tel" placeholder="+63 9XX XXX XXXX" value={form.phone} onChange={update('phone')} />
      </div>
    </Modal>
  )
}
