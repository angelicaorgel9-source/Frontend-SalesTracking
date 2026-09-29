import { useEffect, useState } from 'react'
import {
  ArrowLeft, User, MapPin, Plus, ShieldCheck, Download,
} from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import ChangePasswordModal from '../../components/customer/modals/ChangePasswordModal.jsx'
import AddAddressModal from '../../components/customer/modals/AddAddressModal.jsx'
import { useCustomerProfile } from '../../context/CustomerProfileContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'
import { downloadCsv } from '../../utils/csv.js'

export default function Settings() {
  const { showToast } = useToast()
  const { profile, updateProfile } = useCustomerProfile()

  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone)
  const [dirty, setDirty] = useState(false)

  const [twoFactor, setTwoFactor] = useState(profile.two_factor_enabled !== false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)

  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    if (dirty) return
    setName(profile.name)
    setEmail(profile.email)
    setPhone(profile.phone)
    setTwoFactor(profile.two_factor_enabled !== false)
  }, [profile, dirty])

  useEffect(() => {
    api.getAddresses().then(setAddresses).catch(() => setAddresses([]))
  }, [])

  const handleAddAddress = async (address) => {
    try {
      const savedAddress = await api.createAddress(address)
      setAddresses((current) => [...current, savedAddress])
      setShowAddAddress(false)
      showToast('Address saved successfully.', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleField = (setter) => (e) => {
    setter(e.target.value)
    setDirty(true)
  }

  const handleSave = async () => {
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() })
      setDirty(false)
      showToast('Account settings saved.', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
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
                onClick={async () => {
                  const nextValue = !twoFactor
                  try {
                    await updateProfile({ two_factor_enabled: nextValue })
                    setTwoFactor(nextValue)
                    showToast(`Two-factor authentication ${nextValue ? 'enabled' : 'disabled'}.`, 'success')
                  } catch (error) {
                    showToast(error.message, 'error')
                  }
                }}
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

            <div className="section-sub">Login activity is not available for this account.</div>
          </div>
        </div>

        <div>
          <div className="card card-pad mb-20">
            <div className="flex-between mb-16">
              <div className="flex-row gap-10">
                <MapPin size={16} />
                <span className="section-title">Address Management</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddAddress(true)}>
                <Plus size={13} /> Add Address
              </button>
            </div>
            {!addresses.length && <div className="section-sub" style={{ padding: '8px 0 18px' }}>No saved addresses yet.</div>}
            {addresses.map((a) => (
              <div key={a.id} className="card card-pad mb-16" style={{ padding: 14 }}>
                <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-info" style={{ marginBottom: 6 }}>{a.label.toUpperCase()}</span>
                    <div className="cell-primary" style={{ fontSize: 13, marginTop: 6 }}>{a.name}</div>
                    <div className="cell-sub">{a.address}</div>
                    <div className="cell-sub">{a.phone}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <div className="flex-between mb-16" style={{ alignItems: 'center' }}>
              <div>
                <div className="cell-primary" style={{ fontSize: 13 }}>Download My Data</div>
                <div className="cell-sub">Get an archive of your order history.</div>
              </div>
              <button className="icon-btn" title="Download order history" onClick={async () => {
                try {
                  const orders = await api.getOrders()
                  downloadCsv({
                    filename: 'my-orders.csv',
                    columns: ['Transaction ID', 'Branch', 'Status', 'Total', 'Created At'],
                    rows: orders.map((order) => [order.transaction_id, order.branch_name, order.status, order.total_amount, order.created_at]),
                  })
                  showToast('Order history downloaded.', 'success')
                } catch (error) {
                  showToast(error.message, 'error')
                }
              }}>
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {showAddAddress && <AddAddressModal onClose={() => setShowAddAddress(false)} onSave={handleAddAddress} />}
    </CustomerLayout>
  )
}
