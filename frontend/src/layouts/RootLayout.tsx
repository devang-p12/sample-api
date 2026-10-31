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
  ShieldAlert,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { cn } from '../lib/utils.js';
import { GlobalSimulationState } from '../types/index.js';

export const RootLayout: React.FC = () => {
  const [globalState, setGlobalState] = useState<GlobalSimulationState | null>(null);
  const [activeScenarioName, setActiveScenarioName] = useState<string>('Normal Operation');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [resetting, setResetting] = useState(false);
  const location = useLocation();

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
    navigator.clipboard.writeText('http://localhost:4000/api');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
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

  const isSimulated = globalState?.globalOutage || (globalState?.activeScenarioId && globalState.activeScenarioId !== 'normal') || (globalState?.globalLatencyMs || 0) > 0;

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

        {/* Global Status Pill & Killswitch */}
        <div className="flex items-center space-x-3">
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
            title="Copy Base API URL for Sentinel configuration"
          >
            <span>http://localhost:4000/api</span>
            {copiedUrl ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <a
            href="http://localhost:4000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span>Swagger</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

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
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold shadow-inner'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-cyan-400' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Sentinel Target Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1.5 font-medium text-slate-300">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sentinel Target</span>
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Playground is actively emitting real telemetry and responses for Sentinel monitoring and load tests.
            </p>
            <div className="pt-1 text-[10px] font-mono text-cyan-400">
              Port: 4000 • Protocol: HTTP/REST
            </div>
          </div>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
