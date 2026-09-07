// Sample / mock data only — no backend. Swap these for real API calls later.
import {
  FileText, Sticker, Coffee, Shirt, CreditCard as CardIcon, Image as ImageIcon, ScrollText, Layers,
} from 'lucide-react'

// ---------- Products & Services ----------
export const productCategories = ['All Categories', 'Stationery', 'Marketing', 'Large Format', 'Adhesives', 'Souvenirs', 'Apparel']

export const customerProducts = [
  {
    id: 'business-cards',
    name: 'Business Cards',
    category: 'Stationery',
    badge: 'Cards',
    icon: CardIcon,
    color: '#00AEEF',
    price: 150,
    priceUnit: '100pcs',
    startingLabel: 'Starts at ₱150.00 / 100pcs',
    desc: 'Premium full-color business cards printed on high-quality cardstock.',
    sizes: ['Standard', 'Slim', 'Square'],
    materials: ['Matte', 'Glossy', 'Linen'],
    productionTime: '2-3 Business Days',
  },
  {
    id: 'flyers',
    name: 'Flyers',
    category: 'Marketing',
    badge: 'Marketing',
    icon: FileText,
    color: '#2E6FE0',
    price: 500,
    priceUnit: 'ream',
    startingLabel: 'Starts at ₱500.00 / ream',
    desc: 'High-quality promotional flyers available in A4, A5, and DL sizes.',
    sizes: ['A4', 'A5', 'DL'],
    materials: ['Matte', 'Glossy'],
    productionTime: '2-3 Business Days',
  },
  {
    id: 'tarpaulin',
    name: 'Tarpaulin',
    category: 'Large Format',
    badge: 'Large Format',
    icon: ScrollText,
    color: '#1AA053',
    price: 15,
    priceUnit: 'sq. ft.',
    startingLabel: 'Starts at ₱15.00 / sq. ft.',
    desc: 'Durable, weather-resistant tarpaulin prints ideal for outdoor advertising.',
    sizes: ['3ft x 6ft', '4ft x 8ft', 'Custom'],
    materials: ['Matte', 'Glossy'],
    productionTime: '1-2 Business Days',
  },
  {
    id: 'stickers',
    name: 'Stickers',
    category: 'Adhesives',
    badge: 'Adhesives',
    icon: Sticker,
    color: '#C97A00',
    price: 50,
    priceUnit: 'sheet',
    startingLabel: 'Starts at ₱50.00 / sheet',
    desc: 'Custom kiss-cut or die-cut vinyl stickers. Waterproof and durable.',
    sizes: ['2in', '3in', '4in', 'Custom'],
    materials: ['Vinyl', 'Paper', 'Holographic'],
    productionTime: '2-3 Business Days',
  },
  {
    id: 'souvenirs',
    name: 'Souvenirs',
    category: 'Souvenirs',
    badge: 'Souvenirs',
    icon: Coffee,
    color: '#D03B3B',
    price: 120,
    priceUnit: 'piece',
    startingLabel: 'Starts at ₱120.00 / piece',
    desc: 'Personalized gifts and corporate items such as mugs and keychains.',
    sizes: ['Standard'],
    materials: ['Ceramic', 'Acrylic', 'Metal'],
    productionTime: '3-5 Business Days',
  },
  {
    id: 'apparel',
    name: 'Custom Apparel',
    category: 'Apparel',
    badge: 'Apparel',
    icon: Shirt,
    color: '#7A3FE0',
    price: 250,
    priceUnit: 'piece',
    startingLabel: 'Starts at ₱250.00 / piece',
    desc: 'T-shirts, hoodies & uniforms customized with your own design.',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    materials: ['Cotton', 'Dri-Fit', 'Fleece'],
    productionTime: '3-5 Business Days',
  },
  {
    id: 'posters',
    name: 'Posters',
    category: 'Marketing',
    badge: 'Marketing',
    icon: ImageIcon,
    color: '#2E6FE0',
    price: 80,
    priceUnit: 'piece',
    startingLabel: 'Starts at ₱80.00 / piece',
    desc: 'Vivid full-color posters for events, campaigns, and displays.',
    sizes: ['A3', 'A2', 'A1'],
    materials: ['Matte', 'Glossy'],
    productionTime: '1-2 Business Days',
  },
  {
    id: 'labels',
    name: 'Product Labels',
    category: 'Adhesives',
    badge: 'Adhesives',
    icon: Layers,
    color: '#C97A00',
    price: 90,
    priceUnit: '100pcs',
    startingLabel: 'Starts at ₱90.00 / 100pcs',
    desc: 'Custom product and packaging labels with precise die-cutting.',
    sizes: ['Round', 'Square', 'Custom'],
    materials: ['Matte', 'Glossy', 'Clear'],
    productionTime: '2-3 Business Days',
  },
]

// ---------- Order tracking ----------
export const orderSteps = ['Order Placed', 'Designing', 'Printing', 'Ready for Pickup', 'Completed']

// currentStep is the index (0-based) into orderSteps that is the active/most recent step.
export const customerOrders = [
  {
    id: 'MJ-9021',
    placedAt: 'Oct 24, 2024 · 09:15 AM',
    lastUpdated: '2 hours ago',
    currentStep: 2,
    branch: 'Baliuag',
    items: [
      { name: 'Premium Silk Finish Business Cards', qty: '500 Units • 400gsm', price: 145.0 },
      { name: 'Large Format Vinyl Banner', qty: '1 Unit • 6ft x 3ft', price: 89.0 },
    ],
    expressFee: 25.0,
    estimatedCompletion: 'Oct 28, 2024',
  },
  {
    id: 'MJ-8975',
    placedAt: 'Oct 18, 2024 · 02:40 PM',
    lastUpdated: '3 days ago',
    currentStep: 4,
    branch: 'Tangos-Baliuag',
    items: [
      { name: 'Custom Apparel — Dri-Fit Polo', qty: '20 Units • Size M-XL', price: 5200.0 },
    ],
    expressFee: 0,
    estimatedCompletion: 'Oct 22, 2024',
  },
  {
    id: 'MJ-8890',
    placedAt: 'Oct 05, 2024 · 11:05 AM',
    lastUpdated: '2 weeks ago',
    currentStep: 4,
    branch: 'Baliuag',
    items: [
      { name: 'Kiss-Cut Vinyl Stickers', qty: '200 pcs • 3in', price: 780.0 },
      { name: 'Ceramic Mug Souvenirs', qty: '30 pcs • Standard', price: 3600.0 },
    ],
    expressFee: 0,
    estimatedCompletion: 'Oct 09, 2024',
  },
  {
    id: 'MJ-8712',
    placedAt: 'Sep 21, 2024 · 04:12 PM',
    lastUpdated: '1 month ago',
    currentStep: 1,
    branch: 'Piel',
    items: [
      { name: 'Tri-fold Flyers', qty: '2 reams • A4', price: 1000.0 },
    ],
    expressFee: 0,
    estimatedCompletion: 'Sep 25, 2024',
  },
  {
    id: 'MJ-8590',
    placedAt: 'Sep 02, 2024 · 10:30 AM',
    lastUpdated: '2 months ago',
    currentStep: 4,
    branch: 'Baliuag',
    items: [
      { name: 'Event Posters', qty: '10 pcs • A2', price: 800.0 },
    ],
    expressFee: 0,
    estimatedCompletion: 'Sep 05, 2024',
  },
]

// ---------- Notifications ----------
export const customerNotifications = [
  { id: 1, category: 'Orders', type: 'success', title: 'Order #MJ-9021 is now Printing', desc: 'Your business cards and vinyl banner have moved to the printing stage. Estimated completion: Oct 28.', time: '2 hours ago', unread: true, action: 'Track Order' },
  { id: 2, category: 'Payments', type: 'info', title: 'Payment Confirmed for MJ-9021', desc: 'Payment of ₱259.00 has been received and applied to your order.', time: 'Yesterday', unread: true, action: 'View Receipt' },
  { id: 3, category: 'Promotions', type: 'success', title: 'New Discount Applied', desc: 'You\u2019ve received a 10% loyalty discount on your next order of ₱2,000 or more.', time: 'Oct 21, 2024', unread: false, action: 'Order Now' },
  { id: 4, category: 'Orders', type: 'success', title: 'Order #MJ-8975 Completed', desc: 'Your custom apparel order has been marked completed and is ready for pickup.', time: 'Oct 18, 2024', unread: false, action: 'Track Order' },
  { id: 5, category: 'Announcements', type: 'info', title: 'Scheduled Maintenance Notice', desc: 'The client portal will be briefly unavailable on Nov 1st, 12:00 AM \u2013 2:00 AM for scheduled maintenance.', time: 'Oct 16, 2024', unread: false, action: 'Learn More' },
]

// ---------- Profile / Settings ----------
export const customerPassword = 'customer123'

export const customerAddresses = [
  { id: 1, label: 'Home', name: 'Alexander Sterling', address: '123 Emerald Ave, Ortigas Center, Pasig City, Metro Manila 1605', phone: '+63 917 123 4567' },
  { id: 2, label: 'Work', name: 'MJ Prints HQ', address: 'Floor 12, High-Tech Tower BGC, Taguig City 1634', phone: '+63 2 8888 0000' },
]

export const customerPaymentMethods = [
  { id: 1, type: 'Visa', last4: '4242', exp: '12/26', primary: false },
  { id: 2, type: 'GCash', last4: '4567', exp: null, primary: true },
]

export const customerDevices = [
  { id: 1, label: 'Chrome on macOS Monterey', location: 'Quezon City, Philippines • 2 mins ago', current: true },
  { id: 2, label: 'iPhone 14 Pro', location: 'Makati City, Philippines • Yesterday, 4:21 PM', current: false },
]
