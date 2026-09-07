import { useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'

export default function ActionMenu({ items }) {
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
    <div className="action-menu-wrap" ref={ref}>
      <button
        className="icon-btn"
        style={{ border: 'none' }}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="action-menu" onClick={(e) => e.stopPropagation()}>
          {items.map((item) => (
            <button
              key={item.label}
              className={`action-menu-item${item.danger ? ' danger' : ''}`}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
            >
              {item.icon && <item.icon size={14} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
