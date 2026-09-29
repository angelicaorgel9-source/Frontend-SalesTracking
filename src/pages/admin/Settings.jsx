import { useEffect, useState } from 'react'
import { Building2, Pencil, Plus } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import AddBranchModal from '../../components/admin/modals/AddBranchModal.jsx'
import EditBranchModal from '../../components/admin/modals/EditBranchModal.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'

const toBranch = (branch) => ({
  ...branch,
  location: branch.address || '',
  contact: branch.phone || '',
  status: branch.is_active ? 'Active' : 'Inactive',
})

export default function Settings() {
  const { showToast } = useToast()
  const [branches, setBranches] = useState([])
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)

  const refreshBranches = () => api.getBranches().then((items) => setBranches(items.map(toBranch)))

  useEffect(() => {
    refreshBranches().catch((error) => showToast(error.message, 'error'))
  }, [showToast])

  const handleAddBranch = async (form) => {
    try {
      const branch = await api.createBranch({
        name: form.name,
        code: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        address: form.location,
        phone: form.contact,
      })
      setBranches((previous) => [...previous, toBranch(branch)])
      setShowAddBranch(false)
      showToast('Branch added', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleUpdateBranch = async (form) => {
    try {
      const saved = await api.updateBranch(editingBranch.id, {
        name: form.name,
        address: form.location,
        phone: form.contact,
      })
      setBranches((previous) => previous.map((branch) => branch.id === saved.id ? toBranch(saved) : branch))
      setEditingBranch(null)
      showToast('Branch updated', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <AdminLayout topbarProps={{ title: 'Branch Settings' }}>
      <div className="card">
        <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex-row gap-10"><Building2 size={16} /><span className="section-title">Branches</span></div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddBranch(true)}><Plus /> Add Branch</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Branch Name</th><th>Code</th><th>Location</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {branches.map((branch) => <tr key={branch.id}>
                <td className="cell-primary">{branch.name}</td>
                <td className="text-secondary">{branch.code}</td>
                <td className="text-secondary">{branch.location || '—'}</td>
                <td className="text-secondary">{branch.contact || '—'}</td>
                <td><span className={`badge ${branch.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{branch.status}</span></td>
                <td><button className="icon-btn" title="Edit branch" onClick={() => setEditingBranch(branch)}><Pencil size={15} /></button></td>
              </tr>)}
              {!branches.length && <tr><td colSpan={6} className="text-secondary" style={{ textAlign: 'center', padding: 24 }}>No branches available.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showAddBranch && <AddBranchModal onClose={() => setShowAddBranch(false)} onSave={handleAddBranch} />}
      {editingBranch && <EditBranchModal branch={editingBranch} onClose={() => setEditingBranch(null)} onSave={handleUpdateBranch} />}
    </AdminLayout>
  )
}