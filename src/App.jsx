import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AdminLogin from './pages/admin/Login.jsx'
import EmployeeLogin from './pages/employee/Login.jsx'
import CustomerLogin from './pages/customer/Login.jsx'

import { AdminProfileProvider } from './context/AdminProfileContext.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminOrders from './pages/admin/Orders.jsx'
import AdminInventory from './pages/admin/Inventory.jsx'
import AdminCustomers from './pages/admin/Customers.jsx'
import AdminAnalytics from './pages/admin/Analytics.jsx'
import AdminSettings from './pages/admin/Settings.jsx'
import AdminUserManagement from './pages/admin/UserManagement.jsx'
import AdminPayroll from './pages/admin/Payroll.jsx'
import AdminNotifications from './pages/admin/Notifications.jsx'
import AdminProfile from './pages/admin/Profile.jsx'

import { EmployeeProfileProvider } from './context/EmployeeProfileContext.jsx'
import EmployeeDashboard from './pages/employee/Dashboard.jsx'
import EmployeeOrders from './pages/employee/Orders.jsx'
import EmployeeCustomers from './pages/employee/Customers.jsx'
import EmployeePayroll from './pages/employee/Payroll.jsx'
import EmployeeNotifications from './pages/employee/Notifications.jsx'
import EmployeeProfile from './pages/employee/Profile.jsx'

import { CustomerProfileProvider } from './context/CustomerProfileContext.jsx'
import CustomerHome from './pages/customer/Home.jsx'
import CustomerProfile from './pages/customer/Profile.jsx'
import CustomerSignUp from './pages/customer/SignUp.jsx'
import CustomerProductsServices from './pages/customer/ProductsServices.jsx'
import CustomerTrackOrder from './pages/customer/TrackOrder.jsx'
import CustomerMyOrders from './pages/customer/MyOrders.jsx'
import CustomerNotifications from './pages/customer/Notifications.jsx'
import CustomerSettings from './pages/customer/Settings.jsx'

function CustomerRoute({ children }) {
  return localStorage.getItem('mjc:token') ? children : <Navigate to="/customer/signup" replace />
}

function EmployeeRoute({ children }) {
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('mje:user') || 'null')
  } catch {
    user = null
  }
  return localStorage.getItem('mje:token') && user?.role === 'EMPLOYEE' ? children : <Navigate to="/employee/login" replace />
}

function AdminRoute() {
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('mja:user') || 'null')
  } catch {
    user = null
  }
  const hasAdminAccess = user?.role === 'ADMIN' || user?.is_superuser
  return localStorage.getItem('mja:token') && hasAdminAccess
    ? <Outlet />
    : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/customer/signup" replace />} />
      <Route path="/login" element={<Login portal="customer" />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route path="/customer/login" element={<CustomerLogin />} />

      {/* ---------- Admin portal ---------- */}
      <Route element={<AdminRoute />}>
      <Route
        path="/dashboard"
        element={<AdminProfileProvider><AdminDashboard /></AdminProfileProvider>}
      />
      <Route
        path="/orders"
        element={<AdminProfileProvider><AdminOrders /></AdminProfileProvider>}
      />
      <Route
        path="/inventory"
        element={<AdminProfileProvider><AdminInventory /></AdminProfileProvider>}
      />
      <Route
        path="/customers"
        element={<AdminProfileProvider><AdminCustomers /></AdminProfileProvider>}
      />
      <Route
        path="/analytics"
        element={<AdminProfileProvider><AdminAnalytics /></AdminProfileProvider>}
      />
      <Route
        path="/settings"
        element={<AdminProfileProvider><AdminSettings /></AdminProfileProvider>}
      />
      <Route
        path="/user-management"
        element={<AdminProfileProvider><AdminUserManagement /></AdminProfileProvider>}
      />
      <Route
        path="/payroll"
        element={<AdminProfileProvider><AdminPayroll /></AdminProfileProvider>}
      />
      <Route
        path="/notifications"
        element={<AdminProfileProvider><AdminNotifications /></AdminProfileProvider>}
      />
      <Route
        path="/profile"
        element={<AdminProfileProvider><AdminProfile /></AdminProfileProvider>}
      />
      </Route>

      {/* ---------- Employee portal ---------- */}
      <Route
        path="/employee/dashboard"
        element={<EmployeeRoute><EmployeeProfileProvider><EmployeeDashboard /></EmployeeProfileProvider></EmployeeRoute>}
      />
      <Route
        path="/employee/orders"
        element={<EmployeeRoute><EmployeeProfileProvider><EmployeeOrders /></EmployeeProfileProvider></EmployeeRoute>}
      />
      <Route
        path="/employee/customers"
        element={<EmployeeRoute><EmployeeProfileProvider><EmployeeCustomers /></EmployeeProfileProvider></EmployeeRoute>}
      />
      <Route
        path="/employee/payroll"
        element={<EmployeeRoute><EmployeeProfileProvider><EmployeePayroll /></EmployeeProfileProvider></EmployeeRoute>}
      />
      <Route
        path="/employee/notifications"
        element={<EmployeeRoute><EmployeeProfileProvider><EmployeeNotifications /></EmployeeProfileProvider></EmployeeRoute>}
      />
      <Route
        path="/employee/profile"
        element={<EmployeeRoute><EmployeeProfileProvider><EmployeeProfile /></EmployeeProfileProvider></EmployeeRoute>}
      />

      {/* ---------- Customer portal ---------- */}
      <Route path="/customer/signup" element={<CustomerSignUp />} />
      <Route
        path="/customer/home"
        element={<CustomerRoute><CustomerProfileProvider><CustomerHome /></CustomerProfileProvider></CustomerRoute>}
      />
      <Route
        path="/customer/profile"
        element={<CustomerRoute><CustomerProfileProvider><CustomerProfile /></CustomerProfileProvider></CustomerRoute>}
      />
      <Route
        path="/customer/products-services"
        element={<CustomerRoute><CustomerProfileProvider><CustomerProductsServices /></CustomerProfileProvider></CustomerRoute>}
      />
      <Route
        path="/customer/track-order"
        element={<CustomerRoute><CustomerProfileProvider><CustomerTrackOrder /></CustomerProfileProvider></CustomerRoute>}
      />
      <Route
        path="/customer/my-orders"
        element={<CustomerRoute><CustomerProfileProvider><CustomerMyOrders /></CustomerProfileProvider></CustomerRoute>}
      />
      <Route
        path="/customer/notifications"
        element={<CustomerRoute><CustomerProfileProvider><CustomerNotifications /></CustomerProfileProvider></CustomerRoute>}
      />
      <Route
        path="/customer/settings"
        element={<CustomerRoute><CustomerProfileProvider><CustomerSettings /></CustomerProfileProvider></CustomerRoute>}
      />

      <Route path="*" element={<Navigate to="/customer/signup" replace />} />
    </Routes>
  )
}
