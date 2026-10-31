import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  Activity,
  AlertTriangle,
  Zap,
  Play,
  RotateCcw,
  Clock,
  ArrowRight,
  TrendingDown,
  Layers,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { StatCard } from '../components/StatCard.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { MethodBadge, StatusBadge, Badge } from '../components/Badge.js';
import { RequestStats, RequestLog, ScenarioDefinition, EndpointDefinition } from '../types/index.js';
import { cn, formatDuration } from '../lib/utils.js';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<RequestLog[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointDefinition[]>([]);
  const [activeScenario, setActiveScenario] = useState<ScenarioDefinition | null>(null);
  const [globalOutage, setGlobalOutage] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [configData, statsData, logsData, endpointsData] = await Promise.all([
        api.getSimulationConfig(),
        api.getActivityStats(),
        api.getActivityLogs({ limit: 8 }),
        api.getEndpoints(),
      ]);

      setActiveScenario(configData.activeScenario);
      setGlobalOutage(configData.global.globalOutage);
      setStats(statsData);
      setRecentLogs(logsData.items);
      setEndpoints(endpointsData.endpoints);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleScenarioTrigger = async (scenarioId: string) => {
    setActionLoading(scenarioId);
    try {
      if (scenarioId === 'normal') {
        await api.deactivateScenario();
      } else {
        await api.activateScenario(scenarioId);
      }
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  // Group endpoints by service to display service health
  const services = ['Payments', 'Products', 'Orders', 'Users', 'Inventory', 'Notifications', 'Health'];
  const simulatedCount = endpoints.filter(ep => ep.simulationConfig.mode !== 'HEALTHY').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner if Active Simulation or Outage */}
      {globalOutage ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400">
              <XCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-100">GLOBAL OUTAGE ACTIVE (HTTP 503)</h2>
              <p className="text-xs text-rose-300/80">
                All platform endpoints are intentionally returning 503 Service Unavailable to simulate catastrophic infrastructure failure.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleScenarioTrigger('normal')}
            loading={actionLoading === 'normal'}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Restore Normal Operation
          </Button>
        </div>
      ) : activeScenario && activeScenario.id !== 'normal' ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  SCENARIO ACTIVE
                </span>
                <h2 className="text-base font-bold text-amber-100">{activeScenario.name}</h2>
              </div>
              <p className="text-xs text-amber-300/80 mt-1">
                {activeScenario.description}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleScenarioTrigger('normal')}
            loading={actionLoading === 'normal'}
            className="border-amber-500/40 text-amber-200 hover:bg-amber-500/20"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Deactivate Scenario
          </Button>
        </div>
      ) : null}

      {/* Step 59 Guided Sentinel Interactive Flow Bar */}
      <Card className="border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/20">
        <CardContent className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Sentinel Demonstration Flow
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Trigger degradation or outages on Payments API, observe Sentinel alerts, and recover nominal status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={activeScenario?.id === 'payment-degradation' ? 'primary' : 'outline'}
              onClick={() => handleScenarioTrigger('payment-degradation')}
              loading={actionLoading === 'payment-degradation'}
              className="text-xs"
            >
              <Clock className="w-3.5 h-3.5 mr-1" />
              1. Introduce Latency (2.5s)
            </Button>

            <Button
              size="sm"
              variant={activeScenario?.id === 'payment-outage' ? 'destructive' : 'outline'}
              onClick={() => handleScenarioTrigger('payment-outage')}
              loading={actionLoading === 'payment-outage'}
              className="text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              2. Introduce Outage (503)
            </Button>

            <Button
              size="sm"
              variant={!activeScenario || activeScenario.id === 'normal' ? 'success' : 'outline'}
              onClick={() => handleScenarioTrigger('normal')}
              loading={actionLoading === 'normal'}
              className="text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              3. Recovery (200 OK)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* High-Level Observability Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Endpoints"
          value={endpoints.length}
          subtitle={`${endpoints.length - simulatedCount} healthy • ${simulatedCount} simulated`}
          icon={<Server className="w-5 h-5 text-cyan-400" />}
          indicatorColor="cyan"
        />

        <StatCard
          title="Total Requests"
          value={stats?.totalRequests || 0}
          subtitle={`${stats?.requestsLastMinute || 0} req / min`}
          icon={<Activity className="w-5 h-5 text-emerald-400" />}
          indicatorColor="emerald"
        />

        <StatCard
          title="Error Rate"
          value={`${stats?.errorRatePercent || 0}%`}
          subtitle={`4xx: ${stats?.statusGroups['4xx'] || 0} • 5xx: ${stats?.statusGroups['5xx'] || 0}`}
          icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
          indicatorColor={(stats?.errorRatePercent || 0) > 10 ? 'rose' : 'slate'}
        />

        <StatCard
          title="Avg Latency"
          value={`${stats?.avgLatencyMs || 0}ms`}
          subtitle={`p95: ${stats?.p95LatencyMs || 0}ms • p99: ${stats?.p99LatencyMs || 0}ms`}
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          indicatorColor={(stats?.avgLatencyMs || 0) > 500 ? 'amber' : 'slate'}
        />
      </div>

      {/* Status Breakdown & Service Health Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Codes Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>HTTP Status Distribution</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                {stats?.totalRequests || 0} recorded
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: '2xx Success', count: stats?.statusGroups['2xx'] || 0, color: 'bg-emerald-500' },
              { label: '3xx Redirection', count: stats?.statusGroups['3xx'] || 0, color: 'bg-blue-500' },
              { label: '4xx Client Errors', count: stats?.statusGroups['4xx'] || 0, color: 'bg-amber-500' },
              { label: '5xx Server Errors', count: stats?.statusGroups['5xx'] || 0, color: 'bg-rose-500' },
            ].map(group => {
              const total = stats?.totalRequests || 1;
              const percent = Math.round((group.count / (total === 0 ? 1 : total)) * 100);
              return (
                <div key={group.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{group.label}</span>
                    <span className="text-slate-400">{group.count} ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={cn('h-full transition-all duration-500', group.color)}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Services Status Matrix */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Target Services Health Matrix</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/services')}
              className="text-xs text-cyan-400"
            >
              View Services <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {services.map(sName => {
                const sBreakdown = stats?.servicesBreakdown[sName];
                const sEndpoints = endpoints.filter(ep => ep.service.toLowerCase() === sName.toLowerCase());
                const isServiceSimulated = sEndpoints.some(ep => ep.simulationConfig.mode !== 'HEALTHY') || globalOutage;
                const isOutage = isServiceSimulated && (globalOutage || sEndpoints.some(ep => ep.simulationConfig.mode === 'UNAVAILABLE' || ep.simulationConfig.statusCode === 503));

                return (
                  <div
                    key={sName}
                    onClick={() => navigate('/endpoints')}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all cursor-pointer hover:border-slate-700 bg-slate-900/80 space-y-2',
                      isOutage
                        ? 'border-rose-500/40 bg-rose-950/20'
                        : isServiceSimulated
                        ? 'border-amber-500/40 bg-amber-950/20'
                        : 'border-slate-800'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-200">{sName}</span>
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          isOutage
                            ? 'bg-rose-400 animate-pulse'
                            : isServiceSimulated
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        )}
                      />
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                      <span>{sEndpoints.length} APIs</span>
                      <span>{sBreakdown?.avgLatency || 0}ms avg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Request Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Real-Time Request Activity Feed</span>
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Every request is intercepted, simulated, and stamped with an X-Request-ID
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/activity')}
            className="text-xs text-cyan-400"
          >
            Full Activity Log <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs font-mono">
              No recent requests recorded. Send requests from Sentinel or the API Tester.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2.5 font-medium">Time</th>
                    <th className="pb-2.5 font-medium">Method</th>
                    <th className="pb-2.5 font-medium">Path</th>
                    <th className="pb-2.5 font-medium">Status</th>
                    <th className="pb-2.5 font-medium">Latency</th>
                    <th className="pb-2.5 font-medium">Simulation Mode</th>
                    <th className="pb-2.5 font-medium text-right">Request ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <MethodBadge method={log.method} />
                      </td>
                      <td className="py-2.5 text-slate-200 font-semibold truncate max-w-[200px]">
                        {log.path}
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <StatusBadge statusCode={log.statusCode} />
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'font-mono',
                            log.responseTimeMs > 1000
                              ? 'text-rose-400 font-bold'
                              : log.responseTimeMs > 300
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          )}
                        >
                          {formatDuration(log.responseTimeMs)}
                        </span>
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <Badge
                          variant={
                            log.simulationMode === 'HEALTHY'
                              ? 'outline'
                              : log.simulationMode.includes('OUTAGE') || log.simulationMode.includes('UNAVAILABLE')
                              ? 'destructive'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {log.simulationMode}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right text-slate-500 text-[11px] truncate max-w-[120px]">
                        {log.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
