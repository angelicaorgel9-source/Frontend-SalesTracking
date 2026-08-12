import { X } from 'lucide-react'

export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  size = 'sm',
  headerVariant = 'teal',
  actions,
  eyebrow,
  headerActions,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-header${headerVariant === 'white' ? ' modal-header-white' : ''}`}>
          <div className="modal-header-title-wrap">
            {eyebrow && <div className="modal-eyebrow">{eyebrow}</div>}
            <div>
              <h3>{title}</h3>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          <div className="flex-row gap-8">
            {headerActions}
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">{children}</div>

        {actions && <div className="modal-footer">{actions}</div>}
      </div>
    </div>
  )
}
