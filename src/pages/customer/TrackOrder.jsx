import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Check, Palette, Printer, Package, PackageCheck, Download, Share2, ListOrdered, Search, Pencil,
} from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import { customerOrders, orderSteps } from '../../data/customerMockData.js'
import { useToast } from '../../context/ToastContext.jsx'

const stepIcons = [Check, Palette, Printer, Package, PackageCheck]

function normalizeOrderId(value) {
  return (value || '')
    .trim()
    .replace(/^#/, '')
    .replace(/\s+/g, '')
    .toUpperCase()
}

function statusLabel(order) {
  if (order.currentStep >= orderSteps.length - 1) return 'Completed'
  return orderSteps[order.currentStep]
}

export default function TrackOrder() {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [input, setInput] = useState(searchParams.get('id') || '')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      const normalizedId = normalizeOrderId(id)
      const found = customerOrders.find((o) => normalizeOrderId(o.id) === normalizedId)
      if (found) {
        setOrder(found)
        setInput(found.id)
      } else {
        setOrder(null)
        showToast(`No order found for "${id}".`, 'error')
      }
    } else {
      setOrder(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleTrack = () => {
    const trimmedInput = input.trim()
    if (!trimmedInput) {
      showToast('Please enter a transaction ID to track.', 'error')
      return
    }

    const normalized = normalizeOrderId(trimmedInput)
    const found = customerOrders.find((o) => normalizeOrderId(o.id) === normalized)

    if (!found) {
      showToast(`No order found for "${trimmedInput}".`, 'error')
      setOrder(null)
      return
    }

    setOrder(found)
    setInput(found.id)
    setSearchParams({ id: found.id })
  }

  const subtotal = order ? order.items.reduce((sum, it) => sum + it.price, 0) : 0
  const total = order ? subtotal + (order.expressFee || 0) : 0

  return (
    <CustomerLayout showHeaderNewOrder={false} showFooterNewOrder>
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Track Your Order</h1>
        <Link to="/customer/my-orders" className="link-btn flex-row gap-8">
          <ListOrdered size={14} /> My Orders
        </Link>
      </div>

      <div className="card card-pad mb-20">
        <div className="flex-row gap-10" style={{ flexWrap: 'wrap' }}>
          <div className="topbar-search" style={{ flex: 1, minWidth: 220 }}>
            <Search />
            <input
              placeholder="Transaction ID (e.g., MJ-9021)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            />
          </div>
          <button className="btn btn-primary" onClick={handleTrack}>Track Now</button>
        </div>
      </div>

      {order && (
        <>
          <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: 6 }}>#{order.id}</span>
              <div className="cell-sub" style={{ marginTop: 6 }}>
                <span className="notif-unread-dot" style={{ position: 'static', marginRight: 6, display: 'inline-block' }} />
                Last updated {order.lastUpdated}
              </div>
            </div>
            <div className="flex-row gap-8">
              <button className="btn btn-outline btn-sm" onClick={() => showToast('Opening edit order options…', 'info')}>
                <Pencil size={14} /> Edit
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => showToast('Downloading invoice…', 'info')}>
                <Download size={14} /> Invoice
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => showToast('Share link copied to clipboard.', 'success')}>
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>

          <div className="two-col" style={{ gridTemplateColumns: '1.6fr 1fr', alignItems: 'start', gap: 20 }}>
            <div className="card card-pad">
              <div className="flex-between mb-20">
                <span className="section-title">Tracking Progress</span>
                <span className="badge badge-info">STATUS: {statusLabel(order).toUpperCase()}</span>
              </div>

              <div className="tracking-steps">
                {orderSteps.map((label, idx) => {
                  const Icon = stepIcons[idx]
                  const done = idx < order.currentStep
                  const active = idx === order.currentStep
                  const state = done ? 'done' : active ? 'active' : 'pending'
                  return (
                    <div className={`tracking-step tracking-step-${state}`} key={label}>
                      <div className="tracking-step-line" />
                      <div className="tracking-step-dot">
                        <Icon size={16} />
                      </div>
                      <div className="tracking-step-label">{label}</div>
                      <div className="tracking-step-sub">
                        {done && 'Completed'}
                        {active && 'In Progress'}
                        {!done && !active && 'Pending'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="card mb-16">
                <div className="card-pad" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <span className="section-title">Order Summary</span>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.name}>
                          <td className="cell-primary">{item.name}</td>
                          <td className="text-secondary">{item.qty}</td>
                          <td className="cell-primary" style={{ color: 'var(--color-primary)' }}>${item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card-pad">
                  <div className="flex-between mb-16" style={{ fontSize: 12.5 }}>
                    <span className="text-secondary">Subtotal</span>
                    <span className="cell-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  {order.expressFee > 0 && (
                    <div className="flex-between mb-16" style={{ fontSize: 12.5 }}>
                      <span className="text-secondary">Express Processing</span>
                      <span className="cell-primary">${order.expressFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                    <span className="cell-primary">Total</span>
                    <span className="cell-primary" style={{ color: 'var(--color-primary)', fontSize: 16 }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="card card-pad" style={{ background: 'var(--color-secondary)', border: 'none' }}>
                <div className="section-sub" style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                  Estimated Completion
                </div>
                <div className="cell-primary" style={{ marginTop: 4 }}>{order.estimatedCompletion}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {!order && (
        <div className="card card-pad" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="section-sub">Enter a transaction ID above to see real-time production updates, or view your full order history below.</div>
          <Link to="/customer/my-orders" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', marginTop: 14 }}>
            <ListOrdered size={14} /> View My Orders
          </Link>
        </div>
      )}
    </CustomerLayout>
  )
}
