import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, Settings, Plus } from 'lucide-react'
import logo from '../../assets/logo.png'
import { useCustomerProfile } from '../../context/CustomerProfileContext.jsx'

const navLinks = [
  { to: '/customer/home', label: 'Home' },
  { to: '/customer/my-orders', label: 'My Orders' },
  { to: '/customer/track-order', label: 'Track Order' },
  { to: '/customer/products-services', label: 'Products and Services' },
]

export default function TopNav({ hasUnread = false, onNewOrder = () => {} }) {
  const navigate = useNavigate()
  const { profile } = useCustomerProfile()

  return (
    <header className="customer-topnav">
      <div className="customer-topnav-brand" onClick={() => navigate('/customer/home')}>
        <img src={logo} alt="MJ Prints" />
        <div className="customer-topnav-brand-text">
          <strong>MJ</strong>
          <span>MJ Prints</span>
        </div>
      </div>

      <nav className="customer-topnav-links">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `customer-topnav-link${isActive ? ' active' : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="customer-topnav-right">
        <button className="btn btn-primary btn-sm" onClick={onNewOrder}>
          <Plus size={14} /> New Order
        </button>
        <button className="icon-btn" title="Notifications" onClick={() => navigate('/customer/notifications')}>
          <Bell />
          {hasUnread && <span className="dot" />}
        </button>
        <button className="icon-btn" title="Settings" onClick={() => navigate('/customer/settings')}>
          <Settings />
        </button>
        <button className="customer-topnav-avatar" onClick={() => navigate('/customer/profile')} title={profile.name}>
          <img src={profile.avatar} alt={profile.name} />
        </button>
      </div>
    </header>
  )
}
