import { useState, useRef, useEffect } from 'react'
import { ShoppingBag, UserCheck, DollarSign, Download, Plus, ChevronDown, LayoutGrid, List, Pencil, ArrowRightLeft } from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import ActionMenu from '../../components/ActionMenu.jsx'
import AddOrderModal from '../../components/employee/modals/AddOrderModal.jsx'
import EditOrderModal from '../../components/employee/modals/EditOrderModal.jsx'
import EditOrderStatusModal from '../../components/employee/modals/EditOrderStatusModal.jsx'
import ViewOrderModal from '../../components/employee/modals/ViewOrderModal.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'
import { downloadCsv } from '../../utils/csv.js'

const toUiStatus = (status, fulfillmentMethod = 'DELIVERY') => {
  const mapping = {
    PLACED: 'Pending Proof',
    DESIGNING: 'In Production',
    PRINTING: 'Printing',
    READY: fulfillmentMethod === 'PICKUP' ? 'Ready for Pickup' : 'Ready for Delivery',
    PICKED_UP: 'Order Picked Up',
    DELIVERED: 'Order Delivered',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }
  return mapping[status] || 'Pending Proof'
}

const toUiStatusType = (status) => {
  if (['PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(status)) return 'success'
  if (status === 'PRINTING' || status === 'DESIGNING') return 'danger'
  if (status === 'READY') return 'neutral'
  return 'warning'
}

const formatMinutesAgo = (dateString) => {
  if (!dateString) return 'Just now'
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.max(0, Math.round(diff / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const peso = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const statusBadge = {
  warning: 'badge-warning',
  danger: 'badge-danger',
  success: 'badge-success',
  neutral: 'badge-neutral',
}

let draftIdCounter = 1

const statusOptions = ['All Statuses', 'Pending Proof', 'In Production', 'Printing', 'Review', 'Ready for Pickup', 'Ready for Delivery', 'Order Picked Up', 'Order Delivered', 'Completed', 'Cancelled']
const branchOptions = ['All Branches']
const dateOptions = ['All Dates', 'Today', 'This Week', 'This Month']

export default function Orders() {
  const { showToast } = useToast()
  const [view, setView] = useState('list')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [statFilter, setStatFilter] = useState(null)
  const [statusFilter, setStatusFilter] = useState(statusOptions[0])
  const [branchFilter, setBranchFilter] = useState(branchOptions[0])
  const [dateFilter, setDateFilter] = useState(dateOptions[0])
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ left: 16, top: 44 })
  const draggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const dropdownStartRef = useRef({ left: 16, top: 44 })

  const [showAddOrder, setShowAddOrder] = useState(false)
  const [editingDraft, setEditingDraft] = useState(null)
  const [drafts, setDrafts] = useState([])


  const [editOrder, setEditOrder] = useState(null)
  const [viewOrder, setViewOrder] = useState(null)
  const [statusOrder, setStatusOrder] = useState(null)

  useEffect(() => {
    api.getProducts().then(setProducts).catch((error) => showToast(error.message, 'error'))
    api.getBranches().then(setBranches).catch((error) => showToast(error.message, 'error'))
    let isActive = true
    const refreshOrders = async () => {
      try {
        const items = await api.getOrders()
        const mapped = (items || []).map((order) => {
          const itemNames = (order.items || []).map((item) => item.product_name || 'Printing Service')
          const details = itemNames.length
            ? `${itemNames.slice(0, 2).join(', ')}${itemNames.length > 2 ? ' +' + (itemNames.length - 2) : ''}`
            : 'Production order'
          return {
            id: order.transaction_id || order.id,
            minutesAgo: formatMinutesAgo(order.created_at),
            createdAt: order.created_at,
            customer: order.customer_name || 'Walk-in Customer',
            initials: (order.customer_name || 'WC').trim().split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
            email: order.customer_email || 'No email provided',
            project: itemNames[0] || 'Custom Print Order',
            details: `${order.fulfillment_method === 'PICKUP' ? 'Pickup' : 'Delivery'} · (${(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} units) ${details}`,
            branch: order.branch_name || 'Unassigned',
            fulfillment_method: order.fulfillment_method || 'DELIVERY',
            status: toUiStatus(order.status, order.fulfillment_method),
            statusType: toUiStatusType(order.status),
            backendStatus: order.status,
            totalAmount: Number(order.total_amount || 0),
            value: `₱${Number(order.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            dueDate: order.estimated_completion || '',
            quantity: (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
          }
        })
        if (isActive) setOrders(mapped)
      } catch {
        // Keep the last successful result visible if the API is temporarily unavailable.
      }
    }

    refreshOrders()
    const refreshInterval = window.setInterval(refreshOrders, 15000)
    return () => {
      isActive = false
      window.clearInterval(refreshInterval)
    }
  }, [])

  const today = new Date()
  const todaysOrders = orders.filter((order) => {
    if (!order.createdAt) return false
    const createdAt = new Date(order.createdAt)
    return createdAt.getFullYear() === today.getFullYear()
      && createdAt.getMonth() === today.getMonth()
      && createdAt.getDate() === today.getDate()
  })
  const pendingProofCount = orders.filter((order) => order.backendStatus === 'PLACED').length
  const dailyRevenue = todaysOrders
    .filter((order) => order.backendStatus !== 'CANCELLED')
    .reduce((total, order) => total + order.totalAmount, 0)

  const handleSubmitOrder = async (order) => {
    try {
      const saved = await api.createOrder({
        branch: order.branchId,
        branch_id: order.branchId,
        branch_code: order.branchCode,
        customer_name: order.customer.name,
        customer_phone: order.customer.contact,
        customer_email: order.customer.email,
        payment_method: order.payment.toUpperCase() === 'GCASH' ? 'GCASH' : 'CASH',
        items: [{ product: order.productId, item_name: order.productName, quantity: order.quantity, unit_price: order.unitPrice, specifications: `Size ${order.size}; color ${order.color}` }],
      })
      const newOrder = {
        id: saved.transaction_id,
        minutesAgo: 'Just now',
        createdAt: saved.created_at,
        customer: saved.customer_name,
        initials: saved.customer_name.trim().split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        email: saved.customer_email,
        project: order.productName,
        details: `(${order.quantity} units) Size ${order.size}`,
        branch: saved.branch_name || 'Unassigned',
        status: toUiStatus(saved.status),
        statusType: toUiStatusType(saved.status),
        backendStatus: saved.status,
        totalAmount: Number(saved.total_amount || 0),
        value: peso(saved.total_amount),
        dueDate: saved.estimated_completion || '',
        quantity: order.quantity,
      }
      setOrders((prev) => [newOrder, ...prev])
      if (editingDraft) setDrafts((prev) => prev.filter((draft) => draft.id !== editingDraft.id))
      setShowAddOrder(false)
      setEditingDraft(null)
      showToast(`Order ${saved.transaction_id} created`, 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleSaveDraft = (order) => {
    if (editingDraft) {
      setDrafts((prev) => prev.map((d) => (d.id === editingDraft.id ? { ...order, id: editingDraft.id, savedAt: 'just now' } : d)))
      showToast('Draft updated', 'success')
    } else {
      const id = `draft-${draftIdCounter++}`
      setDrafts((prev) => [{ ...order, id, savedAt: 'just now' }, ...prev])
      showToast('Order saved as draft', 'success')
    }
    setShowAddOrder(false)
    setEditingDraft(null)
  }

  const handleEditDraft = (draft) => {
    setEditingDraft(draft)
    setShowAddOrder(true)
  }

  const handleRemoveDraft = (id) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
    showToast('Draft removed', 'info')
  }

  const handleSaveEditOrder = async (updated) => {
    try {
      const statusMap = {
        'Pending Proof': 'PLACED',
        Printing: 'PRINTING',
        'In Production': 'DESIGNING',
        'Ready for Pickup': 'READY',
        'Ready for Delivery': 'READY',
        'Order Picked Up': 'PICKED_UP',
        'Order Delivered': 'DELIVERED',
        Completed: 'COMPLETED',
      }
      const payload = {
        customer_name: updated.customerName,
        estimated_completion: updated.dueDate || null,
        total_amount: Number(updated.value || 0),
        status: statusMap[updated.status] || 'PLACED',
      }
      await api.updateStaffOrder(updated.id, payload)
      setOrders((prev) => prev.map((order) => order.id === updated.id ? {
        ...order,
        customer: updated.customerName,
        status: toUiStatus(payload.status, order.fulfillment_method),
        statusType: toUiStatusType(payload.status),
        backendStatus: payload.status,
        dueDate: updated.dueDate,
        totalAmount: payload.total_amount,
        value: peso(payload.total_amount),
      } : order))
      setEditOrder(null)
      showToast('Order updated successfully', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleSaveOrderStatus = async (updated) => {
    try {
      const status = {
        Preparing: 'PLACED',
        'In Production': 'DESIGNING',
        'Ready for Pickup': 'READY',
        'Ready for Delivery': 'READY',
        'Order Picked Up': 'PICKED_UP',
        'Order Delivered': 'DELIVERED',
        Completed: 'COMPLETED',
      }[updated.stage]
      await api.updateOrderStatus(updated.id, status)
      setOrders((prev) => prev.map((order) => order.id === updated.id ? {
        ...order,
        status: toUiStatus(status, order.fulfillment_method),
        statusType: toUiStatusType(status),
        backendStatus: status,
      } : order))
      setStatusOrder(null)
      const completionMessage = status === 'PICKED_UP'
        ? 'Customer notified that the order was picked up.'
        : status === 'DELIVERED'
          ? 'Customer notified that the order was delivered.'
          : status === 'READY'
            ? 'Customer notified that the order is ready.'
            : 'Order status updated'
      showToast(completionMessage, 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const filteredOrders = orders.filter((o) => {
    const statusMatch = statusFilter === statusOptions[0]
      || o.status === statusFilter
      || (statusFilter === 'All Statuses' && true)
    const branchMatch = branchFilter === branchOptions[0] || o.branch === branchFilter
    const statMatch = statFilter === 'pending' ? o.backendStatus === 'PLACED' : true
    const createdAt = o.createdAt ? new Date(o.createdAt) : null
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setHours(0, 0, 0, 0)
    weekStart.setDate(now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const dateMatch = dateFilter === 'All Dates'
      || (dateFilter === 'Today' && createdAt?.toDateString() === now.toDateString())
      || (dateFilter === 'This Week' && createdAt >= weekStart)
      || (dateFilter === 'This Month' && createdAt >= monthStart)
    return statusMatch && branchMatch && statMatch && dateMatch
  })

  const exportOrders = () => {
    downloadCsv({
      filename: 'orders.csv',
      columns: ['Transaction ID', 'Customer', 'Email', 'Branch', 'Status', 'Total', 'Created At'],
      rows: filteredOrders.map((order) => [order.id, order.customer, order.email, order.branch, order.status, order.totalAmount, order.createdAt]),
    })
    showToast('Orders exported', 'success')
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const dx = clientX - dragStartRef.current.x
      const dy = clientY - dragStartRef.current.y
      const nextLeft = Math.max(0, dropdownStartRef.current.left + dx)
      const nextTop = Math.max(0, dropdownStartRef.current.top + dy)
      const maxLeft = Math.max(0, window.innerWidth - 120)
      setDropdownPos({ left: Math.min(nextLeft, maxLeft), top: Math.max(0, Math.min(nextTop, window.innerHeight - 80)) })
    }

    const onUp = () => {
      draggingRef.current = false
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [])

  return (
    <EmployeeLayout
      topbarProps={{
        title: null,
        searchPlaceholder: 'Search orders, customers, or items...',
      }}
    >
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="flex-row gap-8" style={{ flexWrap: 'wrap' }}>
          <button className="chip-filter active" onClick={() => setShowFiltersDropdown((v) => !v)}>
            Filters <ChevronDown size={13} style={{ marginLeft: 4 }} />
          </button>
          <select
            className={`chip-filter chip-filter-select${statusFilter !== statusOptions[0] ? ' active' : ''}`}
            value={statusFilter}
            aria-label="Filter by status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select
            className={`chip-filter chip-filter-select${branchFilter !== branchOptions[0] ? ' active' : ''}`}
            value={branchFilter}
            aria-label="Filter by branch"
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            {branchOptions.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
            {branches.map((branch) => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
          </select>
          <select
            className={`chip-filter chip-filter-select${dateFilter !== dateOptions[0] ? ' active' : ''}`}
            value={dateFilter}
            aria-label="Filter by date"
            onChange={(e) => setDateFilter(e.target.value)}
          >
            {dateOptions.map((date) => <option key={date} value={date}>{date}</option>)}
          </select>
          {(statFilter || statusFilter !== statusOptions[0] || branchFilter !== branchOptions[0] || dateFilter !== dateOptions[0]) && (
            <button className="chip-filter" style={{ color: 'var(--color-primary)' }} onClick={() => {
              setStatFilter(null)
              setStatusFilter(statusOptions[0])
              setBranchFilter(branchOptions[0])
              setDateFilter(dateOptions[0])
            }}>
              Clear all filters
            </button>
          )}
          {showFiltersDropdown && (
            <div
              className="filter-dropdown card"
              style={{ position: 'absolute', left: dropdownPos.left, top: dropdownPos.top, zIndex: 60, padding: 12, width: 320, touchAction: 'none' }}
            >
              <div
                className="filter-dropdown-handle"
                onMouseDown={(e) => {
                  draggingRef.current = true
                  dragStartRef.current = { x: e.clientX, y: e.clientY }
                  dropdownStartRef.current = { ...dropdownPos }
                  e.preventDefault()
                }}
                onTouchStart={(e) => {
                  const t = e.touches[0]
                  draggingRef.current = true
                  dragStartRef.current = { x: t.clientX, y: t.clientY }
                  dropdownStartRef.current = { ...dropdownPos }
                }}
              >
                <div style={{ fontWeight: 700 }}>Filters</div>
              </div>
              <div className="field" style={{ marginTop: 8 }}>
                <label>Status</label>
                <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Branch</label>
                <select className="input" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                  {branchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Date</label>
                <select className="input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                  {dateOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setStatusFilter(statusOptions[0]); setBranchFilter(branchOptions[0]); setDateFilter(dateOptions[0]); setShowFiltersDropdown(false) }}>Clear</button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowFiltersDropdown(false)}>Apply</button>
              </div>
            </div>
          )}
        </div>
        <div className="flex-row gap-8">
          <button className={`icon-btn${view === 'list' ? '' : ''}`} onClick={() => setView('list')} style={view === 'list' ? { background: 'var(--color-secondary)', borderColor: 'var(--color-secondary)', color: 'var(--color-primary-dark)' } : undefined}>
            <List />
          </button>
          <button className="icon-btn" onClick={() => setView('grid')} style={view === 'grid' ? { background: 'var(--color-secondary)', borderColor: 'var(--color-secondary)', color: 'var(--color-primary-dark)' } : undefined}>
            <LayoutGrid />
          </button>
        </div>
      </div>

      <div className="three-col mb-20">
        <div className="clickable" onClick={() => setStatFilter(null)}>
          <StatCard icon={ShoppingBag} label="Orders Today" value={String(todaysOrders.length)} sub="Live customer and employee orders" />
        </div>
        <div className="clickable" onClick={() => setStatFilter('pending')}>
          <StatCard icon={UserCheck} label="Pending Proofs" value={String(pendingProofCount)} sub="Orders awaiting production" subDirection="down" />
        </div>
        <div className="clickable" onClick={() => showToast(`Daily revenue: ${peso(dailyRevenue)}`, 'info')}>
          <StatCard icon={DollarSign} label="Revenue (Daily)" value={peso(dailyRevenue)} />
        </div>
      </div>

      <div className="flex-between mb-16">
        <span className="chip-filter active">Main Hub - baliuag <ChevronDown size={13} style={{ marginLeft: 4 }} /></span>
        <div className="flex-row gap-8">
          <button className="btn btn-outline btn-sm" onClick={exportOrders}><Download /> Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingDraft(null); setShowAddOrder(true) }}><Plus /> Add Order</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID/Time</th>
                <th>Customer</th>
                <th>Project Details</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Value</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} className="row-clickable" onClick={() => setStatusOrder(o)}>
                  <td>
                    <div className="cell-primary" style={{ color: 'var(--color-primary)' }}>{o.id}</div>
                    <div className="cell-sub">{o.minutesAgo}</div>
                  </td>
                  <td>
                    <div className="cell-avatar">
                      <span className="avatar-chip round">{o.initials}</span>
                      <div>
                        <div className="cell-primary">{o.customer}</div>
                        <div className="cell-sub">{o.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-primary">{o.project}</div>
                    <div className="cell-sub">{o.details}</div>
                  </td>
                  <td className="text-secondary">{o.branch}</td>
                  <td><span className={`badge ${statusBadge[o.statusType]}`}>{o.status}</span></td>
                  <td className="cell-primary">{o.value}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <ActionMenu
                      items={[
                        { label: 'Edit', icon: Pencil, onClick: () => setEditOrder(o) },
                        { label: 'Change Status', icon: ArrowRightLeft, onClick: () => setStatusOrder(o) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddOrder && (
        <AddOrderModal
          onClose={() => { setShowAddOrder(false); setEditingDraft(null) }}
          onSave={handleSubmitOrder}
          products={products}
          branches={branches}
          onSaveDraft={handleSaveDraft}
          initialDraft={editingDraft}
          drafts={drafts}
          onEditDraft={handleEditDraft}
          onRemoveDraft={handleRemoveDraft}
        />
      )}

      {editOrder && (
        <EditOrderModal
          order={editOrder}
          onClose={() => setEditOrder(null)}
          onSave={handleSaveEditOrder}
        />
      )}

      {viewOrder && (
        <ViewOrderModal order={viewOrder} onClose={() => setViewOrder(null)} />
      )}

      {statusOrder && (
        <EditOrderStatusModal
          order={statusOrder}
          onClose={() => setStatusOrder(null)}
          onSave={handleSaveOrderStatus}
        />
      )}
    </EmployeeLayout>
  )
}
