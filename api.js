const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

function getToken() {
  return localStorage.getItem('mjc:token')
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
}

export function saveSession(data) {
  localStorage.setItem('mjc:token', data.token)
  localStorage.setItem('mjc:user', JSON.stringify(data.user))
}

export function clearSession() {
  localStorage.removeItem('mjc:token')
  localStorage.removeItem('mjc:user')
}