import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Code,
  FileText,
  Key,
  Terminal,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api, getBackendBaseUrl } from '../services/api.js';
import { Card, CardContent } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { MethodBadge, StatusBadge, Badge } from '../components/Badge.js';
import { JsonViewer } from '../components/JsonViewer.js';
import { cn, formatBytes, generateCurl } from '../lib/utils.js';

interface KeyVal {
  key: string;
  value: string;
  enabled: boolean;
}

const TEMPLATE_PRESETS = [
  { name: 'Health Check probe', method: 'GET', url: '{{baseUrl}}/api/health' },
  { name: 'Payments Health probe', method: 'GET', url: '{{baseUrl}}/api/payments/health' },
  { name: 'List Products (Paginated)', method: 'GET', url: '{{baseUrl}}/api/products?page=1&limit=5' },
  { name: 'Search Products', method: 'GET', url: '{{baseUrl}}/api/products/search?q=laptop' },
  { name: 'Large Benchmark Payload', method: 'GET', url: '{{baseUrl}}/api/products/large?count=100' },
  { name: 'List Users', method: 'GET', url: '{{baseUrl}}/api/users' },
  {
    name: 'Create User (POST)',
    method: 'POST',
    url: '{{baseUrl}}/api/users',
    body: JSON.stringify({ name: 'Jordan Hayes', email: 'jordan.hayes@sentinel.dev', role: 'developer', department: 'SRE' }, null, 2),
  },
  {
    name: 'Process Payment (POST)',
    method: 'POST',
    url: '{{baseUrl}}/api/payments',
    body: JSON.stringify({ orderId: 'ord_3001', amount: 499.00, currency: 'USD', paymentMethod: 'credit_card', customerEmail: 'sarah.connor@skyline.io' }, null, 2),
  },
  {
    name: 'Create Order (POST)',
    method: 'POST',
    url: '{{baseUrl}}/api/orders',
    body: JSON.stringify({ userId: 'usr_1001', customerName: 'Sarah Connor', items: [{ productId: 'prd_2001', productName: 'Sentinel Ultra Laptop', price: 2499, quantity: 1 }] }, null, 2),
  },
  {
    name: 'User Login & JWT (POST)',
    method: 'POST',
    url: '{{baseUrl}}/api/login',
    body: JSON.stringify({ username: 'admin', password: 'sentinel123' }, null, 2),
  },
  { name: 'API V1 Products', method: 'GET', url: '{{baseUrl}}/api/v1/products' },
  { name: 'API V2 Products (Changed Schema)', method: 'GET', url: '{{baseUrl}}/api/v2/products' },
  // Direct Chaos Demonstrations
  { name: '🔥 Chaos: Downtime (HTTP 503)', method: 'GET', url: '{{baseUrl}}/api/products?chaos_downtime=true' },
  { name: '⏳ Chaos: High Latency (3s delay)', method: 'GET', url: '{{baseUrl}}/api/products?chaos_latency=3000' },
  { name: '💥 Chaos: HTTP 500 Error', method: 'GET', url: '{{baseUrl}}/api/products?chaos_status=500' },
  { name: '🚫 Chaos: HTTP 502 Bad Gateway', method: 'GET', url: '{{baseUrl}}/api/payments?chaos_status=502' },
  { name: '🚦 Chaos: HTTP 429 Rate Limit', method: 'GET', url: '{{baseUrl}}/api/orders?chaos_status=429' },
  { name: '🔄 Chaos: Schema Drift (V2)', method: 'GET', url: '{{baseUrl}}/api/products?chaos_schema=v2' },
  { name: '⚡ Chaos: Corrupted Schema Payload', method: 'GET', url: '{{baseUrl}}/api/products?chaos_schema=broken' },
];

export const ApiTesterPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [method, setMethod] = useState<string>(searchParams.get('method') || 'GET');
  const [url, setUrl] = useState<string>(
    searchParams.get('path') ? `{{baseUrl}}${searchParams.get('path')}` : '{{baseUrl}}/api/payments'
  );

  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'auth' | 'body'>('body');
  const [bodyText, setBodyText] = useState<string>(
    JSON.stringify({ orderId: 'ord_3001', amount: 2499.00, currency: 'USD', paymentMethod: 'credit_card' }, null, 2)
  );

  // Headers & Params State
  const [headers, setHeaders] = useState<KeyVal[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true },
  ]);

  const [params, setParams] = useState<KeyVal[]>([
    { key: 'page', value: '1', enabled: false },
    { key: 'limit', value: '10', enabled: false },
  ]);

  // Auth State
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic' | 'apikey'>('none');
  const [bearerToken, setBearerToken] = useState('sentinel-mock-jwt-token-xyz');
  const [basicUser, setBasicUser] = useState('admin');
  const [basicPass, setBasicPass] = useState('sentinel123');
  const [apiKey, setApiKey] = useState('sentinel-api-key-live-12345');

  // Response State
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [responseTab, setResponseTab] = useState<'body' | 'headers' | 'raw'>('body');
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Environment variables
  const currentBase = api ? (getBackendBaseUrl() || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000'))) : 'http://localhost:4000';
  const envVars: Record<string, string> = {
    baseUrl: currentBase,
    token: 'sentinel-mock-jwt-token-xyz',
    userId: 'usr_1001',
    productId: 'prd_2001',
    orderId: 'ord_3001',
  };

  const resolveUrl = (rawUrl: string): string => {
    let resolved = rawUrl;
    for (const [k, v] of Object.entries(envVars)) {
      resolved = resolved.replace(new RegExp(`{{${k}}}`, 'g'), v);
    }
    return resolved;
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const finalUrl = resolveUrl(url);

      const requestHeaders: Record<string, string> = {};
      headers.filter(h => h.enabled && h.key).forEach(h => {
        requestHeaders[h.key] = h.value;
      });

      if (authType === 'bearer') {
        requestHeaders['Authorization'] = `Bearer ${bearerToken}`;
      } else if (authType === 'basic') {
        requestHeaders['Authorization'] = `Basic ${btoa(`${basicUser}:${basicPass}`)}`;
      } else if (authType === 'apikey') {
        requestHeaders['X-API-Key'] = apiKey;
      }

      const res = await api.executeRequest({
        method,
        url: finalUrl,
        headers: requestHeaders,
        body: method !== 'GET' && method !== 'HEAD' ? bodyText : undefined,
      });

      setResponse(res);
    } finally {
      setSending(false);
    }
  };

  const handleCopyCurl = () => {
    const finalUrl = resolveUrl(url);
    const requestHeaders: Record<string, string> = {};
    headers.filter(h => h.enabled && h.key).forEach(h => {
      requestHeaders[h.key] = h.value;
    });
    if (authType === 'bearer') requestHeaders['Authorization'] = `Bearer ${bearerToken}`;

    const curl = generateCurl({
      method,
      url: finalUrl,
      headers: requestHeaders,
      body: method !== 'GET' && method !== 'HEAD' ? bodyText : undefined,
    });
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const applyPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    setMethod(preset.method);
    setUrl(preset.url);
    if (preset.body) {
      setBodyText(preset.body);
      setActiveTab('body');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>API Testing Console</span>
            <Badge variant="outline" size="sm">
              Postman-compatible
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Interactively dispatch requests with environment variable interpolation (&#123;&#123;baseUrl&#125;&#125;), examine latency, inspect headers, and generate cURL.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">Load API:</span>
          <select
            onChange={e => {
              const preset = TEMPLATE_PRESETS.find(p => p.name === e.target.value);
              if (preset) applyPreset(preset);
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Choose an API Preset...</option>
            {TEMPLATE_PRESETS.map(p => (
              <option key={p.name} value={p.name}>
                {p.method} - {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Request Builder Panel */}
      <Card>
        <CardContent className="p-5 space-y-4">
          {/* Method and URL Input Bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 shrink-0"
            >
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="{{baseUrl}}/api/products"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleSend}
              loading={sending}
              className="px-6 text-xs font-semibold shrink-0"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send Request
            </Button>
          </div>

          {/* Resolved URL Preview */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
            <span>Target: {resolveUrl(url)}</span>
            <button
              onClick={handleCopyCurl}
              className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCurl ? 'cURL Copied' : 'Copy cURL'}</span>
            </button>
          </div>

          {/* Request Config Tabs */}
          <div className="pt-2">
            <div className="flex space-x-1 border-b border-slate-800">
              {[
                { id: 'body', label: 'Request Body' },
                { id: 'headers', label: 'Headers' },
                { id: 'auth', label: 'Authorization' },
                { id: 'params', label: 'Query Params' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'px-4 py-2 text-xs font-mono font-medium border-b-2 transition-colors -mb-px',
                    activeTab === tab.id
                      ? 'border-cyan-500 text-cyan-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-4">
              {/* Body Tab */}
              {activeTab === 'body' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">JSON Payload</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        try {
                          setBodyText(JSON.stringify(JSON.parse(bodyText), null, 2));
                        } catch {
                          // ignore
                        }
                      }}
                      className="text-[11px] h-6 px-2 text-slate-400"
                    >
                      Prettify JSON
                    </Button>
                  </div>
                  <textarea
                    rows={8}
                    value={bodyText}
                    onChange={e => setBodyText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 scrollbar-thin"
                  />
                </div>
              )}

              {/* Headers Tab */}
              {activeTab === 'headers' && (
                <div className="space-y-2">
                  {headers.map((h, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={h.enabled}
                        onChange={e => {
                          const updated = [...headers];
                          updated[i].enabled = e.target.checked;
                          setHeaders(updated);
                        }}
                        className="accent-cyan-500"
                      />
                      <input
                        type="text"
                        placeholder="Header key"
                        value={h.key}
                        onChange={e => {
                          const updated = [...headers];
                          updated[i].key = e.target.value;
                          setHeaders(updated);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={h.value}
                        onChange={e => {
                          const updated = [...headers];
                          updated[i].value = e.target.value;
                          setHeaders(updated);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
                      />
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setHeaders([...headers, { key: '', value: '', enabled: true }])}
                    className="text-xs h-7 mt-2"
                  >
                    + Add Header
                  </Button>
                </div>
              )}

              {/* Auth Tab */}
              {activeTab === 'auth' && (
                <div className="space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Auth Strategy</label>
                    <select
                      value={authType}
                      onChange={e => setAuthType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="none">No Auth</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth (Username / Password)</option>
                      <option value="apikey">API Key (X-API-Key)</option>
                    </select>
                  </div>

                  {authType === 'bearer' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Bearer Token</label>
                      <input
                        type="text"
                        value={bearerToken}
                        onChange={e => setBearerToken(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                      />
                    </div>
                  )}

                  {authType === 'basic' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">Username</label>
                        <input
                          type="text"
                          value={basicUser}
                          onChange={e => setBasicUser(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">Password</label>
                        <input
                          type="password"
                          value={basicPass}
                          onChange={e => setBasicPass(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  {authType === 'apikey' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">API Key</label>
                      <input
                        type="text"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Params Tab */}
              {activeTab === 'params' && (
                <div className="space-y-2">
                  {params.map((p, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={p.enabled}
                        onChange={e => {
                          const updated = [...params];
                          updated[i].enabled = e.target.checked;
                          setParams(updated);
                        }}
                        className="accent-cyan-500"
                      />
                      <input
                        type="text"
                        placeholder="Parameter key"
                        value={p.key}
                        onChange={e => {
                          const updated = [...params];
                          updated[i].key = e.target.value;
                          setParams(updated);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={p.value}
                        onChange={e => {
                          const updated = [...params];
                          updated[i].value = e.target.value;
                          setParams(updated);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
                      />
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setParams([...params, { key: '', value: '', enabled: true }])}
                    className="text-xs h-7 mt-2"
                  >
                    + Add Parameter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Panel */}
      {response && (
        <Card className="border-cyan-500/30">
          <CardContent className="p-5 space-y-4">
            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <StatusBadge statusCode={response.status} />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  {response.statusText}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{response.durationMs} ms</span>
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">
                  {formatBytes(response.sizeBytes)}
                </span>
              </div>

              {response.headers['x-request-id'] && (
                <div className="text-xs font-mono text-slate-500">
                  X-Request-ID: <span className="text-cyan-400">{response.headers['x-request-id']}</span>
                </div>
              )}
            </div>

            {/* Response Tabs */}
            <div className="flex space-x-1 border-b border-slate-800">
              {[
                { id: 'body', label: 'Response Body' },
                { id: 'headers', label: 'Response Headers' },
                { id: 'raw', label: 'Raw Output' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setResponseTab(tab.id as any)}
                  className={cn(
                    'px-3.5 py-1.5 text-xs font-mono font-medium border-b-2 transition-colors -mb-px',
                    responseTab === tab.id
                      ? 'border-cyan-500 text-cyan-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Response Contents */}
            <div>
              {responseTab === 'body' && (
                <JsonViewer data={response.data} maxHeight="max-h-[500px]" />
              )}

              {responseTab === 'headers' && (
                <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs space-y-1.5 overflow-x-auto">
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} className="flex">
                      <span className="text-cyan-400 w-48 shrink-0">{k}:</span>
                      <span className="text-slate-300 break-all">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {responseTab === 'raw' && (
                <pre className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-auto max-h-96">
                  {response.rawText}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
