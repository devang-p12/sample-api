import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './Button.js';
import { cn } from '../lib/utils.js';

interface JsonViewerProps {
  data: any;
  maxHeight?: string;
  className?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  maxHeight = 'max-h-96',
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const formatted = typeof data === 'string'
    ? (() => {
        try {
          return JSON.stringify(JSON.parse(data), null, 2);
        } catch {
          return data;
        }
      })()
    : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('relative rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden font-mono text-xs', className)}>
      <div className="absolute top-2 right-2 z-10">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          className="h-7 px-2 text-[11px] bg-slate-900/90 border-slate-700/80"
          title="Copy content"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      <pre className={cn('p-4 overflow-auto text-slate-300 leading-relaxed scrollbar-thin', maxHeight)}>
        <code>{formatted}</code>
      </pre>
    </div>
  );
};
