import { useState } from 'react'
import { ShoppingCart, CreditCard, Sparkles, Megaphone, Trash2, CheckCheck } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import { notifications as seedNotifications } from '../../data/adminMockData.js'
import { useToast } from '../../context/ToastContext.jsx'

const tabs = ['All', 'Orders', 'Payments', 'Promotions', 'Announcements']

const categoryIcon = {
  Orders: ShoppingCart,
  Payments: CreditCard,
  Promotions: Sparkles,
  Announcements: Megaphone,
}

export default function Notifications() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('All')
  const [items, setItems] = useState(seedNotifications)

  const filtered = activeTab === 'All' ? items : items.filter((n) => n.category === activeTab)
  const unreadCount = items.filter((n) => n.unread).length

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
    showToast('All notifications marked as read', 'success')
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  const openItem = (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  }

  return (
    <AdminLayout topbarProps={{ title: 'Notifications' }}>
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
                  <button className="link-btn" onClick={() => openItem(n.id)}>{n.action}</button>
                </div>
              </div>
              <button className="notif-delete" onClick={() => removeItem(n.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </AdminLayout>
  )
}
