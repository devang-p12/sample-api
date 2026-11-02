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
  ratePercent: number;
  statusCode: number;
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

export interface SimulationConfig {
  mode: SimulationMode;
  statusCode?: number;
  latency: LatencyConfig;
  failure: FailureConfig;
  rateLimit: RateLimitConfig;
  auth: AuthConfig;
  schemaVersion: SchemaVersion;
  responseContentType?: string;
  database?: {
    mode: 'normal' | 'slow' | 'failure';
    addedLatencyMs?: number;
  };
  gateway?: {
    mode: 'normal' | 'bad_gateway' | 'gateway_timeout';
  };
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
  isActive?: boolean;
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

export interface ServiceSummary {
  name: string;
  status: 'healthy' | 'degraded' | 'outage';
  endpointCount: number;
  requestCount: number;
  errorRate: number;
  avgLatency: number;
  description: string;
}
