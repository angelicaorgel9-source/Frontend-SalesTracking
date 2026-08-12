import { RefreshCcw, X, CheckCircle2, StickyNote, UserPlus2 } from 'lucide-react'
import { activityLog } from '../../../data/employeeMockData.js'

const typeIcon = {
  update: RefreshCcw,
  complete: CheckCircle2,
  note: StickyNote,
  customer: UserPlus2,
}

const typeColor = {
  update: '#F59E0B',
  complete: '#16A34A',
  note: '#F59E0B',
  customer: '#EF4444',
}

export default function ActivityHistoryModal({ onClose, onRefresh }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Activity History</h3>
          <div className="flex-row gap-8">
            <button className="icon-btn" onClick={onRefresh} title="Refresh"><RefreshCcw size={16} /></button>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <div className="modal-body">
          {activityLog.map((a) => {
            const Icon = typeIcon[a.type] || RefreshCcw
            return (
              <div key={a.id} className="flex-row gap-10" style={{ padding: '10px 0', borderBottom: '1px solid #EFEFEF', alignItems: 'flex-start' }}>
                <span
                  className="stat-icon"
                  style={{ color: typeColor[a.type], background: `${typeColor[a.type]}1A`, flexShrink: 0 }}
                >
                  <Icon size={15} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className="cell-primary" style={{ fontSize: 13 }}>{a.title}</div>
                  {a.quote && (
                    <div
                      className="cell-sub"
                      style={{ background: '#F6F8FA', borderRadius: 'var(--radius-sm)', padding: '6px 10px', marginTop: 6, fontStyle: 'italic' }}
                    >
                      &ldquo;{a.quote}&rdquo;
                    </div>
                  )}
                  <div className="cell-sub" style={{ marginTop: 4 }}>{a.time}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
