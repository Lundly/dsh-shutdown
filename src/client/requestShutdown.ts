/**
 * Browser-side shutdown trigger: fires the Host shutdown route, then asks the
 * browser to close the tab. The host responds before exiting, so the POST is
 * best-effort; the page renders its "shut down" overlay regardless.
 */

/** Resolve the browser's Host base with the connection carrier's null-origin fallback. */
function hostBase(): string {
  const origin = (globalThis as { location?: { origin?: string } }).location?.origin
  return origin !== undefined && origin !== 'null' ? origin : 'http://dsh.internal'
}

/**
 * Request Host shutdown and attempt to close the tab.
 * @returns after firing the request and calling `window.close()`.
 */
export function requestShutdown(): void {
  const url = new URL('/api/shutdown', hostBase())
  // keepalive lets the request survive the page teardown the close may trigger.
  void fetch(url, { method: 'POST', keepalive: true }).catch(() => undefined)
  if (typeof window !== 'undefined') window.close()
}
