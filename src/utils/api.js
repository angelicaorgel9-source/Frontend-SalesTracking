const API_BASE = import.meta.env.VITE_API_URL || '/api'

const sessionKeys = {
  admin: { token: 'mja:token', user: 'mja:user' },
  employee: { token: 'mje:token', user: 'mje:user' },
  customer: { token: 'mjc:token', user: 'mjc:user' },
}

function getCurrentPortal() {
  const path = window.location.pathname
  if (path.startsWith('/employee/')) return 'employee'
  if (path.startsWith('/admin/')) return 'admin'
  if (['/dashboard', '/orders', '/inventory', '/customers', '/analytics', '/settings', '/user-management', '/payroll', '/notifications', '/profile'].includes(path)) return 'admin'
  return 'customer'
}

function getToken() {
  return localStorage.getItem(sessionKeys[getCurrentPortal()].token)
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Token ${token}`

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = body?.detail || Object.values(body || {}).flatMap((value) => Array.isArray(value) ? value : [typeof value === 'object' ? JSON.stringify(value) : value]).join(' ') || `Request failed (${response.status}).`
    const error = new Error(message)
    error.status = response.status
    error.data = body
    throw error
  }
  return body
}

export const api = {
  login: (payload) => request('/auth/login/', { method: 'POST', body: JSON.stringify(payload) }),
  verifyPassword: (password) => request('/auth/password/verify/', { method: 'POST', body: JSON.stringify({ password }) }),
  changePassword: (current_password, new_password) => request('/auth/password/change/', { method: 'POST', body: JSON.stringify({ current_password, new_password }) }),
  verifyLogin: (payload) => request('/auth/login/verify/', { method: 'POST', body: JSON.stringify(payload) }),
  resendLoginCode: (payload) => request('/auth/login/resend/', { method: 'POST', body: JSON.stringify(payload) }),
  signup: (payload) => request('/customers/signup/', { method: 'POST', body: JSON.stringify(payload) }),
  getProfile: () => request('/customers/me/'),
  getMyProfile: () => request('/users/me/'),
  updateMyProfile: (payload) => request('/users/me/', { method: 'PATCH', body: JSON.stringify(payload) }),
  updateProfile: (payload) => request('/customers/me/', { method: 'PATCH', body: JSON.stringify(payload) }),
  getAddresses: () => request('/customers/addresses/'),
  createAddress: (payload) => request('/customers/addresses/', { method: 'POST', body: JSON.stringify(payload) }),
  getProducts: () => request('/products/'),
  createProduct: (payload) => request('/products/', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/products/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/products/${id}/`, { method: 'DELETE' }),
  getInventory: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/inventory/${query ? `?${query}` : ''}`)
  },
  createInventory: (payload) => request('/inventory/', { method: 'POST', body: JSON.stringify(payload) }),
  updateInventory: (id, payload) => request(`/inventory/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteInventory: (id) => request(`/inventory/${id}/`, { method: 'DELETE' }),
  getOrders: () => request('/orders/'),
  createOrder: (payload) => request('/orders/', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (id) => request(`/orders/${id}/`),
  deleteOrder: (id) => request(`/orders/${id}/`, { method: 'DELETE' }),
  updateOrder: (transactionId, payload) => request(`/orders/${encodeURIComponent(transactionId)}/edit/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updateOrderStatus: (transactionId, status) => request(`/orders/${encodeURIComponent(transactionId)}/status/`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateStaffOrder: (transactionId, payload) => request(`/orders/${encodeURIComponent(transactionId)}/status/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  trackOrder: (transactionId) => request(`/orders/track/${encodeURIComponent(transactionId)}/`),
  getBranches: () => request('/branches/'),
  createBranch: (payload) => request('/branches/', { method: 'POST', body: JSON.stringify(payload) }),
  updateBranch: (id, payload) => request(`/branches/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteBranch: (id) => request(`/branches/${id}/`, { method: 'DELETE' }),
  getEmployees: () => request('/employees/'),
  createEmployee: (payload) => request('/employees/', { method: 'POST', body: JSON.stringify(payload) }),
    updateEmployee: (id, payload) => request(`/employees/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
    getAdminCustomers: () => request('/customers/admin/'),
    createAdminCustomer: (payload) => request('/customers/admin/', { method: 'POST', body: JSON.stringify(payload) }),
    updateAdminCustomer: (id, payload) => request(`/customers/admin/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
    getAdminNotifications: () => request('/notifications/admin/'),
    markAdminNotificationsRead: (ids) => request('/notifications/admin/', { method: 'POST', body: JSON.stringify({ ids }) }),
  getSalesSummary: () => request('/sales/summary/'),
  getSalesAnalytics: (branch, period) => request(`/sales/analytics/?${new URLSearchParams({ branch, period })}`),
  getCustomerNotifications: () => request('/notifications/customers/'),
  markCustomerNotificationsRead: () => request('/notifications/customers/', { method: 'POST' }),
  getEmployeeDashboard: () => request('/employees/dashboard/'),
  getEmployeeCustomers: () => request('/employees/customers/'),
  getEmployeeNotifications: () => request('/employees/notifications/'),
  markEmployeeNotificationsRead: (ids) => request('/employees/notifications/', { method: 'POST', body: JSON.stringify({ ids }) }),
  getMyPayroll: () => request('/payroll/me/'),
  getAdminPayroll: () => request('/payroll/admin/records/'),
  generatePayroll: (payload) => request('/payroll/admin/generate/', { method: 'POST', body: JSON.stringify(payload) }),
  updateAdminPayroll: (id, payload) => request(`/payroll/admin/records/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
}

export function saveSession(data, portal = 'customer') {
  const keys = sessionKeys[portal] || sessionKeys.customer
  localStorage.setItem(keys.token, data.token)
  localStorage.setItem(keys.user, JSON.stringify(data.user))
}

export function clearSession(portal = getCurrentPortal()) {
  const keys = sessionKeys[portal] || sessionKeys.customer
  localStorage.removeItem(keys.token)
  localStorage.removeItem(keys.user)
}