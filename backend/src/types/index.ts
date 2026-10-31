export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type SimulationMode =
  | 'HEALTHY'
  | 'DELAYED'
  | 'FAILING'
  | 'INTERMITTENT'
  | 'RATE_LIMITED'
  | 'SCHEMA_CHANGED'
  | 'UNAVAILABLE'
  | 'RANDOM'
  | 'AUTH_REQUIRED'
  | 'LARGE_RESPONSE'
  | 'DATABASE_SLOW'
  | 'DATABASE_FAILURE'
  | 'GATEWAY_TIMEOUT';

export type SchemaVersion = 'v1' | 'v2' | 'broken';

export interface LatencyConfig {
  type: 'none' | 'fixed' | 'random' | 'timeout';
  fixedMs?: number;
  minMs?: number;
  maxMs?: number;
  timeoutMs?: number;
}

export interface FailureConfig {
  enabled: boolean;
  ratePercent: number; // 0 to 100
  statusCode: number; // e.g. 500, 502, 503, 504
  errorMessage?: string;
}

export interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  windowSeconds: number;
}

export interface AuthConfig {
  required: boolean;
  type: 'none' | 'bearer' | 'basic' | 'apikey';
  expectedToken?: string;
  username?: string;
  password?: string;
  apiKey?: string;
}

export interface DatabaseSimulationConfig {
  mode: 'normal' | 'slow' | 'failure';
  addedLatencyMs?: number;
}

export interface GatewaySimulationConfig {
  mode: 'normal' | 'bad_gateway' | 'gateway_timeout';
}

export interface RandomDistributionItem {
  statusCode: number;
  probability: number; // 0 to 100
}

export interface SimulationConfig {
  mode: SimulationMode;
  statusCode?: number;
  latency: LatencyConfig;
  failure: FailureConfig;
  rateLimit: RateLimitConfig;
  auth: AuthConfig;
  schemaVersion: SchemaVersion;
  responseContentType?: string;
  database: DatabaseSimulationConfig;
  gateway: GatewaySimulationConfig;
  randomDistribution?: RandomDistributionItem[];
  largeResponseItemCount?: number;
}

export interface GlobalSimulationState {
  globalOutage: boolean;
  globalLatencyMs: number;
  globalFailureRate: number;
  globalStatusCode?: number;
  globalTimeoutMs?: number;
  activeScenarioId?: string;
}

export interface EndpointDefinition {
  id: string;
  service: string;
  method: HttpMethod;
  path: string;
  description: string;
  summary: string;
  tags: string[];
  parameters?: Array<{
    name: string;
    in: 'query' | 'path' | 'header';
    required?: boolean;
    type: string;
    description: string;
    example?: string;
  }>;
  requestBodyExample?: any;
  responseExample?: any;
  simulationConfig: SimulationConfig;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'reliability' | 'security' | 'resilience' | 'chaos';
  affectedServices: string[];
  affectedEndpoints: string[];
  configSummary: string;
  globalConfig?: Partial<GlobalSimulationState>;
  endpointOverrides?: Record<string, Partial<SimulationConfig>>;
}

export interface RequestLog {
  id: string;
  timestamp: string;
  method: HttpMethod;
  path: string;
  url: string;
  service: string;
  statusCode: number;
  responseTimeMs: number;
  requestSize: number;
  responseSize: number;
  ip: string;
  userAgent: string;
  simulationMode: string;
  error?: string;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  responseHeaders: Record<string, string>;
  responseBody?: any;
}

export interface RequestStats {
  totalRequests: number;
  requestsLastMinute: number;
  statusGroups: {
    '2xx': number;
    '3xx': number;
    '4xx': number;
    '5xx': number;
  };
  errorRatePercent: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  servicesBreakdown: Record<string, {
    total: number;
    errors: number;
    avgLatency: number;
  }>;
}

// Models
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'support' | 'developer';
  status: 'active' | 'suspended' | 'pending';
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'upi' | 'crypto';
  transactionRef: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseLocation: string;
  quantityAvailable: number;
  quantityReserved: number;
  minimumThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastRestockedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  channel: 'email' | 'sms' | 'webhook' | 'push';
  status: 'delivered' | 'pending' | 'failed';
  read: boolean;
  createdAt: string;
}

export interface ApiStandardError {
  error: {
    code: string;
    message: string;
    status: number;
    requestId: string;
    details?: any;
    timestamp: string;
  };
}
