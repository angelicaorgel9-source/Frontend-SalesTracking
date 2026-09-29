import { useEffect, useState } from 'react'
import { AlertTriangle, Eye, Plus } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import ActionMenu from '../../components/ActionMenu.jsx'
import NewPurchaseOrderModal from '../../components/admin/modals/NewPurchaseOrderModal.jsx'
import ViewAllInventoryModal from '../../components/admin/modals/ViewAllInventoryModal.jsx'
import { downloadCsv } from '../../utils/csv.js'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'

const quickFilters = ['All Materials', 'Papers', 'Inks', 'Vinyls', 'Equipment Parts']
const levelColor = { healthy: 'var(--color-success)', warning: 'var(--color-warning)', critical: 'var(--color-danger)' }

export default function Inventory() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [branches, setBranches] = useState([])
  const [filter, setFilter] = useState('All Materials')
  const [showNewPO, setShowNewPO] = useState(false)
  const [showViewAll, setShowViewAll] = useState(false)

  const refreshInventory = async () => {
    const [records, branchRecords] = await Promise.all([api.getInventory(), api.getBranches()])
    setBranches(branchRecords)
    setItems(records.map((record) => ({
      ...record,
      name: record.product_name,
      stock: record.quantity,
      unit: 'unit',
      sku: `Branch: ${record.branch_name}`,
      supplier: record.branch_name,
      stockPct: Math.min(100, Math.max(0, record.quantity * 10)),
      level: record.low_stock ? 'critical' : record.quantity <= record.low_stock_threshold * 2 ? 'warning' : 'healthy',
    })))
  }

  useEffect(() => {
    refreshInventory().catch((error) => showToast(error.message, 'error'))
  }, [showToast])

  const filteredItems = items.filter((item) => (
    filter === 'All Materials' || item.name.toLowerCase().includes(filter.toLowerCase().replace(/s$/, ''))
  ))
  const stockRemaining = items.length
    ? Math.round(items.reduce((sum, item) => sum + item.stockPct, 0) / items.length)
    : 0

  const handleSaveMaterial = async (material) => {
    try {
      if (!branches.length) throw new Error('Create a branch before adding inventory.')
      const product = await api.createProduct({
        name: material.name,
        category: 'Inventory',
        description: material.supplier ? `Supplier: ${material.supplier}` : '',
        price: '0.00',
        stock: Number(material.quantity) || 0,
      })
      await api.createInventory({ branch: branches[0].id, product: product.id, quantity: Number(material.quantity) || 0 })
      await refreshInventory()
      setShowNewPO(false)
      showToast('Material added to inventory', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleExportReport = () => {
    downloadCsv({
      filename: 'stock-report.csv',
      columns: ['Material', 'Branch', 'Unit', 'Stock'],
      rows: items.map((item) => [item.name, item.branch_name, item.unit, item.stock]),
    })
    showToast('Stock report exported', 'success')
  }

  const removeInventory = async (item) => {
    try {
      await api.deleteInventory(item.id)
      await refreshInventory()
      showToast(`${item.name} removed`, 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <AdminLayout topbarProps={{ title: null, searchPlaceholder: 'Search inventory, suppliers, or materials...' }}>
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="flex-row gap-8" style={{ flexWrap: 'wrap' }}>
          <span className="section-sub" style={{ fontWeight: 600, marginRight: 4 }}>Quick Filters</span>
          {quickFilters.map((option) => (
            <button key={option} className={`chip-filter${filter === option ? ' active' : ''}`} onClick={() => setFilter(option)}>{option}</button>
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
              <thead><tr><th>Material Name</th><th>Unit</th><th>Stock Level</th><th>Branch</th><th>Action</th></tr></thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td><div className="cell-primary">{item.name}</div><div className="cell-sub">{item.sku}</div></td>
                    <td className="text-secondary">{item.unit}</td>
                    <td><div className="flex-row gap-8"><span className="cell-primary">{item.stock}</span><div style={{ width: 70, height: 6, borderRadius: 4, background: '#EFEFEF', overflow: 'hidden' }}><div style={{ width: `${item.stockPct}%`, height: '100%', background: levelColor[item.level] }} /></div></div></td>
                    <td className="text-secondary">{item.branch_name}</td>
                    <td><ActionMenu items={[{ label: 'View', icon: Eye, onClick: () => setShowViewAll(true) }, { label: 'Remove', danger: true, onClick: () => removeInventory(item) }]} /></td>
                  </tr>
                ))}
                {!filteredItems.length && <tr><td colSpan={5} className="text-secondary" style={{ textAlign: 'center', padding: 20 }}>No materials in this category.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title mb-16">Stock Health</div>
          <div className="flex-between mb-16"><span className="text-secondary" style={{ fontSize: 13 }}>Critical Lows</span><span className="badge badge-danger">{items.filter((item) => item.level === 'critical').length} Items</span></div>
          <div className="flex-between mb-16"><span className="text-secondary" style={{ fontSize: 13 }}>Reorder Warning</span><span className="badge badge-warning">{items.filter((item) => item.level === 'warning').length} Items</span></div>
          <div className="flex-between mb-20"><span className="text-secondary" style={{ fontSize: 13 }}>Healthy Levels</span><span className="badge badge-success">{items.filter((item) => item.level === 'healthy').length} Items</span></div>
          <div className="flex-between" style={{ marginBottom: 6 }}><span className="text-secondary" style={{ fontSize: 12.5 }}>Stock Remaining</span><span className="cell-primary" style={{ fontSize: 12.5 }}>{stockRemaining}%</span></div>
          <div style={{ width: '100%', height: 6, borderRadius: 4, background: '#EFEFEF', overflow: 'hidden', marginBottom: 20 }}><div style={{ width: `${stockRemaining}%`, height: '100%', background: 'var(--color-primary)' }} /></div>
          <div style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div className="flex-row gap-8" style={{ color: 'var(--color-danger)', marginBottom: 8, fontWeight: 700, fontSize: 12.5 }}><AlertTriangle size={15} /> Low Stock Alerts</div>
            <div className="cell-primary" style={{ fontSize: 13 }}>{items.find((item) => item.level === 'critical')?.name || 'No low-stock items'}</div>
            <div className="cell-sub">{items.find((item) => item.level === 'critical')?.branch_name || ''}</div>
          </div>
          <button className="btn btn-outline btn-full" style={{ marginTop: 16 }} onClick={() => setShowViewAll(true)}>View All</button>
        </div>
      </div>

      {showNewPO && <NewPurchaseOrderModal onClose={() => setShowNewPO(false)} onSave={handleSaveMaterial} />}
      {showViewAll && <ViewAllInventoryModal items={items} onClose={() => setShowViewAll(false)} />}
    </AdminLayout>
  )
}