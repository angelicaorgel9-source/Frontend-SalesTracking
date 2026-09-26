const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api'

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
  verifyLogin: (payload) => request('/auth/login/verify/', { method: 'POST', body: JSON.stringify(payload) }),
  resendLoginCode: (payload) => request('/auth/login/resend/', { method: 'POST', body: JSON.stringify(payload) }),
  signup: (payload) => request('/customers/signup/', { method: 'POST', body: JSON.stringify(payload) }),
  getProfile: () => request('/customers/me/'),
  updateProfile: (payload) => request('/customers/me/', { method: 'PATCH', body: JSON.stringify(payload) }),
  getAddresses: () => request('/customers/addresses/'),
  createAddress: (payload) => request('/customers/addresses/', { method: 'POST', body: JSON.stringify(payload) }),
  getProducts: () => request('/products/'),
  getOrders: () => request('/orders/'),
  createOrder: (payload) => request('/orders/', { method: 'POST', body: JSON.stringify(payload) }),
  updateOrder: (transactionId, payload) => request(`/orders/${encodeURIComponent(transactionId)}/edit/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  trackOrder: (transactionId) => request(`/orders/track/${encodeURIComponent(transactionId)}/`),
  getBranches: () => request('/branches/'),
  getCustomerNotifications: () => request('/notifications/customers/'),
  markCustomerNotificationsRead: () => request('/notifications/customers/', { method: 'POST' }),
  getEmployeeDashboard: () => request('/employees/dashboard/'),
  getEmployeeCustomers: () => request('/employees/customers/'),
  getEmployeeNotifications: () => request('/employees/notifications/'),
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