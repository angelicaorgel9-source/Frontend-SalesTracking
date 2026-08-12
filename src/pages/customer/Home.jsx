import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ListOrdered } from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import logo from '../../assets/logo.png'
import { customerProducts } from '../../data/customerMockData.js'
import { useToast } from '../../context/ToastContext.jsx'

const featuredIds = ['tarpaulin', 'stickers', 'souvenirs', 'apparel']

export default function Home() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [transactionId, setTransactionId] = useState('')
  const featured = featuredIds.map((id) => customerProducts.find((p) => p.id === id)).filter(Boolean)

  const handleTrack = () => {
    if (!transactionId.trim()) {
      showToast('Please enter a transaction ID to track.', 'error')
      return
    }
    navigate(`/customer/track-order?id=${encodeURIComponent(transactionId.trim())}`)
  }

  return (
    <CustomerLayout>
      <div className="customer-hero">
        <img src={logo} alt="MJ Prints" />
      </div>

      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Our Services</h1>
          <div className="section-sub">High-quality prints for every need</div>
        </div>
        <Link to="/customer/products-services" className="link-btn flex-row gap-8">
          View All Categories <ArrowRight size={14} />
        </Link>
      </div>

      <div className="customer-product-grid mb-20">
        {featured.map((p) => {
          const Icon = p.icon
          return (
            <div
              key={p.id}
              className="customer-product-card"
              onClick={() => navigate('/customer/products-services')}
            >
              <div className="customer-product-thumb" style={{ background: `linear-gradient(135deg, ${p.color}26, ${p.color}08)` }}>
                <Icon size={34} color={p.color} strokeWidth={1.5} />
              </div>
              <div className="customer-product-info">
                <div className="cell-primary">{p.name}</div>
                <div className="cell-sub">{p.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card card-pad customer-track-box">
        <div className="flex-row gap-10 mb-16">
          <span className="stat-icon"><ListOrdered size={16} /></span>
          <div>
            <div className="cell-primary" style={{ fontSize: 14 }}>Track Your Order</div>
            <div className="cell-sub">Enter your unique transaction ID to get real-time production updates.</div>
          </div>
        </div>
        <div className="flex-row gap-10" style={{ flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: 220 }}
            placeholder="Transaction ID (e.g., MJ-12345)"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
          />
          <button className="btn btn-primary" onClick={handleTrack}>Track Now</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <Link to="/customer/my-orders" className="link-btn">View all your orders →</Link>
        </div>
      </div>
    </CustomerLayout>
  )
}
