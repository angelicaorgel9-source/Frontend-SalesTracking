export default function StatCard({ icon: Icon, label, value, sub, subDirection }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <span className="stat-icon">
            <Icon />
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div
        className={`stat-card-sub${subDirection ? ` ${subDirection}` : ''}`}
        style={sub ? undefined : { visibility: 'hidden' }}
      >
        {sub || '\u00A0'}
      </div>
    </div>
  )
}