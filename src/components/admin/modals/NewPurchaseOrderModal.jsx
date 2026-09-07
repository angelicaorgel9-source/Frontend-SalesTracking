import { useState } from 'react'
import { Save } from 'lucide-react'
import Modal from '../../Modal.jsx'

export default function NewPurchaseOrderModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', sku: '', quantity: '', unit: 'Ream', purchaseDate: '', supplier: '',
  })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <Modal
      title="Add New Material"
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Save to Inventory
          </button>
        </>
      )}
    >
      <div className="field">
        <label>Product Name</label>
        <input className="input" placeholder="A4 Bond Papers" value={form.name} onChange={update('name')} />
      </div>
      <div className="field">
        <label>Item Number/SKU</label>
        <input className="input" placeholder="ABC-001" value={form.sku} onChange={update('sku')} />
      </div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="field">
          <label>Quantity</label>
          <input className="input" type="number" value={form.quantity} onChange={update('quantity')} />
        </div>
        <div className="field">
          <label>Unit</label>
          <select className="input" value={form.unit} onChange={update('unit')}>
            <option>Ream</option>
            <option>Liters</option>
            <option>Meters</option>
            <option>Pack</option>
            <option>Rolls</option>
          </select>
        </div>
        <div className="field">
          <label>Purchase Date</label>
          <input className="input" type="date" value={form.purchaseDate} onChange={update('purchaseDate')} />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Supplier</label>
        <input className="input" placeholder="Supplier name" value={form.supplier} onChange={update('supplier')} />
      </div>
    </Modal>
  )
}
