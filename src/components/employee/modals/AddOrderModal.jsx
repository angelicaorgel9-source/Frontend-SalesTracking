import { useState } from 'react'
import { UploadCloud, Wallet, Smartphone, Landmark, CreditCard } from 'lucide-react'
import Modal from '../../Modal.jsx'
import DraftsPopover from '../../DraftsPopover.jsx'

const sizes = ['S', 'M', 'L', 'XL', '2XL']
const colors = ['#1A1A1A', '#D03B3B', '#00AEEF', '#7A7A7A']
const paymentMethods = [
  { key: 'Cash', icon: Wallet },
  { key: 'GCash', icon: Smartphone },
  { key: 'Maya', icon: Smartphone },
  { key: 'Bank Transfer', icon: Landmark },
]

export default function AddOrderModal({
  onClose, onSave, onSaveDraft, initialDraft, drafts = [], onEditDraft, onRemoveDraft,
}) {
  const [customer, setCustomer] = useState(initialDraft?.customer || { name: '', contact: '', email: '', address: '' })
  const [size, setSize] = useState(initialDraft?.size || 'M')
  const [color, setColor] = useState(initialDraft?.color || colors[0])
  const [quantity, setQuantity] = useState(initialDraft?.quantity || 10)
  const [payment, setPayment] = useState(initialDraft?.payment || 'GCash')

  const base = 2500
  const printing = 890
  const discount = quantity >= 20 ? Math.round((base + printing) * 0.05) : 0
  const delivery = 150
  const total = base + printing - discount + delivery

  const buildOrder = () => ({
    id: initialDraft?.id,
    customer, size, color, quantity, payment, total,
  })

  const handleSubmit = () => {
    if (!customer.name.trim()) return
    onSave(buildOrder())
  }

  const handleSaveDraft = () => {
    onSaveDraft(buildOrder())
  }

  return (
    <Modal
      title="New Order"
      subtitle="Fill in the details to create a new print order"
      onClose={onClose}
      size="xl"
      headerActions={<DraftsPopover drafts={drafts} onEdit={onEditDraft} onRemove={onRemoveDraft} />}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-outline" onClick={handleSaveDraft}>Save Draft</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Order</button>
        </>
      )}
    >
      <div className="two-col" style={{ gridTemplateColumns: '1.6fr 1fr', alignItems: 'start', gap: 20 }}>
        <div>
          <div className="section-title mb-16">Customer Information</div>
          <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field">
              <label>Full Name</label>
              <input className="input" placeholder="John Doe" value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} />
            </div>
            <div className="field">
              <label>Contact Number</label>
              <input className="input" placeholder="+63 9XX XXX XXXX" value={customer.contact} onChange={(e) => setCustomer((c) => ({ ...c, contact: e.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label>Email Address</label>
            <input className="input" type="email" placeholder="john@example.com" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} />
          </div>
          <div className="field">
            <label>Delivery Address</label>
            <input className="input" placeholder="Street, City, Province, Zip Code" value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))} />
          </div>

          <div className="section-title mb-16" style={{ marginTop: 8 }}>Order Configuration</div>
          <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field">
              <label>Product Category</label>
              <select className="input" defaultValue="Men's Wear">
                <option>Men's Wear</option>
                <option>Women's Wear</option>
                <option>Kids Wear</option>
              </select>
            </div>
            <div className="field">
              <label>T-Shirt Type</label>
              <select className="input" defaultValue="Cotton Crew Neck">
                <option>Cotton Crew Neck</option>
                <option>Polo Shirt</option>
                <option>V-Neck</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Size</label>
            <div className="flex-row gap-8">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className="btn btn-sm"
                  style={{
                    minWidth: 40,
                    background: size === s ? 'var(--color-primary)' : '#fff',
                    color: size === s ? '#fff' : 'var(--color-text)',
                    borderColor: size === s ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Color</label>
            <div className="flex-row gap-8">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: color === c ? '2px solid var(--color-primary)' : '2px solid transparent',
                    boxShadow: '0 0 0 1px var(--color-border)',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field">
              <label>Quantity</label>
              <div className="flex-row gap-8">
                <button className="icon-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                <input className="input" style={{ textAlign: 'center' }} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
                <button className="icon-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>
            <div className="field">
              <label>Printing Type</label>
              <select className="input" defaultValue="Screen Printing">
                <option>Screen Printing</option>
                <option>Sublimation</option>
                <option>DTF</option>
              </select>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label>Upload Design</label>
            <div style={{
              border: '1.5px dashed var(--color-border)', borderRadius: 'var(--radius-sm)',
              padding: '22px 14px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 12.5,
            }}
            >
              <UploadCloud style={{ margin: '0 auto 6px', display: 'block' }} size={22} />
              Drag and drop your design files here
              <div className="section-sub" style={{ margin: '4px 0 10px' }}>Supports PNG, SVG, AI, PSD (Max 25MB)</div>
              <button type="button" className="btn btn-outline btn-sm">Browse Files</button>
            </div>
          </div>
        </div>

        <div>
          <div className="card card-pad mb-16">
            <div className="flex-between mb-16">
              <span className="section-title">Order Summary</span>
            </div>
            <div className="flex-between mb-16" style={{ fontSize: 12.5 }}>
              <span className="text-secondary">Base Product (10x)</span>
              <span className="cell-primary">₱{base.toLocaleString()}.00</span>
            </div>
            <div className="flex-between mb-16" style={{ fontSize: 12.5 }}>
              <span className="text-secondary">Printing Service</span>
              <span className="cell-primary">₱{printing.toLocaleString()}.00</span>
            </div>
            {discount > 0 && (
              <div className="flex-between mb-16" style={{ fontSize: 12.5, color: 'var(--color-primary)' }}>
                <span>Bulk Discount (5%)</span>
                <span>- ₱{discount.toLocaleString()}.00</span>
              </div>
            )}
            <div className="flex-between mb-16" style={{ fontSize: 12.5 }}>
              <span className="text-secondary">Delivery Fee</span>
              <span className="cell-primary">₱{delivery.toLocaleString()}.00</span>
            </div>
            <div className="flex-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
              <span className="cell-primary">Total Amount</span>
              <span className="cell-primary" style={{ color: 'var(--color-primary)', fontSize: 16 }}>₱{total.toLocaleString()}.00</span>
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-title mb-16 flex-row gap-8"><CreditCard size={15} /> Payment Method</div>
            <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {paymentMethods.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPayment(key)}
                  className="card"
                  style={{
                    padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    borderColor: payment === key ? 'var(--color-primary)' : 'var(--color-border)',
                    background: payment === key ? 'var(--color-secondary)' : '#fff',
                  }}
                >
                  <Icon size={16} />
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
