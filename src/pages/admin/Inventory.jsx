import { useState } from 'react'
import { AlertTriangle, Pencil, Eye, Plus } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import ActionMenu from '../../components/ActionMenu.jsx'
import NewPurchaseOrderModal from '../../components/admin/modals/NewPurchaseOrderModal.jsx'
import ViewAllInventoryModal from '../../components/admin/modals/ViewAllInventoryModal.jsx'
import { inventoryItems as seedItems } from '../../data/adminMockData.js'
import { downloadCsv } from '../../utils/csv.js'
import { useToast } from '../../context/ToastContext.jsx'

const quickFilters = ['All Materials', 'Papers', 'Inks', 'Vinyls', 'Equipment Parts']

const levelColor = {
  healthy: 'var(--color-success)',
  warning: 'var(--color-warning)',
  critical: 'var(--color-danger)',
}

export default function Inventory() {
  const { showToast } = useToast()
  const [items, setItems] = useState(seedItems)
  const [filter, setFilter] = useState('All Materials')
  const [showNewPO, setShowNewPO] = useState(false)
  const [showViewAll, setShowViewAll] = useState(false)

  const filteredItems = items.filter((item) => (
    filter === 'All Materials' || item.name.toLowerCase().includes(filter.toLowerCase().replace(/s$/, ''))
  ))

  const handleSaveMaterial = (material) => {
    const newItem = {
      id: items.length + 1,
      name: material.name,
      sku: `SKU: ${material.sku || 'N/A'}`,
      unit: material.unit,
      stock: Number(material.quantity) || 0,
      stockPct: 100,
      level: 'healthy',
      supplier: material.supplier || '—',
    }
    setItems((prev) => [newItem, ...prev])
    setShowNewPO(false)
    showToast('Material added to inventory', 'success')
  }

  const handleExportReport = () => {
    downloadCsv({
      filename: 'stock-report.csv',
      columns: ['Material', 'SKU', 'Unit', 'Stock', 'Supplier'],
      rows: items.map((i) => [i.name, i.sku, i.unit, i.stock, i.supplier]),
    })
    showToast('Stock report exported', 'success')
  }

  return (
    <AdminLayout
      topbarProps={{
        title: null,
        searchPlaceholder: 'Search inventory, suppliers, or materials...',
      }}
    >
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="flex-row gap-8" style={{ flexWrap: 'wrap' }}>
          <span className="section-sub" style={{ fontWeight: 600, marginRight: 4 }}>Quick Filters</span>
          {quickFilters.map((f) => (
            <button key={f} className={`chip-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleExportReport}>Export Stock Report ⤓</button>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-pad flex-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="section-title">Materials</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNewPO(true)}><Plus /> New Purchase Order</button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Unit</th>
                  <th>Stock Level</th>
                  <th>Supplier</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
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
                    <td>
                      <ActionMenu
                        items={[
                          { label: 'View', icon: Eye, onClick: () => setShowViewAll(true) },
                          { label: 'Remove', danger: true, onClick: () => {
                            setItems((prev) => prev.filter((it) => it.id !== item.id))
                            showToast(`${item.name} removed`, 'success')
                          } },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr><td colSpan={5} className="text-secondary" style={{ textAlign: 'center', padding: 20 }}>No materials in this category.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title mb-16">Stock Health</div>

          <div className="flex-between mb-16">
            <span className="text-secondary" style={{ fontSize: 13 }}>Critical Lows</span>
            <span className="badge badge-danger">12 Items</span>
          </div>
          <div className="flex-between mb-16">
            <span className="text-secondary" style={{ fontSize: 13 }}>Reorder Warning</span>
            <span className="badge badge-warning">8 Items</span>
          </div>
          <div className="flex-between mb-20">
            <span className="text-secondary" style={{ fontSize: 13 }}>Healthy Levels</span>
            <span className="badge badge-success">142 Items</span>
          </div>

          <div className="flex-between" style={{ marginBottom: 6 }}>
            <span className="text-secondary" style={{ fontSize: 12.5 }}>Stock Remaining</span>
            <span className="cell-primary" style={{ fontSize: 12.5 }}>68%</span>
          </div>
          <div style={{ width: '100%', height: 6, borderRadius: 4, background: '#EFEFEF', overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ width: '68%', height: '100%', background: 'var(--color-primary)' }} />
          </div>

          <div style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div className="flex-row gap-8" style={{ color: 'var(--color-danger)', marginBottom: 8, fontWeight: 700, fontSize: 12.5 }}>
              <AlertTriangle size={15} /> Low Stock Alerts
            </div>
            <div className="cell-primary" style={{ fontSize: 13 }}>Matte Vinyl Roll - 54&Prime; <span style={{ color: 'var(--color-danger)' }}>2 left</span></div>
            <div className="cell-sub">Main Warehouse</div>
          </div>

          <button className="btn btn-outline btn-full" style={{ marginTop: 16 }} onClick={() => setShowViewAll(true)}>View All</button>
        </div>
      </div>

      {showNewPO && (
        <NewPurchaseOrderModal onClose={() => setShowNewPO(false)} onSave={handleSaveMaterial} />
      )}

      {showViewAll && (
        <ViewAllInventoryModal items={items} onClose={() => setShowViewAll(false)} />
      )}
    </AdminLayout>
  )
}
