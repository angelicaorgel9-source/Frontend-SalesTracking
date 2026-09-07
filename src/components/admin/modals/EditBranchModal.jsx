import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import Modal from '../../Modal.jsx'
import ConfirmPasswordModal from './ConfirmPasswordModal.jsx'

export default function EditBranchModal({ branch, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', location: '', contact: '', manager: '' })

  useEffect(() => {
    if (branch) {
      setForm({
        name: branch.name || '',
        location: branch.location || '',
        contact: branch.contact || '',
        manager: branch.manager || '',
      })
    }
  }, [branch])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    if (!form.name.trim()) return
    setShowConfirm(true)
  }

  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <Modal
      title="Edit Branch"
      subtitle={`Modify details for ${branch?.name || 'branch'}`}
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-danger-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}><Pencil size={14} /> Save</button>
        </>
      )}
    >
      <div className="field">
        <label>Branch Name</label>
        <input className="input" placeholder="MJ Prints Manila" value={form.name} onChange={update('name')} />
      </div>
      <div className="field">
        <label>Location/Address</label>
        <input className="input" placeholder="Manila" value={form.location} onChange={update('location')} />
      </div>
      <div className="field">
        <label>Contact Number</label>
        <input className="input" value={form.contact} onChange={update('contact')} />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Manager/Admin</label>
        <select className="input" value={form.manager} onChange={update('manager')}>
          <option value="">Select manager...</option>
          <option>Alexander Pierce</option>
          <option>Sarah Jenkins</option>
          <option>Juan Dela Cruz</option>
        </select>
      </div>
      {showConfirm && (
        <ConfirmPasswordModal
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false)
            onSave({ ...branch, ...form })
          }}
        />
      )}
    </Modal>
  )
}
