import type { AppExit, HostContext } from './types'

export const name = 'dsh-shutdown'

/** 与浏览器半 src/client/shutdown.ts 中的 EXIT_ROUTE 保持一致 */
const EXIT_ROUTE = '/api/dsh-shutdown.exit'

export const inject = ['connection']

export function apply(ctx: HostContext): void {
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

/**
 * 安全结束 dsh：
 * - 首选 launcher 提供的 appExit —— 由 shutdown controller 接线，
 *   在 cordis 根 fiber dispose（所有插件逆序清理、webServer close）后自然退出；
 * - 非 launcher 宿主没有 appExit 时退回 SIGTERM（launcher 已注册信号处理，同样走优雅退出），
 *   并保留一个不被等待的硬退出兜底，避免信号不可用（如部分 Windows 环境）时进程残留。
 */
function requestExit(ctx: HostContext): void {
  let exit: AppExit | undefined
  try {
    exit = ctx.get('appExit') as AppExit | undefined
  } catch {
    exit = undefined
  }
  if (typeof exit === 'function') {
    exit(0)
    return
  }

  try {
    process.kill(process.pid, 'SIGTERM')
  } catch {
    // ignore：信号发送失败时由下方兜底退出
  }
  const fallback = setTimeout(() => {
    process.exit(0)
  }, 4500)
  // 不阻止优雅退出路径自行结束进程；若进程仍在，这里保证最终退出
  fallback.unref?.()
}
