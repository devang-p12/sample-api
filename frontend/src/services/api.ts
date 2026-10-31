import {
  GlobalSimulationState,
  EndpointDefinition,
  ScenarioDefinition,
  SimulationConfig,
  RequestLog,
  RequestStats,
} from '../types/index.js';

const API_BASE = '/api';

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
    const res = await fetch(`${API_BASE}/simulation/config`);
    if (!res.ok) throw new Error('Failed to fetch simulation config');
    return res.json();
  },

  async updateGlobalSimulation(patch: Partial<GlobalSimulationState>): Promise<{ global: GlobalSimulationState }> {
    const res = await fetch(`${API_BASE}/simulation/global`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Failed to update global simulation');
    return res.json();
  },

  async resetAllToHealthy(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset simulation');
    return res.json();
  },

  // Endpoints
  async getEndpoints(): Promise<{ total: number; endpoints: EndpointDefinition[] }> {
    const res = await fetch(`${API_BASE}/simulation/endpoints`);
    if (!res.ok) throw new Error('Failed to fetch endpoints');
    return res.json();
  },

  async getEndpointById(id: string): Promise<EndpointDefinition> {
    const res = await fetch(`${API_BASE}/simulation/endpoints/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch endpoint ${id}`);
    return res.json();
  },

  async updateEndpointSimulation(id: string, config: Partial<SimulationConfig>): Promise<{ endpoint: EndpointDefinition }> {
    const res = await fetch(`${API_BASE}/simulation/endpoints/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error(`Failed to update endpoint ${id}`);
    return res.json();
  },

  async resetEndpointSimulation(id: string): Promise<{ endpoint: EndpointDefinition }> {
    const res = await fetch(`${API_BASE}/simulation/endpoints/${id}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to reset endpoint ${id}`);
    return res.json();
  },

  // Scenarios
  async getScenarios(): Promise<{ activeScenarioId: string; scenarios: ScenarioDefinition[] }> {
    const res = await fetch(`${API_BASE}/simulation/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch scenarios');
    return res.json();
  },

  async activateScenario(id: string): Promise<{ scenario: ScenarioDefinition }> {
    const res = await fetch(`${API_BASE}/simulation/scenarios/${id}/activate`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to activate scenario ${id}`);
    return res.json();
  },

  async deactivateScenario(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/simulation/scenarios/deactivate`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to deactivate scenario');
    return res.json();
  },

  // Datastore
  async resetDataStore(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/simulation/datastore/reset`, { method: 'POST' });
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

    const res = await fetch(`${API_BASE}/activity?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    return res.json();
  },

  async getActivityStats(): Promise<RequestStats> {
    const res = await fetch(`${API_BASE}/activity/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async clearActivityLogs(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/activity`, { method: 'DELETE' });
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

    try {
      const response = await fetch(options.url, {
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
