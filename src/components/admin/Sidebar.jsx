import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, ShoppingCart, Package, Users, BarChart3, Settings,
  UserCog, Wallet, ChevronLeft, ChevronRight,
} from 'lucide-react'
import logo from '../../assets/logo.png'
import { useAdminProfile } from '../../context/AdminProfileContext.jsx'
import EditProfileModal from './modals/EditProfileModal.jsx'

const mainLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const teamLinks = [
  { to: '/user-management', label: 'User Management', icon: UserCog },
  { to: '/payroll', label: 'Payroll', icon: Wallet },
]

export default function Sidebar({ open, collapsed = false, setCollapsed = () => {} }) {
  const { profile, showEditProfile, closeEditProfile } = useAdminProfile()
  const navigate = useNavigate()
  return (
    <aside className={`sidebar${open ? ' open' : ''}${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'space-between' : 'space-between', width: '100%', padding: collapsed ? '10px 12px' : '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={logo} alt="MJ Prints" style={{ height: 28 }} />
          {!collapsed && (
            <div className="sidebar-brand-text">
              <strong>MJ Prints</strong>
              <span>Admin Portal</span>
            </div>
          )}
        </div>
        <button
          className="icon-btn"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((v) => !v)}
          style={{ border: 'none', marginLeft: 'auto' }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {mainLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon />
            {!collapsed && label}
            {collapsed && <span className="sidebar-tooltip">{label}</span>}
          </NavLink>
        ))}

        <div className="sidebar-section-label">Team &amp; Security</div>
        {teamLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon />
            {!collapsed && label}
            {collapsed && <span className="sidebar-tooltip">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div
        className="sidebar-footer clickable"
        onClick={() => navigate('/profile')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <div className="sidebar-avatar">
          <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
        </div>
        {!collapsed && (
          <div className="sidebar-footer-text">
            <strong>{profile.name}</strong>
            <span>{profile.role}</span>
          </div>
        )}
        {collapsed && <span className="sidebar-tooltip">{profile.name}</span>}
      </div>
      {showEditProfile && <EditProfileModal onClose={closeEditProfile} />}
    </aside>
  )
}
