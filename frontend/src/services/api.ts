import {
  GlobalSimulationState,
  EndpointDefinition,
  ScenarioDefinition,
  SimulationConfig,
  RequestLog,
  RequestStats,
} from '../types/index.js';

export function getBackendBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sentinel_backend_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/$/, '');
    }
  }
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || '';
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }
  return '';
}

export function setBackendBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    const trimmed = url.trim().replace(/\/$/, '');
    if (!trimmed) {
      localStorage.removeItem('sentinel_backend_url');
    } else {
      localStorage.setItem('sentinel_backend_url', trimmed);
    }
  }
}

export function getEffectiveApiUrl(path: string): string {
  const base = getBackendBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!base) {
    return cleanPath;
  }
  return `${base}${cleanPath}`;
}

export async function testBackendConnection(targetUrl?: string): Promise<{ ok: boolean; message: string; latencyMs: number; status?: number }> {
  const base = (targetUrl !== undefined ? targetUrl.trim().replace(/\/$/, '') : getBackendBaseUrl()) || '';
  const healthUrl = base ? `${base}/api/health` : '/api/health';
  const start = performance.now();
  try {
    const res = await fetch(healthUrl);
    const latencyMs = Math.round(performance.now() - start);
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: `Connected (${data.status || 'operational'})`, latencyMs, status: res.status };
    }
    return { ok: false, message: `HTTP ${res.status} response from server`, latencyMs, status: res.status };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return { ok: false, message: err.message || 'Connection failed', latencyMs, status: 0 };
  }
}

const endpoint = (subPath: string) => getEffectiveApiUrl(`/api${subPath}`);

export const api = {
  // Config & State
  async getSimulationConfig(): Promise<{
    global: GlobalSimulationState;
    activeScenario: ScenarioDefinition | null;
    stats: {
      totalEndpoints: number;
      healthyEndpoints: number;
      simulatedEndpoints: number;
      globalOutageActive: boolean;
    };
  }> {
    const res = await fetch(endpoint('/simulation/config'));
    if (!res.ok) throw new Error('Failed to fetch simulation config');
    return res.json();
  },

  async updateGlobalSimulation(patch: Partial<GlobalSimulationState>): Promise<{ global: GlobalSimulationState }> {
    const res = await fetch(endpoint('/simulation/global'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Failed to update global simulation');
    return res.json();
  },

  async resetAllToHealthy(): Promise<{ message: string }> {
    const res = await fetch(endpoint('/simulation/reset'), { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset simulation');
    return res.json();
  },

  // Endpoints
  async getEndpoints(): Promise<{ total: number; endpoints: EndpointDefinition[] }> {
    const res = await fetch(endpoint('/simulation/endpoints'));
    if (!res.ok) throw new Error('Failed to fetch endpoints');
    return res.json();
  },

  async getEndpointById(id: string): Promise<EndpointDefinition> {
    const res = await fetch(endpoint(`/simulation/endpoints/${id}`));
    if (!res.ok) throw new Error(`Failed to fetch endpoint ${id}`);
    return res.json();
  },

  async updateEndpointSimulation(id: string, config: Partial<SimulationConfig>, isActive?: boolean): Promise<{ endpoint: EndpointDefinition }> {
    const res = await fetch(endpoint(`/simulation/endpoints/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...config, ...(isActive !== undefined ? { isActive } : {}) }),
    });
    if (!res.ok) throw new Error(`Failed to update endpoint ${id}`);
    return res.json();
  },

  async activateEndpoint(id: string): Promise<{ endpoint: EndpointDefinition }> {
    const res = await fetch(endpoint(`/simulation/endpoints/${id}/activate`), { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to activate endpoint ${id}`);
    return res.json();
  },

  async deactivateEndpoint(id: string): Promise<{ endpoint: EndpointDefinition }> {
    const res = await fetch(endpoint(`/simulation/endpoints/${id}/deactivate`), { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to deactivate endpoint ${id}`);
    return res.json();
  },

  async toggleEndpoint(id: string): Promise<{ endpoint: EndpointDefinition }> {
    const res = await fetch(endpoint(`/simulation/endpoints/${id}/toggle`), { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to toggle endpoint ${id}`);
    return res.json();
  },

  async resetEndpointSimulation(id: string): Promise<{ endpoint: EndpointDefinition }> {
    const res = await fetch(endpoint(`/simulation/endpoints/${id}/reset`), { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to reset endpoint ${id}`);
    return res.json();
  },

  // Scenarios
  async getScenarios(): Promise<{ activeScenarioId: string; scenarios: ScenarioDefinition[] }> {
    const res = await fetch(endpoint('/simulation/scenarios'));
    if (!res.ok) throw new Error('Failed to fetch scenarios');
    return res.json();
  },

  async activateScenario(id: string): Promise<{ scenario: ScenarioDefinition }> {
    const res = await fetch(endpoint(`/simulation/scenarios/${id}/activate`), { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to activate scenario ${id}`);
    return res.json();
  },

  async deactivateScenario(id?: string): Promise<{ message: string }> {
    const url = id ? endpoint(`/simulation/scenarios/${id}/deactivate`) : endpoint('/simulation/scenarios/deactivate');
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to deactivate scenario');
    return res.json();
  },

  // Datastore
  async resetDataStore(): Promise<{ message: string }> {
    const res = await fetch(endpoint('/simulation/datastore/reset'), { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset datastore');
    return res.json();
  },

  // Activity Logs & Stats
  async getActivityLogs(params?: {
    search?: string;
    method?: string;
    statusGroup?: string;
    service?: string;
    minLatency?: number;
    page?: number;
    limit?: number;
  }): Promise<{ items: RequestLog[]; total: number; page: number; limit: number; totalPages: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.method && params.method !== 'ALL') searchParams.set('method', params.method);
    if (params?.statusGroup && params.statusGroup !== 'ALL') searchParams.set('statusGroup', params.statusGroup);
    if (params?.service && params.service !== 'ALL') searchParams.set('service', params.service);
    if (params?.minLatency) searchParams.set('minLatency', params.minLatency.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const res = await fetch(`${endpoint('/activity')}?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    return res.json();
  },

  async getActivityStats(): Promise<RequestStats> {
    const res = await fetch(endpoint('/activity/stats'));
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async clearActivityLogs(): Promise<{ message: string }> {
    const res = await fetch(endpoint('/activity'), { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear activity');
    return res.json();
  },

  // Generic Client Execution (for API tester)
  async executeRequest(options: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<{
    status: number;
    statusText: string;
    durationMs: number;
    sizeBytes: number;
    headers: Record<string, string>;
    data: any;
    rawText: string;
  }> {
    const start = performance.now();
    const fetchHeaders: Record<string, string> = { ...(options.headers || {}) };

    let bodyPayload: BodyInit | undefined = undefined;
    if (options.body && options.method !== 'GET' && options.method !== 'HEAD') {
      bodyPayload = options.body;
      if (!fetchHeaders['Content-Type'] && !fetchHeaders['content-type']) {
        try {
          JSON.parse(options.body);
          fetchHeaders['Content-Type'] = 'application/json';
        } catch {
          fetchHeaders['Content-Type'] = 'text/plain';
        }
      }
    }

    // Resolve relative URL to effective backend
    let targetUrl = options.url;
    if (targetUrl.startsWith('/')) {
      targetUrl = getEffectiveApiUrl(targetUrl);
    }

    try {
      const response = await fetch(targetUrl, {
        method: options.method,
        headers: fetchHeaders,
        body: bodyPayload,
      });

      const durationMs = Math.round(performance.now() - start);
      const resHeaders: Record<string, string> = {};
      response.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      const rawText = await response.text();
      let parsedData: any = rawText;
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        // keep text
      }

      return {
        status: response.status,
        statusText: response.statusText,
        durationMs,
        sizeBytes: new Blob([rawText]).size,
        headers: resHeaders,
        data: parsedData,
        rawText,
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      return {
        status: 0,
        statusText: 'Network Error',
        durationMs,
        sizeBytes: 0,
        headers: {},
        data: { error: err.message || 'Connection failed' },
        rawText: err.message || 'Connection failed',
      };
    }
  },
};
