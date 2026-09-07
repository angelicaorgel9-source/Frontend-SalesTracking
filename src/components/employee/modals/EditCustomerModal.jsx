import { useState } from 'react'
import { Pencil, Save } from 'lucide-react'
import Modal from '../../Modal.jsx'

export default function EditCustomerModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState({
    company: customer?.company || '',
    contact: customer?.name || '',
    customerId: `CUST-${String(customer?.id || '0').padStart(4, '0')}-AX`,
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    status: customer?.status || 'Active',
    ltv: customer?.ltv || customer?.spend || '',
    notes: customer?.notes || '',
  })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => onSave(form)

  return (
    <Modal
      title="Edit Customer Details"
      onClose={onClose}
      size="md"
      eyebrow={<Pencil size={13} />}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Save Changes
          </button>
        </>
      )}
    >
      <div className="section-sub mb-16" style={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Basic Information</div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label>Company Name</label>
          <input className="input" value={form.company} onChange={update('company')} />
        </div>
        <div className="field">
          <label>Contact Person</label>
          <input className="input" value={form.contact} onChange={update('contact')} />
        </div>
      </div>
      <div className="field">
        <label>Customer ID</label>
        <input className="input" value={form.customerId} disabled style={{ background: '#F6F8FA' }} />
      </div>

      <div className="section-sub mb-16" style={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 6 }}>Contact Details</div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label>Email Address</label>
          <input className="input" type="email" value={form.email} onChange={update('email')} />
        </div>
        <div className="field">
          <label>Phone Number</label>
          <input className="input" value={form.phone} onChange={update('phone')} />
        </div>
      </div>
      <div className="field">
        <label>Business Address</label>
        <input className="input" value={form.address} onChange={update('address')} placeholder="Street, City, Province" />
      </div>

      <div className="section-sub mb-16" style={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 6 }}>Account Settings</div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label>Account Status</label>
          <select className="input" value={form.status} onChange={update('status')}>
            <option>Active</option>
            <option>Pending</option>
            <option>Printing</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="field">
          <label>Lifetime Value</label>
          <input className="input" value={form.ltv} onChange={update('ltv')} />
        </div>
      </div>

      <div className="section-sub mb-16" style={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 6 }}>Internal Notes</div>
      <div className="field" style={{ marginBottom: 0 }}>
        <textarea
          className="input"
          rows={3}
          placeholder="Add private notes about this customer..."
          value={form.notes}
          onChange={update('notes')}
          style={{ resize: 'vertical' }}
        />
        <div className="section-sub" style={{ marginTop: 6 }}>These notes are only visible to admin staff.</div>
      </div>
    </Modal>
  )
}
