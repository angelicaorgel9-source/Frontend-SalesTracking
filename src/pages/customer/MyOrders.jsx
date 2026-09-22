import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListOrdered, ChevronRight } from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import { orderSteps } from '../../data/customerMockData.js'
import { api } from '../../utils/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const statusFilters = ['All', ...orderSteps]

function statusBadgeClass(order) {
  if (order.status === 'COMPLETED') return 'badge-success'
  if (order.status === 'PLACED') return 'badge-warning'
  return 'badge-info'
}

function statusLabel(order) {
  return order.statusLabel
}

function orderTotal(order) {
  return Number(order.total_amount || 0)
}

// Newest to oldest — mock data already carries a relative-recency order,
// this keeps the list stable if entries are ever appended out of order.
function sortNewestFirst(list) {
  return [...list].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))
}

export default function MyOrders() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [filter, setFilter] = useState('All')
  const [customerOrders, setCustomerOrders] = useState([])

  useEffect(() => {
    api.getOrders().then((items) => setCustomerOrders(items.map((order) => ({
      ...order,
      id: order.transaction_id,
      statusLabel: { PLACED: 'Order Placed', DESIGNING: 'Designing', PRINTING: 'Printing', READY: 'Ready for Pickup', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }[order.status] || order.status,
      placedAt: new Date(order.created_at).toLocaleString(),
      branch: 'MJ Prints',
      items: order.items.map((item) => ({ name: item.product_name, qty: `${item.quantity} unit(s)`, price: Number(item.subtotal) })),
    })))).catch((error) => {
      setCustomerOrders([])
      showToast(error.message, 'error')
    })
  }, [showToast])

  const orders = useMemo(() => {
    const sorted = sortNewestFirst(customerOrders)
    if (filter === 'All') return sorted
    return sorted.filter((o) => statusLabel(o) === filter)
  }, [filter, customerOrders])

  return (
    <CustomerLayout>
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            <ListOrdered size={20} style={{ verticalAlign: -3, marginRight: 8 }} />
            My Orders
          </h1>
          <div className="section-sub">All your orders, from newest to past.</div>
        </div>
      </div>

      <div className="notif-tabs mb-16">
        {statusFilters.map((s) => (
          <button
            key={s}
            className={`chip-filter${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card">
        {orders.length === 0 && (
          <div className="section-sub" style={{ textAlign: 'center', padding: '30px 0' }}>
            No orders found for this status.
          </div>
        )}
        {orders.map((order) => (
          <div
            key={order.id}
            className="my-order-row"
            onClick={() => navigate(`/customer/track-order?id=${encodeURIComponent(order.id)}`)}
          >
            <div className="my-order-row-main">
              <div className="flex-row gap-10">
                <span className="cell-primary" style={{ color: 'var(--color-primary)' }}>#{order.id}</span>
                <span className={`badge ${statusBadgeClass(order)}`}>{statusLabel(order)}</span>
              </div>
              <div className="cell-sub" style={{ marginTop: 4 }}>{order.placedAt} • {order.branch} Branch</div>
              <div className="cell-sub" style={{ marginTop: 6 }}>
                {order.items.map((it) => it.name).join(', ')}
              </div>
            </div>
            <div className="my-order-row-side">
              <div className="cell-primary" style={{ color: 'var(--color-primary)', fontSize: 15 }}>
                ₱{orderTotal(order).toFixed(2)}
              </div>
              <div className="link-btn flex-row gap-8" style={{ marginTop: 8 }}>
                Track Order <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CustomerLayout>
  )
}
