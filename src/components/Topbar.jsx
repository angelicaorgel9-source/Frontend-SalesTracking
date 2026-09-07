import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, MapPin, Menu } from 'lucide-react'

export default function Topbar({
  title,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearch,
  locationLabel = 'Baliuag',
  onMenuClick,
  rightSlot,
  notificationsPath = '/notifications',
  hasUnread = false,
}) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(searchValue)

  useEffect(() => {
    setQuery(searchValue)
  }, [searchValue])

  const handleSearchChange = (event) => {
    const nextQuery = event.target.value
    setQuery(nextQuery)
    if (typeof onSearch === 'function') {
      onSearch(nextQuery)
    }
  }

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
            <input placeholder={searchPlaceholder} value={query} onChange={handleSearchChange} />
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
