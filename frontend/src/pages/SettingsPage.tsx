import React, { useState, useEffect } from 'react';
import {
  Settings,
  AlertTriangle,
  Clock,
  RotateCcw,
  Database,
  Check,
  ShieldAlert,
  ServerCrash,
  Sliders,
  Radio,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { GlobalSimulationState } from '../types/index.js';
import { cn } from '../lib/utils.js';

export const SettingsPage: React.FC = () => {
  const [globalState, setGlobalState] = useState<GlobalSimulationState>({
    globalOutage: false,
    globalLatencyMs: 0,
    globalFailureRate: 0,
    globalStatusCode: undefined,
    globalTimeoutMs: undefined,
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reseedSuccess, setReseedSuccess] = useState(false);

  const loadConfig = async () => {
    try {
      const data = await api.getSimulationConfig();
      setGlobalState(data.global);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleUpdateGlobal = async (patch: Partial<GlobalSimulationState>) => {
    setSaving(true);
    try {
      const updated = await api.updateGlobalSimulation(patch);
      setGlobalState(updated.global);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDatastore = async () => {
    if (confirm('Reset in-memory datastore back to default seeds? (Reverts all created/edited products and payments)')) {
      await api.resetDataStore();
      setReseedSuccess(true);
      setTimeout(() => setReseedSuccess(false), 2000);
    }
  };

  const handleResetAllSimulation = async () => {
    if (confirm('Reset ALL endpoints and global chaos controls back to nominal healthy state?')) {
      await api.resetAllToHealthy();
      await loadConfig();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Global Simulation Controls & Chaos Knobs</span>
            <Badge variant="outline" size="sm">
              Cluster-wide
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global overrides supersede individual endpoint configurations, affecting all simulated services simultaneously.
          </p>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleResetAllSimulation}
          className="text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset All Knobs to Nominal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Chaos Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={cn(globalState.globalOutage && 'border-rose-500/50 bg-rose-950/15')}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <ServerCrash className="w-4 h-4 text-rose-400" />
                  <span>Global Outage Simulation</span>
                </span>
                {globalState.globalOutage && (
                  <Badge variant="destructive" size="sm">
                    ACTIVE OUTAGE
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-300">
                Instantly forces <strong>every single API endpoint</strong> to return <code>503 Service Unavailable</code> with a standardized error envelope. Useful for testing Sentinel complete site-down alerts and pager duty integrations.
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <Button
                  variant={globalState.globalOutage ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateGlobal({ globalOutage: !globalState.globalOutage })}
                  loading={saving}
                  className="text-xs"
                >
                  {globalState.globalOutage ? 'Turn OFF Global Outage' : 'Trigger Global Outage (503)'}
                </Button>
                {saveSuccess && <span className="text-xs text-emerald-400 font-mono">Updated!</span>}
              </div>
            </CardContent>
          </Card>

          {/* Global Latency & Fault Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Global Latency Injection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Added Delay:</span>
                  <span className="text-cyan-400 font-bold">{globalState.globalLatencyMs} ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={globalState.globalLatencyMs}
                  onChange={e => handleUpdateGlobal({ globalLatencyMs: Number(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0 ms (Instant)</span>
                  <span>1000 ms</span>
                  <span>2500 ms</span>
                  <span>5000 ms (High latency)</span>
                </div>
              </div>

              {/* Global Failure Rate */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Global Failure Rate (500 Internal Server Error):</span>
                  <span className="text-rose-400 font-bold">{globalState.globalFailureRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={globalState.globalFailureRate}
                  onChange={e => handleUpdateGlobal({ globalFailureRate: Number(e.target.value) })}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0% (Reliable)</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>100% (Complete failure)</span>
                </div>
              </div>

              {/* Global Status Override */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <label className="text-xs font-medium text-slate-300">Global Forced Status Code</label>
                <select
                  value={globalState.globalStatusCode || ''}
                  onChange={e => handleUpdateGlobal({ globalStatusCode: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">None (Let endpoints respond naturally)</option>
                  <option value="500">500 Internal Server Error</option>
                  <option value="502">502 Bad Gateway</option>
                  <option value="503">503 Service Unavailable</option>
                  <option value="504">504 Gateway Timeout</option>
                  <option value="429">429 Too Many Requests</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Datastore & Sentinel Integration Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>In-Memory Datastore</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Sentinel API Playground maintains realistic in-memory records for users, products, orders, payments, and inventory.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDatastore}
                className="w-full text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reseed In-Memory Datastore
              </Button>

              {reseedSuccess && (
                <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1 justify-center">
                  <Check className="w-3.5 h-3.5" />
                  <span>Datastore reseeded to initial state!</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sentinel Integration Guide */}
          <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-900 to-cyan-950/20">
            <CardHeader>
              <CardTitle className="text-sm text-cyan-400">Sentinel Target Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-300 font-sans">
              <p>Configure your <strong>Sentinel</strong> platform monitoring probes to target:</p>
              <div className="bg-slate-950 rounded p-2 font-mono text-[11px] text-slate-200 space-y-1">
                <div>http://localhost:4000/api/health</div>
                <div>http://localhost:4000/api/payments/health</div>
                <div>http://localhost:4000/api/products</div>
                <div>http://localhost:4000/api/payments</div>
              </div>
              <p className="text-slate-400 text-[11px] pt-1">
                All responses include <code>X-Request-ID</code>, <code>X-Response-Time</code>, and <code>X-Simulation-Mode</code> headers for distributed tracing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
