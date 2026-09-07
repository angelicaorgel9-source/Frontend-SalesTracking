export default function ConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-confirm-header">
          <h3>{title}</h3>
          {message && <p>{message}</p>}
        </div>
        <div className="modal-confirm-actions">
          <button className="btn btn-danger-outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={busy}>
            {busy ? 'Importing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
