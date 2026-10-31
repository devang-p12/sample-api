import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ServerCrash,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { ScenarioDefinition } from '../types/index.js';
import { cn } from '../lib/utils.js';

export const ScenariosPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('normal');
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const loadScenarios = async () => {
    try {
      const data = await api.getScenarios();
      setScenarios(data.scenarios);
      setActiveScenarioId(data.activeScenarioId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  const handleActivate = async (scenarioId: string) => {
    setActivatingId(scenarioId);
    try {
      if (scenarioId === 'normal') {
        await api.deactivateScenario();
      } else {
        await api.activateScenario(scenarioId);
      }
      await loadScenarios();
    } finally {
      setActivatingId(null);
    }
  };

  const categoryBadges: Record<string, { variant: 'info' | 'warning' | 'destructive' | 'purple' | 'success'; label: string }> = {
    performance: { variant: 'warning', label: 'Latency & Performance' },
    reliability: { variant: 'destructive', label: 'Reliability & Faults' },
    chaos: { variant: 'purple', label: 'Chaos Engineering' },
    security: { variant: 'info', label: 'Auth & Rate Limiting' },
    resilience: { variant: 'success', label: 'Nominal & Schema' },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Predefined Simulation Scenarios</span>
            <Badge variant="outline" size="sm">
              {scenarios.length} Scenarios
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            One-click chaos, degradation, and recovery scenarios to validate Sentinel alerting rules, incident creation, and load testing.
          </p>
        </div>

        {activeScenarioId !== 'normal' && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleActivate('normal')}
            loading={activatingId === 'normal'}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Restore Normal Operation
          </Button>
        )}
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {scenarios.map(sc => {
          const isActive = activeScenarioId === sc.id;
          const cat = categoryBadges[sc.category] || { variant: 'info', label: sc.category };

          return (
            <Card
              key={sc.id}
              className={cn(
                'group transition-all flex flex-col justify-between overflow-hidden',
                isActive
                  ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-900 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'hover:border-slate-700 bg-slate-900/60'
              )}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={cat.variant} size="sm">
                        {cat.label}
                      </Badge>
                      {isActive && (
                        <span className="text-[11px] font-mono font-bold text-cyan-400 flex items-center space-x-1 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span>CURRENTLY ACTIVE</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-1 group-hover:text-cyan-300 transition-colors">
                      {sc.name}
                    </h3>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 shadow-inner">
                    {sc.id.includes('outage') || sc.id.includes('database') ? (
                      <ServerCrash className="w-5 h-5 text-rose-400" />
                    ) : sc.id.includes('slow') || sc.id.includes('degradation') ? (
                      <Clock className="w-5 h-5 text-amber-400" />
                    ) : sc.id.includes('auth') || sc.id.includes('rate') ? (
                      <ShieldAlert className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {sc.description}
                </p>

                {/* Configuration Specs */}
                <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Simulation Effect:</span>
                    <span className="text-cyan-400 font-medium">{sc.configSummary}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-900">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Target APIs:</span>
                    <span className="text-slate-300 truncate max-w-[220px]">
                      {sc.affectedServices.join(', ')}
                    </span>
                  </div>
                </div>
              </CardContent>

              {/* Action Footer */}
              <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  ID: {sc.id}
                </span>

                {isActive ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleActivate('normal')}
                    loading={activatingId === 'normal'}
                    className="text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleActivate(sc.id)}
                    loading={activatingId === sc.id}
                    className="text-xs font-semibold"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    Activate Scenario
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
