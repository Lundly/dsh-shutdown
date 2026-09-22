import Schema from '@deepseek-ai/schemastery'
import type { AppExit, HostContext, Volatile } from './types'

export const name = 'dsh-shutdown'

/** 与浏览器半 src/client/shutdown.ts 中的 EXIT_ROUTE 保持一致 */
const EXIT_ROUTE = '/api/dsh-shutdown.exit'

/** 请求退出后等待进程自行结束的上限，超过则强制退出 */
const FORCE_EXIT_GRACE_MS = 8_000

export const inject = ['connection']

/** 当前 profile 条目 dsh-shutdown 的配置；字段即时生效，无需重载插件。 */
export interface ShutdownConfig {
  /** true = 点击「关闭」按钮不再弹确认 */
  skipConfirm: Volatile<boolean>
}

export const Config = Schema.object({
  skipConfirm: Schema.boolean().default(false).volatile(),
})

export function apply(ctx: HostContext, _config: ShutdownConfig): void {
  ctx.connection.fetch.register({
    path: EXIT_ROUTE,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async () => {
      // 先把响应送回浏览器（浏览器半在收到 2xx 后才尝试关标签页/显示兜底画面），
      // 再请求退出——dispose 会立刻断开所有浏览器连接。
      setTimeout(() => requestExit(ctx), 50)
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    },
  })
}

/** 仅登记一次退出兜底，重复的退出请求不再叠加监听器与定时器 */
let exitRequested = false

/**
 * 结束 dsh 进程：请求优雅退出（launcher 的 appExit，缺席时退回 SIGTERM），
 * 并在事件循环排空时或超过 FORCE_EXIT_GRACE_MS 后退出进程。
 */
function requestExit(ctx: HostContext): void {
  let exit: AppExit | undefined
  try {
    exit = ctx.get('appExit') as AppExit | undefined
  } catch {
    exit = undefined
  }

  if (!exitRequested) {
    exitRequested = true
    process.on('beforeExit', () => {
      process.exit(0)
    })
    const cap = setTimeout(() => {
      process.exit(0)
    }, FORCE_EXIT_GRACE_MS)
    cap.unref?.()
  }

  if (typeof exit === 'function') {
    exit(0)
    return
  }
  try {
    process.kill(process.pid, 'SIGTERM')
  } catch {
    // ignore：信号不可用时由上方兜底定时器退出
  }
}
