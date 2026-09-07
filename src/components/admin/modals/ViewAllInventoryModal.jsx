import { useState } from 'react'
import { Search, AlertTriangle } from 'lucide-react'
import Modal from '../../Modal.jsx'

const quickFilters = ['All Materials', 'Papers', 'Inks', 'Vinyls', 'Equipment Parts']

const levelColor = {
  healthy: 'var(--color-success)',
  warning: 'var(--color-warning)',
  critical: 'var(--color-danger)',
}

export default function ViewAllInventoryModal({ items, onClose }) {
  const [filter, setFilter] = useState('All Materials')
  const [search, setSearch] = useState('')

  const filtered = items.filter((item) => {
    const matchesFilter = filter === 'All Materials' || item.name.toLowerCase().includes(filter.toLowerCase().replace(/s$/, ''))
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <Modal
      title="All Inventory Stock"
      onClose={onClose}
      size="lg"
      headerVariant="white"
      actions={<button className="btn btn-danger-outline" onClick={onClose}>Close</button>}
    >
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="flex-row gap-8" style={{ flexWrap: 'wrap' }}>
          {quickFilters.map((f) => (
            <button
              key={f}
              className={`chip-filter${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.startsWith('Low') ? <AlertTriangle size={12} style={{ marginRight: 4 }} /> : null}
              {f}
            </button>
          ))}
        </div>
        <div className="input-icon-wrap" style={{ width: 220 }}>
          <Search />
          <input className="input" placeholder="Search materials, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Unit</th>
              <th>Stock Level</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="cell-primary">{item.name}</div>
                  <div className="cell-sub">{item.sku}</div>
                </td>
                <td className="text-secondary">{item.unit}</td>
                <td>
                  <div className="flex-row gap-8">
                    <span className="cell-primary">{item.stock}</span>
                    <div style={{ width: 70, height: 6, borderRadius: 4, background: '#EFEFEF', overflow: 'hidden' }}>
                      <div style={{ width: `${item.stockPct}%`, height: '100%', background: levelColor[item.level] }} />
                    </div>
                  </div>
                </td>
                <td className="text-secondary">{item.supplier}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-secondary" style={{ textAlign: 'center', padding: 24 }}>No materials match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex-between" style={{ marginTop: 12 }}>
        <span className="section-sub">Showing {filtered.length} of {items.length} entries</span>
      </div>
    </Modal>
  )
}
