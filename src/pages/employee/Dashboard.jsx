import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, HandCoins, UserPlus2, AlertTriangle, RefreshCcw,
  CheckCircle2, StickyNote, UserPlus, CalendarDays,
} from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import FullQueueModal from '../../components/employee/modals/FullQueueModal.jsx'
import ActivityHistoryModal from '../../components/employee/modals/ActivityHistoryModal.jsx'
import { productionQueue, activityLog } from '../../data/employeeMockData.js'
import { useEmployeeProfile } from '../../context/EmployeeProfileContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const statusBadge = {
  Queued: 'badge-neutral',
  'In Progress': 'badge-warning',
  Review: 'badge-info',
  Completed: 'badge-success',
}

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

const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile } = useEmployeeProfile()
  const { showToast } = useToast()
  const [showQueue, setShowQueue] = useState(false)
  const [showActivity, setShowActivity] = useState(false)

  const firstName = profile.name.split(' ')[0]
  const visibleJobs = productionQueue.slice(0, 4)
  const visibleActivity = activityLog.slice(0, 5)

  return (
    <EmployeeLayout
      topbarProps={{
        title: null,
        searchPlaceholder: 'Search orders, customers, or items...',
        rightSlot: (
          <span className="pill" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarDays size={13} /> {today}
          </span>
        ),
      }}
    >
      <div className="flex-between mb-20" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Good morning, {firstName}</h1>
          <div className="section-sub">Here&rsquo;s what&rsquo;s happening in the workshop today.</div>
        </div>
        <span className="pill">
          Production Unit A
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
        </span>
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start', gap: 20 }}>
        <div>
          <div className="three-col mb-20">
            <div className="clickable" onClick={() => navigate('/employee/orders')}>
              <StatCard icon={ClipboardList} label="Assigned Jobs" value="12" sub="+4 vs yesterday · 3 urgent deadlines" subDirection="up" />
            </div>
            <div className="clickable" onClick={() => navigate('/employee/orders')}>
              <StatCard icon={HandCoins} label="New Sales Today" value="$4,280" sub="On target · 18 new orders placed" subDirection="up" />
            </div>
            <div className="clickable" onClick={() => navigate('/employee/customers')}>
              <StatCard icon={UserPlus} label="Registered Customers" value="842" sub="Last 24h · 7 accounts pending approval" />
            </div>
          </div>

          <div className="card">
            <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <span className="section-title">Pending Jobs</span>
                <div className="section-sub">Currently active items in the production queue</div>
              </div>
              <button className="link-btn" onClick={() => setShowQueue(true)}>View all queue &rarr;</button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleJobs.map((o) => (
                    <tr key={o.id} className="row-clickable" onClick={() => navigate('/employee/orders')}>
                      <td className="cell-primary" style={{ color: 'var(--color-primary)' }}>{o.id}</td>
                      <td>
                        <div className="cell-primary">{o.customer}</div>
                        <div className="cell-sub">{o.details}</div>
                      </td>
                      <td><span className={`badge ${statusBadge[o.status] || 'badge-neutral'}`}>{o.status}</span></td>
                      <td>
                        {o.priority === 'urgent' && <AlertTriangle size={14} color="var(--color-danger)" />}
                        {o.priority === 'up' && <span style={{ color: 'var(--color-primary)' }}>▲</span>}
                        {!o.priority && <span className="text-secondary">&mdash;</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="flex-between mb-16">
            <span className="section-title">Activity</span>
            <button className="icon-btn" style={{ border: 'none' }} onClick={() => showToast('Activity refreshed', 'info')}>
              <RefreshCcw size={15} />
            </button>
          </div>
          {visibleActivity.map((a) => {
            const Icon = typeIcon[a.type] || RefreshCcw
            return (
              <div key={a.id} className="flex-row gap-10" style={{ padding: '9px 0', borderBottom: '1px solid #EFEFEF', alignItems: 'flex-start' }}>
                <span className="stat-icon" style={{ color: typeColor[a.type], background: `${typeColor[a.type]}1A`, flexShrink: 0, width: 30, height: 30 }}>
                  <Icon size={14} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className="cell-primary" style={{ fontSize: 12.5, lineHeight: 1.4 }}>{a.title}</div>
                  {a.quote && (
                    <div className="cell-sub" style={{ background: '#F6F8FA', borderRadius: 'var(--radius-sm)', padding: '5px 8px', marginTop: 5, fontStyle: 'italic', fontSize: 11.5 }}>
                      &ldquo;{a.quote}&rdquo;
                    </div>
                  )}
                  <div className="cell-sub" style={{ marginTop: 3 }}>{a.time}</div>
                </div>
              </div>
            )
          })}
          <button className="btn btn-outline btn-sm btn-full" style={{ marginTop: 12 }} onClick={() => setShowActivity(true)}>
            Show More
          </button>
        </div>
      </div>

      {showQueue && (
        <FullQueueModal
          onClose={() => setShowQueue(false)}
          onViewOrder={() => { setShowQueue(false); navigate('/employee/orders') }}
        />
      )}

      {showActivity && (
        <ActivityHistoryModal
          onClose={() => setShowActivity(false)}
          onRefresh={() => showToast('Activity refreshed', 'info')}
        />
      )}
    </EmployeeLayout>
  )
}
