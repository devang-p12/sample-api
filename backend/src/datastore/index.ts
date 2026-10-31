import { User, Product, Order, Payment, InventoryItem, NotificationItem } from '../types/index.js';

const INITIAL_USERS: User[] = [
  {
    id: 'usr_1001',
    name: 'Sarah Connor',
    email: 'sarah.connor@skyline.io',
    role: 'admin',
    status: 'active',
    department: 'Engineering',
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-03-10T14:22:00Z',
  },
  {
    id: 'usr_1002',
    name: 'Alex Mercer',
    email: 'alex.mercer@apex.dev',
    role: 'developer',
    status: 'active',
    department: 'Infrastructure',
    createdAt: '2026-02-01T09:15:00Z',
    updatedAt: '2026-03-12T11:45:00Z',
  },
  {
    id: 'usr_1003',
    name: 'Elena Rostova',
    email: 'elena.rostova@cyberdyn.org',
    role: 'support',
    status: 'active',
    department: 'Customer Success',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-03-01T09:30:00Z',
  },
  {
    id: 'usr_1004',
    name: 'Devon Vance',
    email: 'devon.vance@lumina.net',
    role: 'user',
    status: 'active',
    department: 'Marketing',
    createdAt: '2026-02-14T16:20:00Z',
    updatedAt: '2026-02-14T16:20:00Z',
  },
  {
    id: 'usr_1005',
    name: 'Maya Lin',
    email: 'maya.lin@orbital.tech',
    role: 'developer',
    status: 'suspended',
    department: 'Product',
    createdAt: '2026-02-20T11:10:00Z',
    updatedAt: '2026-03-15T18:00:00Z',
  },
  {
    id: 'usr_1006',
    name: 'Marcus Brody',
    email: 'marcus.brody@archetype.co',
    role: 'user',
    status: 'pending',
    department: 'Finance',
    createdAt: '2026-03-01T13:40:00Z',
    updatedAt: '2026-03-01T13:40:00Z',
  },
  {
    id: 'usr_1007',
    name: 'Rachel Zane',
    email: 'rachel.zane@lawcorp.io',
    role: 'admin',
    status: 'active',
    department: 'Legal',
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-20T17:15:00Z',
  },
  {
    id: 'usr_1008',
    name: 'Tariq Hassan',
    email: 'tariq.hassan@quantumsys.com',
    role: 'developer',
    status: 'active',
    department: 'Engineering',
    createdAt: '2026-03-10T12:00:00Z',
    updatedAt: '2026-03-22T10:10:00Z',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prd_2001',
    name: 'Sentinel Pro Ultra Laptop',
    description: 'High-performance workstation with 32GB RAM, 1TB NVMe SSD and 16-core neural processor.',
    price: 2499.00,
    category: 'Laptops',
    stock: 45,
    sku: 'SN-LAP-001',
    status: 'in_stock',
    rating: 4.9,
    tags: ['workstation', 'hardware', 'laptop', 'developer'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'prd_2002',
    name: 'Quantum Edge 4K OLED Monitor',
    description: '32-inch 4K HDR display with 144Hz refresh rate, USB-C 90W power delivery.',
    price: 899.00,
    category: 'Monitors',
    stock: 28,
    sku: 'SN-MON-002',
    status: 'in_stock',
    rating: 4.8,
    tags: ['display', 'oled', '4k', 'monitor'],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-03-12T14:00:00Z',
  },
  {
    id: 'prd_2003',
    name: 'CyberAcoustic Noise-Cancelling Headphones',
    description: 'Studio-grade wireless over-ear headphones with active adaptive noise cancellation.',
    price: 349.00,
    category: 'Audio',
    stock: 120,
    sku: 'SN-AUD-003',
    status: 'in_stock',
    rating: 4.7,
    tags: ['audio', 'wireless', 'headphones', 'anc'],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-03-14T08:30:00Z',
  },
  {
    id: 'prd_2004',
    name: 'Tactile MechMatrix Keyboard',
    description: 'Custom hot-swappable mechanical keyboard with lubricated linear switches and RGB.',
    price: 189.00,
    category: 'Accessories',
    stock: 5,
    sku: 'SN-ACC-004',
    status: 'low_stock',
    rating: 4.9,
    tags: ['keyboard', 'mechanical', 'accessories'],
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-03-25T11:00:00Z',
  },
  {
    id: 'prd_2005',
    name: 'OmniPrecision Ergonomic Mouse',
    description: 'Ultra-lightweight wireless gaming and productivity mouse with 26K DPI optical sensor.',
    price: 99.00,
    category: 'Accessories',
    stock: 0,
    sku: 'SN-ACC-005',
    status: 'out_of_stock',
    rating: 4.6,
    tags: ['mouse', 'ergonomic', 'accessories'],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-28T16:00:00Z',
  },
  {
    id: 'prd_2006',
    name: 'Titan Thunderbolt 4 Docking Station',
    description: '14-in-1 dual 4K display dock with 10Gbps Ethernet and 100W PD charging.',
    price: 279.00,
    category: 'Hardware',
    stock: 64,
    sku: 'SN-HDW-006',
    status: 'in_stock',
    rating: 4.7,
    tags: ['dock', 'thunderbolt', 'connectivity'],
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'prd_2007',
    name: 'AeroStream 4K Streaming Webcam',
    description: 'Wide-angle AI autofocus 4K camera with integrated dual microphone array.',
    price: 159.00,
    category: 'Video',
    stock: 42,
    sku: 'SN-VID-007',
    status: 'in_stock',
    rating: 4.5,
    tags: ['webcam', 'video', 'streaming'],
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-03-11T13:20:00Z',
  },
  {
    id: 'prd_2008',
    name: 'Vortex Rapid 100W GaN Fast Charger',
    description: 'Compact 4-port USB-C and USB-A GaN wall charger with dynamic smart power sharing.',
    price: 69.00,
    category: 'Power',
    stock: 210,
    sku: 'SN-PWR-008',
    status: 'in_stock',
    rating: 4.8,
    tags: ['charger', 'gan', 'power'],
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-20T15:00:00Z',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_3001',
    userId: 'usr_1001',
    customerName: 'Sarah Connor',
    items: [
      { productId: 'prd_2001', productName: 'Sentinel Pro Ultra Laptop', price: 2499.00, quantity: 1 },
      { productId: 'prd_2003', productName: 'CyberAcoustic Noise-Cancelling Headphones', price: 349.00, quantity: 1 },
    ],
    totalAmount: 2848.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'credit_card',
    shippingAddress: '742 Evergreen Terrace, Sector 4, Tech City',
    createdAt: '2026-03-01T10:14:00Z',
    updatedAt: '2026-03-02T12:00:00Z',
  },
  {
    id: 'ord_3002',
    userId: 'usr_1002',
    customerName: 'Alex Mercer',
    items: [
      { productId: 'prd_2002', productName: 'Quantum Edge 4K OLED Monitor', price: 899.00, quantity: 2 },
      { productId: 'prd_2006', productName: 'Titan Thunderbolt 4 Docking Station', price: 279.00, quantity: 1 },
    ],
    totalAmount: 2077.00,
    currency: 'USD',
    status: 'shipped',
    paymentMethod: 'bank_transfer',
    shippingAddress: '10880 Wilshire Blvd, Suite 1101, Metro City',
    createdAt: '2026-03-10T14:30:00Z',
    updatedAt: '2026-03-11T16:00:00Z',
  },
  {
    id: 'ord_3003',
    userId: 'usr_1003',
    customerName: 'Elena Rostova',
    items: [
      { productId: 'prd_2004', productName: 'Tactile MechMatrix Keyboard', price: 189.00, quantity: 1 },
    ],
    totalAmount: 189.00,
    currency: 'USD',
    status: 'processing',
    paymentMethod: 'upi',
    shippingAddress: '42 Baker Street, Apt 3B, North District',
    createdAt: '2026-03-24T09:00:00Z',
    updatedAt: '2026-03-24T09:30:00Z',
  },
  {
    id: 'ord_3004',
    userId: 'usr_1004',
    customerName: 'Devon Vance',
    items: [
      { productId: 'prd_2007', productName: 'AeroStream 4K Streaming Webcam', price: 159.00, quantity: 1 },
      { productId: 'prd_2008', productName: 'Vortex Rapid 100W GaN Fast Charger', price: 69.00, quantity: 2 },
    ],
    totalAmount: 297.00,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'credit_card',
    shippingAddress: '1900 Pacific Ave, Dallas, TX 75201',
    createdAt: '2026-03-29T18:45:00Z',
    updatedAt: '2026-03-29T18:45:00Z',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_4001',
    orderId: 'ord_3001',
    userId: 'usr_1001',
    amount: 2848.00,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: 'credit_card',
    transactionRef: 'txn_sentinel_9918231',
    customerEmail: 'sarah.connor@skyline.io',
    createdAt: '2026-03-01T10:15:22Z',
    updatedAt: '2026-03-01T10:15:30Z',
  },
  {
    id: 'pay_4002',
    orderId: 'ord_3002',
    userId: 'usr_1002',
    amount: 2077.00,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: 'bank_transfer',
    transactionRef: 'txn_sentinel_8849204',
    customerEmail: 'alex.mercer@apex.dev',
    createdAt: '2026-03-10T14:32:00Z',
    updatedAt: '2026-03-10T14:35:10Z',
  },
  {
    id: 'pay_4003',
    orderId: 'ord_3003',
    userId: 'usr_1003',
    amount: 189.00,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'upi',
    transactionRef: 'txn_sentinel_7730192',
    customerEmail: 'elena.rostova@cyberdyn.org',
    createdAt: '2026-03-24T09:01:05Z',
    updatedAt: '2026-03-24T09:01:05Z',
  },
  {
    id: 'pay_4004',
    orderId: 'ord_3004',
    userId: 'usr_1004',
    amount: 297.00,
    currency: 'USD',
    status: 'failed',
    paymentMethod: 'credit_card',
    transactionRef: 'txn_sentinel_6629103',
    customerEmail: 'devon.vance@lumina.net',
    createdAt: '2026-03-29T18:46:12Z',
    updatedAt: '2026-03-29T18:46:25Z',
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv_5001',
    productId: 'prd_2001',
    productName: 'Sentinel Pro Ultra Laptop',
    sku: 'SN-LAP-001',
    warehouseLocation: 'WH-EAST-A1',
    quantityAvailable: 45,
    quantityReserved: 3,
    minimumThreshold: 10,
    status: 'in_stock',
    lastRestockedAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 'inv_5002',
    productId: 'prd_2002',
    productName: 'Quantum Edge 4K OLED Monitor',
    sku: 'SN-MON-002',
    warehouseLocation: 'WH-WEST-B3',
    quantityAvailable: 28,
    quantityReserved: 4,
    minimumThreshold: 8,
    status: 'in_stock',
    lastRestockedAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 'inv_5003',
    productId: 'prd_2003',
    productName: 'CyberAcoustic Noise-Cancelling Headphones',
    sku: 'SN-AUD-003',
    warehouseLocation: 'WH-CENTRAL-C2',
    quantityAvailable: 120,
    quantityReserved: 12,
    minimumThreshold: 25,
    status: 'in_stock',
    lastRestockedAt: '2026-03-12T14:30:00Z',
  },
  {
    id: 'inv_5004',
    productId: 'prd_2004',
    productName: 'Tactile MechMatrix Keyboard',
    sku: 'SN-ACC-004',
    warehouseLocation: 'WH-EAST-D1',
    quantityAvailable: 5,
    quantityReserved: 2,
    minimumThreshold: 15,
    status: 'low_stock',
    lastRestockedAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 'inv_5005',
    productId: 'prd_2005',
    productName: 'OmniPrecision Ergonomic Mouse',
    sku: 'SN-ACC-005',
    warehouseLocation: 'WH-WEST-E4',
    quantityAvailable: 0,
    quantityReserved: 0,
    minimumThreshold: 20,
    status: 'out_of_stock',
    lastRestockedAt: '2026-02-15T09:00:00Z',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_6001',
    userId: 'usr_1001',
    title: 'Order Delivered',
    message: 'Your order #ord_3001 has been successfully delivered.',
    channel: 'email',
    status: 'delivered',
    read: true,
    createdAt: '2026-03-02T12:05:00Z',
  },
  {
    id: 'notif_6002',
    userId: 'usr_1002',
    title: 'Shipment Tracking Update',
    message: 'Package #ord_3002 is out for delivery with FedEx Express.',
    channel: 'sms',
    status: 'delivered',
    read: false,
    createdAt: '2026-03-11T16:10:00Z',
  },
  {
    id: 'notif_6003',
    userId: 'usr_1004',
    title: 'Payment Verification Required',
    message: 'Transaction failed for order #ord_3004. Please check card details.',
    channel: 'push',
    status: 'delivered',
    read: false,
    createdAt: '2026-03-29T18:47:00Z',
  },
];

export class DataStore {
  private users: User[] = [];
  private products: Product[] = [];
  private orders: Order[] = [];
  private payments: Payment[] = [];
  private inventory: InventoryItem[] = [];
  private notifications: NotificationItem[] = [];

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
    this.inventory = JSON.parse(JSON.stringify(INITIAL_INVENTORY));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
  }

  // --- Users ---
  public getUsers(filter?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) {
    let list = [...this.users];
    if (filter?.role) list = list.filter(u => u.role === filter.role);
    if (filter?.status) list = list.filter(u => u.status === filter.status);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q));
    }
    const total = list.length;
    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...data,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.unshift(newUser);
    return newUser;
  }

  public updateUser(id: string, data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User | null {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const updated: User = {
      ...data,
      id,
      createdAt: this.users[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.users[idx] = updated;
    return updated;
  }

  public patchUser(id: string, partial: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const updated: User = {
      ...this.users[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.users[idx] = updated;
    return updated;
  }

  public deleteUser(id: string): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }

  // --- Products ---
  public getProducts(filter?: {
    category?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    let list = [...this.products];
    if (filter?.category) list = list.filter(p => p.category.toLowerCase() === filter.category?.toLowerCase());
    if (filter?.status) list = list.filter(p => p.status === filter.status);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filter?.sortBy) {
      const order = filter.sortOrder === 'desc' ? -1 : 1;
      list.sort((a, b) => {
        const key = filter.sortBy as keyof Product;
        if (a[key] < b[key]) return -1 * order;
        if (a[key] > b[key]) return 1 * order;
        return 0;
      });
    }
    const total = list.length;
    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public searchProducts(query: string) {
    const q = query.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  public createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...data,
      id: `prd_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  public updateProduct(id: string, data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product | null {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated: Product = {
      ...data,
      id,
      createdAt: this.products[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.products[idx] = updated;
    return updated;
  }

  public patchProduct(id: string, partial: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated: Product = {
      ...this.products[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.products[idx] = updated;
    return updated;
  }

  public deleteProduct(id: string): boolean {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    return true;
  }

  // --- Orders ---
  public getOrders(filter?: { status?: string; userId?: string; page?: number; limit?: number }) {
    let list = [...this.orders];
    if (filter?.status) list = list.filter(o => o.status === filter.status);
    if (filter?.userId) list = list.filter(o => o.userId === filter.userId);
    const total = list.length;
    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  public createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const newOrder: Order = {
      ...data,
      id: `ord_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  public updateOrder(id: string, data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order | null {
    const idx = this.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    const updated: Order = {
      ...data,
      id,
      createdAt: this.orders[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.orders[idx] = updated;
    return updated;
  }

  public patchOrder(id: string, partial: Partial<Omit<Order, 'id' | 'createdAt'>>): Order | null {
    const idx = this.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    const updated: Order = {
      ...this.orders[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.orders[idx] = updated;
    return updated;
  }

  public deleteOrder(id: string): boolean {
    const idx = this.orders.findIndex(o => o.id === id);
    if (idx === -1) return false;
    this.orders.splice(idx, 1);
    return true;
  }

  // --- Payments ---
  public getPayments(filter?: { status?: string; orderId?: string; page?: number; limit?: number }) {
    let list = [...this.payments];
    if (filter?.status) list = list.filter(p => p.status === filter.status);
    if (filter?.orderId) list = list.filter(p => p.orderId === filter.orderId);
    const total = list.length;
    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public getPaymentById(id: string): Payment | undefined {
    return this.payments.find(p => p.id === id);
  }

  public createPayment(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'transactionRef'>): Payment {
    const newPayment: Payment = {
      ...data,
      id: `pay_${Date.now()}`,
      transactionRef: `txn_sentinel_${Math.floor(1000000 + Math.random() * 9000000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.payments.unshift(newPayment);
    return newPayment;
  }

  public updatePayment(id: string, data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment | null {
    const idx = this.payments.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated: Payment = {
      ...data,
      id,
      createdAt: this.payments[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.payments[idx] = updated;
    return updated;
  }

  public patchPayment(id: string, partial: Partial<Omit<Payment, 'id' | 'createdAt'>>): Payment | null {
    const idx = this.payments.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated: Payment = {
      ...this.payments[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.payments[idx] = updated;
    return updated;
  }

  public deletePayment(id: string): boolean {
    const idx = this.payments.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.payments.splice(idx, 1);
    return true;
  }

  // --- Inventory ---
  public getInventory() {
    return [...this.inventory];
  }

  public getInventoryById(id: string): InventoryItem | undefined {
    return this.inventory.find(i => i.id === id);
  }

  public updateInventory(id: string, partial: Partial<InventoryItem>): InventoryItem | null {
    const idx = this.inventory.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.inventory[idx] = {
      ...this.inventory[idx],
      ...partial,
    };
    return this.inventory[idx];
  }

  // --- Notifications ---
  public getNotifications(userId?: string) {
    if (userId) return this.notifications.filter(n => n.userId === userId);
    return [...this.notifications];
  }

  public createNotification(data: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    const notif: NotificationItem = {
      ...data,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    return notif;
  }
}

export const datastore = new DataStore();
