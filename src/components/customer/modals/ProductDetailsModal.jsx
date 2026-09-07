import { X, Clock, Ruler, Layers } from 'lucide-react'

export default function ProductDetailsModal({ product, onClose, onOrder }) {
  if (!product) return null
  const Icon = product.icon

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-md" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" style={{ position: 'absolute', top: 14, right: 14, zIndex: 2 }} onClick={onClose}>
          <X size={18} />
        </button>
        <div
          className="product-modal-hero"
          style={{ background: `linear-gradient(135deg, ${product.color}22, ${product.color}05)` }}
        >
          <Icon size={56} color={product.color} strokeWidth={1.5} />
        </div>
        <div className="modal-body" style={{ paddingTop: 20 }}>
          <div className="section-sub" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            {product.category}
          </div>
          <h3 style={{ fontSize: 20, margin: '4px 0 8px' }}>{product.name}</h3>
          <div className="flex-row gap-8 mb-16" style={{ alignItems: 'baseline' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 18 }}>
              ₱{product.price.toLocaleString()}.00
            </span>
            <span className="section-sub">Starting Price</span>
          </div>
          <p className="text-secondary" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>
            {product.desc}
          </p>

          <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="card card-pad" style={{ padding: 14 }}>
              <div className="flex-row gap-8 mb-16" style={{ marginBottom: 8 }}>
                <Ruler size={14} />
                <span className="cell-primary" style={{ fontSize: 12.5 }}>Available Sizes</span>
              </div>
              <div className="flex-row gap-8" style={{ flexWrap: 'wrap' }}>
                {product.sizes.map((s) => (
                  <span key={s} className="chip-filter active" style={{ cursor: 'default' }}>{s}</span>
                ))}
              </div>
            </div>
            <div className="card card-pad" style={{ padding: 14 }}>
              <div className="flex-row gap-8" style={{ marginBottom: 8 }}>
                <Layers size={14} />
                <span className="cell-primary" style={{ fontSize: 12.5 }}>Available Materials</span>
              </div>
              <div className="flex-row gap-8" style={{ flexWrap: 'wrap' }}>
                {product.materials.map((m) => (
                  <span key={m} className="chip-filter active" style={{ cursor: 'default' }}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="card card-pad flex-row gap-10 mb-20" style={{ padding: 14 }}>
            <Clock size={16} color="var(--color-primary)" />
            <div>
              <div className="section-sub">Production Time</div>
              <div className="cell-primary" style={{ fontSize: 13 }}>{product.productionTime}</div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={() => onOrder(product)}>
              <Layers size={14} /> Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
