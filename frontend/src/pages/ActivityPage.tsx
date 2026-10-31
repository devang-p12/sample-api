import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Clock,
  Copy,
  Check,
  Code,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { MethodBadge, StatusBadge, Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { JsonViewer } from '../components/JsonViewer.js';
import { RequestLog } from '../types/index.js';
import { cn, formatDuration, formatBytes, generateCurl } from '../lib/utils.js';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [minLatency, setMinLatency] = useState<number>(0);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getActivityLogs({
        search,
        method: selectedMethod,
        statusGroup: selectedStatus,
        minLatency: minLatency > 0 ? minLatency : undefined,
        page,
        limit: 25,
      });
      setLogs(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Fetch logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, selectedMethod, selectedStatus, minLatency]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, page, search, selectedMethod, selectedStatus, minLatency]);

  const handleClear = async () => {
    if (confirm('Clear all request logs in the buffer?')) {
      await api.clearActivityLogs();
      await fetchLogs();
    }
  };

  const handleCopyCurl = (log: RequestLog) => {
    const curl = generateCurl({
      method: log.method,
      url: `http://localhost:4000${log.url}`,
      headers: log.requestHeaders,
      body: log.requestBody,
    });
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const methods = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  const statusGroups = ['ALL', '2xx', '3xx', '4xx', '5xx'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Request Activity Stream</span>
            <Badge variant="outline" size="sm">
              {total} Logged Requests
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ingress observability for all target REST requests from Sentinel, curl, or load tests.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={autoRefresh ? 'primary' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="text-xs h-8"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', autoRefresh && 'animate-spin')} />
            {autoRefresh ? 'Live Stream: ON' : 'Live Stream: OFF'}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={handleClear}
            className="text-xs h-8"
            title="Clear buffer"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by path, request ID, error, or service..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Min Latency:</span>
            <select
              value={minLatency}
              onChange={e => {
                setMinLatency(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="0">All Latencies</option>
              <option value="200">&gt; 200ms</option>
              <option value="500">&gt; 500ms</option>
              <option value="1000">&gt; 1000ms (1s)</option>
              <option value="2000">&gt; 2000ms (2s)</option>
            </select>
          </div>
        </div>

        {/* Method & Status Group Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-mono text-slate-500 mr-1">METHOD:</span>
            {methods.map(m => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMethod(m);
                  setPage(1);
                }}
                className={cn(
                  'px-2 py-0.5 text-[11px] font-mono font-medium rounded transition-colors',
                  selectedMethod === m
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-mono text-slate-500 mr-1">STATUS:</span>
            {statusGroups.map(s => (
              <button
                key={s}
                onClick={() => {
                  setSelectedStatus(s);
                  setPage(1);
                }}
                className={cn(
                  'px-2 py-0.5 text-[11px] font-mono font-medium rounded transition-colors',
                  selectedStatus === s
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              No matching request telemetry records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-medium">Timestamp</th>
                    <th className="py-3 px-4 font-medium">Method</th>
                    <th className="py-3 px-4 font-medium">Path & Service</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Duration</th>
                    <th className="py-3 px-4 font-medium">Simulation Mode</th>
                    <th className="py-3 px-4 font-medium">Request ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.map(log => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <MethodBadge method={log.method} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-200 truncate max-w-[260px]">
                            {log.path}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {log.service}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge statusCode={log.statusCode} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'font-mono font-medium',
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
                      <td className="py-3 px-4 whitespace-nowrap">
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
                      <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-[140px]">
                        {log.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
              <span>
                Page {page} of {totalPages} ({total} total requests)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-7 px-2 text-xs"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-7 px-2 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Request Inspector: ${selectedLog.method} ${selectedLog.path}`}
          description={`Request ID: ${selectedLog.id} • ${new Date(selectedLog.timestamp).toISOString()}`}
          size="xl"
        >
          <div className="space-y-5">
            {/* Summary badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">HTTP Status</span>
                <div className="mt-1 flex items-center space-x-1.5">
                  <StatusBadge statusCode={selectedLog.statusCode} />
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Response Time</span>
                <span className="mt-1 font-bold text-slate-200 block">
                  {selectedLog.responseTimeMs} ms
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Simulation Mode</span>
                <span className="mt-1 font-bold text-cyan-400 block truncate">
                  {selectedLog.simulationMode}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Payload Size</span>
                <span className="mt-1 font-bold text-slate-200 block">
                  {formatBytes(selectedLog.responseSize)}
                </span>
              </div>
            </div>

            {/* Error Message if any */}
            {selectedLog.error && (
              <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-950/30 text-rose-300 font-mono text-xs">
                <span className="font-bold mr-2">Error:</span>
                {selectedLog.error}
              </div>
            )}

            {/* Request Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Request Headers
              </h4>
              <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-x-auto text-xs font-mono space-y-1">
                {Object.entries(selectedLog.requestHeaders).map(([k, v]) => (
                  <div key={k} className="flex">
                    <span className="text-cyan-400 w-44 shrink-0 font-medium">{k}:</span>
                    <span className="text-slate-300 break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Body */}
            {selectedLog.requestBody && Object.keys(selectedLog.requestBody).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Request Body
                </h4>
                <JsonViewer data={selectedLog.requestBody} maxHeight="max-h-48" />
              </div>
            )}

            {/* Response Body */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Response Payload
              </h4>
              <JsonViewer data={selectedLog.responseBody || { status: selectedLog.statusCode }} maxHeight="max-h-60" />
            </div>

            {/* Response Headers */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Response Headers
              </h4>
              <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-x-auto text-xs font-mono space-y-1 max-h-36">
                {Object.entries(selectedLog.responseHeaders).map(([k, v]) => (
                  <div key={k} className="flex">
                    <span className="text-emerald-400 w-48 shrink-0 font-medium">{k}:</span>
                    <span className="text-slate-300 break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyCurl(selectedLog)}
                className="text-xs"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                Copy as cURL
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="text-xs"
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
