import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, UserCheck, DollarSign, Download, Plus, ChevronDown, LayoutGrid, List, Pencil, Eye } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import ActionMenu from '../../components/ActionMenu.jsx'
import AddOrderModal from '../../components/admin/modals/AddOrderModal.jsx'
import EditOrderModal from '../../components/admin/modals/EditOrderModal.jsx'
import ViewOrderModal from '../../components/admin/modals/ViewOrderModal.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'
import { downloadCsv } from '../../utils/csv.js'

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
  const navigate = useNavigate()
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

  const refreshOrders = async () => {
    const records = await api.getOrders()
    setOrders(records.map((order) => {
      const item = order.items?.[0]
      const status = {
        PLACED: 'Pending Proof',
        DESIGNING: 'In Production',
        PRINTING: 'Printing',
        READY: order.fulfillment_method === 'PICKUP' ? 'Ready for Pickup' : 'Ready for Delivery',
        PICKED_UP: 'Order Picked Up',
        DELIVERED: 'Order Delivered',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
      }[order.status] || order.status
      return {
        ...order,
        id: order.transaction_id,
        minutesAgo: order.created_at ? new Date(order.created_at).toLocaleString() : '—',
        customer: order.customer_name,
        initials: (order.customer_name || 'NC').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        email: order.customer_email || '',
        project: item?.product_name || item?.item_name || 'Print Order',
        details: `${order.items?.reduce((sum, row) => sum + Number(row.quantity || 0), 0) || 0} unit(s)`,
        branch: order.branch_name || 'Unassigned',
        status,
        statusType: ['PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(order.status) ? 'success' : order.status === 'PRINTING' || order.status === 'DESIGNING' ? 'danger' : 'warning',
        backendStatus: order.status,
        value: `₱${Number(order.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
        totalAmount: Number(order.total_amount || 0),
      }
    }))
  }

  useEffect(() => {
    Promise.all([refreshOrders(), api.getProducts().then(setProducts), api.getBranches().then(setBranches)])
      .catch((error) => showToast(error.message, 'error'))
  }, [showToast])

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
      await refreshOrders()
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
      const status = {
        'Pending Proof': 'PLACED',
        Printing: 'PRINTING',
        'In Production': 'DESIGNING',
        'Ready for Pickup': 'READY',
        'Ready for Delivery': 'READY',
        'Order Picked Up': 'PICKED_UP',
        'Order Delivered': 'DELIVERED',
        Completed: 'COMPLETED',
      }[updated.status]
      await api.updateStaffOrder(updated.id, {
        customer_name: updated.customerName,
        status,
        estimated_completion: updated.dueDate || null,
        total_amount: Number(updated.value || 0),
      })
      await refreshOrders()
      setEditOrder(null)
      showToast('Order updated successfully', 'success')
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
    const createdAt = o.created_at ? new Date(o.created_at) : null
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
  const today = new Date().toDateString()
  const todayOrders = orders.filter((order) => order.created_at && new Date(order.created_at).toDateString() === today)
  const pendingProofs = orders.filter((order) => order.backendStatus === 'PLACED')
  const dailyRevenue = todayOrders.filter((order) => order.backendStatus !== 'CANCELLED').reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)

  const exportOrders = () => {
    downloadCsv({
      filename: 'orders.csv',
      columns: ['Transaction ID', 'Customer', 'Email', 'Branch', 'Status', 'Total', 'Created At'],
      rows: filteredOrders.map((order) => [order.id, order.customer, order.email, order.branch, order.status, order.totalAmount, order.created_at]),
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
    <AdminLayout
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
          <button className={`chip-filter${statusFilter !== statusOptions[0] ? ' active' : ''}`} onClick={() => setShowFiltersDropdown((v) => !v)}>
            {statusFilter}
          </button>
          <button className={`chip-filter${branchFilter !== branchOptions[0] ? ' active' : ''}`} onClick={() => setShowFiltersDropdown((v) => !v)}>
            {branchFilter}
          </button>
          <button className={`chip-filter${dateFilter !== dateOptions[0] ? ' active' : ''}`} onClick={() => setShowFiltersDropdown((v) => !v)}>
            {dateFilter}
          </button>
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
                  {branches.map((branch) => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
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
          <StatCard icon={ShoppingBag} label="Orders Today" value={String(todayOrders.length)} sub="Live order count" />
        </div>
        <div className="clickable" onClick={() => setStatFilter('pending')}>
          <StatCard icon={UserCheck} label="Pending Proofs" value={String(pendingProofs.length)} sub="Awaiting production" />
        </div>
        <div className="clickable" onClick={() => navigate('/analytics')}>
          <StatCard icon={DollarSign} label="Revenue (Daily)" value={`₱${dailyRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
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
                <tr key={o.id} className="row-clickable" onClick={() => setViewOrder(o)}>
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
                        { label: 'View', icon: Eye, onClick: () => setViewOrder(o) },
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
    </AdminLayout>
  )
}
