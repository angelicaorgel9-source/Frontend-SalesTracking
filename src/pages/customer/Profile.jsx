import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Pencil, ShieldCheck, Laptop, Smartphone } from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import EditProfileModal from '../../components/customer/modals/EditProfileModal.jsx'
import { useCustomerProfile } from '../../context/CustomerProfileContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const devices = [
  { id: 2, label: 'iPhone 14 Pro', location: 'Makati City, Philippines • Yesterday, 4:21 PM', icon: Smartphone, current: false },
  { id: 1, label: 'Chrome on macOS Monterey', location: 'Quezon City, Philippines • 2 mins ago', icon: Laptop, current: true },
]

export default function CustomerProfile() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { profile, openEditProfile, showEditProfile, closeEditProfile } = useCustomerProfile()
  const [twoFactor, setTwoFactor] = useState(true)

  return (
    <CustomerLayout>
      <button className="icon-btn mb-16" onClick={() => navigate(-1)} style={{ border: 'none' }}>
        <ArrowLeft />
      </button>

      <div className="card card-pad mb-20">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div className="flex-row gap-12">
            <img
              src={profile.avatar}
              alt={profile.name}
              style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }}
            />
            <div>
              <div className="flex-row gap-8">
                <span className="cell-primary" style={{ fontSize: 17 }}>{profile.name}</span>
                <span className="badge badge-neutral">c-001</span>
              </div>
              <div className="cell-sub" style={{ marginBottom: 6 }}>Member since: 2024-01-10</div>
              <span className="badge badge-info">{profile.role}</span>
            </div>
          </div>
          <div className="flex-row gap-8">
            <button className="btn btn-outline btn-sm" onClick={() => showToast('Opening email client…', 'info')}>
              <Mail size={14} /> Contact
            </button>
            <button className="btn btn-primary btn-sm" onClick={openEditProfile}>
              <Pencil size={14} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="card card-pad mb-20">
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
        {devices.map((d) => (
          <div key={d.id} className="flex-between" style={{ padding: '10px 4px', borderBottom: '1px solid #EFEFEF' }}>
            <div className="flex-row gap-10">
              <span className="stat-icon"><d.icon size={15} /></span>
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
        ))}

        <button className="link-btn" style={{ marginTop: 12 }} onClick={() => showToast('Opening device manager…', 'info')}>
          Manage All Devices
        </button>
      </div>

      {showEditProfile && <EditProfileModal onClose={closeEditProfile} />}
    </CustomerLayout>
  )
}
