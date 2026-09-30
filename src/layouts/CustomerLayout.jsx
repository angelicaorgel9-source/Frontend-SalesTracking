import { useNavigate } from 'react-router-dom'
import TopNav from '../components/customer/TopNav.jsx'
import NewOrderModal from '../components/customer/modals/NewOrderModal.jsx'
import EditProfileModal from '../components/customer/modals/EditProfileModal.jsx'
import { useCustomerProfile } from '../context/CustomerProfileContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { api } from '../utils/api.js'
import { useEffect, useState } from 'react'

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
  const [hasUnread, setHasUnread] = useState(false)
  const [products, setProducts] = useState([])

  useEffect(() => {
    const refreshNotifications = () => {
      api.getCustomerNotifications()
        .then((notifications) => setHasUnread(notifications.some((notification) => notification.unread)))
        .catch(() => setHasUnread(false))
    }
    refreshNotifications()
    const intervalId = window.setInterval(refreshNotifications, 15000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    api.getProducts()
      .then((items) => setProducts(items.map((product) => ({
        ...product,
        id: String(product.id),
        price: Number(product.price),
        priceUnit: 'unit',
        sizes: ['Standard', 'Custom'],
        materials: ['Standard', 'Premium'],
      }))))
      .catch(() => setProducts([]))
  }, [])

  const handleSaveOrder = async (order) => {
    try {
      const saved = await api.createOrder({
        branch: order.branchId,
        branch_id: order.branchId,
        branch_code: order.branchCode,
        customer_name: order.customer.name,
        customer_phone: order.customer.contact,
        customer_email: order.customer.email,
        fulfillment_method: order.fulfillmentMethod,
        delivery_address: order.deliveryAddress,
        payment_method: order.payment,
        items: [{
          product: order.product.service_id || order.product.id,
          item_name: order.product.name,
          quantity: order.quantity,
          unit_price: order.product.price,
          size: order.size,
          material: order.material,
          specifications: order.notes,
        }],
      })
      setShowNewOrder(false)
      showToast(`Order ${saved.transaction_id} submitted successfully!`, 'success')
      navigate('/customer/my-orders')
    } catch (error) {
      showToast(error.message, 'error')
    }
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

      {showNewOrder && <NewOrderModal products={products} onClose={() => setShowNewOrder(false)} onSave={handleSaveOrder} />}
      {showEditProfile && <EditProfileModal onClose={closeEditProfile} />}
    </div>
  )
}
