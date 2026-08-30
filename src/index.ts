/**
 * @deepseek-ai/dsh-shutdown — host half of the one-click shutdown bundle.
 *
 * Owns the single Host operation behind the Web close button: an exact
 * `POST /api/shutdown` fetch route that requests bounded process exit through
 * the launcher's `ctx.appExit`. `appExit` disposes the whole Cordis tree, then
 * exits, so termination is graceful (no half-started work left running).
 *
 * The route is reached only from the browser client plugin (a deliberate user
 * gesture), so there is no model-visible `/shutdown` command.
 * @module dsh-shutdown
 */

import type { Context } from '@deepseek-ai/cordis'

/** Stable Cordis plugin name. */
export const name = 'shutdown'

/** Services required before the shutdown route can mount. */
export const inject = ['connection']

/** Exact browser-addressable shutdown path, served through the shared `/api` channel. */
export const SHUTDOWN_PATH = '/api/shutdown'

/** The launcher's bounded process-exit request (`ctx.appExit`). */
type AppExit = (code: number) => void

/** The `connection.fetch.register` slot this plugin consumes (typed locally). */
interface ShutdownConnection {
  readonly fetch: {
    register(route: {
      readonly path: string
      readonly methods: readonly ('POST')[]
      readonly fetch: (request: Request) => Promise<Response>
    }): () => Promise<void>
  }
}

/**
 * Register the shutdown route and request graceful process exit.
 * @param ctx - Host context carrying the `connection` service.
 */
export function apply(ctx: Context): void {
  const exit = ctx.get('appExit') as AppExit | undefined
  if (exit === undefined) {
    throw new Error('dsh-shutdown: the launcher must provide ctx.appExit before the tree mounts')
  }
  const connection = ctx.get('connection') as ShutdownConnection | undefined
  if (connection === undefined) {
    throw new Error('dsh-shutdown: the connection service is missing; this bundle mounts only on the Web surface')
  }
  connection.fetch.register({
    path: SHUTDOWN_PATH,
    methods: ['POST'],
    fetch: async () => {
      // Respond first, then exit: the browser should observe success before
      // the tree teardown closes its connection.
      const response = new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      })
      setImmediate(() => { exit(0) })
      return response
    },
  })
}
