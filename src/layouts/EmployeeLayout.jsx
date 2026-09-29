import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/employee/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import { api } from '../utils/api.js'

export default function EmployeeLayout({ children, topbarProps }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const v = localStorage.getItem('mje:sidebarCollapsed')
      return v === 'true'
    } catch (e) {
      return false
    }
  })

  const location = useLocation()

  useEffect(() => {
    api.getEmployeeNotifications().then((items) => setHasUnread(items.some((item) => item.unread))).catch(() => setHasUnread(false))
  }, [location.pathname])

  useEffect(() => {
    try {
      localStorage.setItem('mje:sidebarCollapsed', sidebarCollapsed ? 'true' : 'false')
    } catch (e) {
      // ignore
    }
  }, [sidebarCollapsed])

  // Close overlay sidebar on navigation (mobile), but do NOT change collapsed state
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className={`admin-shell ${sidebarCollapsed ? 'collapsed-sidebar' : ''}`} style={{ display: 'flex', alignItems: 'stretch' }}>
      <Sidebar open={sidebarOpen} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="admin-main" style={{ flex: 1 }}>
        <Topbar
          onMenuClick={() => setSidebarOpen((v) => !v)}
          notificationsPath="/employee/notifications"
          hasUnread={hasUnread}
          {...topbarProps}
        />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}
