import { useNavigate } from 'react-router-dom'
import TopNav from '../components/customer/TopNav.jsx'
import NewOrderModal from '../components/customer/modals/NewOrderModal.jsx'
import EditProfileModal from '../components/customer/modals/EditProfileModal.jsx'
import { useCustomerProfile } from '../context/CustomerProfileContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { customerNotifications } from '../data/customerMockData.js'
import { useState } from 'react'

export default function CustomerLayout({ children, contentClassName = '' }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { showEditProfile, closeEditProfile } = useCustomerProfile()
  const [showNewOrder, setShowNewOrder] = useState(false)
  const hasUnread = customerNotifications.some((n) => n.unread)

  const handleSaveOrder = (order) => {
    setShowNewOrder(false)
    showToast(`Order for ${order.product.name} submitted successfully!`, 'success')
    navigate('/customer/my-orders')
  }

  return (
    <div className="customer-shell">
      <TopNav hasUnread={hasUnread} onNewOrder={() => setShowNewOrder(true)} />
      <div className={`customer-content ${contentClassName}`}>{children}</div>

      <footer className="customer-footer">
        <div className="customer-footer-brand">MJ Prints</div>
        <div className="customer-footer-copy">© 2024 MJ Prints Advertising. All rights reserved.</div>
        <div className="customer-footer-links">
          <span className="link-btn" onClick={() => showToast('Opening Contact Us…', 'info')}>Contact Us</span>
          <span className="link-btn" onClick={() => showToast('Opening Terms of Service…', 'info')}>Terms of Service</span>
          <span className="link-btn" onClick={() => showToast('Opening Privacy Policy…', 'info')}>Privacy Policy</span>
        </div>
      </footer>

      {showNewOrder && <NewOrderModal onClose={() => setShowNewOrder(false)} onSave={handleSaveOrder} />}
      {showEditProfile && <EditProfileModal onClose={closeEditProfile} />}
    </div>
  )
}
