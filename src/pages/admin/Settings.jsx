import { useState } from 'react'
import { Cloud, Building2, Plus, Pencil, ShieldCheck, KeyRound, CreditCard, Truck, Lock } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import { branchProfiles as seedBranches } from '../../data/adminMockData.js'
import AddBranchModal from '../../components/admin/modals/AddBranchModal.jsx'
import EditBranchModal from '../../components/admin/modals/EditBranchModal.jsx'
import ApiKeyModal from '../../components/admin/modals/ApiKeyModal.jsx'
import PasswordPolicyModal from '../../components/admin/modals/PasswordPolicyModal.jsx'
import SessionSecurityModal from '../../components/admin/modals/SessionSecurityModal.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const branchStatusBadge = {
  Active: 'badge-success',
  Maintenance: 'badge-warning',
}

export default function Settings() {
  const { showToast } = useToast()
  const [twoFactor, setTwoFactor] = useState(true)
  const [branches, setBranches] = useState(seedBranches)

  const [showAddBranch, setShowAddBranch] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showEditBranch, setShowEditBranch] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false)
  const [showSessionSecurity, setShowSessionSecurity] = useState(false)

  const [passwordPolicy, setPasswordPolicy] = useState({ minLength: 12, requireUpper: true, requireNumber: true, requireSpecial: true, expiration: '90 days' })
  const [sessionSecurity, setSessionSecurity] = useState({ autoLogout: true, timeout: '30 minutes', maxAttempts: 5, lockoutDuration: '15 minutes' })

  const handleAddBranch = (form) => {
    setBranches((prev) => [...prev, { name: form.name, tag: 'New Branch', location: form.location, status: 'Active' }])
    setShowAddBranch(false)
    showToast('Branch added successfully', 'success')
  }

  const handleGenerateKey = () => {
    setShowApiKey(false)
    showToast('API key generated and saved', 'success')
  }

  const handleSaveAccess = () => {
    showToast('User permissions updated', 'success')
  }

  return (
    <AdminLayout topbarProps={{ title: 'Admin System Settings - MJ Prints' }}>
      <div className="card card-pad mb-20">
        <div className="flex-between">
          <div className="flex-row gap-12">
            <span className="stat-icon"><Cloud /></span>
            <div>
              <div className="section-title">System Backup Log</div>
              <div className="section-sub">Automated daily redundancy checks</div>
            </div>
          </div>
          <div className="flex-row gap-8">
            <div className="sidebar-avatar" style={{ width: 34, height: 34 }}>MJ</div>
            <div className="sidebar-footer-text">
              <strong>Admin MJ</strong>
              <span>Admin</span>
            </div>
          </div>
        </div>

        <div className="three-col" style={{ marginTop: 20, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div>
            <div className="section-sub">Last Backup</div>
            <div className="cell-primary" style={{ fontSize: 16 }}>02:00 AM</div>
            <div className="cell-sub" style={{ color: 'var(--color-success)' }}>✓ Successful</div>
          </div>
          <div>
            <div className="section-sub">Total Size</div>
            <div className="cell-primary" style={{ fontSize: 16 }}>1.4 TB</div>
            <div className="cell-sub">AWS S3 Glacier</div>
          </div>
          <div>
            <div className="section-sub">Retained Files</div>
            <div className="cell-primary" style={{ fontSize: 16 }}>4,208</div>
            <div className="cell-sub">30-day policy</div>
          </div>
          <div>
            <div className="section-sub">Health Score</div>
            <div className="cell-primary" style={{ fontSize: 16 }}>99.8%</div>
            <div style={{ width: '100%', height: 5, borderRadius: 4, background: '#EFEFEF', marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: '99.8%', height: '100%', background: 'var(--color-success)' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="two-col mb-20">
        <div className="card">
          <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex-row gap-10">
              <Building2 size={16} />
              <span className="section-title">Branch Profiles</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setShowAddBranch(true)}><Plus /> Add Branch</button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.name}>
                    <td>
                      <div className="cell-primary" style={{ color: 'var(--color-primary)' }}>{b.name}</div>
                      <div className="cell-sub">{b.tag}</div>
                    </td>
                    <td className="text-secondary">{b.location}</td>
                    <td><span className={`badge ${branchStatusBadge[b.status] || 'badge-neutral'}`}>{b.status}</span></td>
                    <td>
                      <div className="flex-row gap-8">
                        <button
                          className="icon-btn"
                          title={`Backup ${b.name}`}
                          onClick={() => {
                            showToast(`Backup started for ${b.name}`, 'info')
                            setTimeout(() => showToast(`Backup completed for ${b.name}`, 'success'), 1800)
                          }}
                        >
                          <Cloud />
                        </button>

                        <button
                          className="icon-btn"
                          style={{ border: 'none' }}
                          onClick={() => { setEditingBranch(b); setShowEditBranch(true) }}
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card card-pad">
          <div className="flex-row gap-10 mb-16">
            <ShieldCheck size={16} />
            <span className="section-title">Security &amp; RBAC</span>
          </div>

          <div className="flex-between mb-16">
            <div>
              <div className="cell-primary" style={{ fontSize: 13 }}>Two-Factor Auth</div>
              <div className="cell-sub">Required for all admins</div>
            </div>
            <button
              onClick={() => setTwoFactor((v) => !v)}
              style={{
                width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
                background: twoFactor ? 'var(--color-primary)' : 'var(--color-border)', position: 'relative',
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: twoFactor ? 21 : 3, width: 18, height: 18,
                borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease',
              }}
              />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ background: '#F6F8FA', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex-row gap-8 cell-primary" style={{ fontSize: 13 }}>
                  <KeyRound size={15} /> Password Policy
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setShowPasswordPolicy(true)}>Configure</button>
              </div>
                <div className="cell-sub" style={{ marginTop: 8 }}>{`${passwordPolicy.minLength}+ chars${passwordPolicy.requireSpecial ? ', symbols' : ''}, ${passwordPolicy.expiration}`}</div>
            </div>

            <div style={{ background: '#F6F8FA', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex-row gap-8 cell-primary" style={{ fontSize: 13 }}>
                  <Lock size={15} /> Session Security
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setShowSessionSecurity(true)}>Configure</button>
              </div>
              <div style={{ marginTop: 8 }}>
                <div className="cell-sub">Auto logout: <strong>{sessionSecurity.timeout}</strong></div>
                <div className="cell-sub">Max login attempts: <strong>{sessionSecurity.maxAttempts}</strong></div>
              </div>
            </div>
          </div>

          
        </div>
      </div>

      <div className="card card-pad">
        <div className="flex-between mb-16">
          <div className="flex-row gap-10">
            <span className="section-title">API Integrations</span>
          </div>
          <span className="badge badge-success">System Live</span>
        </div>

        <div className="two-col mb-16">
          <div className="card card-pad flex-between">
            <div className="flex-row gap-10">
              <span className="stat-icon"><CreditCard /></span>
              <div>
                <div className="cell-primary" style={{ fontSize: 13 }}>Payment Gateway</div>
                <div className="cell-sub">Stripe v3.2 API</div>
              </div>
            </div>
            <span className="badge badge-success">Linked</span>
          </div>
          <div className="card card-pad flex-between">
            <div className="flex-row gap-10">
              <span className="stat-icon"><Truck /></span>
              <div>
                <div className="cell-primary" style={{ fontSize: 13 }}>Logistics API</div>
                <div className="cell-sub">FedEx Global Webhook</div>
              </div>
            </div>
            <span className="badge badge-success">Linked</span>
          </div>
        </div>

        <button className="btn btn-outline btn-full mb-16" onClick={() => setShowApiKey(true)}>Generate New API Key</button>
        <button className="btn btn-primary btn-full" onClick={() => showToast('All settings saved', 'success')}>Save All Changes</button>
      </div>

      {showAddBranch && (
        <AddBranchModal onClose={() => setShowAddBranch(false)} onSave={handleAddBranch} />
      )}

      {showEditBranch && (
        <EditBranchModal
          branch={editingBranch}
          onClose={() => { setShowEditBranch(false); setEditingBranch(null) }}
          onSave={(updated) => {
            setBranches((prev) => prev.map((br) => (br.name === editingBranch.name ? { ...br, ...updated } : br)))
            setShowEditBranch(false)
            setEditingBranch(null)
            showToast('Branch updated', 'success')
          }}
        />
      )}

      {showApiKey && (
        <ApiKeyModal onClose={() => setShowApiKey(false)} onSave={handleGenerateKey} />
      )}

      {showPasswordPolicy && (
        <PasswordPolicyModal
          value={passwordPolicy}
          onClose={() => setShowPasswordPolicy(false)}
          onSave={(v) => { setPasswordPolicy(v); setShowPasswordPolicy(false); showToast('Password policy saved', 'success') }}
        />
      )}

      {showSessionSecurity && (
        <SessionSecurityModal
          value={sessionSecurity}
          onClose={() => setShowSessionSecurity(false)}
          onSave={(v) => { setSessionSecurity(v); setShowSessionSecurity(false); showToast('Session security saved', 'success') }}
        />
      )}

      
    </AdminLayout>
  )
}
