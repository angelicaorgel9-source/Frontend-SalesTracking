import { useEffect, useRef, useState } from 'react'
import { FileText, Pencil, Trash2 } from 'lucide-react'

export default function DraftsPopover({ drafts, onEdit, onRemove }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="drafts-popover-wrap" ref={ref}>
      <button
        className="icon-btn"
        title="Saved drafts"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        <FileText size={16} />
        {drafts.length > 0 && <span className="dot" />}
      </button>

      {open && (
        <div className="drafts-popover" onClick={(e) => e.stopPropagation()}>
          <div className="drafts-popover-header">Saved Drafts ({drafts.length})</div>
          <div className="drafts-popover-body">
            {drafts.length === 0 && <div className="drafts-empty">No drafts saved yet.</div>}
            {drafts.map((d) => (
              <div key={d.id} className="draft-row">
                <div className="draft-row-info">
                  <div className="draft-row-title">{d.customer?.name || 'Unnamed order'}</div>
                  <div className="draft-row-sub">Qty {d.quantity} · Saved {d.savedAt}</div>
                </div>
                <div className="draft-row-actions">
                  <button className="draft-icon-btn" title="Edit draft" onClick={() => { setOpen(false); onEdit(d) }}>
                    <Pencil size={13} />
                  </button>
                  <button className="draft-icon-btn danger" title="Remove draft" onClick={() => onRemove(d.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
