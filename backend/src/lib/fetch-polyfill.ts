// Provide WHATWG fetch APIs in Node environments that lack them (e.g., Node < 18)
// Uses undici to polyfill fetch, Headers, Request, Response, FormData, File, Blob
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const undici = require('undici');
  if (typeof (globalThis as any).fetch !== 'function') {
    (globalThis as any).fetch = undici.fetch;
  }
  if (typeof (globalThis as any).Headers === 'undefined') {
    (globalThis as any).Headers = undici.Headers;
  }
  if (typeof (globalThis as any).Request === 'undefined') {
    (globalThis as any).Request = undici.Request;
  }
  if (typeof (globalThis as any).Response === 'undefined') {
    (globalThis as any).Response = undici.Response;
  }
  if (typeof (globalThis as any).FormData === 'undefined') {
    (globalThis as any).FormData = undici.FormData;
  }
  if (typeof (globalThis as any).File === 'undefined' && undici.File) {
    (globalThis as any).File = undici.File;
  }
  if (typeof (globalThis as any).Blob === 'undefined' && undici.Blob) {
    (globalThis as any).Blob = undici.Blob;
  }
} catch {
  // If undici is not available, do nothing; code paths will surface a clearer error elsewhere
}


