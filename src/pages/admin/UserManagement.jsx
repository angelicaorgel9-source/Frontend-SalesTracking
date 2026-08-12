import { useState } from 'react'
import { Search, Shield, User } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import CredentialsModal from '../../components/CredentialsModal.jsx'
import ChangePositionModal from '../../components/admin/modals/ChangePositionModal.jsx'
import ChangeStatusModal from '../../components/admin/modals/ChangeStatusModal.jsx'
import ManageAccessModal from '../../components/admin/modals/ManageAccessModal.jsx'
import SelectUserModal from '../../components/admin/modals/SelectUserModal.jsx'
import { employeeUsers as seedUsers } from '../../data/adminMockData.js'
import { useToast } from '../../context/ToastContext.jsx'

const roleBadge = {
  ADMIN: 'badge-info',
  Employee: 'badge-neutral',
}

function randomPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789@#'
  let out = ''
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default function UserManagement() {
  const { showToast } = useToast()
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [surname, setSurname] = useState('')
  const [gender, setGender] = useState('Female')
  const [branch, setBranch] = useState('Main Hub - baliuag')
  const [role, setRole] = useState('')
  const [credentials, setCredentials] = useState(null)

  const [users, setUsers] = useState(seedUsers)
  const [positionUser, setPositionUser] = useState(null)
  const [statusUser, setStatusUser] = useState(null)
  const [manageUser, setManageUser] = useState(null)
  const [showSelectUser, setShowSelectUser] = useState(false)
  const [showManageAccess, setShowManageAccess] = useState(false)

  const clearForm = () => {
    setFirstName('')
    setMiddleName('')
    setSurname('')
    setGender('Female')
    setRole('')
  }

  const generateCredentials = () => {
    const username = `MJP-001-e${String(Math.floor(Math.random() * 900) + 100)}`
    setCredentials({ username, password: randomPassword() })
  }

  const handleSavePosition = (newPosition) => {
    setUsers((prev) => prev.map((u, i) => (u === positionUser ? { ...u, role: u.role === 'ADMIN' ? u.role : newPosition } : u)))
    setPositionUser(null)
    showToast('Employee position updated', 'success')
  }

  const handleSaveStatus = ({ status }) => {
    setUsers((prev) => prev.map((u) => (u === statusUser ? { ...u, status } : u)))
    setStatusUser(null)
    showToast('Employee status updated', 'success')
  }

  return (
    <AdminLayout topbarProps={{ title: 'Admin: User Management' }}>
      <div className="card mb-20">
        <div className="card-pad" style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
          <span className="section-title" style={{ color: 'var(--color-primary-dark)' }}>Add/Create Employee Account</span>
        </div>

        <div className="card-pad">
          <div className="section-sub mb-16" style={{ fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Employee Details</div>

          <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
            <div className="field">
              <label>First Name</label>
              <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="field">
              <label>Middle Name</label>
              <input className="input" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
            </div>
            <div className="field">
              <label>Surname</label>
              <input className="input" value={surname} onChange={(e) => setSurname(e.target.value)} />
            </div>
            <div className="field">
              <label>Gender</label>
              <div className="flex-row gap-12" style={{ marginTop: 10 }}>
                <label className="flex-row gap-8 text-secondary" style={{ fontSize: 13 }}>
                  <input type="radio" name="gender" checked={gender === 'Female'} onChange={() => setGender('Female')} />
                  Female
                </label>
                <label className="flex-row gap-8 text-secondary" style={{ fontSize: 13 }}>
                  <input type="radio" name="gender" checked={gender === 'Male'} onChange={() => setGender('Male')} />
                  Male
                </label>
              </div>
            </div>
          </div>

          <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field">
              <label>Branch Assessment</label>
              <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option>Main Hub - baliuag</option>
                <option>Tangos - baliuag</option>
                <option>Sabang</option>
              </select>
            </div>
            <div className="field">
              <label>Role</label>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
                <option value="Editor">Editor</option>
              </select>
            </div>
          </div>

          <div className="flex-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginTop: 4 }}>
            <div />
            <div className="flex-row gap-10">
              <button className="btn btn-primary" onClick={clearForm}>Clear Form</button>
              <button className="btn btn-outline" onClick={generateCredentials}>+ Generate Credentials</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="section-title" style={{ color: 'var(--color-primary-dark)' }}>User (Employee) List</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="input-icon-wrap" style={{ width: 240 }}>
              <Search />
              <input className="input" placeholder="Filter by role or name..." />
            </div>
            <button className="btn btn-outline" onClick={() => setShowSelectUser(true)}>Manage Permissions</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead style={{ background: 'var(--color-secondary)' }}>
              <tr>
                <th>Key Identifier</th>
                <th>Assigned Role</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div className="cell-primary">{u.key}</div>
                    <div className="cell-sub">{u.name}</div>
                  </td>
                  <td>
                    <span className={`badge ${roleBadge[u.role] || 'badge-neutral'}`}>
                      {u.role === 'ADMIN' ? <Shield size={11} /> : <User size={11} />} {u.role}
                    </span>
                  </td>
                  <td className="text-secondary">{u.created}</td>
                  <td>
                    <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span>
                  </td>
                  <td>
                    <div className="flex-row gap-8">
                      <button className="btn btn-primary btn-sm" onClick={() => setPositionUser(u)}>Change Position</button>
                      {u.status === 'ACTIVE' ? (
                        <button className="btn btn-outline btn-sm" onClick={() => setStatusUser(u)}>Change Status</button>
                      ) : (
                        <button className="btn btn-outline btn-sm" style={{ background: 'var(--color-secondary)' }} onClick={() => setStatusUser(u)}>Change Status</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-pad">
          <span className="section-sub">Showing 3 of 12 keys</span>
        </div>
      </div>

      <CredentialsModal
        credentials={credentials}
        onClose={() => setCredentials(null)}
        onSave={() => setCredentials(null)}
      />

      {showSelectUser && (
        <SelectUserModal
          users={users}
          onClose={() => setShowSelectUser(false)}
          onSelect={(u) => {
            setShowSelectUser(false)
            setManageUser(u)
            setShowManageAccess(true)
          }}
        />
      )}

      {showManageAccess && manageUser && (
        <ManageAccessModal
          user={manageUser}
          onClose={() => { setShowManageAccess(false); setManageUser(null) }}
          onSave={(access) => {
            // For now we just close and show toast; wiring to persist permissions is out of scope
            setShowManageAccess(false)
            setManageUser(null)
            showToast('Permissions updated', 'success')
          }}
        />
      )}

      {positionUser && (
        <ChangePositionModal
          user={positionUser}
          onClose={() => setPositionUser(null)}
          onSave={handleSavePosition}
        />
      )}

      {statusUser && (
        <ChangeStatusModal
          user={statusUser}
          onClose={() => setStatusUser(null)}
          onSave={handleSaveStatus}
        />
      )}
    </AdminLayout>
  )
}
