import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Workflow,
  Sliders,
  Activity,
  Terminal,
  FileCode,
  Settings,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  Radio,
  Globe,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api, getBackendBaseUrl, setBackendBaseUrl, testBackendConnection } from '../services/api.js';
import { Button } from '../components/Button.js';
import { cn } from '../lib/utils.js';
import { GlobalSimulationState } from '../types/index.js';

export const RootLayout: React.FC = () => {
  const [globalState, setGlobalState] = useState<GlobalSimulationState | null>(null);
  const [activeScenarioName, setActiveScenarioName] = useState<string>('Normal Operation');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [backendModalOpen, setBackendModalOpen] = useState(false);
  const [backendInput, setBackendInput] = useState(getBackendBaseUrl());
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs: number } | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const location = useLocation();

  const getEffectiveBase = () => {
    const custom = getBackendBaseUrl();
    if (custom) return custom;
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:4000';
    }
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000';
  };

  const loadStatus = async () => {
    try {
      const data = await api.getSimulationConfig();
      setGlobalState(data.global);
      setActiveScenarioName(data.activeScenario?.name || 'Normal Operation');
    } catch {
      // silently retry
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleResetToHealthy = async () => {
    setResetting(true);
    try {
      await api.resetAllToHealthy();
      await loadStatus();
    } finally {
      setResetting(false);
    }
  };

  const handleCopyBaseUrl = () => {
    const fullApiUrl = `${getEffectiveBase()}/api`;
    navigator.clipboard.writeText(fullApiUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testBackendConnection(backendInput);
      setTestResult(res);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveBackendUrl = () => {
    setBackendBaseUrl(backendInput);
    setBackendModalOpen(false);
    loadStatus();
  };

  const handleResetBackendUrl = () => {
    setBackendInput('');
    setBackendBaseUrl('');
    setTestResult(null);
    setBackendModalOpen(false);
    loadStatus();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Services', path: '/services', icon: Server },
    { name: 'Endpoints', path: '/endpoints', icon: Workflow },
    { name: 'Scenarios', path: '/scenarios', icon: Sliders },
    { name: 'Activity Log', path: '/activity', icon: Activity },
    { name: 'API Tester', path: '/test', icon: Terminal },
    { name: 'API Docs', path: '/docs', icon: FileCode },
    { name: 'Global Controls', path: '/settings', icon: Settings },
  ];

  const isSimulated =
    globalState?.globalOutage ||
    (globalState?.activeScenarioId && globalState.activeScenarioId !== 'normal') ||
    (globalState?.globalLatencyMs || 0) > 0;

  const currentBackend = getBackendBaseUrl();
  const effectiveBase = getEffectiveBase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Radio className="w-5 h-5 text-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-base text-slate-100">
                Sentinel API Playground
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                Sim Target
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Controlled API Reliability & Chaos Simulation Platform
            </p>
          </div>
        </div>

        {/* Global Status Pill & Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Active Backend Indicator / Config Button */}
          <button
            onClick={() => {
              setBackendInput(getBackendBaseUrl());
              setTestResult(null);
              setBackendModalOpen(true);
            }}
            className={cn(
              'px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center space-x-1.5 transition-colors',
              currentBackend
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20'
                : 'bg-slate-800/80 border-slate-700/70 text-slate-300 hover:bg-slate-800'
            )}
            title="Configure Target Backend URL (e.g. Render Web Service)"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Backend:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[140px]">
              {currentBackend ? currentBackend.replace(/^https?:\/\//, '') : 'Local / Proxy'}
            </span>
          </button>

          <div
            className={cn(
              'px-3 py-1.5 rounded-full border text-xs font-mono font-medium flex items-center space-x-2 transition-all',
              globalState?.globalOutage
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : isSimulated
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                globalState?.globalOutage
                  ? 'bg-rose-400 animate-ping'
                  : isSimulated
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400'
              )}
            />
            <span className="truncate max-w-[200px]">
              {globalState?.globalOutage
                ? 'GLOBAL OUTAGE'
                : isSimulated
                ? `SIMULATION: ${activeScenarioName}`
                : 'ALL NOMINAL'}
            </span>
          </div>

          {isSimulated && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleResetToHealthy}
              loading={resetting}
              className="text-xs h-8"
              title="Reset all endpoints and scenarios to healthy defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset All
            </Button>
          )}

          {/* Base URL badge */}
          <button
            onClick={handleCopyBaseUrl}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs font-mono text-slate-300 transition-colors"
            title="Copy Base API URL for Postman, curl, or Sentinel probes"
          >
            <span className="truncate max-w-[180px]">{effectiveBase}/api</span>
            {copiedUrl ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            )}
          </button>

          <a
            href={`${effectiveBase}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span>Swagger</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Backend Configuration Modal */}
      {backendModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm">Target Backend URL</h3>
              </div>
              <button
                onClick={() => setBackendModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              When deployed to <strong>Vercel</strong>, connect to your <strong>Render</strong> backend web service by pasting its live URL below.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-300 block">
                Backend API URL (Render or Localhost)
              </label>
              <input
                type="text"
                value={backendInput}
                onChange={(e) => setBackendInput(e.target.value)}
                placeholder="https://simulation-api.onrender.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBackendInput('http://localhost:4000')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Localhost (:4000)
                </button>
                <button
                  type="button"
                  onClick={() => setBackendInput('')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Default (Same Origin / Proxy)
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={cn(
                  'p-3 rounded-lg border text-xs flex items-center space-x-2 font-mono',
                  testResult.ok
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                )}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div>{testResult.message}</div>
                  <div className="text-[10px] opacity-75">{testResult.latencyMs}ms response time</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                loading={testingConnection}
                className="text-xs"
              >
                Test Connection
              </Button>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetBackendUrl}
                  className="text-xs text-slate-400"
                >
                  Clear / Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveBackendUrl}
                  className="text-xs bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold"
                >
                  Save Target
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 p-4 hidden md:flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Platform Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === '/dashboard' && location.pathname === '/');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-cyan-400' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Quick Simulation Help Card */}
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-xs space-y-2">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Student Chaos Guide</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Demonstrate fault tolerance by toggling Downtime, Latency, Errors, or Schema Drift on endpoints or in the API Tester.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
