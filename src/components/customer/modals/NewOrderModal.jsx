import { useState } from 'react'
import { UploadCloud, Wallet, Smartphone, Landmark, CreditCard } from 'lucide-react'
import Modal from '../../Modal.jsx'
import { customerProducts } from '../../../data/customerMockData.js'
import { useCustomerProfile } from '../../../context/CustomerProfileContext.jsx'

const paymentMethods = [
  { key: 'Cash', icon: Wallet },
  { key: 'GCash', icon: Smartphone },
  { key: 'Maya', icon: Smartphone },
  { key: 'Bank Transfer', icon: Landmark },
]

export default function NewOrderModal({ onClose, onSave, initialProduct = null }) {
  const { profile } = useCustomerProfile()
  const [customer, setCustomer] = useState({
    name: profile.name || '',
    contact: profile.phone || '',
    email: profile.email || '',
    address: '',
  })
  const [productId, setProductId] = useState(initialProduct?.id || customerProducts[0].id)
  const product = customerProducts.find((p) => p.id === productId) || customerProducts[0]
  const [size, setSize] = useState(product.sizes[0])
  const [material, setMaterial] = useState(product.materials[0])
  const [quantity, setQuantity] = useState(10)
  const [payment, setPayment] = useState('GCash')
  const [notes, setNotes] = useState('')

  const handleProductChange = (id) => {
    const next = customerProducts.find((p) => p.id === id) || customerProducts[0]
    setProductId(id)
    setSize(next.sizes[0])
    setMaterial(next.materials[0])
  }

  const base = product.price * quantity
  const discount = quantity >= 100 ? Math.round(base * 0.05) : 0
  const delivery = 150
  const total = base - discount + delivery

  const handleSubmit = () => {
    if (!customer.name.trim() || !customer.address.trim()) return
    onSave({
      product, size, material, quantity, payment, notes, customer, total,
    })
  }

  return (
    <Modal
      title="New Order"
      subtitle="Fill in the details to create a new print order"
      onClose={onClose}
      size="xl"
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
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
          <div className="field">
            <label>Product</label>
            <select className="input" value={productId} onChange={(e) => handleProductChange(e.target.value)}>
              {customerProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field">
              <label>Size</label>
              <select className="input" value={size} onChange={(e) => setSize(e.target.value)}>
                {product.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Material / Finish</label>
              <select className="input" value={material} onChange={(e) => setMaterial(e.target.value)}>
                {product.materials.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Quantity</label>
            <div className="flex-row gap-8">
              <button type="button" className="icon-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <input className="input" style={{ textAlign: 'center' }} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
              <button type="button" className="icon-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
              <span className="section-sub" style={{ whiteSpace: 'nowrap' }}>per {product.priceUnit}</span>
            </div>
          </div>

          <div className="field">
            <label>Order Notes (optional)</label>
            <input className="input" placeholder="Any special instructions for your order" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
              <span className="text-secondary">{product.name} ({quantity}x)</span>
              <span className="cell-primary">₱{base.toLocaleString()}.00</span>
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
