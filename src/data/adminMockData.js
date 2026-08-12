// Sample / mock data only — no backend. Swap these for real API calls later.

export const customerDirectory = [
  { id: 1, initials: 'VS', company: 'Vanguard Solutions', type: 'Marketing Agency', status: 'Active', contact: 'Sarah Jenkins', ltv: '₱42,500.00', lastOrder: 'Oct 24, 2023' },
  { id: 2, initials: 'NL', company: 'Nexus Logistics', type: 'Freight Services', status: 'Printing', contact: 'Robert Chen', ltv: '₱12,840.50', lastOrder: 'Nov 02, 2023' },
  { id: 3, initials: 'BA', company: 'Blue Atlantic', type: 'Retail Group', status: 'Pending', contact: 'Maria Garcia', ltv: '₱8,200.00', lastOrder: 'Oct 29, 2023' },
  { id: 4, initials: 'ST', company: 'Silver Tech', type: 'SaaS Platform', status: 'Active', contact: 'David Wilson', ltv: '₱21,300.00', lastOrder: 'Nov 01, 2023' },
]

export const customerRegistry = [
  { id: 1, initials: 'SM', name: 'Sarah Mitchell', company: 'Mitchell Design Agency', email: 's.mitchell@designagency.com', phone: '+1 (555) 012-3456', orders: 42, spend: '₱12,450', spendLabel: 'Total Spend', lastDate: 'Oct 24, 2023', lastNote: 'Banner Printing #6841' },
  { id: 2, initials: 'JK', name: 'James Kincaid', company: 'Freelance Photographer', email: 'jk.photo@gmail.com', phone: '+1 (555) 987-6543', orders: 12, spend: '₱2,100', spendLabel: 'Total Spend', lastDate: 'Oct 21, 2023', lastNote: 'Glossy Photo Paper x50' },
  { id: 3, initials: 'LR', name: 'Lydia Russo', company: 'Bloom Event Planning', email: 'lydia@bloomevents.co', phone: '+1 (555) 444-3210', orders: 85, spend: '₱45,600', spendLabel: 'Total Spend', lastDate: 'Oct 19, 2023', lastNote: 'Wedding Invites Bulk' },
  { id: 4, initials: 'AB', company: 'Local Library Assoc.', name: 'Arthur Brown', email: 'a.brown@library.org', phone: '+1 (555) 777-8899', orders: 3, spend: '₱420', spendLabel: 'Total Spend', lastDate: 'Aug 05, 2023', lastNote: 'Poster Lamination' },
]

export const orders = [
  { id: 'ORD-2023-8902', minutesAgo: '2 mins ago', customer: 'Global Logistics Co.', initials: 'GL', email: 'sarah@globallog.com', project: 'Vinyl Banners', details: '(500 units) High Gloss, 13oz Heavy Duty', branch: 'Baliuag', status: 'Pending Proof', statusType: 'warning', value: '$4,250.00' },
  { id: 'ORD-2023-8899', minutesAgo: '1 hour ago', customer: 'Metro Kitchens', initials: 'MK', email: 'billing@metrokitchens.io', project: 'Business Cards (2k)', details: '32pt Silk Touch, Gold Foil', branch: 'Tangos-Baliuag', status: 'Printing', statusType: 'danger', value: '$890.00' },
  { id: 'ORD-2023-8894', minutesAgo: '4 hours ago', customer: 'Apex Studios', initials: 'AS', email: 'jason@apex.design', project: 'Acrylic Lobby Signage', details: 'Standoff Mount, Backlit LED', branch: 'Piel', status: 'Completed', statusType: 'success', value: '$1,850.50' },
  { id: 'ORD-2023-8560', minutesAgo: 'Yesterday', customer: 'Urban Realty', initials: 'UR', email: 'info@urban.com', project: 'Yard Signs (50 units)', details: 'Double-sided, H-Stakes', branch: 'Baliuag', status: 'Shipped', statusType: 'neutral', value: '$650.00' },
]

export const inventoryItems = [
  { id: 1, name: 'Bond Paper 80gsm', sku: 'SKU: BP-80-WH', unit: 'Ream (500)', stock: 450, stockPct: 78, level: 'healthy', supplier: 'Global Paper Co.' },
  { id: 2, name: 'Eco-Solvent Ink XL', sku: 'SKU: ES-INK-BLK', unit: 'Liters', stock: 12, stockPct: 22, level: 'warning', supplier: 'ColorMaster Int.' },
  { id: 3, name: 'Frosted Window Film', sku: 'SKU: VF-FR-50', unit: 'Meters', stock: 2, stockPct: 6, level: 'critical', supplier: 'Vinyl Solutions Ltd.' },
  { id: 4, name: '300gsm Glossy Cardstock', sku: 'SKU: CS-300-GL', unit: 'Pack (100)', stock: 24, stockPct: 60, level: 'healthy', supplier: 'Premium Supplies' },
]

export const revenueTrend = [
  { month: 'Jan', value: 62 },
  { month: 'Feb', value: 58 },
  { month: 'Mar', value: 92 },
  { month: 'Apr', value: 45 },
  { month: 'May', value: 88 },
  { month: 'Jun', value: 70 },
  { month: 'Jul', value: 96 },
]

export const customerGrowthTrend = [
  { label: 'W1', value: 30 },
  { label: 'W2', value: 42 },
  { label: 'W3', value: 26 },
  { label: 'W4', value: 88 },
  { label: 'W5', value: 46 },
  { label: 'W6', value: 38 },
]

export const branchPerformance = [
  { branch: 'Poblacion', volume: '482 orders', revenue: '$52,400.00', efficiency: '98.2%', status: 'Active', trend: '4.2%', trendDir: 'up' },
  { branch: 'Branch 2', volume: '312 orders', revenue: '$38,150.00', efficiency: '92.5%', status: 'Active', trend: '1.8%', trendDir: 'up' },
  { branch: 'Branch 3', volume: '254 orders', revenue: '$28,900.00', efficiency: '88.4%', status: 'Active', trend: '0.5%', trendDir: 'down' },
  { branch: 'Branch 4', volume: '236 orders', revenue: '$23,400.00', efficiency: '94.1%', status: 'Active', trend: '8.4%', trendDir: 'up' },
]

export const branchProfiles = [
  { name: 'Baliuag', tag: 'Main Production Hub', location: 'Baliuag, Bayan', status: 'Active' },
  { name: 'Tangos - baliuag', tag: 'Design & Prototyping', location: 'Tangos, Baliuag', status: 'Active' },
  { name: 'Sabang', tag: 'Distribution Center', location: 'Sabang, Baliuag', status: 'Maintenance' },
]

// Mock admin credential for local verification (UI-only)
export const adminPassword = 'admin123'

export const employeeUsers = [
  { key: 'mjpAdmin001', name: 'Juan Dela Cruz', role: 'ADMIN', created: 'Dec 12, 2023', status: 'ACTIVE', code: '' },
  { key: 'mjpEmployee001', name: 'Juan Dela Cruz', role: 'Employee', created: 'Feb 14, 2024', status: 'ACTIVE', code: 'MJP-001-e001' },
  { key: 'mjpEmployee001', name: 'Juan Dela Cruz', role: 'Employee', created: 'Feb 14, 2024', status: 'RESIGNED', code: 'MJP-002-e005' },
]

export const notifications = [
  { id: 1, category: 'Orders', type: 'success', title: 'Order #INF-8842 Ready for Pickup', desc: 'Your custom corporate apparel batch is ready. Please visit the main warehouse pickup desk with your confirmation code.', time: '10:42 AM', unread: true, action: 'View Details' },
  { id: 2, category: 'Payments', type: 'info', title: 'Payment Confirmed for MJ-9921', desc: 'Payment of $1,420.00 for your bulk flyer order has been processed. Production of your items will begin within 24 hours.', time: 'Yesterday', unread: true, action: 'View Receipt' },
  { id: 3, category: 'Promotions', type: 'success', title: 'New Discount Applied', desc: 'Great news! We\u2019ve added a 15% loyalty discount to your account for your next order. Valid for all digital printing services.', time: 'Oct 21, 2023', unread: false, action: 'Apply to Order' },
  { id: 4, category: 'Orders', type: 'warning', title: 'Production Started #INF-8842', desc: 'Your design has passed quality check and is now being printed. Estimated completion: Oct 26th.', time: 'Oct 22, 2023', unread: false, action: 'Track Progress' },
  { id: 5, category: 'Announcements', type: 'info', title: 'Scheduled Maintenance Notice', desc: 'The client portal will be briefly unavailable on Nov 1st, 12:00 AM \u2013 2:00 AM for scheduled maintenance.', time: 'Oct 18, 2023', unread: false, action: 'Learn More' },
]

export const payrollEntries = [
  { id: 'e001', name: 'Maria Santos', branch: 'MJP-001', position: 'Employee', gross: '₱45,000', deductions: '-₱4,500', net: '₱40,500', status: 'PAID' },
  { id: 'e002', name: 'Juan Dela Cruz', branch: 'MJP-001', position: 'Employee', gross: '₱32,000', deductions: '-₱3,200', net: '₱28,800', status: 'PENDING' },
  { id: 'e003', name: 'Ana Reyes', branch: 'MJP-001', position: 'Employee', gross: '₱38,000', deductions: '-₱3,800', net: '₱34,200', status: 'PROCESSING' },
  { id: 'e004', name: 'Pedro Garcia', branch: 'MJP-001', position: 'Editor', gross: '₱28,000', deductions: '-₱2,800', net: '₱25,200', status: 'PAID' },
  { id: 'e005', name: 'Elena Bautista', branch: 'MJP-001', position: 'Admin', gross: '₱35,000', deductions: '-₱3,500', net: '₱31,500', status: 'PENDING' },
]
