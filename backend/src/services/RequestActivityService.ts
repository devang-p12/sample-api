import { RequestLog, RequestStats } from '../types/index.js';
import { config } from '../config/index.js';

export class RequestActivityService {
  private logs: RequestLog[] = [];
  private maxLogs: number;

  constructor(maxLogs: number = config.maxRequestLogs) {
    this.maxLogs = maxLogs;
  }

  public record(log: RequestLog): void {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
  }

  public getLogs(filter?: {
    search?: string;
    method?: string;
    statusGroup?: '2xx' | '3xx' | '4xx' | '5xx';
    service?: string;
    minLatency?: number;
    page?: number;
    limit?: number;
  }) {
    let result = [...this.logs];

    if (filter?.method && filter.method !== 'ALL') {
      result = result.filter(l => l.method === filter.method);
    }

    if (filter?.statusGroup) {
      const codePrefix = filter.statusGroup.charAt(0);
      result = result.filter(l => Math.floor(l.statusCode / 100).toString() === codePrefix);
    }

    if (filter?.service && filter.service !== 'ALL') {
      result = result.filter(l => l.service.toLowerCase() === filter.service?.toLowerCase());
    }

    if (filter?.minLatency && filter.minLatency > 0) {
      result = result.filter(l => l.responseTimeMs >= (filter.minLatency || 0));
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        l =>
          l.path.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          l.service.toLowerCase().includes(q) ||
          (l.error && l.error.toLowerCase().includes(q))
      );
    }

    const total = result.length;
    const page = Math.max(1, filter?.page || 1);
    const limit = Math.min(100, Math.max(1, filter?.limit || 20));
    const start = (page - 1) * limit;
    const items = result.slice(start, start + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public getStats(): RequestStats {
    const total = this.logs.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        requestsLastMinute: 0,
        statusGroups: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
        errorRatePercent: 0,
        avgLatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
        servicesBreakdown: {},
      };
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const requestsLastMinute = this.logs.filter(
      l => new Date(l.timestamp).getTime() >= oneMinuteAgo
    ).length;

    let totalLatency = 0;
    let errorsCount = 0;
    const statusGroups = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
    const latencies: number[] = [];
    const servicesBreakdown: Record<string, { total: number; errors: number; totalLatency: number; avgLatency: number }> = {};

    for (const log of this.logs) {
      totalLatency += log.responseTimeMs;
      latencies.push(log.responseTimeMs);

      const prefix = `${Math.floor(log.statusCode / 100)}xx` as keyof typeof statusGroups;
      if (statusGroups[prefix] !== undefined) {
        statusGroups[prefix]++;
      }

      if (log.statusCode >= 400) {
        errorsCount++;
      }

      const sName = log.service || 'other';
      if (!servicesBreakdown[sName]) {
        servicesBreakdown[sName] = { total: 0, errors: 0, totalLatency: 0, avgLatency: 0 };
      }
      servicesBreakdown[sName].total++;
      if (log.statusCode >= 400) servicesBreakdown[sName].errors++;
      servicesBreakdown[sName].totalLatency += log.responseTimeMs;
    }

    latencies.sort((a, b) => a - b);
    const p95Index = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95));
    const p99Index = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.99));

    const finalServicesBreakdown: RequestStats['servicesBreakdown'] = {};
    for (const [k, v] of Object.entries(servicesBreakdown)) {
      finalServicesBreakdown[k] = {
        total: v.total,
        errors: v.errors,
        avgLatency: Math.round(v.totalLatency / v.total),
      };
    }

    return {
      totalRequests: total,
      requestsLastMinute,
      statusGroups,
      errorRatePercent: parseFloat(((errorsCount / total) * 100).toFixed(1)),
      avgLatencyMs: Math.round(totalLatency / total),
      p95LatencyMs: latencies[p95Index] || 0,
      p99LatencyMs: latencies[p99Index] || 0,
      servicesBreakdown: finalServicesBreakdown,
    };
  }

  public clear(): void {
    this.logs = [];
  }
}

export const requestActivityService = new RequestActivityService();
