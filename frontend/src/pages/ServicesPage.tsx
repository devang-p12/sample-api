import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Warehouse,
  Bell,
  HeartPulse,
  Key,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { EndpointDefinition, RequestStats } from '../types/index.js';
import { cn } from '../lib/utils.js';

interface ServiceCardMeta {
  name: string;
  key: string;
  description: string;
  icon: any;
  accent: string;
}

const SERVICE_META: ServiceCardMeta[] = [
  {
    name: 'Payments Service',
    key: 'payments',
    description: 'Transaction authorization, refund ledger, payment gateways, and dedicated payment health probe.',
    icon: CreditCard,
    accent: 'border-emerald-500/30 text-emerald-400',
  },
  {
    name: 'Products Catalog',
    key: 'products',
    description: 'Hardware items, full-text product search, category filters, and large benchmark payload generation.',
    icon: Package,
    accent: 'border-sky-500/30 text-sky-400',
  },
  {
    name: 'Orders Service',
    key: 'orders',
    description: 'Customer purchase lifecycle, order fulfillment states (pending, processing, shipped, completed).',
    icon: ShoppingCart,
    accent: 'border-purple-500/30 text-purple-400',
  },
  {
    name: 'Users Service',
    key: 'users',
    description: 'User directory, RBAC roles (admin, developer, support), and account status management.',
    icon: Users,
    accent: 'border-cyan-500/30 text-cyan-400',
  },
  {
    name: 'Inventory Warehouse',
    key: 'inventory',
    description: 'Physical warehouse stock quantities, SKU mappings, and inventory reservation tracking.',
    icon: Warehouse,
    accent: 'border-amber-500/30 text-amber-400',
  },
  {
    name: 'Notifications Dispatcher',
    key: 'notifications',
    description: 'Multi-channel alerting dispatches covering Email, SMS, Webhooks, and Push notifications.',
    icon: Bell,
    accent: 'border-rose-500/30 text-rose-400',
  },
  {
    name: 'System Health Probes',
    key: 'health',
    description: 'High-frequency liveness and readiness probes designed specifically for Sentinel monitoring uptime checks.',
    icon: HeartPulse,
    accent: 'border-teal-500/30 text-teal-400',
  },
  {
    name: 'Authentication Provider',
    key: 'auth',
    description: 'JWT bearer token generation and simulated authorization credential verification.',
    icon: Key,
    accent: 'border-indigo-500/30 text-indigo-400',
  },
];

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [endpoints, setEndpoints] = useState<EndpointDefinition[]>([]);
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [epData, statsData] = await Promise.all([
          api.getEndpoints(),
          api.getActivityStats(),
        ]);
        setEndpoints(epData.endpoints);
        setStats(statsData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Simulated Microservices</span>
            <Badge variant="outline" size="sm">
              {SERVICE_META.length} Services
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Realistic domain services with full CRUD capabilities, in-memory datastores, and individual simulation controls.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/endpoints')}
          className="text-xs"
        >
          View All Endpoints <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICE_META.map(svc => {
          const Icon = svc.icon;
          const svcEndpoints = endpoints.filter(ep => ep.service.toLowerCase().includes(svc.key));
          const svcBreakdown = stats?.servicesBreakdown[svc.name.split(' ')[0]] || { total: 0, errors: 0, avgLatency: 0 };
          const simulatedEpCount = svcEndpoints.filter(ep => ep.simulationConfig.mode !== 'HEALTHY').length;
          const isDegraded = simulatedEpCount > 0;

          return (
            <Card
              key={svc.key}
              className={cn(
                'group hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden',
                isDegraded && 'border-amber-500/30 bg-amber-950/10'
              )}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn('p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner', svc.accent)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">
                        {svc.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500">
                        {svcEndpoints.length} registered APIs
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={isDegraded ? 'warning' : 'success'}
                    size="sm"
                  >
                    {isDegraded ? `${simulatedEpCount} Simulated` : 'Healthy'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {svc.description}
                </p>

                {/* Metrics ribbon */}
                <div className="pt-2 grid grid-cols-3 gap-2 border-t border-slate-800/80 text-center font-mono">
                  <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800">
                    <div className="text-[10px] uppercase text-slate-500">Requests</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">{svcBreakdown.total}</div>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800">
                    <div className="text-[10px] uppercase text-slate-500">Avg Latency</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">{svcBreakdown.avgLatency}ms</div>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800">
                    <div className="text-[10px] uppercase text-slate-500">Errors</div>
                    <div className="text-xs font-bold text-rose-400 mt-0.5">{svcBreakdown.errors}</div>
                  </div>
                </div>
              </CardContent>

              <div className="px-5 py-3 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  /api/{svc.key === 'health' ? 'health' : svc.key}/*
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/endpoints?service=${svc.name.split(' ')[0]}`)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 h-7 px-2"
                >
                  Configure APIs <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
