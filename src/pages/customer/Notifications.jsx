import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, CreditCard, Sparkles, Megaphone, Trash2, CheckCheck } from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'

const tabs = ['All', 'Orders', 'Payments', 'Promotions', 'Announcements']

const categoryIcon = {
  Orders: ShoppingCart,
  Payments: CreditCard,
  Promotions: Sparkles,
  Announcements: Megaphone,
}

export default function Notifications() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('All')
  const [items, setItems] = useState([])

  useEffect(() => {
    api.getCustomerNotifications().then(setItems).catch(() => setItems([]))
  }, [])

  const filtered = activeTab === 'All' ? items : items.filter((n) => n.category === activeTab)
  const unreadCount = items.filter((n) => n.unread).length

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
    api.markCustomerNotificationsRead().catch(() => {})
    showToast('All notifications marked as read', 'success')
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  const openItem = (notification) => {
    setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, unread: false } : n)))
    if (notification.orderId) {
      navigate(`/customer/track-order?id=${encodeURIComponent(notification.orderId)}`)
    }
  }

  return (
    <CustomerLayout>
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Notifications {unreadCount > 0 && <span className="badge badge-danger" style={{ marginLeft: 8 }}>{unreadCount}</span>}
        </h1>
        <button className="link-btn flex-row gap-8" onClick={markAllRead}>
          <CheckCheck size={14} /> Mark all as read
        </button>
      </div>

      <div className="notif-tabs mb-16">
        {tabs.map((t) => (
          <button
            key={t}
            className={`chip-filter${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card card-pad">
        {filtered.length === 0 && (
          <div className="section-sub" style={{ textAlign: 'center', padding: '30px 0' }}>
            No notifications in this category.
          </div>
        )}
        {filtered.map((n) => {
          const Icon = categoryIcon[n.category] || Megaphone
          return (
            <div key={n.id} className={`notif-item${n.unread ? ' unread' : ''}`}>
              {n.unread && <span className="notif-unread-dot" />}
              <span className={`notif-icon ${n.type}`}>
                <Icon size={16} />
              </span>
              <div className="notif-body">
                <div className="notif-top">
                  <span className="notif-title">{n.title}</span>
                  <span className="notif-time">{n.time}</span>
                </div>
                <div className="notif-desc">{n.desc}</div>
                <div className="notif-actions">
                  <button className="link-btn" onClick={() => openItem(n)}>{n.action}</button>
                </div>
              </div>
              <button className="notif-delete" onClick={() => removeItem(n.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </CustomerLayout>
  )
}
