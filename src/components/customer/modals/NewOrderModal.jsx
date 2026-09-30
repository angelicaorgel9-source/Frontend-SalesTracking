import { useEffect, useState } from 'react'
import { UploadCloud, Wallet, QrCode, CreditCard, Info, Store, Truck } from 'lucide-react'
import Modal from '../../Modal.jsx'
import { useCustomerProfile } from '../../../context/CustomerProfileContext.jsx'
import { api } from '../../../utils/api.js'

const paymentMethods = [
  { key: 'CASH', label: 'Cash', icon: Wallet },
  { key: 'QRPH', label: 'QR Ph', icon: QrCode },
]

const fulfillmentOptions = [
  { key: 'PICKUP', label: 'Pick up', icon: Store },
  { key: 'DELIVERY', label: 'Delivery', icon: Truck },
]

export default function NewOrderModal({ onClose, onSave, initialProduct = null, products = [] }) {
  const { profile } = useCustomerProfile()
  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState('')
  const [customer, setCustomer] = useState({
    name: profile.name || '',
    contact: profile.phone || '',
    email: profile.email || '',
    address: '',
  })
  const [productId, setProductId] = useState(initialProduct?.id || products[0]?.id || '')
  const product = products.find((p) => String(p.id) === String(productId)) || products[0] || null
  const [size, setSize] = useState(initialProduct?.sizes?.[0] || products[0]?.sizes?.[0] || '')
  const [customSize, setCustomSize] = useState('')
  const [material, setMaterial] = useState(initialProduct?.materials?.[0] || products[0]?.materials?.[0] || '')
  const [quantity, setQuantity] = useState(10)
  const [fulfillmentMethod, setFulfillmentMethod] = useState('DELIVERY')
  const [payment, setPayment] = useState('CASH')
  const [notes, setNotes] = useState('')
  const [designFile, setDesignFile] = useState(null)

  useEffect(() => {
    if (!productId && products.length) {
      setProductId(String(products[0].id))
      setSize(products[0].sizes[0])
      setMaterial(products[0].materials[0])
    }
  }, [productId, products])

  useEffect(() => {
    api.getBranches().then((items) => {
      setBranches(items)
      if (items.length) setBranchId(String(items[0].id))
    }).catch(() => setBranches([]))
  }, [])

  const handleProductChange = (id) => {
    const next = products.find((p) => String(p.id) === String(id))
    if (!next) return
    setProductId(id)
    setSize(next.sizes[0])
    setCustomSize('')
    setMaterial(next.materials[0])
  }

  const base = (product?.price || 0) * quantity
  const discount = quantity >= 100 ? Math.round(base * 0.05) : 0
  const deliveryFee = fulfillmentMethod === 'DELIVERY' ? 100 : 0
  const total = base - discount + deliveryFee
  const formattedTotal = total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleSubmit = () => {
    if (!product || !customer.name.trim() || !branchId) return
    if (fulfillmentMethod === 'DELIVERY' && !customer.address.trim()) return
    if (size === 'Custom' && !customSize.trim()) return
    onSave({
      product,
      branchId,
      branchCode: branches.find((branch) => String(branch.id) === branchId)?.code,
      size: size === 'Custom' ? customSize.trim() : size,
      material,
      quantity,
      fulfillmentMethod,
      deliveryFee,
      deliveryAddress: fulfillmentMethod === 'DELIVERY' ? customer.address.trim() : '',
      payment,
      notes,
      customer,
      total,
      designFile,
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
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!products.length}>Submit Order</button>
        </>
      )}
    >
      <div className="two-col" style={{ gridTemplateColumns: '1.6fr 1fr', alignItems: 'start', gap: 20 }}>
        <div>
          {!products.length && <div className="section-sub mb-16">No products are available to order yet. Please try again later.</div>}
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
          {fulfillmentMethod === 'DELIVERY' && (
            <div className="field">
              <label>Delivery Address</label>
              <input className="input" placeholder="Street, City, Province, Zip Code" value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))} />
            </div>
          )}

          <div className="section-title mb-16" style={{ marginTop: 8 }}>Order Configuration</div>
          <div className="field">
            <label>Fulfillment</label>
            <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {fulfillmentOptions.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFulfillmentMethod(key)}
                  className="card"
                  aria-pressed={fulfillmentMethod === key}
                  style={{
                    padding: '12px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    borderColor: fulfillmentMethod === key ? 'var(--color-primary)' : 'var(--color-border)',
                    background: fulfillmentMethod === key ? 'var(--color-secondary)' : '#fff',
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Branch</label>
            <select className="input" value={branchId} onChange={(event) => setBranchId(event.target.value)} required>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Product</label>
            <select className="input" value={productId} onChange={(e) => handleProductChange(e.target.value)}>
              {!products.length && <option value="">No products available</option>}
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field">
              <label>Size</label>
              <select className="input" value={size} onChange={(e) => setSize(e.target.value)}>
                {product?.sizes?.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {size === 'Custom' && (
                <input
                  className="input"
                  style={{ marginTop: 8 }}
                  placeholder="Enter custom size (e.g., 4ft x 8ft)"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                />
              )}
            </div>
            <div className="field">
              <label>Material / Finish</label>
              <select className="input" value={material} onChange={(e) => setMaterial(e.target.value)}>
                {product?.materials?.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Quantity</label>
            <div className="flex-row gap-8">
              <button type="button" className="icon-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <input className="input" style={{ textAlign: 'center' }} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
              <button type="button" className="icon-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
              <span className="section-sub" style={{ whiteSpace: 'nowrap' }}>per {product?.priceUnit || 'unit'}</span>
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
              <input
                id="design-file"
                type="file"
                accept=".png,.svg,.ai,.psd"
                style={{ display: 'none' }}
                onChange={(e) => setDesignFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="design-file" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                Browse Files
              </label>
              {designFile && (
                <div className="section-sub" style={{ marginTop: 8 }}>
                  Selected: {designFile.name}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card card-pad mb-16">
            <div className="flex-between mb-16">
              <span className="section-title">Order Summary</span>
            </div>
            <div className="flex-between mb-16" style={{ fontSize: 12.5 }}>
              <span className="text-secondary">{product?.name || 'No product selected'} ({quantity}x)</span>
              <span className="cell-primary">₱{base.toLocaleString()}.00</span>
            </div>
            {discount > 0 && (
              <div className="flex-between mb-16" style={{ fontSize: 12.5, color: 'var(--color-primary)' }}>
                <span>Bulk Discount (5%)</span>
                <span>- ₱{discount.toLocaleString()}.00</span>
              </div>
            )}
            <div className="flex-between mb-16" style={{ fontSize: 12.5 }}>
              <span className="text-secondary">{fulfillmentMethod === 'DELIVERY' ? 'Delivery Fee' : 'Pickup'}</span>
              <span className="cell-primary">{deliveryFee ? `₱${deliveryFee.toFixed(2)}` : 'No charge'}</span>
            </div>
            <div className="flex-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
              <span className="cell-primary">Total Amount</span>
              <span className="cell-primary" style={{ color: 'var(--color-primary)', fontSize: 16 }}>₱{formattedTotal}</span>
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-title mb-16 flex-row gap-8"><CreditCard size={15} /> Payment Method</div>
            <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {paymentMethods.map(({ key, label, icon: Icon }) => (
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
                  {label}
                </button>
              ))}
            </div>
            {payment === 'CASH' && (
              <div className="toast toast-info" role="status" aria-live="polite" style={{ marginTop: 12 }}>
                <Info size={17} />
                <span>Please prepare the exact cash amount of ₱{formattedTotal} for your order.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
