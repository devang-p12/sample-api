import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function generateCurl(options: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}): string {
  const parts = ['curl', '-X', options.method.toUpperCase(), `"${options.url}"`];

  if (options.headers) {
    for (const [k, v] of Object.entries(options.headers)) {
      if (v) parts.push(`-H "${k}: ${v}"`);
    }
  }

  if (options.body && options.method.toUpperCase() !== 'GET' && options.method.toUpperCase() !== 'HEAD') {
    const bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    parts.push(`-d '${bodyStr}'`);
  }

  return parts.join(' \\\n  ');
}
