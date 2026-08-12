import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import logo from '../assets/logo.png'
import ForgotPasswordModal from '../components/ForgotPasswordModal.jsx'

function getCustomerAccounts() {
  try {
    return JSON.parse(localStorage.getItem('mjc:customer-accounts') || '[]')
  } catch (error) {
    return []
  }
}

// Usernames/IDs that start with "MJP-A" (case-insensitive) land in the Admin
// Portal, "MJP-E" lands in the Employee Portal. Everything else (e.g. a
// regular customer email or username) is treated as a Customer account and
// lands in the Customer Portal.
function resolvePortal(username) {
  const normalized = username.trim().toUpperCase()
  if (normalized.startsWith('MJP-A')) return 'admin'
  if (normalized.startsWith('MJP-E')) return 'employee'
  return 'customer'
}

export default function Login({ portal = 'customer' }) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoginError('')

    if (portal === 'customer') {
      const trimmedUsername = username.trim()
      const customerAccounts = getCustomerAccounts()
      const matchingCustomer = customerAccounts.find(
        (entry) => entry.username.trim().toLowerCase() === trimmedUsername.toLowerCase(),
      )

      if (matchingCustomer) {
        if (matchingCustomer.password !== password) {
          setLoginError('Incorrect password for this customer account.')
          return
        }
        navigate('/customer/home')
        return
      }

      const customerFallback = resolvePortal(username)
      if (customerFallback === 'customer') {
        setLoginError('Customer account not found. Please sign up first.')
        return
      }
    }

    const targetPortal = portal === 'admin' ? 'admin' : portal === 'employee' ? 'employee' : resolvePortal(username)
    if (targetPortal === 'admin') navigate('/dashboard')
    else if (targetPortal === 'employee') navigate('/employee/dashboard')
    else navigate('/customer/home')
  }

  return (
    <div className="customer-login-shell">
      <div className="customer-login-panel-wrap">
        <div className="customer-login-panel">
          <div className="customer-login-logo-wrap">
            <div className="customer-login-logo">
              <img src={logo} alt="MJ Prints" />
            </div>
          </div>

          <div className="customer-login-heading">
            <h1>Welcome back</h1>
            <p>Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="customer-login-form">
            <div className="customer-login-field">
              <label htmlFor="username">Username</label>
              <div className="customer-login-input-wrap">
                <User size={15} />
                <input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="customer-login-field">
              <label htmlFor="password">Password</label>
              <div className="customer-login-input-wrap">
                <Lock size={15} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {showPassword ? (
                  <EyeOff className="customer-login-visibility" onClick={() => setShowPassword(false)} />
                ) : (
                  <Eye className="customer-login-visibility" onClick={() => setShowPassword(true)} />
                )}
              </div>
            </div>

            {loginError && <div className="login-error">{loginError}</div>}

            <div className="customer-login-row-between">
              <label className="customer-login-remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember Me
              </label>
              <button
                type="button"
                className="customer-login-forgot"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="customer-login-submit">
              Login
            </button>

            {portal === 'customer' && (
              <>
                <div className="customer-login-divider"><span>or sign up with</span></div>

                <button type="button" className="customer-google-btn">
                  <svg className="google-g-icon" viewBox="0 0 48 48" aria-label="Google logo" role="img" focusable="false">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.82-6.82C35.96 2.62 30.58 0 24 0 14.62 0 6.45 5.38 2.56 13.22l7.98 6.2C12.13 13.72 17.55 9.5 24 9.5Z" />
                    <path fill="#4285F4" d="M46.5 24.55c0-1.64-.15-3.22-.43-4.74H24v9h12.72c-.55 2.96-2.23 5.47-4.76 7.17l7.7 5.97C43.78 37.1 46.5 31.3 46.5 24.55Z" />
                    <path fill="#FBBC05" d="M32.96 36.82c-2.06 1.38-4.7 2.18-8.96 2.18-6.52 0-12.08-4.28-14.08-10.03l-7.98 6.2C4.22 42.33 13.16 48 24 48c7.34 0 13.52-2.41 18.02-6.57l-9.06-4.61Z" />
                    <path fill="#34A853" d="M10.92 29.97A14.66 14.66 0 0 1 9.5 24c0-1.55.27-3.05.75-4.47L1.27 13.33A23.85 23.85 0 0 0 0 24c0 3.84.92 7.48 2.56 10.72l8.36-4.75Z" />
                  </svg>
                  Sign in with Google
                </button>

                <div className="customer-login-footer-row">
                  <span>Don't have an account? <Link to="/customer/signup">Sign up here</Link></span>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal portal={portal} onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  )
}
