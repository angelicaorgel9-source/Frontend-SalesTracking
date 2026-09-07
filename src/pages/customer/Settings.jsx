import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, MapPin, CreditCard, Plus, Pencil, Trash2, ShieldCheck, Download, Laptop, Smartphone,
} from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import ChangePasswordModal from '../../components/customer/modals/ChangePasswordModal.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import { useCustomerProfile } from '../../context/CustomerProfileContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { customerAddresses, customerPaymentMethods, customerDevices } from '../../data/customerMockData.js'

const deviceIcon = { Laptop, Smartphone }

export default function Settings() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { profile, updateProfile } = useCustomerProfile()

  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone)
  const [dirty, setDirty] = useState(false)

  const [twoFactor, setTwoFactor] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [addresses] = useState(customerAddresses)
  const [payments] = useState(customerPaymentMethods)

  const handleField = (setter) => (e) => {
    setter(e.target.value)
    setDirty(true)
  }

  const handleSave = () => {
    updateProfile({ name: name.trim(), phone: phone.trim() })
    setDirty(false)
    showToast('Account settings saved.', 'success')
  }

  const handleCancel = () => {
    setName(profile.name)
    setEmail(profile.email)
    setPhone(profile.phone)
    setDirty(false)
  }

  return (
    <CustomerLayout>
      <button className="icon-btn mb-16" onClick={() => navigate(-1)} style={{ border: 'none' }}>
        <ArrowLeft />
      </button>
      <h1 className="page-title mb-20">Settings</h1>

      <div className="two-col" style={{ gridTemplateColumns: '1.3fr 1fr', alignItems: 'start', gap: 20 }}>
        <div>
          <div className="card card-pad mb-20">
            <div className="flex-row gap-10 mb-16">
              <User size={16} />
              <span className="section-title">Account Settings</span>
            </div>
            <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="field">
                <label>Full Name</label>
                <input className="input" value={name} onChange={handleField(setName)} />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input className="input" value={email} disabled />
              </div>
            </div>
            <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Phone Number</label>
                <input className="input" value={phone} onChange={handleField(setPhone)} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <button className="link-btn" onClick={() => setShowChangePassword(true)}>Change Password</button>
              </div>
            </div>
            <div className="flex-row gap-8" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-outline btn-sm" disabled={!dirty} onClick={handleCancel}>Cancel</button>
              <button className="btn btn-primary btn-sm" disabled={!dirty} onClick={handleSave}>Save Changes</button>
            </div>
          </div>

          <div className="card card-pad">
            <div className="flex-row gap-10 mb-16">
              <ShieldCheck size={16} />
              <span className="section-title">Security</span>
            </div>

            <div className="flex-between" style={{ padding: '12px 14px', background: '#F6F8FA', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              <div>
                <div className="cell-primary" style={{ fontSize: 13 }}>Two-Factor Authentication</div>
                <div className="cell-sub">Add an extra layer of security to your account.</div>
              </div>
              <button
                onClick={() => setTwoFactor((v) => !v)}
                style={{
                  width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: twoFactor ? 'var(--color-primary)' : 'var(--color-border)', position: 'relative', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: twoFactor ? 21 : 3, width: 18, height: 18,
                  borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease',
                }}
                />
              </button>
            </div>

            <div className="section-sub mb-16" style={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Recent Login Activity</div>
            {customerDevices.map((d) => {
              const Icon = d.label.toLowerCase().includes('iphone') || d.label.toLowerCase().includes('phone') ? Smartphone : Laptop
              return (
                <div key={d.id} className="flex-between" style={{ padding: '10px 4px', borderBottom: '1px solid #EFEFEF' }}>
                  <div className="flex-row gap-10">
                    <span className="stat-icon"><Icon size={15} /></span>
                    <div>
                      <div className="cell-primary" style={{ fontSize: 13 }}>{d.label}</div>
                      <div className="cell-sub">{d.location}</div>
                    </div>
                  </div>
                  {d.current ? (
                    <span className="badge badge-success">Current</span>
                  ) : (
                    <button className="link-btn" style={{ color: 'var(--color-danger)' }} onClick={() => showToast(`Logged out ${d.label}`, 'success')}>
                      Log out
                    </button>
                  )}
                </div>
              )
            })}
            <button className="link-btn" style={{ marginTop: 12 }} onClick={() => showToast('Opening device manager…', 'info')}>
              Manage All Devices
            </button>
          </div>
        </div>

        <div>
          <div className="card card-pad mb-20">
            <div className="flex-between mb-16">
              <div className="flex-row gap-10">
                <MapPin size={16} />
                <span className="section-title">Address Management</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => showToast('Add Address form coming soon.', 'info')}>
                <Plus size={13} /> Add Address
              </button>
            </div>
            {addresses.map((a) => (
              <div key={a.id} className="card card-pad mb-16" style={{ padding: 14 }}>
                <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-info" style={{ marginBottom: 6 }}>{a.label.toUpperCase()}</span>
                    <div className="cell-primary" style={{ fontSize: 13, marginTop: 6 }}>{a.name}</div>
                    <div className="cell-sub">{a.address}</div>
                    <div className="cell-sub">{a.phone}</div>
                  </div>
                  <div className="flex-row gap-8">
                    <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => showToast('Editing address…', 'info')}>
                      <Pencil size={13} />
                    </button>
                    <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--color-danger)' }} onClick={() => showToast('Address removed.', 'success')}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-pad mb-20">
            <div className="flex-row gap-10 mb-16">
              <CreditCard size={16} />
              <span className="section-title">Payments</span>
            </div>
            {payments.map((p) => (
              <div key={p.id} className="flex-between mb-16" style={{ padding: '10px 4px', borderBottom: '1px solid #EFEFEF' }}>
                <div className="flex-row gap-10">
                  <span className="stat-icon"><CreditCard size={15} /></span>
                  <div>
                    <div className="cell-primary" style={{ fontSize: 13 }}>•••• {p.last4}</div>
                    <div className="cell-sub">{p.primary ? 'Primary' : `Exp ${p.exp}`}</div>
                  </div>
                </div>
                <button className="link-btn" onClick={() => showToast('Payment method removed.', 'success')}>Remove</button>
              </div>
            ))}
            <button className="btn btn-outline btn-sm btn-full" onClick={() => showToast('Add Payment Method form coming soon.', 'info')}>
              <Plus size={13} /> Add Payment Method
            </button>
          </div>

          <div className="card card-pad">
            <div className="flex-between mb-16" style={{ alignItems: 'center' }}>
              <div>
                <div className="cell-primary" style={{ fontSize: 13 }}>Download My Data</div>
                <div className="cell-sub">Get an archive of your order history.</div>
              </div>
              <button className="icon-btn" onClick={() => showToast('Preparing your data export…', 'info')}>
                <Download size={16} />
              </button>
            </div>
            <button
              className="btn btn-full"
              style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Account"
          message="This will permanently delete your account and order history. This action cannot be undone."
          confirmLabel="Delete Account"
          cancelLabel="Cancel"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false)
            showToast('Your account has been deleted.', 'info')
            navigate('/login')
          }}
        />
      )}
    </CustomerLayout>
  )
}
