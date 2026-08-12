import { useNavigate } from 'react-router-dom'
import { Search, Bell, MapPin, Menu } from 'lucide-react'

export default function Topbar({
  title,
  searchPlaceholder = 'Search...',
  locationLabel = 'Baliuag',
  onMenuClick,
  rightSlot,
  notificationsPath = '/notifications',
  hasUnread = false,
}) {
  const navigate = useNavigate()

  return (
    <header className="topbar">
      <div className="flex-row gap-12">
        <button className="icon-btn" onClick={onMenuClick} style={{ display: 'none' }} id="mobile-menu-btn">
          <Menu />
        </button>
        {title ? (
          <span className="topbar-title">{title}</span>
        ) : (
          <div className="topbar-search">
            <Search />
            <input placeholder={searchPlaceholder} />
          </div>
        )}
      </div>

      <div className="topbar-right">
        {rightSlot}
        <span className="pill">
          <MapPin size={13} />
          {locationLabel}
        </span>
        <button className="icon-btn" onClick={() => navigate(notificationsPath)} title="Notifications">
          <Bell />
          {hasUnread && <span className="dot" />}
        </button>
      </div>
    </header>
  )
}
