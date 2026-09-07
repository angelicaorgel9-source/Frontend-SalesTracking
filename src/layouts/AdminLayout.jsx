import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/admin/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import { notifications } from '../data/adminMockData.js'

export default function AdminLayout({ children, topbarProps }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const v = localStorage.getItem('mj:sidebarCollapsed')
      return v === 'true'
    } catch (e) {
      return false
    }
  })

  const location = useLocation()

  useEffect(() => {
    try {
      localStorage.setItem('mj:sidebarCollapsed', sidebarCollapsed ? 'true' : 'false')
    } catch (e) {
      // ignore
    }
  }, [sidebarCollapsed])

  // Close overlay sidebar on navigation (mobile), but do NOT change collapsed state
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const hasUnread = notifications.some((n) => n.unread)

  return (
    <div className={`admin-shell ${sidebarCollapsed ? 'collapsed-sidebar' : ''}`} style={{ display: 'flex', alignItems: 'stretch' }}>
      <Sidebar open={sidebarOpen} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="admin-main" style={{ flex: 1 }}>
        <Topbar
          onMenuClick={() => setSidebarOpen((v) => !v)}
          notificationsPath="/notifications"
          hasUnread={hasUnread}
          {...topbarProps}
        />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}
