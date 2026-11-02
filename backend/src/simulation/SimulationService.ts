import {
  SimulationConfig,
  GlobalSimulationState,
  EndpointDefinition,
  ScenarioDefinition,
  HttpMethod,
} from '../types/index.js';

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  mode: 'HEALTHY',
  statusCode: undefined,
  latency: {
    type: 'none',
    fixedMs: 0,
    minMs: 100,
    maxMs: 500,
    timeoutMs: 15000,
  },
  failure: {
    enabled: false,
    ratePercent: 0,
    statusCode: 500,
    errorMessage: 'Simulated service internal failure',
  },
  rateLimit: {
    enabled: false,
    maxRequests: 60,
    windowSeconds: 60,
  },
  auth: {
    required: false,
    type: 'none',
  },
  schemaVersion: 'v1',
  database: {
    mode: 'normal',
    addedLatencyMs: 0,
  },
  gateway: {
    mode: 'normal',
  },
  randomDistribution: [],
  largeResponseItemCount: 100,
};

export const PREDEFINED_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'normal',
    name: 'Normal Operation',
    description: 'All services operating nominally with sub-50ms latency and 0% simulated failures.',
    category: 'resilience',
    affectedServices: ['All Services'],
    affectedEndpoints: ['*'],
    configSummary: 'Mode: HEALTHY, Latency: 0ms, Failures: 0%',
    globalConfig: {
      globalOutage: false,
      globalLatencyMs: 0,
      globalFailureRate: 0,
      globalStatusCode: undefined,
      globalTimeoutMs: undefined,
      activeScenarioId: 'normal',
    },
  },
  {
    id: 'slow-api',
    name: 'Slow API Latency Spike',
    description: 'Simulates a network or compute bottleneck introducing a global 2500ms delay across all endpoints.',
    category: 'performance',
    affectedServices: ['All Services'],
    affectedEndpoints: ['*'],
    configSummary: 'Global Latency: 2500ms fixed',
    globalConfig: {
      globalOutage: false,
      globalLatencyMs: 2500,
      globalFailureRate: 0,
      activeScenarioId: 'slow-api',
    },
  },
  {
    id: 'payment-degradation',
    name: 'Payment API Degradation',
    description: 'Simulates high latency (2500ms) on Payment endpoints while other services remain fast.',
    category: 'performance',
    affectedServices: ['Payments'],
    affectedEndpoints: ['POST /api/payments', 'GET /api/payments', 'GET /api/payments/:id', 'GET /api/payments/health'],
    configSummary: 'Payments Latency: 2500ms',
    globalConfig: {
      globalOutage: false,
      globalLatencyMs: 0,
      globalFailureRate: 0,
      activeScenarioId: 'payment-degradation',
    },
    endpointOverrides: {
      'payments-post': {
        mode: 'DELAYED',
        latency: { type: 'fixed', fixedMs: 2500 },
      },
      'payments-get-all': {
        mode: 'DELAYED',
        latency: { type: 'fixed', fixedMs: 2500 },
      },
      'payments-get-id': {
        mode: 'DELAYED',
        latency: { type: 'fixed', fixedMs: 2500 },
      },
      'payments-health': {
        mode: 'DELAYED',
        latency: { type: 'fixed', fixedMs: 2500 },
      },
    },
  },
  {
    id: 'payment-outage',
    name: 'Payment API Outage',
    description: 'Simulates a complete outage on Payment endpoints, returning 503 Service Unavailable.',
    category: 'reliability',
    affectedServices: ['Payments'],
    affectedEndpoints: ['POST /api/payments', 'GET /api/payments', 'GET /api/payments/:id', 'GET /api/payments/health'],
    configSummary: 'Payments Status: 503 Service Unavailable',
    globalConfig: {
      globalOutage: false,
      globalLatencyMs: 0,
      globalFailureRate: 0,
      activeScenarioId: 'payment-outage',
    },
    endpointOverrides: {
      'payments-post': {
        mode: 'UNAVAILABLE',
        statusCode: 503,
        failure: { enabled: true, ratePercent: 100, statusCode: 503, errorMessage: 'Payment gateway service temporarily unavailable' },
      },
      'payments-get-all': {
        mode: 'UNAVAILABLE',
        statusCode: 503,
        failure: { enabled: true, ratePercent: 100, statusCode: 503, errorMessage: 'Payment gateway service temporarily unavailable' },
      },
      'payments-get-id': {
        mode: 'UNAVAILABLE',
        statusCode: 503,
        failure: { enabled: true, ratePercent: 100, statusCode: 503, errorMessage: 'Payment gateway service temporarily unavailable' },
      },
      'payments-health': {
        mode: 'UNAVAILABLE',
        statusCode: 503,
        failure: { enabled: true, ratePercent: 100, statusCode: 503, errorMessage: 'Payment service health check failed' },
      },
    },
  },
  {
    id: 'payment-intermittent',
    name: 'Intermittent Payment Failures',
    description: 'Simulates flaky network or upstream payment provider with an unpredictable 35% failure rate (500/503).',
    category: 'chaos',
    affectedServices: ['Payments'],
    affectedEndpoints: ['POST /api/payments', 'GET /api/payments'],
    configSummary: 'Payments: 35% failure probability with random 500/503',
    globalConfig: {
      globalOutage: false,
      globalLatencyMs: 0,
      globalFailureRate: 0,
      activeScenarioId: 'payment-intermittent',
    },
    endpointOverrides: {
      'payments-post': {
        mode: 'INTERMITTENT',
        failure: { enabled: true, ratePercent: 35, statusCode: 503, errorMessage: 'Upstream payment processor timeout' },
      },
      'payments-get-all': {
        mode: 'INTERMITTENT',
        failure: { enabled: true, ratePercent: 35, statusCode: 500, errorMessage: 'Intermittent ledger read timeout' },
      },
    },
  },
  {
    id: 'rate-limited',
    name: 'Aggressive Rate Limiting',
    description: 'Enforces strict rate limit of 5 requests per 10 seconds returning 429 Too Many Requests.',
    category: 'security',
    affectedServices: ['All Services'],
    affectedEndpoints: ['*'],
    configSummary: 'Rate Limit: 5 requests / 10s',
    globalConfig: {
      globalOutage: false,
      globalLatencyMs: 0,
      globalFailureRate: 0,
      activeScenarioId: 'rate-limited',
    },
    endpointOverrides: {
      '*': {
        mode: 'RATE_LIMITED',
        rateLimit: { enabled: true, maxRequests: 5, windowSeconds: 10 },
      },
    },
  },
  {
    id: 'schema-change',
    name: 'Response Schema Breaking Change',
    description: 'Switches Products API response schema from Schema V1 to V2 (renamed fields: name -> productName, price -> amount).',
    category: 'resilience',
    affectedServices: ['Products'],
    affectedEndpoints: ['GET /api/products', 'GET /api/products/:id'],
    configSummary: 'Schema Version: V2 (Field renamed: name -> productName, price -> amount)',
    globalConfig: {
      globalOutage: false,
      globalLatencyMs: 0,
      globalFailureRate: 0,
      activeScenarioId: 'schema-change',
    },
    endpointOverrides: {
      'products-get-all': {
        mode: 'SCHEMA_CHANGED',
        schemaVersion: 'v2',
      },
      'products-get-id': {
        mode: 'SCHEMA_CHANGED',
        schemaVersion: 'v2',
      },
    },
  },
  {
    id: 'auth-failure',
    name: 'Authentication Enforced & Rejecting',
    description: 'Simulates authorization expiration or misconfiguration returning 401 Unauthorized across protected APIs.',
    category: 'security',
    affectedServices: ['Users', 'Orders', 'Payments'],
    affectedEndpoints: ['GET /api/users', 'GET /api/orders', 'POST /api/payments'],
    configSummary: 'Auth: Bearer Token required; invalid credentials -> 401',
    globalConfig: {
      activeScenarioId: 'auth-failure',
    },
    endpointOverrides: {
      'users-get-all': {
        mode: 'AUTH_REQUIRED',
        auth: { required: true, type: 'bearer', expectedToken: 'super-secret-valid-token' },
      },
      'orders-get-all': {
        mode: 'AUTH_REQUIRED',
        auth: { required: true, type: 'bearer', expectedToken: 'super-secret-valid-token' },
      },
      'payments-post': {
        mode: 'AUTH_REQUIRED',
        auth: { required: true, type: 'bearer', expectedToken: 'super-secret-valid-token' },
      },
    },
  },
  {
    id: 'database-failure',
    name: 'Database Cluster Outage',
    description: 'Simulates primary database connection pool exhaustion throwing 500 Internal Server Error.',
    category: 'reliability',
    affectedServices: ['Users', 'Products', 'Orders', 'Payments'],
    affectedEndpoints: ['*'],
    configSummary: 'Database Mode: FAILURE (500 Error)',
    globalConfig: {
      globalOutage: false,
      globalStatusCode: 500,
      activeScenarioId: 'database-failure',
    },
  },
  {
    id: 'gateway-failure',
    name: 'Gateway Timeout / Bad Gateway',
    description: 'Simulates API gateway and reverse-proxy errors (502 Bad Gateway and 504 Gateway Timeout).',
    category: 'reliability',
    affectedServices: ['Payments', 'Orders'],
    affectedEndpoints: ['POST /api/payments', 'POST /api/orders'],
    configSummary: 'Gateway: 502 Bad Gateway / 504 Timeout',
    globalConfig: {
      activeScenarioId: 'gateway-failure',
    },
    endpointOverrides: {
      'payments-post': {
        mode: 'GATEWAY_TIMEOUT',
        statusCode: 504,
        failure: { enabled: true, ratePercent: 100, statusCode: 504, errorMessage: 'Gateway timed out waiting for payment processor upstream' },
      },
      'orders-post': {
        mode: 'FAILING',
        statusCode: 502,
        failure: { enabled: true, ratePercent: 100, statusCode: 502, errorMessage: 'Bad gateway: Order dispatch service unreachable' },
      },
    },
  },
];

export class SimulationService {
  private globalState: GlobalSimulationState = {
    globalOutage: false,
    globalLatencyMs: 0,
    globalFailureRate: 0,
    globalStatusCode: undefined,
    globalTimeoutMs: undefined,
    activeScenarioId: 'normal',
  };

  private endpoints: Map<string, EndpointDefinition> = new Map();
  private rateLimitBuckets: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.registerDefaultEndpoints();
  }

  private registerDefaultEndpoints(): void {
    const defaultList: EndpointDefinition[] = [
      // Health
      {
        id: 'health-get',
        service: 'Health',
        method: 'GET',
        path: '/api/health',
        summary: 'Primary System Health Check',
        description: 'Returns the overall operational health of Sentinel API Playground platform.',
        tags: ['Health'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'payments-health',
        service: 'Payments',
        method: 'GET',
        path: '/api/payments/health',
        summary: 'Payment Service Health Check',
        description: 'Dedicated health probe for payment gateway and transaction processing.',
        tags: ['Payments', 'Health'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'users-health',
        service: 'Users',
        method: 'GET',
        path: '/api/users/health',
        summary: 'Users Service Health Check',
        description: 'Health probe for user management and profile datastore.',
        tags: ['Users', 'Health'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'orders-health',
        service: 'Orders',
        method: 'GET',
        path: '/api/orders/health',
        summary: 'Orders Service Health Check',
        description: 'Health probe for order fulfillment pipeline.',
        tags: ['Orders', 'Health'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'inventory-health',
        service: 'Inventory',
        method: 'GET',
        path: '/api/inventory/health',
        summary: 'Inventory Service Health Check',
        description: 'Health probe for warehouse inventory tracking.',
        tags: ['Inventory', 'Health'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },

      // Auth
      {
        id: 'auth-login-post',
        service: 'Auth',
        method: 'POST',
        path: '/api/login',
        summary: 'User Login & Token Generation',
        description: 'Authenticates credentials and returns a simulated JWT bearer token.',
        tags: ['Auth'],
        requestBodyExample: { username: 'admin', password: 'sentinel123' },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },

      // Users
      {
        id: 'users-get-all',
        service: 'Users',
        method: 'GET',
        path: '/api/users',
        summary: 'List All Users',
        description: 'Retrieve paginated users with optional role, status, and search filters.',
        tags: ['Users'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'users-post',
        service: 'Users',
        method: 'POST',
        path: '/api/users',
        summary: 'Create User',
        description: 'Create a new user account in the datastore.',
        tags: ['Users'],
        requestBodyExample: { name: 'John Doe', email: 'john.doe@example.com', role: 'developer', department: 'Engineering' },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'users-get-id',
        service: 'Users',
        method: 'GET',
        path: '/api/users/:id',
        summary: 'Get User By ID',
        description: 'Fetch detailed user profile by unique identifier.',
        tags: ['Users'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'users-put',
        service: 'Users',
        method: 'PUT',
        path: '/api/users/:id',
        summary: 'Replace User',
        description: 'Perform full resource replacement for user.',
        tags: ['Users'],
        requestBodyExample: { name: 'Jane Doe', email: 'jane.doe@example.com', role: 'admin', department: 'Leadership', status: 'active' },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'users-patch',
        service: 'Users',
        method: 'PATCH',
        path: '/api/users/:id',
        summary: 'Update User Fields',
        description: 'Partially modify specific fields of a user record.',
        tags: ['Users'],
        requestBodyExample: { department: 'Cloud Operations' },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'users-delete',
        service: 'Users',
        method: 'DELETE',
        path: '/api/users/:id',
        summary: 'Delete User',
        description: 'Permanently remove a user from datastore.',
        tags: ['Users'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },

      // Products
      {
        id: 'products-get-all',
        service: 'Products',
        method: 'GET',
        path: '/api/products',
        summary: 'List Products',
        description: 'Get paginated catalog of hardware and accessories with category & sorting filters.',
        tags: ['Products'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'products-search-get',
        service: 'Products',
        method: 'GET',
        path: '/api/products/search',
        summary: 'Search Products',
        description: 'Full-text search across product name, description, tags, and SKU.',
        tags: ['Products'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'products-large-get',
        service: 'Products',
        method: 'GET',
        path: '/api/products/large',
        summary: 'Large Response Benchmark',
        description: 'Returns heavy JSON payload (e.g. 500-2000 items) to test network bandwidth and memory limits.',
        tags: ['Products'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'products-post',
        service: 'Products',
        method: 'POST',
        path: '/api/products',
        summary: 'Create Product',
        description: 'Add a new catalog item with SKU, pricing, and initial stock.',
        tags: ['Products'],
        requestBodyExample: { name: 'Sentinel CyberHub 5000', price: 199.99, category: 'Hardware', stock: 50, sku: 'SN-HUB-500' },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'products-get-id',
        service: 'Products',
        method: 'GET',
        path: '/api/products/:id',
        summary: 'Get Product By ID',
        description: 'Fetch complete product details.',
        tags: ['Products'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'products-put',
        service: 'Products',
        method: 'PUT',
        path: '/api/products/:id',
        summary: 'Replace Product',
        description: 'Completely overwrite an existing product catalog entry.',
        tags: ['Products'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'products-patch',
        service: 'Products',
        method: 'PATCH',
        path: '/api/products/:id',
        summary: 'Patch Product',
        description: 'Update price, stock, or status without rewriting entire product.',
        tags: ['Products'],
        requestBodyExample: { price: 2199.00, status: 'low_stock' },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'products-delete',
        service: 'Products',
        method: 'DELETE',
        path: '/api/products/:id',
        summary: 'Delete Product',
        description: 'Remove product from catalog.',
        tags: ['Products'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },

      // Orders
      {
        id: 'orders-get-all',
        service: 'Orders',
        method: 'GET',
        path: '/api/orders',
        summary: 'List Orders',
        description: 'List customer purchase orders with status filtering.',
        tags: ['Orders'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'orders-post',
        service: 'Orders',
        method: 'POST',
        path: '/api/orders',
        summary: 'Place New Order',
        description: 'Create and submit customer purchase order.',
        tags: ['Orders'],
        requestBodyExample: {
          userId: 'usr_1001',
          customerName: 'Sarah Connor',
          items: [{ productId: 'prd_2001', productName: 'Sentinel Pro Ultra Laptop', price: 2499.00, quantity: 1 }],
          paymentMethod: 'credit_card',
          shippingAddress: '42 Tech Lane, Sector 9',
        },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'orders-get-id',
        service: 'Orders',
        method: 'GET',
        path: '/api/orders/:id',
        summary: 'Get Order By ID',
        description: 'Retrieve order summary and fulfillment status.',
        tags: ['Orders'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'orders-put',
        service: 'Orders',
        method: 'PUT',
        path: '/api/orders/:id',
        summary: 'Update Entire Order',
        description: 'Replace order details.',
        tags: ['Orders'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'orders-patch',
        service: 'Orders',
        method: 'PATCH',
        path: '/api/orders/:id',
        summary: 'Patch Order Status',
        description: 'Update status of order (e.g. processing -> shipped).',
        tags: ['Orders'],
        requestBodyExample: { status: 'shipped' },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'orders-delete',
        service: 'Orders',
        method: 'DELETE',
        path: '/api/orders/:id',
        summary: 'Cancel & Delete Order',
        description: 'Remove order from system.',
        tags: ['Orders'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },

      // Payments
      {
        id: 'payments-get-all',
        service: 'Payments',
        method: 'GET',
        path: '/api/payments',
        summary: 'List Payments',
        description: 'View recorded payment transactions and gateway authorizations.',
        tags: ['Payments'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'payments-post',
        service: 'Payments',
        method: 'POST',
        path: '/api/payments',
        summary: 'Process Payment',
        description: 'Execute charge transaction against payment gateway.',
        tags: ['Payments'],
        requestBodyExample: {
          orderId: 'ord_3001',
          userId: 'usr_1001',
          amount: 2499.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerEmail: 'sarah.connor@skyline.io',
        },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'payments-get-id',
        service: 'Payments',
        method: 'GET',
        path: '/api/payments/:id',
        summary: 'Get Payment By ID',
        description: 'Fetch transaction receipt and verification status.',
        tags: ['Payments'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'payments-put',
        service: 'Payments',
        method: 'PUT',
        path: '/api/payments/:id',
        summary: 'Update Payment Record',
        description: 'Replace payment transaction state.',
        tags: ['Payments'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'payments-patch',
        service: 'Payments',
        method: 'PATCH',
        path: '/api/payments/:id',
        summary: 'Patch Payment Status',
        description: 'Update payment status (e.g. pending -> succeeded, or refunded).',
        tags: ['Payments'],
        requestBodyExample: { status: 'refunded' },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'payments-delete',
        service: 'Payments',
        method: 'DELETE',
        path: '/api/payments/:id',
        summary: 'Void Payment',
        description: 'Delete or void payment record.',
        tags: ['Payments'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },

      // Inventory
      {
        id: 'inventory-get-all',
        service: 'Inventory',
        method: 'GET',
        path: '/api/inventory',
        summary: 'List Warehouse Inventory',
        description: 'Monitor stock levels, warehouse locations, and reserved counts.',
        tags: ['Inventory'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'inventory-put',
        service: 'Inventory',
        method: 'PUT',
        path: '/api/inventory/:id',
        summary: 'Update Inventory Level',
        description: 'Restock or allocate warehouse inventory.',
        tags: ['Inventory'],
        requestBodyExample: { quantityAvailable: 150, warehouseLocation: 'WH-EAST-A1' },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },

      // Notifications
      {
        id: 'notifications-get-all',
        service: 'Notifications',
        method: 'GET',
        path: '/api/notifications',
        summary: 'List Notifications',
        description: 'Retrieve alert dispatches, email logs, and SMS messages.',
        tags: ['Notifications'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'notifications-post',
        service: 'Notifications',
        method: 'POST',
        path: '/api/notifications',
        summary: 'Dispatch Notification',
        description: 'Send simulated email/SMS/webhook alert to user.',
        tags: ['Notifications'],
        requestBodyExample: {
          userId: 'usr_1001',
          title: 'System Alert',
          message: 'Security update applied to your Sentinel account.',
          channel: 'email',
        },
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },

      // Versioned APIs
      {
        id: 'v1-products-get',
        service: 'Products',
        method: 'GET',
        path: '/api/v1/products',
        summary: 'API V1 Products Catalog',
        description: 'Legacy schema representation of product catalog.',
        tags: ['API Versioning'],
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
      {
        id: 'v2-products-get',
        service: 'Products',
        method: 'GET',
        path: '/api/v2/products',
        summary: 'API V2 Products Catalog',
        description: 'Modern v2 schema representation of product catalog.',
        tags: ['API Versioning'],
        isActive: true,
        simulationConfig: JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG)),
      },
    ];

    for (const ep of defaultList) {
      if (ep.isActive === undefined) ep.isActive = true;
      this.endpoints.set(ep.id, ep);
    }
  }

  public getGlobalState(): GlobalSimulationState {
    return { ...this.globalState };
  }

  public updateGlobalState(patch: Partial<GlobalSimulationState>): GlobalSimulationState {
    this.globalState = {
      ...this.globalState,
      ...patch,
    };
    return this.getGlobalState();
  }

  public getEndpoints(): EndpointDefinition[] {
    return Array.from(this.endpoints.values());
  }

  public getEndpointById(id: string): EndpointDefinition | undefined {
    return this.endpoints.get(id);
  }

  public setEndpointActive(id: string, active: boolean): EndpointDefinition | null {
    const ep = this.endpoints.get(id);
    if (!ep) return null;
    ep.isActive = active;
    this.endpoints.set(id, ep);
    return ep;
  }

  public toggleEndpointActive(id: string): EndpointDefinition | null {
    const ep = this.endpoints.get(id);
    if (!ep) return null;
    ep.isActive = ep.isActive === false ? true : false;
    this.endpoints.set(id, ep);
    return ep;
  }

  public updateEndpointSimulation(id: string, config: Partial<SimulationConfig>, isActive?: boolean): EndpointDefinition | null {
    const ep = this.endpoints.get(id);
    if (!ep) return null;

    if (isActive !== undefined) {
      ep.isActive = isActive;
    }

    const isHealthyMode = config.mode === 'HEALTHY';

    ep.simulationConfig = {
      ...ep.simulationConfig,
      ...config,
      statusCode: isHealthyMode && config.statusCode === undefined ? undefined : (config.statusCode !== undefined ? config.statusCode : ep.simulationConfig.statusCode),
      latency: {
        ...ep.simulationConfig.latency,
        ...(config.latency || (isHealthyMode ? { type: 'none', fixedMs: 0 } : {})),
      },
      failure: {
        ...ep.simulationConfig.failure,
        ...(config.failure || (isHealthyMode ? { enabled: false, ratePercent: 0 } : {})),
      },
      rateLimit: {
        ...ep.simulationConfig.rateLimit,
        ...(config.rateLimit || (isHealthyMode ? { enabled: false } : {})),
      },
      auth: {
        ...ep.simulationConfig.auth,
        ...(config.auth || (isHealthyMode ? { required: false } : {})),
      },
      database: {
        ...ep.simulationConfig.database,
        ...(config.database || (isHealthyMode ? { mode: 'normal', addedLatencyMs: 0 } : {})),
      },
      gateway: {
        ...ep.simulationConfig.gateway,
        ...(config.gateway || (isHealthyMode ? { mode: 'normal' } : {})),
      },
    };

    if (ep.simulationConfig.mode === 'UNAVAILABLE' && !ep.simulationConfig.statusCode) {
      ep.simulationConfig.statusCode = 503;
    }

    this.endpoints.set(id, ep);
    return ep;
  }

  public resetEndpointSimulation(id: string): EndpointDefinition | null {
    const ep = this.endpoints.get(id);
    if (!ep) return null;
    ep.isActive = true;
    ep.simulationConfig = JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG));
    this.endpoints.set(id, ep);
    return ep;
  }

  public resetAllToHealthy(): void {
    this.globalState = {
      globalOutage: false,
      globalLatencyMs: 0,
      globalFailureRate: 0,
      globalStatusCode: undefined,
      globalTimeoutMs: undefined,
      activeScenarioId: 'normal',
    };
    this.rateLimitBuckets.clear();
    for (const [id, ep] of this.endpoints.entries()) {
      ep.isActive = true;
      ep.simulationConfig = JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG));
      this.endpoints.set(id, ep);
    }
  }

  public getScenarios(): ScenarioDefinition[] {
    return PREDEFINED_SCENARIOS;
  }

  public activateScenario(scenarioId: string): ScenarioDefinition | null {
    const scenario = PREDEFINED_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return null;

    // Reset endpoints first
    for (const [id, ep] of this.endpoints.entries()) {
      ep.simulationConfig = JSON.parse(JSON.stringify(DEFAULT_SIMULATION_CONFIG));
      this.endpoints.set(id, ep);
    }

    // Apply global config from scenario
    this.globalState = {
      globalOutage: false,
      globalLatencyMs: 0,
      globalFailureRate: 0,
      globalStatusCode: undefined,
      globalTimeoutMs: undefined,
      activeScenarioId: scenarioId,
      ...(scenario.globalConfig || {}),
    };

    // Apply endpoint overrides
    if (scenario.endpointOverrides) {
      if (scenario.endpointOverrides['*']) {
        const wildcard = scenario.endpointOverrides['*'];
        for (const [id] of this.endpoints.entries()) {
          this.updateEndpointSimulation(id, wildcard);
        }
      }
      for (const [targetId, override] of Object.entries(scenario.endpointOverrides)) {
        if (targetId !== '*') {
          this.updateEndpointSimulation(targetId, override);
        }
      }
    }

    return scenario;
  }

  public deactivateScenario(): void {
    this.resetAllToHealthy();
  }

  public findMatchingEndpoint(method: HttpMethod, reqPath: string): EndpointDefinition | undefined {
    // Normalise path by removing trailing slash if not root
    const cleanPath = reqPath.length > 1 && reqPath.endsWith('/') ? reqPath.slice(0, -1) : reqPath;

    for (const ep of this.endpoints.values()) {
      if (ep.method !== method && method !== 'HEAD' && method !== 'OPTIONS') {
        continue;
      }
      // Check exact match
      if (ep.path === cleanPath) {
        return ep;
      }
      // Check parameterized match e.g. /api/users/:id
      const epParts = ep.path.split('/');
      const reqParts = cleanPath.split('/');
      if (epParts.length === reqParts.length) {
        let match = true;
        for (let i = 0; i < epParts.length; i++) {
          if (epParts[i].startsWith(':')) {
            continue;
          }
          if (epParts[i] !== reqParts[i]) {
            match = false;
            break;
          }
        }
        if (match) return ep;
      }
    }
    return undefined;
  }

  // Rate limit helper per IP/key
  public checkRateLimit(key: string, limit: number, windowSec: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowMs = windowSec * 1000;
    const bucket = this.rateLimitBuckets.get(key);

    if (!bucket || now > bucket.resetTime) {
      this.rateLimitBuckets.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
    }

    if (bucket.count >= limit) {
      return { allowed: false, remaining: 0, resetTime: bucket.resetTime };
    }

    bucket.count++;
    return { allowed: true, remaining: limit - bucket.count, resetTime: bucket.resetTime };
  }
}

export const simulationService = new SimulationService();
