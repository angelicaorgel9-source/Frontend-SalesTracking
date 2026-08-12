import { Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/customer/login" replace />} />
      <Route path="/login" element={<Login portal="customer" />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route path="/customer/login" element={<CustomerLogin />} />

      {/* ---------- Admin portal ---------- */}
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

      {/* ---------- Employee portal ---------- */}
      <Route
        path="/employee/dashboard"
        element={<EmployeeProfileProvider><EmployeeDashboard /></EmployeeProfileProvider>}
      />
      <Route
        path="/employee/orders"
        element={<EmployeeProfileProvider><EmployeeOrders /></EmployeeProfileProvider>}
      />
      <Route
        path="/employee/customers"
        element={<EmployeeProfileProvider><EmployeeCustomers /></EmployeeProfileProvider>}
      />
      <Route
        path="/employee/payroll"
        element={<EmployeeProfileProvider><EmployeePayroll /></EmployeeProfileProvider>}
      />
      <Route
        path="/employee/notifications"
        element={<EmployeeProfileProvider><EmployeeNotifications /></EmployeeProfileProvider>}
      />
      <Route
        path="/employee/profile"
        element={<EmployeeProfileProvider><EmployeeProfile /></EmployeeProfileProvider>}
      />

      {/* ---------- Customer portal ---------- */}
      <Route path="/customer/signup" element={<CustomerSignUp />} />
      <Route
        path="/customer/home"
        element={<CustomerProfileProvider><CustomerHome /></CustomerProfileProvider>}
      />
      <Route
        path="/customer/profile"
        element={<CustomerProfileProvider><CustomerProfile /></CustomerProfileProvider>}
      />
      <Route
        path="/customer/products-services"
        element={<CustomerProfileProvider><CustomerProductsServices /></CustomerProfileProvider>}
      />
      <Route
        path="/customer/track-order"
        element={<CustomerProfileProvider><CustomerTrackOrder /></CustomerProfileProvider>}
      />
      <Route
        path="/customer/my-orders"
        element={<CustomerProfileProvider><CustomerMyOrders /></CustomerProfileProvider>}
      />
      <Route
        path="/customer/notifications"
        element={<CustomerProfileProvider><CustomerNotifications /></CustomerProfileProvider>}
      />
      <Route
        path="/customer/settings"
        element={<CustomerProfileProvider><CustomerSettings /></CustomerProfileProvider>}
      />

      <Route path="*" element={<Navigate to="/customer/login" replace />} />
    </Routes>
  )
}
