import { useState } from 'react'
import { Info, Boxes, DollarSign, Save } from 'lucide-react'
import Modal from '../../Modal.jsx'

export default function EditOrderModal({ order, onClose, onSave }) {
  const [form, setForm] = useState({
    customerName: order?.customer || '',
    project: order?.project || '',
    dueDate: order?.dueDate || '',
    quantity: order?.quantity || '',
    status: order?.status || 'Pending Proof',
    priority: order?.priority || 'Standard',
    value: (order?.value || '').replace(/[^0-9.]/g, ''),
    branch: order?.branch || 'Baliuag',
    address: order?.address || '',
  })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    onSave({ ...order, ...form })
  }

  return (
    <Modal
      title={`Edit Order #${order?.id || ''}`}
      onClose={onClose}
      size="md"
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Save Order
          </button>
        </>
      )}
    >
      <div className="flex-row gap-8 mb-16" style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        <Info size={14} /> Order Information
      </div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label>Order ID</label>
          <input className="input" value={order?.id || ''} disabled />
        </div>
        <div className="field">
          <label>Customer Name</label>
          <input className="input" value={form.customerName} onChange={update('customerName')} />
        </div>
      </div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label>Project Type</label>
          <input className="input" value={form.project} onChange={update('project')} />
        </div>
        <div className="field">
          <label>Due Date</label>
          <input className="input" type="date" value={form.dueDate} onChange={update('dueDate')} />
        </div>
      </div>

      <div className="flex-row gap-8 mb-16" style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>
        <Boxes size={14} /> Production Details
      </div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="field">
          <label>Quantity</label>
          <input className="input" value={form.quantity} onChange={update('quantity')} />
        </div>
        <div className="field">
          <label>Status</label>
          <select className="input" value={form.status} onChange={update('status')}>
            <option>Pending Proof</option>
            <option>Printing</option>
            <option>In Production</option>
            <option>Completed</option>
            <option>Shipped</option>
          </select>
        </div>
        <div className="field">
          <label>Priority</label>
          <select className="input" value={form.priority} onChange={update('priority')}>
            <option>Standard</option>
            <option>High Rush</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      <div className="flex-row gap-8 mb-16" style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>
        <DollarSign size={14} /> Pricing &amp; Shipping
      </div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label>Total Value</label>
          <input className="input" value={form.value} onChange={update('value')} />
        </div>
        <div className="field">
          <label>Production Branch</label>
          <select className="input" value={form.branch} onChange={update('branch')}>
            <option>Baliuag</option>
            <option>Tangos - Baliuag</option>
            <option>Sabang</option>
          </select>
        </div>
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Shipping Address</label>
        <input className="input" value={form.address} onChange={update('address')} placeholder="Street, City, Province" />
      </div>
    </Modal>
  )
}
