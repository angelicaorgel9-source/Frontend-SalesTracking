import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Pencil, Bell, LogOut, Settings, ClipboardList } from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import EditProfileModal from '../../components/customer/modals/EditProfileModal.jsx'
import { useCustomerProfile } from '../../context/CustomerProfileContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { customerOrders, orderSteps } from '../../data/customerMockData.js'

export default function CustomerProfile() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { profile, openEditProfile, showEditProfile, closeEditProfile } = useCustomerProfile()

  const totalOrders = customerOrders.length
  const completedOrders = customerOrders.filter((o) => o.currentStep >= orderSteps.length - 1).length
  const pendingOrders = totalOrders - completedOrders
  const cancelledOrders = 2
  const totalSpending = customerOrders.reduce(
    (sum, o) => sum + o.items.reduce((itemSum, it) => itemSum + it.price, 0) + (o.expressFee || 0),
    0,
  )

  const recentItems = customerOrders.slice(0, 3).map((o) => ({
    orderId: o.id,
    name: o.items[0]?.name,
    qty: o.items[0]?.qty,
    total: o.items.reduce((sum, item) => sum + item.price, 0) + (o.expressFee || 0),
    status: o.currentStep >= orderSteps.length - 1 ? 'Delivered' : orderSteps[o.currentStep],
  }))

  const profileStats = [
    { label: 'Total Orders', value: String(totalOrders) },
    { label: 'Cancelled', value: String(cancelledOrders) },
    { label: 'Pending', value: String(pendingOrders) },
    { label: 'Total Spending', value: `$${totalSpending.toFixed(2)}` },
  ]

  return (
    <CustomerLayout showTopNav={false} showHeaderNewOrder={false}>
      <div className="customer-profile-shell">
        <div className="customer-profile-topbar">
          <div className="customer-profile-brand">MJ Prints</div>
          <div className="customer-profile-topbar-actions">
            <button className="customer-profile-link-btn">Orders</button>
            <button className="icon-btn" title="Notifications" onClick={() => navigate('/customer/notifications')}>
              <Bell />
            </button>
            <button className="icon-btn" title="Settings" onClick={() => navigate('/customer/settings')}>
              <Settings />
            </button>
          </div>
        </div>

        <div className="customer-profile-toolbar">
          <button className="customer-profile-back" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>

          <button className="customer-profile-logout" onClick={() => showToast('You have been logged out.', 'info')}>
            <LogOut size={14} /> Logout
          </button>
        </div>

        <div className="customer-profile-overview">
          <div className="customer-profile-summary-card">
            <div className="customer-profile-summary-main">
              <img src={profile.avatar} alt={profile.name} className="customer-profile-avatar" />
              <div className="customer-profile-meta">
                <div className="customer-profile-name-row">
                  <h2>{profile.name}</h2>
                  <span className="badge badge-neutral">c-001</span>
                </div>
                <p className="customer-profile-note">Premium Client since October 2023</p>
                <div className="customer-profile-badges">
                  <span className="badge badge-info">{profile.role}</span>
                  <span className="badge badge-neutral">Free Shipping Active</span>
                </div>
              </div>
            </div>

            <div className="customer-profile-summary-actions">
              <button className="btn btn-primary btn-sm" onClick={() => showToast('Opening contact options…', 'info')}>
                <Mail size={14} /> Contact
              </button>
              <button className="btn btn-primary btn-sm" onClick={openEditProfile}>
                <Pencil size={14} /> Edit Profile
              </button>
            </div>
          </div>

          <div className="customer-profile-stats">
            {profileStats.map((stat) => (
              <div key={stat.label} className="customer-profile-stat-card">
                <div className="customer-profile-stat-label">{stat.label}</div>
                <div className="customer-profile-stat-value">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="customer-profile-lower-grid">
          <div className="card customer-profile-panel">
            <div className="customer-profile-panel-header">
              <span className="section-title">Personal Information</span>
              <button className="btn btn-outline btn-sm" onClick={openEditProfile}><Pencil size={13} /> Update</button>
            </div>

            <div className="customer-profile-info-grid">
              <div>
                <div className="customer-profile-field-label">Full Name</div>
                <div className="cell-primary customer-profile-field-value">{profile.name}</div>

                <div className="customer-profile-field-label">Phone Number</div>
                <div className="cell-primary customer-profile-field-value">{profile.phone}</div>
              </div>

              <div>
                <div className="customer-profile-field-label">Email Address</div>
                <div className="cell-primary customer-profile-field-value">{profile.email}</div>
              </div>
            </div>
          </div>

          <div className="card customer-profile-panel">
            <div className="customer-profile-panel-header">
              <span className="section-title">Recently Ordered Items</span>
              <ClipboardList size={16} />
            </div>

            <div className="customer-profile-order-list">
              {recentItems.map((item) => (
                <div className="customer-profile-order-item" key={item.orderId}>
                  <div className="customer-profile-order-item-main">
                    <div className="customer-profile-order-thumb">T</div>
                    <div>
                      <div className="customer-profile-order-name">{item.name}</div>
                      <div className="customer-profile-order-meta">Qty: {item.qty}</div>
                    </div>
                  </div>

                  <div className="customer-profile-order-side">
                    <div className="customer-profile-order-price">${item.total.toFixed(2)}</div>
                    <span className={`badge ${item.status === 'Delivered' ? 'badge-success' : 'badge-info'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="customer-profile-order-link-wrap">
              <Link to="/customer/my-orders" className="link-btn">View All Order History</Link>
            </div>
          </div>
        </div>
      </div>

      {showEditProfile && <EditProfileModal onClose={closeEditProfile} />}
    </CustomerLayout>
  )
}
