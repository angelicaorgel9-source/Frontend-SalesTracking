import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, HandCoins, UserPlus2, AlertTriangle, RefreshCcw,
  CheckCircle2, StickyNote, UserPlus, CalendarDays,
} from 'lucide-react'
import EmployeeLayout from '../../layouts/EmployeeLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import FullQueueModal from '../../components/employee/modals/FullQueueModal.jsx'
import ActivityHistoryModal from '../../components/employee/modals/ActivityHistoryModal.jsx'
import { useEmployeeProfile } from '../../context/EmployeeProfileContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'

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

const formatCurrency = (value) => new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
}).format(Number(value || 0))

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile } = useEmployeeProfile()
  const { showToast } = useToast()
  const [showQueue, setShowQueue] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [stats, setStats] = useState({ assigned_jobs: 0, new_sales_today: 0, registered_customers: 0 })
  const [pendingJobs, setPendingJobs] = useState([])
  const [activityLog, setActivityLog] = useState([])

  useEffect(() => {
    api.getEmployeeDashboard()
      .then((data) => {
        setStats(data?.stats || { assigned_jobs: 0, new_sales_today: 0, registered_customers: 0 })
        setPendingJobs(data?.pending_jobs || [])
        setActivityLog(data?.activity || [])
      })
      .catch(() => {
        setStats({ assigned_jobs: 0, new_sales_today: 0, registered_customers: 0 })
        setPendingJobs([])
        setActivityLog([])
      })
  }, [])

  const firstName = profile?.name?.split(' ')[0] || 'Employee'
  const visibleJobs = pendingJobs.slice(0, 4)
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
          {profile?.branch_name || 'Unassigned'}
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
        </span>
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start', gap: 20 }}>
        <div>
          <div className="three-col mb-20">
            <div className="clickable" onClick={() => navigate('/employee/orders')}>
              <StatCard icon={ClipboardList} label="Assigned Jobs" value={String(stats.assigned_jobs || 0)} sub="Live production queue" subDirection="up" />
            </div>
            <div className="clickable" onClick={() => navigate('/employee/orders')}>
              <StatCard icon={HandCoins} label="New Sales Today" value={formatCurrency(stats.new_sales_today)} sub="Live store revenue" subDirection="up" />
            </div>
            <div className="clickable" onClick={() => navigate('/employee/customers')}>
              <StatCard icon={UserPlus} label="Registered Customers" value={String(stats.registered_customers || 0)} sub="Active customer accounts" />
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
                  {visibleJobs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-secondary" style={{ textAlign: 'center', padding: 18 }}>No active jobs yet.</td>
                    </tr>
                  )}
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
          {visibleActivity.length === 0 && (
            <div className="cell-sub" style={{ padding: '10px 0' }}>No recent activity available.</div>
          )}
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
          items={activityLog}
        />
      )}
    </EmployeeLayout>
  )
}
