import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Lock, Mail, Phone, User, UserRound } from 'lucide-react'

const defaultStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('mjc:customer-accounts') || '[]')
  } catch (error) {
    return []
  }
}

export default function CustomerSignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const { fullName, email, phone, password, confirmPassword } = form

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError('Please complete all required fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!agree) {
      setError('Please accept the Terms of Service and Privacy Policy.')
      return
    }

    const accounts = defaultStorage()
    const duplicate = accounts.some(
      (account) => account.email.trim().toLowerCase() === email.trim().toLowerCase(),
    )

    if (duplicate) {
      setError('This email is already registered.')
      return
    }

    const nextAccount = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      username: email.trim().split('@')[0],
      password,
    }

    localStorage.setItem('mjc:customer-accounts', JSON.stringify([...accounts, nextAccount]))
    localStorage.setItem('mjc:profile', JSON.stringify({
      name: nextAccount.fullName,
      email: nextAccount.email,
      phone: nextAccount.phone,
      role: 'Customer',
      avatar: '/src/assets/logo.png',
    }))

    setSuccess('Account created successfully. Redirecting to login...')
    setForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    })
    setAgree(false)

    setTimeout(() => navigate('/login'), 700)
  }

  return (
    <div className="customer-signup-shell">
      <div className="customer-signup-center">
        <div className="customer-signup-card">
          <h1>Create an Account</h1>

          <form onSubmit={handleSubmit}>
            <div className="customer-signup-field">
              <label htmlFor="fullName">Full Name</label>
              <div className="customer-signup-input-wrap">
                <UserRound size={15} />
                <input id="fullName" placeholder="John Doe" value={form.fullName} onChange={updateField('fullName')} />
              </div>
            </div>

            <div className="customer-signup-field">
              <label htmlFor="email">Email Address</label>
              <div className="customer-signup-input-wrap">
                <Mail size={15} />
                <input id="email" type="email" placeholder="john@example.com" value={form.email} onChange={updateField('email')} />
              </div>
            </div>

            <div className="customer-signup-field">
              <label htmlFor="phone">Phone Number</label>
              <div className="customer-signup-input-wrap">
                <Phone size={15} />
                <input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={updateField('phone')} />
              </div>
            </div>

            <div className="customer-signup-field">
              <label htmlFor="password">Password</label>
              <div className="customer-signup-input-wrap">
                <Lock size={15} />
                <input id="password" type="password" placeholder="••••••••" value={form.password} onChange={updateField('password')} />
              </div>
            </div>

            <div className="customer-signup-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="customer-signup-input-wrap">
                <Lock size={15} />
                <input id="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={updateField('confirmPassword')} />
              </div>
            </div>

            <label className="customer-signup-terms">
              <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
              <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy.</a></span>
            </label>

            {error && <div className="login-error">{error}</div>}
            {success && <div className="signup-success">{success}</div>}

            <button type="submit" className="customer-signup-btn">
              Create Account <ArrowRight size={16} />
            </button>
          </form>

          <div className="customer-signup-login">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>

        <div className="customer-signup-ornament" aria-hidden="true" />
      </div>
    </div>
  )
}
