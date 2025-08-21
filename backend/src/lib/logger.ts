/* Simple structured logger. In production, replace with pino/winston */
export function info(message: string, meta?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ level: 'info', message, ...(meta ? { meta } : {}) }));
}

export function warn(message: string, meta?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.warn(JSON.stringify({ level: 'warn', message, ...(meta ? { meta } : {}) }));
}

export function error(message: string, meta?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ level: 'error', message, ...(meta ? { meta } : {}) }));
}


