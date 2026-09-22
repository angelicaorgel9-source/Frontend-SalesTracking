import { useEffect, useMemo, useState } from 'react'
import { Search, ListOrdered, Printer } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import ProductDetailsModal from '../../components/customer/modals/ProductDetailsModal.jsx'
import NewOrderModal from '../../components/customer/modals/NewOrderModal.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../utils/api.js'

const sortOptions = ['Popular', 'Price: Low to High', 'Price: High to Low', 'Name: A-Z']

export default function ProductsServices() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('All Categories')
  const [sort, setSort] = useState(sortOptions[0])
  const [viewProduct, setViewProduct] = useState(null)
  const [orderProduct, setOrderProduct] = useState(null)

  useEffect(() => {
    api.getProducts()
      .then((items) => setProducts(items.map((product) => ({
        ...product,
        id: String(product.id),
        desc: product.description,
        price: Number(product.price),
        priceUnit: 'unit',
        startingLabel: `Starts at ₱${Number(product.price).toFixed(2)} / unit`,
        badge: product.category || 'Printing',
        color: '#00AEEF',
        icon: Printer,
        sizes: ['Standard', 'Custom'],
        materials: ['Standard', 'Premium'],
        productionTime: '2-3 Business Days',
      }))))
      .catch(() => setProducts([]))
  }, [])

  const availableProducts = products
  const productCategories = ['All Categories', ...new Set(availableProducts.map((product) => product.category).filter(Boolean))]

  const filtered = useMemo(() => {
    let list = availableProducts.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All Categories' || p.category === category
      return matchesSearch && matchesCategory
    })
    if (sort === 'Price: Low to High') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'Price: High to Low') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'Name: A-Z') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [availableProducts, search, category, sort])

  const handleSaveOrder = async (order) => {
    try {
      const saved = await api.createOrder({
        customer_name: order.customer.name,
        customer_phone: order.customer.contact,
        customer_email: order.customer.email,
        payment_method: order.payment.toUpperCase() === 'GCASH' ? 'GCASH' : 'CASH',
        items: [{
          product: order.product.service_id || order.product.id,
          item_name: order.product.name,
          quantity: order.quantity,
          unit_price: order.product.price,
          size: order.size,
          material: order.material,
          specifications: order.notes,
        }],
      })
      setOrderProduct(null)
      showToast(`Order ${saved.transaction_id} submitted successfully!`, 'success')
      navigate('/customer/my-orders')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <CustomerLayout>
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4, color: 'var(--color-primary)' }}>Products &amp; Services</h1>
          <div className="section-sub" style={{ maxWidth: 560 }}>
            Browse all available printing products and services offered by MJ Prints. Select a category to narrow down
            your search or explore our popular items.
          </div>
        </div>
        <Link to="/customer/my-orders" className="link-btn flex-row gap-8">
          <ListOrdered size={14} /> My Orders
        </Link>
      </div>

      <div className="card card-pad mb-20">
        <div className="flex-row gap-10" style={{ flexWrap: 'wrap' }}>
          <div className="topbar-search" style={{ flex: 1, minWidth: 220 }}>
            <Search />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input" style={{ maxWidth: 190 }} value={category} onChange={(e) => setCategory(e.target.value)}>
            {productCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" style={{ maxWidth: 190 }} value={sort} onChange={(e) => setSort(e.target.value)}>
            {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="page-title" style={{ fontSize: 16, marginBottom: 14 }}>Featured Products &amp; Services</div>

      <div className="customer-product-grid">
        {filtered.map((p) => {
          const Icon = p.icon
          return (
            <div key={p.id} className="customer-product-card customer-product-card-full">
              <div className="customer-product-thumb" style={{ background: `linear-gradient(135deg, ${p.color}26, ${p.color}08)`, position: 'relative' }}>
                <Icon size={40} color={p.color} strokeWidth={1.5} />
                <span className="badge badge-neutral" style={{ position: 'absolute', top: 10, right: 10 }}>{p.badge}</span>
              </div>
              <div className="customer-product-info">
                <div className="cell-primary">{p.name}</div>
                <div className="cell-sub" style={{ marginBottom: 8 }}>{p.desc}</div>
                <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
                  {p.startingLabel}
                </div>
                <div className="flex-row gap-8">
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setViewProduct(p)}>View Details</button>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setOrderProduct(p)}>Order Now</button>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="section-sub" style={{ padding: '30px 0' }}>No products match your search.</div>
        )}
      </div>

      {viewProduct && (
        <ProductDetailsModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onOrder={(p) => { setViewProduct(null); setOrderProduct(p) }}
        />
      )}
      {orderProduct && (
        <NewOrderModal
          initialProduct={orderProduct}
          products={availableProducts}
          onClose={() => setOrderProduct(null)}
          onSave={handleSaveOrder}
        />
      )}
    </CustomerLayout>
  )
}
