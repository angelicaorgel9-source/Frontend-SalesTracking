import { useState } from 'react'
import Modal from '../../Modal.jsx'

const paymentMethods = ['Cash', 'GCash', 'Maya', 'Bank Transfer']

export default function EditOrderModal({ order, onClose, onSave }) {
  const [name, setName] = useState(order.customer_name || '')
  const [phone, setPhone] = useState(order.customer_phone || '')
  const [email, setEmail] = useState(order.customer_email || '')
  const [payment, setPayment] = useState(order.payment_method || 'CASH')
  const [notes, setNotes] = useState(order.items?.[0]?.specifications || '')

  const handleSubmit = () => {
    onSave({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim(),
      paymentMethod: payment.toUpperCase() === 'GCASH' ? 'GCASH' : payment.toUpperCase() === 'CARD' ? 'CARD' : 'CASH',
      notes: notes.trim(),
    })
  }

  return (
    <Modal
      title="Edit Order"
      subtitle={`Update order #${order.transaction_id}`}
      onClose={onClose}
      size="md"
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Save Changes</button>
        </>
      )}
    >
      <div className="field">
        <label>Full Name</label>
        <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="field">
        <label>Contact Number</label>
        <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </div>
      <div className="field">
        <label>Email Address</label>
        <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div className="field">
        <label>Payment Method</label>
        <select className="input" value={payment} onChange={(event) => setPayment(event.target.value)}>
          {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
        </select>
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Order Notes</label>
        <textarea className="input" rows="4" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>
    </Modal>
  )
}
