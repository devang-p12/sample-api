import React, { useState, useEffect } from 'react';
import { FileCode, ExternalLink, Download, Copy, Check, Terminal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { JsonViewer } from '../components/JsonViewer.js';

export const DocsPage: React.FC = () => {
  const [spec, setSpec] = useState<any>(null);
  const [activeView, setActiveView] = useState<'swagger' | 'json'>('swagger');

  useEffect(() => {
    fetch('/openapi.json')
      .then(r => r.json())
      .then(setSpec)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>OpenAPI 3.0 & Swagger Documentation</span>
            <Badge variant="outline" size="sm">
              Specification v1.0.0
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete API catalog describing request schemas, parameter types, authentication methods, and status responses.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={activeView === 'swagger' ? 'primary' : 'outline'}
            onClick={() => setActiveView('swagger')}
            className="text-xs h-8"
          >
            Swagger UI
          </Button>

          <Button
            size="sm"
            variant={activeView === 'json' ? 'primary' : 'outline'}
            onClick={() => setActiveView('json')}
            className="text-xs h-8"
          >
            Raw JSON Spec
          </Button>

          <a
            href="http://localhost:4000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-mono text-slate-200 hover:text-cyan-400"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Full Screen
          </a>
        </div>
      </div>

      {/* Embedded Swagger UI or JSON View */}
      {activeView === 'swagger' ? (
        <Card className="overflow-hidden border-slate-800">
          <div className="h-[750px] w-full bg-slate-950">
            <iframe
              src="http://localhost:4000/docs"
              title="Sentinel API Playground Swagger Documentation"
              className="w-full h-full border-0 rounded-b-xl"
            />
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">openapi.json</CardTitle>
            <a
              href="http://localhost:4000/openapi.json"
              download="openapi.json"
              className="text-xs text-cyan-400 flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Schema</span>
            </a>
          </CardHeader>
          <CardContent>
            {spec ? (
              <JsonViewer data={spec} maxHeight="max-h-[700px]" />
            ) : (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                Loading OpenAPI specification...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
