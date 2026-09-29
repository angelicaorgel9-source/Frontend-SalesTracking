import { useEffect, useState } from 'react'
import { Search, Shield, User } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import CredentialsModal from '../../components/CredentialsModal.jsx'
import ChangePositionModal from '../../components/admin/modals/ChangePositionModal.jsx'
import ChangeStatusModal from '../../components/admin/modals/ChangeStatusModal.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'

const roleBadge = {
  ADMIN: 'badge-info',
  EMPLOYEE: 'badge-neutral',
}

function randomPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789@#'
  const values = crypto.getRandomValues(new Uint32Array(12))
  return Array.from(values, (value) => chars[value % chars.length]).join('').slice(0, 12)
}

export default function UserManagement() {
  const { showToast } = useToast()
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [surname, setSurname] = useState('')
  const [branch, setBranch] = useState('')
  const [credentials, setCredentials] = useState(null)

  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [search, setSearch] = useState('')
  const [positionUser, setPositionUser] = useState(null)
  const [statusUser, setStatusUser] = useState(null)

  const loadUsers = () => api.getEmployees().then((records) => setUsers(records.map((user) => ({
    ...user,
    key: user.username,
    created: new Date(user.created_at).toLocaleDateString(),
    status: user.is_active ? 'ACTIVE' : 'INACTIVE',
  }))))

  useEffect(() => {
    Promise.all([loadUsers(), api.getBranches().then(setBranches)])
      .catch((error) => showToast(error.message, 'error'))
  }, [showToast])

  const clearForm = () => {
    setFirstName('')
    setMiddleName('')
    setSurname('')
    setBranch('')
  }

  const generateCredentials = () => {
    const username = `mjp-${crypto.randomUUID().slice(0, 8)}`
    setCredentials({ username, password: randomPassword() })
  }

  const handleSavePosition = async (newPosition) => {
    try {
      const role = newPosition === 'Admin' ? 'ADMIN' : 'EMPLOYEE'
      await api.updateEmployee(positionUser.id, { role })
      await loadUsers()
      setPositionUser(null)
      showToast('Employee role updated', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleSaveStatus = async ({ status }) => {
    try {
      await api.updateEmployee(statusUser.id, { is_active: status === 'ACTIVE' })
      await loadUsers()
      setStatusUser(null)
      showToast('Employee status updated', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleSaveEmployee = async () => {
    if (!credentials) return
    try {
      const selectedBranch = branches.find((item) => String(item.id) === String(branch))
      await api.createEmployee({
        username: credentials.username,
        password: credentials.password,
        name: [firstName, middleName, surname].filter(Boolean).join(' '),
        branch: selectedBranch?.id || null,
      })
      await loadUsers()
      clearForm()
      setCredentials(null)
      showToast('Employee account created', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const filteredUsers = users.filter((user) => (
    `${user.name} ${user.username} ${user.role}`.toLowerCase().includes(search.trim().toLowerCase())
  ))

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
              <label>Account Type</label>
              <input className="input" value="Employee" disabled />
            </div>
          </div>

          <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field">
              <label>Branch</label>
              <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="">Unassigned</option>
                {branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Role</label><input className="input" value="Employee" disabled /></div>
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
              <input className="input" placeholder="Filter by role or name..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
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
              {filteredUsers.map((u) => (
                <tr key={u.id}>
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
                      <button className="btn btn-primary btn-sm" onClick={() => setPositionUser(u)}>Change Role</button>
                      {u.status === 'ACTIVE' ? (
                        <button className="btn btn-outline btn-sm" onClick={() => setStatusUser(u)}>Change Status</button>
                      ) : (
                        <button className="btn btn-outline btn-sm" style={{ background: 'var(--color-secondary)' }} onClick={() => setStatusUser(u)}>Change Status</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredUsers.length && <tr><td colSpan={5} className="text-secondary" style={{ textAlign: 'center', padding: 24 }}>No employees match this search.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card-pad">
          <span className="section-sub">{filteredUsers.length} employee account{filteredUsers.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      <CredentialsModal
        credentials={credentials}
        onClose={() => setCredentials(null)}
        onSave={handleSaveEmployee}
      />

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
