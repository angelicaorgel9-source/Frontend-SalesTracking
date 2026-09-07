import { useNavigate } from 'react-router-dom'
import TopNav from '../components/customer/TopNav.jsx'
import NewOrderModal from '../components/customer/modals/NewOrderModal.jsx'
import EditProfileModal from '../components/customer/modals/EditProfileModal.jsx'
import { useCustomerProfile } from '../context/CustomerProfileContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { customerNotifications } from '../data/customerMockData.js'
import { useState } from 'react'

export default function CustomerLayout({
  children,
  contentClassName = '',
  showHeaderNewOrder = true,
  showFooterNewOrder = false,
  showTopNav = true,
}) {
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
      {showTopNav && <TopNav hasUnread={hasUnread} onNewOrder={() => setShowNewOrder(true)} showNewOrderButton={showHeaderNewOrder} />}
      <div className={`customer-content ${contentClassName}`}>{children}</div>

      <footer className="customer-footer">
        <div className="customer-footer-brand">MJ Prints</div>

        <div className="customer-footer-links">
          <span className="link-btn" onClick={() => navigate('/customer/home')}>Home</span>
          <span className="link-btn" onClick={() => navigate('/customer/my-orders')}>My Orders</span>
          <span className="link-btn" onClick={() => navigate('/customer/track-order')}>Track Order</span>
          <span className="link-btn" onClick={() => navigate('/customer/products-services')}>Products and Services</span>
        </div>

        {showFooterNewOrder && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewOrder(true)}>
            New Order
          </button>
        )}
      </footer>

      {showNewOrder && <NewOrderModal onClose={() => setShowNewOrder(false)} onSave={handleSaveOrder} />}
      {showEditProfile && <EditProfileModal onClose={closeEditProfile} />}
    </div>
  )
}
