export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Sentinel API Playground Specification',
    version: '1.0.0',
    description: 'Realistic target REST API environment designed for Sentinel monitoring, reliability testing, failure simulation, alerting validation, and high-throughput load testing.',
    contact: {
      name: 'Sentinel Reliability Engineering',
      url: 'https://sentinel.monitoring.dev',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local Simulation Server',
    },
  ],
  tags: [
    { name: 'Health', description: 'System and service-specific health monitoring probes' },
    { name: 'Auth', description: 'Authentication simulation and token issuance' },
    { name: 'Users', description: 'User account and profile CRUD operations' },
    { name: 'Products', description: 'Catalog management, full-text search, and large payload benchmarks' },
    { name: 'Orders', description: 'Purchase order lifecycle and fulfillment tracking' },
    { name: 'Payments', description: 'Payment processing, refunds, and transaction ledger' },
    { name: 'Inventory', description: 'Warehouse stock and reservation metrics' },
    { name: 'Notifications', description: 'Alert dispatch and multi-channel messaging' },
    { name: 'API Versioning', description: 'Multi-version schemas for compatibility verification' },
    { name: 'Simulation Control', description: 'Programmatic chaos and simulation management API' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Primary system health probe',
        description: 'Returns health status across all sub-services.',
        responses: {
          '200': { description: 'System healthy', content: { 'application/json': { schema: { type: 'object' } } } },
          '503': { description: 'Service degraded or unavailable' },
        },
      },
      head: { tags: ['Health'], summary: 'Health HEAD probe', responses: { '200': { description: 'OK' } } },
    },
    '/api/payments/health': {
      get: {
        tags: ['Payments', 'Health'],
        summary: 'Payment service health probe',
        description: 'Direct health check probe monitored by Sentinel for payment subsystem degradation.',
        responses: {
          '200': { description: 'Payment gateway connected' },
          '503': { description: 'Payment gateway unavailable' },
        },
      },
    },
    '/api/users/health': {
      get: { tags: ['Users', 'Health'], summary: 'Users service health probe', responses: { '200': { description: 'Users healthy' } } },
    },
    '/api/orders/health': {
      get: { tags: ['Orders', 'Health'], summary: 'Orders service health probe', responses: { '200': { description: 'Orders healthy' } } },
    },
    '/api/inventory/health': {
      get: { tags: ['Inventory', 'Health'], summary: 'Inventory service health probe', responses: { '200': { description: 'Inventory healthy' } } },
    },
    '/api/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate and receive bearer token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', example: 'sentinel123' },
                },
                required: ['username', 'password'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated successfully' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string' }, description: 'Filter by role (admin, developer, support, user)' },
          { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by status (active, suspended, pending)' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search name, email, department' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { '200': { description: 'Users list' } },
      },
      post: {
        tags: ['Users'],
        summary: 'Create user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Alex Smith' },
                  email: { type: 'string', example: 'alex.smith@example.com' },
                  role: { type: 'string', example: 'developer' },
                  department: { type: 'string', example: 'Core Infra' },
                },
                required: ['name', 'email'],
              },
            },
          },
        },
        responses: { '201': { description: 'User created' }, '400': { description: 'Validation failed' }, '409': { description: 'Email conflict' } },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'User found' }, '404': { description: 'User not found' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Replace user (PUT)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'User replaced' }, '404': { description: 'Not found' } },
      },
      patch: {
        tags: ['Users'],
        summary: 'Partially update user (PATCH)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'User patched' }, '404': { description: 'Not found' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Deleted' }, '404': { description: 'Not found' } },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', example: 'price' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { '200': { description: 'Products list' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Ultra Wide Monitor' },
                  price: { type: 'number', example: 799.99 },
                  category: { type: 'string', example: 'Monitors' },
                  stock: { type: 'integer', example: 25 },
                },
                required: ['name', 'price'],
              },
            },
          },
        },
        responses: { '201': { description: 'Product created' } },
      },
    },
    '/api/products/search': {
      get: {
        tags: ['Products'],
        summary: 'Search products by text query',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string', example: 'laptop' } }],
        responses: { '200': { description: 'Search results' } },
      },
    },
    '/api/products/large': {
      get: {
        tags: ['Products'],
        summary: 'Large payload response benchmark',
        description: 'Simulates heavy JSON transfer (500 to 2000 items) to test bandwidth and parsing under load.',
        parameters: [{ name: 'count', in: 'query', schema: { type: 'integer', default: 500 } }],
        responses: { '200': { description: 'Large response dataset' } },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Product found' }, '404': { description: 'Product not found' } },
      },
      put: {
        tags: ['Products'],
        summary: 'Replace product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Updated' } },
      },
      patch: {
        tags: ['Products'],
        summary: 'Patch product fields',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Patched' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Deleted' } },
      },
    },
    '/api/orders': {
      get: { tags: ['Orders'], summary: 'List orders', responses: { '200': { description: 'Orders list' } } },
      post: {
        tags: ['Orders'],
        summary: 'Create order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string', example: 'usr_1001' },
                  customerName: { type: 'string', example: 'Sarah Connor' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: { type: 'string', example: 'prd_2001' },
                        productName: { type: 'string', example: 'Laptop' },
                        price: { type: 'number', example: 2499.00 },
                        quantity: { type: 'integer', example: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Order created' } },
      },
    },
    '/api/orders/{id}': {
      get: { tags: ['Orders'], summary: 'Get order by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Found' } } },
      put: { tags: ['Orders'], summary: 'Update order', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      patch: { tags: ['Orders'], summary: 'Patch order status', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Patched' } } },
      delete: { tags: ['Orders'], summary: 'Cancel order', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'Deleted' } } },
    },
    '/api/payments': {
      get: { tags: ['Payments'], summary: 'List payments', responses: { '200': { description: 'Payments list' } } },
      post: {
        tags: ['Payments'],
        summary: 'Process payment authorization',
        description: 'Endpoint heavily targeted during Sentinel reliability demos (latency degradation and 503 outage simulations).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orderId: { type: 'string', example: 'ord_3001' },
                  amount: { type: 'number', example: 2499.00 },
                  currency: { type: 'string', example: 'USD' },
                  paymentMethod: { type: 'string', example: 'credit_card' },
                },
                required: ['orderId', 'amount'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Payment succeeded' },
          '500': { description: 'Simulated payment processing error' },
          '503': { description: 'Simulated payment service outage' },
        },
      },
    },
    '/api/payments/{id}': {
      get: { tags: ['Payments'], summary: 'Get payment by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Payment found' } } },
      put: { tags: ['Payments'], summary: 'Update payment', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      patch: { tags: ['Payments'], summary: 'Patch payment status', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Patched' } } },
      delete: { tags: ['Payments'], summary: 'Delete payment record', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'Deleted' } } },
    },
    '/api/inventory': {
      get: { tags: ['Inventory'], summary: 'Get warehouse inventory stock', responses: { '200': { description: 'Inventory list' } } },
    },
    '/api/notifications': {
      get: { tags: ['Notifications'], summary: 'List dispatched notifications', responses: { '200': { description: 'Notifications list' } } },
      post: { tags: ['Notifications'], summary: 'Trigger simulated notification', responses: { '201': { description: 'Sent' } } },
    },
    '/api/v1/products': {
      get: { tags: ['API Versioning'], summary: 'Get products in V1 schema', responses: { '200': { description: 'V1 schema response' } } },
    },
    '/api/v2/products': {
      get: { tags: ['API Versioning'], summary: 'Get products in V2 schema', responses: { '200': { description: 'V2 modern schema response' } } },
    },
    '/api/simulation/config': {
      get: { tags: ['Simulation Control'], summary: 'Get active simulation state and active scenario', responses: { '200': { description: 'Config' } } },
    },
    '/api/simulation/scenarios': {
      get: { tags: ['Simulation Control'], summary: 'List all available simulation scenarios', responses: { '200': { description: 'Scenarios list' } } },
    },
    '/api/simulation/scenarios/{id}/activate': {
      post: { tags: ['Simulation Control'], summary: 'Activate a scenario (e.g. payment-outage, slow-api)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Activated' } } },
    },
    '/api/simulation/scenarios/deactivate': {
      post: { tags: ['Simulation Control'], summary: 'Deactivate current scenario and restore healthy operation', responses: { '200': { description: 'Deactivated' } } },
    },
    '/api/activity': {
      get: { tags: ['Simulation Control'], summary: 'Query live request activity log buffer', responses: { '200': { description: 'Recent requests' } } },
      delete: { tags: ['Simulation Control'], summary: 'Clear request activity buffer', responses: { '200': { description: 'Cleared' } } },
    },
  },
};
