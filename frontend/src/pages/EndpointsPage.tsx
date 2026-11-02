import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Sliders,
  Play,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Code,
  Terminal,
  Power,
  PowerOff,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { MethodBadge, Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { JsonViewer } from '../components/JsonViewer.js';
import { EndpointDefinition, SimulationConfig, HttpMethod } from '../types/index.js';
import { cn, generateCurl } from '../lib/utils.js';

export const EndpointsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [endpoints, setEndpoints] = useState<EndpointDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>(searchParams.get('service') || 'ALL');

  // Selected endpoint for modal / drawer
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointDefinition | null>(null);
  const [simForm, setSimForm] = useState<SimulationConfig | null>(null);
  const [endpointIsActive, setEndpointIsActive] = useState<boolean>(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const loadEndpoints = async () => {
    try {
      const data = await api.getEndpoints();
      setEndpoints(data.endpoints);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEndpoints();
  }, []);

  const openEndpointModal = (ep: EndpointDefinition) => {
    setActiveEndpoint(ep);
    setSimForm(JSON.parse(JSON.stringify(ep.simulationConfig)));
    setEndpointIsActive(ep.isActive !== false);
    setSaveSuccess(false);
  };

  const handleToggleActive = async (ep: EndpointDefinition, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTogglingId(ep.id);
    try {
      const res = await api.toggleEndpoint(ep.id);
      if (activeEndpoint && activeEndpoint.id === ep.id) {
        setActiveEndpoint(res.endpoint);
        setEndpointIsActive(res.endpoint.isActive !== false);
      }
      await loadEndpoints();
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveSimulation = async () => {
    if (!activeEndpoint || !simForm) return;
    setSaving(true);
    try {
      const res = await api.updateEndpointSimulation(activeEndpoint.id, simForm, endpointIsActive);
      setActiveEndpoint(res.endpoint);
      setEndpointIsActive(res.endpoint.isActive !== false);
      setSaveSuccess(true);
      await loadEndpoints();
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetEndpoint = async () => {
    if (!activeEndpoint) return;
    setSaving(true);
    try {
      const res = await api.resetEndpointSimulation(activeEndpoint.id);
      setActiveEndpoint(res.endpoint);
      setEndpointIsActive(true);
      setSimForm(JSON.parse(JSON.stringify(res.endpoint.simulationConfig)));
      await loadEndpoints();
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCurl = (ep: EndpointDefinition) => {
    const curl = generateCurl({
      method: ep.method,
      url: `http://localhost:4000${ep.path}`,
      headers: {
        'Content-Type': 'application/json',
        ...(ep.simulationConfig.auth.required ? { Authorization: 'Bearer sentinel-mock-jwt-token-xyz' } : {}),
      },
      body: ep.requestBodyExample,
    });
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const methods = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  const servicesList = ['ALL', ...Array.from(new Set(endpoints.map(ep => ep.service)))];

  const filteredEndpoints = endpoints.filter(ep => {
    const matchesSearch =
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.service.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = selectedMethod === 'ALL' || ep.method === selectedMethod;
    const matchesService = selectedService === 'ALL' || ep.service.toLowerCase() === selectedService.toLowerCase();

    return matchesSearch && matchesMethod && matchesService;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Endpoint Explorer & Simulation Matrix</span>
            <Badge variant="outline" size="sm">
              {filteredEndpoints.length} of {endpoints.length} APIs
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and configure individual simulation behaviors, response delays, fault injections, and schemas.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search endpoints by path (e.g. /api/payments), summary, or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {/* Method Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {methods.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-mono font-medium rounded transition-colors',
                  selectedMethod === m
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Service Dropdown */}
          <select
            value={selectedService}
            onChange={e => setSelectedService(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            {servicesList.map(s => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Services' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Endpoints Table / Cards */}
      <div className="space-y-2">
        {filteredEndpoints.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-xs font-mono text-slate-500">
              No matching endpoints found for your filters.
            </CardContent>
          </Card>
        ) : (
          filteredEndpoints.map(ep => {
            const isDeactivated = ep.isActive === false;
            const isSimulated = !isDeactivated && ep.simulationConfig.mode !== 'HEALTHY';
            const latencyMs = ep.simulationConfig.latency.type === 'fixed'
              ? ep.simulationConfig.latency.fixedMs
              : ep.simulationConfig.latency.type === 'random'
              ? `${ep.simulationConfig.latency.minMs}-${ep.simulationConfig.latency.maxMs}`
              : 0;

            return (
              <div
                key={ep.id}
                onClick={() => openEndpointModal(ep)}
                className={cn(
                  'group p-3.5 sm:p-4 rounded-xl border bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3',
                  isDeactivated
                    ? 'border-rose-600/50 bg-rose-950/20'
                    : isSimulated
                    ? ep.simulationConfig.mode === 'UNAVAILABLE' || ep.simulationConfig.statusCode === 503
                      ? 'border-rose-500/40 bg-rose-950/15'
                      : 'border-amber-500/40 bg-amber-950/15'
                    : 'border-slate-800 hover:border-slate-700'
                )}
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                  <MethodBadge method={ep.method} />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                        {ep.path}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {ep.service}
                      </span>
                      {isDeactivated && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                          OFFLINE 503
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5 font-sans">
                      {ep.summary}
                    </p>
                  </div>
                </div>

                {/* Simulation Badges & Action Buttons */}
                <div className="flex items-center space-x-2.5 self-end md:self-auto shrink-0">
                  {isDeactivated ? (
                    <Badge variant="destructive" size="sm" className="font-mono font-bold tracking-wider">
                      DEACTIVATED
                    </Badge>
                  ) : isSimulated ? (
                    <div className="flex items-center space-x-1.5">
                      <Badge
                        variant={
                          ep.simulationConfig.mode === 'UNAVAILABLE'
                            ? 'destructive'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {ep.simulationConfig.mode}
                      </Badge>
                      {ep.simulationConfig.latency.type !== 'none' && (
                        <Badge variant="warning" size="sm">
                          +{latencyMs}ms
                        </Badge>
                      )}
                      {ep.simulationConfig.failure.enabled && (
                        <Badge variant="destructive" size="sm">
                          {ep.simulationConfig.failure.ratePercent}% err
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <Badge variant="success" size="sm">
                      HEALTHY
                    </Badge>
                  )}

                  {/* Toggle Active / Deactivate Quick Button */}
                  <Button
                    size="sm"
                    variant={isDeactivated ? "success" : "outline"}
                    onClick={(e) => handleToggleActive(ep, e)}
                    loading={togglingId === ep.id}
                    className={cn(
                      "h-8 px-2.5 text-xs font-semibold transition-all",
                      isDeactivated
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                        : "text-rose-400 hover:text-rose-200 border-rose-500/30 hover:bg-rose-950/40"
                    )}
                    title={isDeactivated ? "Re-activate this API" : "Deactivate this API (returns 503)"}
                  >
                    {isDeactivated ? (
                      <>
                        <Power className="w-3.5 h-3.5 mr-1" />
                        Activate
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-3.5 h-3.5 mr-1" />
                        Deactivate
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEndpointModal(ep);
                    }}
                    className="h-8 px-2 text-xs text-slate-400 hover:text-cyan-400"
                  >
                    <Sliders className="w-3.5 h-3.5 mr-1" />
                    Configure
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCurl(ep);
                    }}
                    className="h-8 px-2 text-xs"
                    title="Copy as cURL command"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Endpoint Configuration & Inspection Modal */}
      {activeEndpoint && simForm && (
        <Modal
          isOpen={!!activeEndpoint}
          onClose={() => setActiveEndpoint(null)}
          title={`${activeEndpoint.method} ${activeEndpoint.path}`}
          description={activeEndpoint.description}
          size="xl"
        >
          <div className="space-y-6">
            {/* Quick Actions Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="flex items-center space-x-2">
                <MethodBadge method={activeEndpoint.method} />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  {activeEndpoint.path}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">{activeEndpoint.service} Service</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyCurl(activeEndpoint)}
                  className="text-xs h-7"
                >
                  {copiedCurl ? <Check className="w-3 h-3 text-emerald-400 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copy cURL
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/test?method=${activeEndpoint.method}&path=${activeEndpoint.path}`)}
                  className="text-xs h-7"
                >
                  <Terminal className="w-3 h-3 mr-1" />
                  Test Endpoint
                </Button>
              </div>
            </div>

            {/* Endpoint Active / Deactivated Banner Toggle */}
            <div className={cn(
              'p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3',
              endpointIsActive ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/30 border-rose-500/40'
            )}>
              <div className="flex items-center space-x-2.5">
                <div className={cn('p-1.5 rounded-md', endpointIsActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>
                  {endpointIsActive ? <CheckCircle2 className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                    <span>Endpoint Status: {endpointIsActive ? 'ACTIVE (Operational)' : 'DEACTIVATED (Offline)'}</span>
                    <Badge variant={endpointIsActive ? 'success' : 'destructive'} size="sm">
                      {endpointIsActive ? 'Operational' : '503 Deactivated'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {endpointIsActive
                      ? 'Endpoint is responding to incoming traffic and simulation configurations.'
                      : 'Endpoint is intentionally disabled. Any incoming requests immediately fail with 503 Service Unavailable.'}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant={endpointIsActive ? 'destructive' : 'success'}
                onClick={() => setEndpointIsActive(!endpointIsActive)}
                className="text-xs h-8 shrink-0 font-medium"
              >
                {endpointIsActive ? (
                  <>
                    <PowerOff className="w-3.5 h-3.5 mr-1.5" />
                    Deactivate Endpoint
                  </>
                ) : (
                  <>
                    <Power className="w-3.5 h-3.5 mr-1.5" />
                    Re-Activate Endpoint
                  </>
                )}
              </Button>
            </div>

            {/* Simulation Controls Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4" />
                <span>Simulation Configuration</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Simulation Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Simulation Mode</label>
                  <select
                    value={simForm.mode}
                    onChange={e => {
                      const newMode = e.target.value as any;
                      setSimForm({
                        ...simForm,
                        mode: newMode,
                        ...(newMode === 'UNAVAILABLE' ? { statusCode: 503 } : {}),
                        ...(newMode === 'HEALTHY' ? { statusCode: undefined } : {}),
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="HEALTHY">HEALTHY (Default 200/201, 0ms delay)</option>
                    <option value="DELAYED">DELAYED (Inject latency)</option>
                    <option value="FAILING">FAILING (Fixed failure status code)</option>
                    <option value="INTERMITTENT">INTERMITTENT (Random percentage failures)</option>
                    <option value="RATE_LIMITED">RATE_LIMITED (Simulate 429 Too Many Requests)</option>
                    <option value="SCHEMA_CHANGED">SCHEMA_CHANGED (Switch to Schema V2 / Broken)</option>
                    <option value="UNAVAILABLE">UNAVAILABLE (Simulate 503 Outage)</option>
                    <option value="AUTH_REQUIRED">AUTH_REQUIRED (Require Bearer/Basic/ApiKey)</option>
                    <option value="DATABASE_SLOW">DATABASE_SLOW (Simulate slow DB queries)</option>
                    <option value="DATABASE_FAILURE">DATABASE_FAILURE (Simulate 500 DB error)</option>
                    <option value="GATEWAY_TIMEOUT">GATEWAY_TIMEOUT (Simulate 504 Timeout)</option>
                  </select>
                </div>

                {/* Status Code Override */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Status Code Override</label>
                  <select
                    value={simForm.statusCode || ''}
                    onChange={e => setSimForm({ ...simForm, statusCode: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Default (Route standard 200/201/204)</option>
                    <option value="200">200 OK</option>
                    <option value="201">201 Created</option>
                    <option value="202">202 Accepted</option>
                    <option value="204">204 No Content</option>
                    <option value="400">400 Bad Request</option>
                    <option value="401">401 Unauthorized</option>
                    <option value="403">403 Forbidden</option>
                    <option value="404">404 Not Found</option>
                    <option value="408">408 Request Timeout</option>
                    <option value="409">409 Conflict</option>
                    <option value="422">422 Unprocessable Entity</option>
                    <option value="429">429 Too Many Requests</option>
                    <option value="500">500 Internal Server Error</option>
                    <option value="502">502 Bad Gateway</option>
                    <option value="503">503 Service Unavailable</option>
                    <option value="504">504 Gateway Timeout</option>
                  </select>
                </div>

                {/* Latency Simulation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Latency Type</label>
                  <select
                    value={simForm.latency.type}
                    onChange={e => setSimForm({
                      ...simForm,
                      latency: { ...simForm.latency, type: e.target.value as any }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="none">None (Immediate response)</option>
                    <option value="fixed">Fixed Latency (ms)</option>
                    <option value="random">Random Latency Range (min-max)</option>
                    <option value="timeout">Timeout Simulation (15000ms+)</option>
                  </select>
                </div>

                {/* Latency Value */}
                {simForm.latency.type === 'fixed' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Fixed Latency (ms)</label>
                    <input
                      type="number"
                      value={simForm.latency.fixedMs || 0}
                      onChange={e => setSimForm({
                        ...simForm,
                        latency: { ...simForm.latency, fixedMs: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                      min={0}
                      max={60000}
                      step={100}
                    />
                  </div>
                )}

                {/* Failure Rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-medium text-slate-300">Failure Probability</label>
                    <span className="font-mono text-cyan-400">{simForm.failure.ratePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={simForm.failure.ratePercent}
                    onChange={e => {
                      const rate = Number(e.target.value);
                      setSimForm({
                        ...simForm,
                        failure: {
                          ...simForm.failure,
                          ratePercent: rate,
                          enabled: rate > 0,
                        }
                      });
                    }}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Response Schema Version */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Response Schema</label>
                  <select
                    value={simForm.schemaVersion}
                    onChange={e => setSimForm({ ...simForm, schemaVersion: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="v1">Schema V1 (Standard structure)</option>
                    <option value="v2">Schema V2 (Renamed fields: productName, amount)</option>
                    <option value="broken">Broken Schema (Unexpected shape: &#123; unexpected: true &#125;)</option>
                  </select>
                </div>

                {/* Authentication Simulation */}
                <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Authentication Enforcement</label>
                    <label className="text-xs font-mono text-slate-400 flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simForm.auth?.required || simForm.mode === 'AUTH_REQUIRED'}
                        onChange={e => {
                          const req = e.target.checked;
                          setSimForm({
                            ...simForm,
                            mode: req ? 'AUTH_REQUIRED' : (simForm.mode === 'AUTH_REQUIRED' ? 'HEALTHY' : simForm.mode),
                            auth: {
                              ...simForm.auth,
                              required: req,
                              type: req && simForm.auth?.type === 'none' ? 'bearer' : simForm.auth?.type || 'bearer',
                            },
                          });
                        }}
                        className="accent-cyan-500"
                      />
                      <span>Enforce Authentication (Returns 401 if invalid)</span>
                    </label>
                  </div>

                  {(simForm.auth?.required || simForm.mode === 'AUTH_REQUIRED') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Auth Mechanism:</span>
                        <select
                          value={simForm.auth?.type || 'bearer'}
                          onChange={e => setSimForm({
                            ...simForm,
                            auth: {
                              ...simForm.auth,
                              required: true,
                              type: e.target.value as any,
                            }
                          })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="bearer">Bearer Token (Authorization: Bearer &lt;token&gt;)</option>
                          <option value="basic">Basic Auth (Authorization: Basic base64)</option>
                          <option value="apikey">API Key (Header X-API-Key or ?apiKey=)</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Expected Token / Credential:</span>
                        <input
                          type="text"
                          placeholder={simForm.auth?.type === 'apikey' ? 'sentinel-api-key-live-12345' : 'sentinel-mock-jwt-token-xyz'}
                          value={simForm.auth?.expectedToken || simForm.auth?.apiKey || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setSimForm({
                              ...simForm,
                              auth: {
                                ...simForm.auth,
                                required: true,
                                expectedToken: val,
                                apiKey: val,
                              }
                            });
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Request Body & Response Example Preview */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Sample Request / Response Payloads
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeEndpoint.requestBodyExample && (
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 mb-1 block">Request Body Template:</span>
                    <JsonViewer data={activeEndpoint.requestBodyExample} maxHeight="max-h-48" />
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-mono text-slate-400 mb-1 block">Endpoint Response Structure:</span>
                  <JsonViewer
                    data={
                      simForm.schemaVersion === 'broken'
                        ? { unexpected: true, data: null }
                        : activeEndpoint.responseExample || { status: 'success', data: 'realistic resource' }
                    }
                    maxHeight="max-h-48"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetEndpoint}
                loading={saving}
                className="text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset to Healthy
              </Button>

              <div className="flex items-center space-x-3">
                {saveSuccess && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Configuration Live!</span>
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveEndpoint(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveSimulation}
                  loading={saving}
                  className="text-xs font-semibold"
                >
                  Save & Apply Simulation
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
