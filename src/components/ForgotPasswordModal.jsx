import { useState } from 'react'
import { Mail, ShieldCheck } from 'lucide-react'
import Modal from './Modal.jsx'

export default function ForgotPasswordModal({ onClose, portal = 'customer' }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
  }

  return (
    <Modal
      title="Forgot Password"
      subtitle={portal === 'customer' ? 'Reset your customer account password.' : 'Reset your portal password.'}
      onClose={onClose}
      size="sm"
      headerVariant="white"
      actions={
        <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
          Close
        </button>
      }
    >
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-16">
            <label className="field-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={15} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="info-note">
            <ShieldCheck size={16} />
            We will send a password reset link to your registered email.
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Send Reset Link
          </button>
        </form>
      ) : (
        <div>
          <div className="success-box">
            <ShieldCheck size={18} />
            Password reset instructions were sent to <strong>{email}</strong>.
          </div>
          <button className="btn btn-primary btn-full" onClick={onClose}>
            Back to Login
          </button>
        </div>
      )}
    </Modal>
  )
}
